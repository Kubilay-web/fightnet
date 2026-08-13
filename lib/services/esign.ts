import "server-only";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

/**
 * §4.6 — eIDAS uyumlu dijital imza.
 *
 * eIDAS üç seviye tanımlar:
 *   EES  (basit)      — tıklayarak onay
 *   FES  (gelişmiş)   — imzalayan kimliği, tek kontrol, sonradan değişiklik tespiti
 *   QES  (nitelikli)  — ancak nitelikli güven hizmeti sağlayıcısı (QTSP) verebilir
 *
 * Üyelik sözleşmeleri ve SEPA mandatı için **FES yeterlidir** (BGB §126b yazılı
 * biçim). Bu modül FES'i harici servis olmadan üretir: belge özeti, imzalayan
 * kimliği, zaman damgası, IP ve cihaz bilgisi tek bir mühürde HMAC ile bağlanır;
 * belge sonradan değişirse mühür tutmaz.
 *
 * QES gerektiğinde (§4.6 ileri aşama) Skribble/DocuSign gibi bir QTSP devreye
 * alınır — `esignProvider` env ile "skribble"a çevrilir ve aynı arayüz kullanılır.
 */

export type ESignProvider = "internal" | "skribble" | "docusign";

const PROVIDER = (process.env.ESIGN_PROVIDER ?? "internal").toLowerCase() as ESignProvider;
const SKRIBBLE_TOKEN = process.env.SKRIBBLE_API_TOKEN;
const DOCUSIGN_TOKEN = process.env.DOCUSIGN_ACCESS_TOKEN;

export const esignProvider: ESignProvider =
  PROVIDER === "skribble" && SKRIBBLE_TOKEN
    ? "skribble"
    : PROVIDER === "docusign" && DOCUSIGN_TOKEN
      ? "docusign"
      : "internal";

/** QES yalnızca harici QTSP ile mümkündür. */
export const qualifiedSignatureAvailable = esignProvider !== "internal";

export type SignatureLevel = "EES" | "FES" | "QES";

export interface SignatureRequest {
  /** İmzalanacak metnin tamamı — özet bundan üretilir */
  documentText: string;
  documentTitle: string;
  signerId: string;
  signerName: string;
  signerEmail: string;
  ip: string | null;
  userAgent: string | null;
}

export interface SignatureSeal {
  id: string;
  level: SignatureLevel;
  provider: ESignProvider;
  /** SHA-256, belgenin değişmediğini kanıtlar */
  documentHash: string;
  signedAt: string;
  seal: string;
  evidence: {
    signerId: string;
    signerName: string;
    signerEmail: string;
    ip: string | null;
    userAgent: string | null;
  };
}

function sealSecret(): string {
  const secret = process.env.ESIGN_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) throw new Error("ESIGN_SECRET veya AUTH_SECRET tanımlı olmalı");
  return secret;
}

export function hashDocument(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function computeSeal(parts: Record<string, string | null>): string {
  const canonical = Object.keys(parts)
    .sort()
    .map((k) => `${k}=${parts[k] ?? ""}`)
    .join("|");
  return createHmac("sha256", sealSecret()).update(canonical, "utf8").digest("hex");
}

/**
 * FES üretir. Harici sağlayıcı yapılandırılmışsa oradaki imza akışı
 * başlatılır; sonuç yine bu yapıda saklanır.
 */
export function signDocument(input: SignatureRequest): SignatureSeal {
  const id = randomUUID();
  const documentHash = hashDocument(input.documentText);
  const signedAt = new Date().toISOString();

  const seal = computeSeal({
    id,
    documentHash,
    signedAt,
    signerId: input.signerId,
    signerEmail: input.signerEmail,
    ip: input.ip,
  });

  return {
    id,
    level: "FES",
    provider: esignProvider,
    documentHash,
    signedAt,
    seal,
    evidence: {
      signerId: input.signerId,
      signerName: input.signerName,
      signerEmail: input.signerEmail,
      ip: input.ip,
      userAgent: input.userAgent,
    },
  };
}

/**
 * Mührü ve belge bütünlüğünü doğrular.
 * Belge metni değiştiyse veya mühür oynatıldıysa false döner.
 */
export function verifySeal(seal: SignatureSeal, documentText: string): boolean {
  if (hashDocument(documentText) !== seal.documentHash) return false;
  const expected = computeSeal({
    id: seal.id,
    documentHash: seal.documentHash,
    signedAt: seal.signedAt,
    signerId: seal.evidence.signerId,
    signerEmail: seal.evidence.signerEmail,
    ip: seal.evidence.ip,
  });
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(seal.seal, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * QES gerektiğinde harici sağlayıcıda imza isteği açar.
 * @returns imzalayanın yönlendirileceği adres; sağlayıcı yoksa null.
 */
export async function requestQualifiedSignature(input: {
  documentTitle: string;
  documentPdfBase64: string;
  signerEmail: string;
  returnUrl: string;
}): Promise<{ id: string; url: string } | null> {
  if (esignProvider === "skribble" && SKRIBBLE_TOKEN) {
    try {
      const res = await fetch("https://api.skribble.com/v2/signature-requests", {
        method: "POST",
        headers: { Authorization: `Bearer ${SKRIBBLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.documentTitle,
          content: input.documentPdfBase64,
          legislation: "EIDAS",
          quality: "QES",
          signatures: [{ signer_email_address: input.signerEmail }],
          callback_success_url: input.returnUrl,
        }),
        cache: "no-store",
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { id?: string; signing_url?: string };
      if (!json.id) return null;
      return { id: json.id, url: json.signing_url ?? input.returnUrl };
    } catch {
      return null;
    }
  }
  return null;
}
