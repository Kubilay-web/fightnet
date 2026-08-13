import "server-only";
import type { PaymentPurpose, PlatformPlan, Prisma } from "@prisma/client";
import prisma from "./prisma";
import { absoluteUrl } from "./utils";
import { audit } from "./notify";
import {
  createCheckoutSession,
  createConnectAccount,
  createAccountLink,
  stripeConfigured,
  StripeError,
  type CheckoutLine,
} from "./services/stripe";

/**
 * Ödeme akışlarının tek giriş noktası.
 *
 * Her satın alma önce `Payment` kaydı olarak PENDING yazılır, ardından Stripe
 * Checkout oturumu açılır. Yetki (abonelik, PPV erişimi, sipariş onayı) yalnızca
 * webhook `PAID` yazdığında verilir — istemciden gelen "başarılı" yönlendirmesine
 * asla güvenilmez.
 *
 * Stripe yapılandırılmamışsa `PaymentUnavailableError` fırlatılır; çağıran akış
 * bunu kullanıcıya "ödeme altyapısı henüz açık değil" olarak gösterir. Sessizce
 * ücretsiz erişim verilmez.
 */

export class PaymentUnavailableError extends Error {
  constructor() {
    super("Ödeme altyapısı henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin.");
    this.name = "PaymentUnavailableError";
  }
}

export interface StartCheckoutInput {
  userId: string;
  userEmail: string;
  purpose: PaymentPurpose;
  /** Brüt tutar (EUR) */
  amount: number;
  platformFee?: number;
  lines: CheckoutLine[];
  /** İlgili kaydın türü ve kimliği — webhook bununla yetki verir */
  refType: string;
  refId: string;
  mode?: "payment" | "subscription";
  /** Connect: tutarın aktarılacağı satıcı hesabı */
  destinationAccount?: string | null;
  successPath: string;
  cancelPath: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  paymentId: string;
  url: string;
}

export async function startCheckout(input: StartCheckoutInput): Promise<CheckoutResult> {
  if (!stripeConfigured) throw new PaymentUnavailableError();

  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      purpose: input.purpose,
      amount: input.amount,
      platformFee: input.platformFee ?? 0,
      refType: input.refType,
      refId: input.refId,
      destinationAccount: input.destinationAccount ?? null,
      metadata: (input.metadata ?? null) as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  try {
    const session = await createCheckoutSession({
      mode: input.mode ?? "payment",
      lines: input.lines,
      customerEmail: input.userEmail,
      clientReferenceId: payment.id,
      successUrl: absoluteUrl(`${input.successPath}?odeme=basarili&pid=${payment.id}`),
      cancelUrl: absoluteUrl(`${input.cancelPath}?odeme=iptal&pid=${payment.id}`),
      metadata: { ...input.metadata, paymentId: payment.id, purpose: input.purpose },
      transferAccount: input.destinationAccount ?? undefined,
      applicationFee: input.platformFee,
      // Aynı kayıt için tekrar tıklamada ikinci oturum açılmaz
      idempotencyKey: `checkout_${payment.id}`,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: session.id },
    });

    return { paymentId: payment.id, url: session.url };
  } catch (err) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failureReason: err instanceof StripeError ? err.message : "Bilinmeyen hata",
      },
    });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Connect Express — satıcı tarafı
// ---------------------------------------------------------------------------

/**
 * Creator, antrenör, organizatör ve salonların para alabilmesi için
 * Stripe Express hesabı açar ve onboarding bağlantısı döndürür.
 */
export async function ensureConnectOnboarding(input: {
  userId: string;
  email: string;
  returnPath: string;
}): Promise<string> {
  if (!stripeConfigured) throw new PaymentUnavailableError();

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { stripeAccountId: true },
  });

  let accountId = user?.stripeAccountId ?? null;
  if (!accountId) {
    const account = await createConnectAccount({
      email: input.email,
      metadata: { fightnetUserId: input.userId },
    });
    accountId = account.id;
    await prisma.user.update({
      where: { id: input.userId },
      data: { stripeAccountId: accountId, connectStatus: "ONBOARDING" },
    });
    audit({ userId: input.userId, action: "CONNECT_ACCOUNT_CREATED", targetType: "USER", targetId: input.userId });
  }

  const link = await createAccountLink({
    account: accountId,
    refreshUrl: absoluteUrl(input.returnPath),
    returnUrl: absoluteUrl(`${input.returnPath}?connect=tamam`),
  });
  return link.url;
}

/** Satıcı hesabı ödeme almaya hazır mı — hazır değilse komisyon aktarımı yapılmaz. */
export async function payoutAccountFor(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeAccountId: true, connectStatus: true },
  });
  if (!user?.stripeAccountId || user.connectStatus !== "ACTIVE") return null;
  return user.stripeAccountId;
}

// ---------------------------------------------------------------------------
// Yetkilendirme okumaları — reklam gizleme, kota, kilit
// ---------------------------------------------------------------------------

export interface Entitlements {
  premium: boolean;
  coachTools: boolean;
}

/**
 * §4.4 — Premium kullanıcıya reklam gösterilmez.
 * §4.3 — Antrenör-Araç abonesi genişletilmiş kotalara erişir.
 */
export async function entitlementsFor(userId: string | null | undefined): Promise<Entitlements> {
  if (!userId) return { premium: false, coachTools: false };
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { premiumUntil: true, coachToolsUntil: true },
  });
  const now = new Date();
  return {
    premium: Boolean(user?.premiumUntil && user.premiumUntil > now),
    coachTools: Boolean(user?.coachToolsUntil && user.coachToolsUntil > now),
  };
}

export function planField(plan: PlatformPlan): "premiumUntil" | "coachToolsUntil" {
  return plan === "PREMIUM" ? "premiumUntil" : "coachToolsUntil";
}

/** Abonelik dönemini bir ay uzatır; süresi dolmuşsa bugünden başlatır. */
export function nextPeriodEnd(current: Date | null | undefined): Date {
  const base = current && current > new Date() ? new Date(current) : new Date();
  base.setMonth(base.getMonth() + 1);
  return base;
}
