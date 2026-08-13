import "server-only";

/**
 * §4.5 Seviye 1 / §5.3 — Kimlik doğrulama (KYC) adaptörü.
 *
 * İki sağlayıcı desteklenir: Onfido ve IDnow. İkisi de ücretlidir; anahtar
 * yoksa `kycConfigured` false döner ve platform mevcut **manuel** akışına
 * devam eder (kullanıcı belge + selfie yükler, admin `/admin/dogrulama`
 * ekranından onaylar). Yani doğrulama her hâlükârda çalışır, otomasyon
 * seviyesi değişir.
 */

export type KycProvider = "onfido" | "idnow" | "manual";

const PROVIDER = (process.env.KYC_PROVIDER ?? "").toLowerCase();
const ONFIDO_TOKEN = process.env.ONFIDO_API_TOKEN;
const ONFIDO_WORKFLOW = process.env.ONFIDO_WORKFLOW_ID;
const IDNOW_COMPANY = process.env.IDNOW_COMPANY_ID;
const IDNOW_KEY = process.env.IDNOW_API_KEY;

export const kycProvider: KycProvider =
  PROVIDER === "onfido" && ONFIDO_TOKEN
    ? "onfido"
    : PROVIDER === "idnow" && IDNOW_COMPANY && IDNOW_KEY
      ? "idnow"
      : "manual";

export const kycConfigured = kycProvider !== "manual";

export interface KycSession {
  provider: KycProvider;
  /** Sağlayıcıdaki referans — VerificationRequest.externalId olarak saklanır */
  externalId: string;
  /** Kullanıcının yönlendirileceği adres; manuel akışta null */
  redirectUrl: string | null;
  /** Mobil/gömülü SDK için kısa ömürlü jeton */
  token: string | null;
}

export interface KycApplicant {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  /** ISO 3166-1 alpha-2 — DACH varsayılanı DE */
  country?: string;
  returnUrl: string;
}

/** §5.4 — AB veri alanı: Onfido'nun eu bölgesi kullanılır. */
const ONFIDO_API = process.env.ONFIDO_REGION_HOST ?? "https://api.eu.onfido.com/v3.6";
const IDNOW_API = process.env.IDNOW_HOST ?? "https://gateway.idnow.de/api/v1";

export async function startKycSession(input: KycApplicant): Promise<KycSession | null> {
  if (kycProvider === "onfido") return startOnfido(input);
  if (kycProvider === "idnow") return startIdnow(input);
  return null;
}

async function startOnfido(input: KycApplicant): Promise<KycSession | null> {
  try {
    const applicantRes = await fetch(`${ONFIDO_API}/applicants`, {
      method: "POST",
      headers: {
        Authorization: `Token token=${ONFIDO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        location: { country_of_residence: input.country ?? "DEU" },
      }),
      cache: "no-store",
    });
    if (!applicantRes.ok) return null;
    const applicant = (await applicantRes.json()) as { id: string };

    if (!ONFIDO_WORKFLOW) {
      return { provider: "onfido", externalId: applicant.id, redirectUrl: null, token: null };
    }

    const runRes = await fetch(`${ONFIDO_API}/workflow_runs`, {
      method: "POST",
      headers: {
        Authorization: `Token token=${ONFIDO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicant_id: applicant.id,
        workflow_id: ONFIDO_WORKFLOW,
        link: { completed_redirect_url: input.returnUrl },
      }),
      cache: "no-store",
    });
    if (!runRes.ok) return null;
    const run = (await runRes.json()) as { id: string; link?: { url?: string } };

    return {
      provider: "onfido",
      externalId: run.id,
      redirectUrl: run.link?.url ?? null,
      token: null,
    };
  } catch {
    return null;
  }
}

async function startIdnow(input: KycApplicant): Promise<KycSession | null> {
  try {
    const transaction = `FN-${input.userId.slice(-8)}-${Date.now().toString(36)}`;
    const res = await fetch(`${IDNOW_API}/${IDNOW_COMPANY}/identifications/${transaction}/start`, {
      method: "POST",
      headers: { "X-API-KEY": IDNOW_KEY!, "Content-Type": "application/json" },
      body: JSON.stringify({
        firstname: input.firstName,
        lastname: input.lastName,
        email: input.email,
        custom: { settings: { redirectUrlSuccess: input.returnUrl } },
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { id?: string };

    return {
      provider: "idnow",
      externalId: transaction,
      redirectUrl: `https://go.idnow.de/${IDNOW_COMPANY}/identifications/${transaction}`,
      token: json.id ?? null,
    };
  } catch {
    return null;
  }
}

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNKNOWN";

export interface KycResult {
  status: KycStatus;
  reason: string | null;
}

/** Sağlayıcı webhook gövdesini ortak sonuca çevirir. */
export function parseKycWebhook(provider: KycProvider, payload: unknown): (KycResult & { externalId: string }) | null {
  const body = payload as Record<string, never>;
  try {
    if (provider === "onfido") {
      const p = body as unknown as {
        payload?: { resource_type?: string; action?: string; object?: { id?: string; status?: string } };
      };
      const id = p.payload?.object?.id;
      if (!id) return null;
      const status = p.payload?.object?.status;
      return {
        externalId: id,
        status: status === "approved" ? "APPROVED" : status === "declined" ? "REJECTED" : "PENDING",
        reason: status ?? null,
      };
    }
    if (provider === "idnow") {
      const p = body as unknown as { transactionnumber?: string; identificationprocess?: { result?: string } };
      if (!p.transactionnumber) return null;
      const result = p.identificationprocess?.result;
      return {
        externalId: p.transactionnumber,
        status: result === "SUCCESS" ? "APPROVED" : result === "FRAUD_SUSPICION" ? "REJECTED" : "PENDING",
        reason: result ?? null,
      };
    }
  } catch {
    return null;
  }
  return null;
}
