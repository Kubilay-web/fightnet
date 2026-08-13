import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * §5.3 — Stripe Connect adaptörü.
 *
 * SDK yerine doğrudan REST kullanılır: ek bağımlılık yok, sunucu bundle'ı
 * küçük kalır, webhook imzası node:crypto ile doğrulanır. Anahtar tanımlı
 * değilse `stripeConfigured` false döner ve çağıran akış "ödeme yapılandırılmamış"
 * durumunu kullanıcıya gösterir — hiçbir yerde sessizce başarılı sayılmaz.
 *
 * Beklenen ortam değişkenleri (.env.example'a bakın):
 *   STRIPE_SECRET_KEY          sk_test_… (canlıya geçmeden önce test anahtarı)
 *   STRIPE_WEBHOOK_SECRET      whsec_…
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  pk_test_…
 */

const SECRET = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const API = "https://api.stripe.com/v1";
const API_VERSION = "2024-06-20";

export const stripeConfigured = Boolean(SECRET);
export const stripeWebhookConfigured = Boolean(WEBHOOK_SECRET);
export const stripeMode: "live" | "test" | "off" = SECRET
  ? SECRET.startsWith("sk_live_")
    ? "live"
    : "test"
  : "off";

export class StripeError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "StripeError";
  }
}

/** Stripe form kodlaması: iç içe nesneler `a[b][0]=c` biçimine düzleştirilir. */
function encode(params: Record<string, unknown>, prefix = ""): string[] {
  const out: string[] = [];
  for (const [rawKey, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const key = prefix ? `${prefix}[${rawKey}]` : rawKey;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item !== null && typeof item === "object") {
          out.push(...encode(item as Record<string, unknown>, `${key}[${i}]`));
        } else {
          out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof value === "object") {
      out.push(...encode(value as Record<string, unknown>, key));
    } else {
      out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return out;
}

async function request<T>(
  path: string,
  method: "GET" | "POST" | "DELETE",
  params?: Record<string, unknown>,
  opts?: { idempotencyKey?: string },
): Promise<T> {
  if (!SECRET) throw new StripeError("Stripe yapılandırılmamış", 503, "not_configured");

  const body = params && method !== "GET" ? encode(params).join("&") : undefined;
  const url = params && method === "GET" ? `${API}${path}?${encode(params).join("&")}` : `${API}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${SECRET}`,
    "Stripe-Version": API_VERSION,
  };
  if (body) headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (opts?.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;

  const res = await fetch(url, { method, headers, body, cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string; code?: string };
  };

  if (!res.ok) {
    throw new StripeError(
      json.error?.message ?? `Stripe isteği başarısız (${res.status})`,
      res.status,
      json.error?.code,
    );
  }
  return json as T;
}

// ---------------------------------------------------------------------------
// Checkout — tek seferlik ve abonelik ödemeleri
// ---------------------------------------------------------------------------

export interface CheckoutLine {
  name: string;
  description?: string;
  /** Euro cinsinden; sente burada çevrilir */
  amount: number;
  quantity?: number;
  recurring?: "month" | "year";
}

export interface CheckoutInput {
  mode: "payment" | "subscription";
  lines: CheckoutLine[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  clientReferenceId?: string;
  metadata?: Record<string, string>;
  /** Connect: tutarın satıcıya aktarılacak kısmı için hedef hesap */
  transferAccount?: string;
  /** Platform komisyonu (euro) — Connect akışlarında */
  applicationFee?: number;
  idempotencyKey?: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  payment_intent?: string;
  subscription?: string;
  amount_total?: number;
  client_reference_id?: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession> {
  const params: Record<string, unknown> = {
    mode: input.mode,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    line_items: input.lines.map((l) => ({
      quantity: l.quantity ?? 1,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(l.amount * 100),
        product_data: { name: l.name, ...(l.description ? { description: l.description } : {}) },
        ...(l.recurring ? { recurring: { interval: l.recurring } } : {}),
      },
    })),
    ...(input.customerEmail ? { customer_email: input.customerEmail } : {}),
    ...(input.clientReferenceId ? { client_reference_id: input.clientReferenceId } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
    // KVKK: Stripe AB kuruluşu üzerinden işler, kart verisi bize hiç ulaşmaz (§5.5)
    payment_method_types: input.mode === "subscription" ? ["card", "sepa_debit"] : ["card"],
  };

  if (input.transferAccount) {
    const fee = Math.round((input.applicationFee ?? 0) * 100);
    if (input.mode === "payment") {
      params.payment_intent_data = {
        transfer_data: { destination: input.transferAccount },
        ...(fee > 0 ? { application_fee_amount: fee } : {}),
      };
    } else {
      params.subscription_data = {
        transfer_data: { destination: input.transferAccount },
        ...(fee > 0 ? { application_fee_percent: input.applicationFee } : {}),
      };
    }
  }

  return request<CheckoutSession>("/checkout/sessions", "POST", params, {
    idempotencyKey: input.idempotencyKey,
  });
}

export function retrieveCheckoutSession(id: string): Promise<CheckoutSession> {
  return request<CheckoutSession>(`/checkout/sessions/${id}`, "GET");
}

// ---------------------------------------------------------------------------
// Connect Express — §4.6/§4.7 sporcu, antrenör ve salon ödemeleri
// ---------------------------------------------------------------------------

export interface ConnectAccount {
  id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

/**
 * Express hesap: BaFin lisansı gerektirmez, KYC yükümlülüğü Stripe'ta kalır (§4.6).
 */
export function createConnectAccount(input: {
  email: string;
  country?: string;
  businessType?: "individual" | "company";
  metadata?: Record<string, string>;
}): Promise<ConnectAccount> {
  return request<ConnectAccount>("/accounts", "POST", {
    type: "express",
    country: input.country ?? "DE",
    email: input.email,
    business_type: input.businessType ?? "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
      sepa_debit_payments: { requested: true },
    },
    ...(input.metadata ? { metadata: input.metadata } : {}),
  });
}

export function retrieveConnectAccount(id: string): Promise<ConnectAccount> {
  return request<ConnectAccount>(`/accounts/${id}`, "GET");
}

export function createAccountLink(input: {
  account: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<{ url: string; expires_at: number }> {
  return request("/account_links", "POST", {
    account: input.account,
    refresh_url: input.refreshUrl,
    return_url: input.returnUrl,
    type: "account_onboarding",
  });
}

export function createLoginLink(account: string): Promise<{ url: string }> {
  return request(`/accounts/${account}/login_links`, "POST", {});
}

// ---------------------------------------------------------------------------
// Abonelik yönetimi
// ---------------------------------------------------------------------------

export function cancelSubscription(id: string): Promise<{ id: string; status: string }> {
  return request(`/subscriptions/${id}`, "DELETE");
}

export function createBillingPortalSession(input: {
  customer: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  return request("/billing_portal/sessions", "POST", {
    customer: input.customer,
    return_url: input.returnUrl,
  });
}

export function refundPaymentIntent(paymentIntent: string, amount?: number) {
  return request<{ id: string; status: string }>("/refunds", "POST", {
    payment_intent: paymentIntent,
    ...(amount ? { amount: Math.round(amount * 100) } : {}),
  });
}

// ---------------------------------------------------------------------------
// Webhook imza doğrulaması (Stripe SDK'sız)
// ---------------------------------------------------------------------------

export interface StripeEventPayload {
  id: string;
  type: string;
  created: number;
  data: { object: Record<string, unknown> };
}

const WEBHOOK_TOLERANCE_SEC = 300;

/**
 * `Stripe-Signature: t=…,v1=…` başlığını doğrular.
 * Zaman toleransı replay saldırısını engeller, karşılaştırma sabit zamanlıdır.
 */
export function constructWebhookEvent(
  rawBody: string,
  signatureHeader: string | null,
  nowSec = Math.floor(Date.now() / 1000),
): StripeEventPayload {
  if (!WEBHOOK_SECRET) throw new StripeError("Webhook secret tanımlı değil", 503, "not_configured");
  if (!signatureHeader) throw new StripeError("İmza başlığı yok", 400, "no_signature");

  const parts = new Map<string, string[]>();
  for (const chunk of signatureHeader.split(",")) {
    const [k, v] = chunk.split("=", 2);
    if (!k || !v) continue;
    parts.set(k.trim(), [...(parts.get(k.trim()) ?? []), v.trim()]);
  }

  const timestamp = parts.get("t")?.[0];
  const signatures = parts.get("v1") ?? [];
  if (!timestamp || !signatures.length) throw new StripeError("İmza biçimi geçersiz", 400, "bad_signature");

  if (Math.abs(nowSec - Number(timestamp)) > WEBHOOK_TOLERANCE_SEC) {
    throw new StripeError("İmza zaman aşımına uğradı", 400, "timestamp_out_of_tolerance");
  }

  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");

  const matched = signatures.some((sig) => {
    const buf = Buffer.from(sig, "utf8");
    return buf.length === expectedBuf.length && timingSafeEqual(buf, expectedBuf);
  });
  if (!matched) throw new StripeError("İmza doğrulanamadı", 400, "signature_mismatch");

  return JSON.parse(rawBody) as StripeEventPayload;
}
