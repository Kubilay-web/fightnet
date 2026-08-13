import type { PaymentPurpose, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { notify, audit } from "@/lib/notify";
import { issueInvoice } from "@/lib/invoicing";
import { nextPeriodEnd, planField } from "@/lib/billing";
import { PLATFORM_PLANS } from "@/lib/constants";
import {
  constructWebhookEvent,
  stripeWebhookConfigured,
  StripeError,
  type StripeEventPayload,
} from "@/lib/services/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — yetkilendirmenin TEK doğruluk kaynağı.
 *
 * Kullanıcı ödeme sonrası `?odeme=basarili` ile geri döner ama hiçbir yetki
 * o yönlendirmeye bakarak verilmez: abonelik, PPV erişimi, sipariş onayı ve
 * salon planı yalnızca burada açılır.
 *
 * İdempotans: her olay `StripeEvent.eventId` ile bir kez işlenir. Stripe aynı
 * olayı yeniden gönderdiğinde (ki gönderir) ikinci kez yetki verilmez.
 */

export async function POST(req: Request) {
  if (!stripeWebhookConfigured) return fail("Webhook yapılandırılmamış", 503);

  const raw = await req.text();
  let event: StripeEventPayload;
  try {
    event = constructWebhookEvent(raw, req.headers.get("stripe-signature"));
  } catch (err) {
    const message = err instanceof StripeError ? err.message : "İmza doğrulanamadı";
    return fail(message, 400);
  }

  // İdempotans kapısı — unique ihlali "zaten işlendi" demektir
  try {
    await prisma.stripeEvent.create({
      data: { eventId: event.id, type: event.type, payload: event.data as Prisma.InputJsonValue },
    });
  } catch {
    return ok({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event);
        break;
      case "invoice.paid":
        await onSubscriptionRenewed(event);
        break;
      case "customer.subscription.deleted":
        await onSubscriptionCancelled(event);
        break;
      case "payment_intent.payment_failed":
        await onPaymentFailed(event);
        break;
      case "charge.refunded":
        await onRefunded(event);
        break;
      case "account.updated":
        await onAccountUpdated(event);
        break;
      default:
        break;
    }
  } catch (err) {
    // Hata durumunda olay kaydını geri al ki Stripe tekrar denediğinde işlensin
    await prisma.stripeEvent.delete({ where: { eventId: event.id } }).catch(() => {});
    audit({
      action: "STRIPE_WEBHOOK_ERROR",
      targetType: "STRIPE_EVENT",
      targetId: event.id,
      meta: { type: event.type, error: err instanceof Error ? err.message : String(err) },
    });
    return fail("Olay işlenemedi", 500);
  }

  return ok({ received: true });
}

// ---------------------------------------------------------------------------

async function onCheckoutCompleted(event: StripeEventPayload) {
  const session = event.data.object as {
    id?: string;
    client_reference_id?: string;
    payment_intent?: string;
    subscription?: string;
    customer?: string;
  };

  const paymentId = session.client_reference_id;
  if (!paymentId) return;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status === "PAID") return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripePaymentIntentId: session.payment_intent ?? null,
      stripeSubscriptionId: session.subscription ?? null,
    },
  });

  if (session.customer) {
    await prisma.user
      .update({ where: { id: payment.userId }, data: { stripeCustomerId: session.customer } })
      .catch(() => {});
  }

  await grantEntitlement({
    purpose: payment.purpose,
    userId: payment.userId,
    refId: payment.refId,
    amount: payment.amount,
    paymentId: payment.id,
    stripeSubscriptionId: session.subscription ?? null,
    stripeCustomerId: session.customer ?? null,
  });
}

interface GrantInput {
  purpose: PaymentPurpose;
  userId: string;
  refId: string | null;
  amount: number;
  paymentId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}

/** Ödeme onaylandığında ürünü teslim eder. */
async function grantEntitlement(input: GrantInput) {
  switch (input.purpose) {
    case "PREMIUM":
    case "COACH_TOOLS":
      await grantPlatformPlan(input);
      break;

    case "PPV_TICKET": {
      if (!input.refId) break;
      const purchase = await prisma.ppvPurchase.update({
        where: { id: input.refId },
        data: {
          status: "PAID",
          paymentId: input.paymentId,
          // §4.4 — etkinlik sonrası 30 gün tekrar izleme
          accessUntil: new Date(Date.now() + 30 * 86400_000),
        },
        select: { eventId: true, event: { select: { title: true, slug: true } } },
      });
      notify({
        userId: input.userId,
        type: "SYSTEM",
        title: "PPV erişimin açıldı",
        body: purchase.event.title,
        url: `/etkinlikler/${purchase.event.slug}`,
      });
      break;
    }

    case "MARKETPLACE_ORDER":
      if (input.refId) {
        await prisma.order.update({ where: { id: input.refId }, data: { status: "PAID" } });
      }
      break;

    case "COACHING_SESSION":
      if (input.refId) {
        const session = await prisma.coachingSession.update({
          where: { id: input.refId },
          data: { status: "ACCEPTED", paymentId: input.paymentId },
          select: { coachId: true, offer: { select: { title: true } } },
        });
        notify({
          userId: session.coachId,
          actorId: input.userId,
          type: "SYSTEM",
          title: "Yeni koçluk seansı ödendi",
          body: session.offer.title,
          url: "/panel/kocluk",
        });
      }
      break;

    case "GYM_PLAN":
      if (input.refId) {
        const gym = await prisma.gym.update({
          where: { id: input.refId },
          data: { status: "ACTIVE", planSince: new Date(), planPrice: input.amount },
          select: { name: true, country: true, id: true },
        });
        await issueInvoice({
          lines: [{ description: `FIGHTNET salon aboneliği — ${gym.name}`, quantity: 1, unitGross: input.amount }],
          country: gym.country,
          gymId: gym.id,
          userId: input.userId,
          paymentId: input.paymentId,
          paid: true,
        });
      }
      break;

    case "EVENT_REGISTRATION":
      if (input.refId) {
        await prisma.eventRegistration.update({
          where: { id: input.refId },
          data: { status: "ACCEPTED" },
        });
      }
      break;

    case "DATA_LICENSE":
      if (input.refId) {
        const startsAt = new Date();
        const expiresAt = new Date(startsAt);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        await prisma.dataLicense.update({
          where: { id: input.refId },
          data: { status: "ACTIVE", startsAt, expiresAt },
        });
      }
      break;

    case "CREATOR_SUBSCRIPTION":
      if (input.refId) {
        await prisma.creatorSubscription.update({
          where: { id: input.refId },
          data: { status: "ACTIVE", currentPeriodEnd: nextPeriodEnd(null) },
        });
      }
      break;
  }

  audit({
    userId: input.userId,
    action: "PAYMENT_FULFILLED",
    targetType: "PAYMENT",
    targetId: input.paymentId,
    meta: { purpose: input.purpose, refId: input.refId, amount: input.amount },
  });
}

async function grantPlatformPlan(input: GrantInput) {
  const plan = input.purpose === "PREMIUM" ? "PREMIUM" : "COACH_TOOLS";
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { premiumUntil: true, coachToolsUntil: true, country: true },
  });
  if (!user) return;

  const field = planField(plan);
  const until = nextPeriodEnd(plan === "PREMIUM" ? user.premiumUntil : user.coachToolsUntil);

  await prisma.$transaction([
    prisma.user.update({ where: { id: input.userId }, data: { [field]: until } }),
    prisma.platformSubscription.upsert({
      where: { userId_plan: { userId: input.userId, plan } },
      update: {
        status: "ACTIVE",
        currentPeriodEnd: until,
        cancelledAt: null,
        stripeSubscriptionId: input.stripeSubscriptionId,
        stripeCustomerId: input.stripeCustomerId,
      },
      create: {
        userId: input.userId,
        plan,
        price: PLATFORM_PLANS[plan].price,
        currentPeriodEnd: until,
        stripeSubscriptionId: input.stripeSubscriptionId,
        stripeCustomerId: input.stripeCustomerId,
      },
    }),
  ]);

  await issueInvoice({
    lines: [{ description: `FIGHTNET ${PLATFORM_PLANS[plan].label} — 1 ay`, quantity: 1, unitGross: input.amount }],
    country: user.country,
    userId: input.userId,
    paymentId: input.paymentId,
    paid: true,
  });

  notify({
    userId: input.userId,
    type: "SYSTEM",
    title: `${PLATFORM_PLANS[plan].label} aktif`,
    body: `Sonraki yenileme: ${until.toLocaleDateString("tr-TR")}`,
    url: "/panel/abonelik",
  });
}

// ---------------------------------------------------------------------------

/** Abonelik yenilemesi — Stripe her dönem `invoice.paid` gönderir. */
async function onSubscriptionRenewed(event: StripeEventPayload) {
  const invoice = event.data.object as { subscription?: string; amount_paid?: number };
  if (!invoice.subscription) return;

  const sub = await prisma.platformSubscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription },
    select: { id: true, userId: true, plan: true, currentPeriodEnd: true },
  });
  if (!sub) return;

  const until = nextPeriodEnd(sub.currentPeriodEnd);
  await prisma.$transaction([
    prisma.platformSubscription.update({
      where: { id: sub.id },
      data: { status: "ACTIVE", currentPeriodEnd: until },
    }),
    prisma.user.update({
      where: { id: sub.userId },
      data: { [planField(sub.plan)]: until },
    }),
  ]);
}

async function onSubscriptionCancelled(event: StripeEventPayload) {
  const sub = event.data.object as { id?: string };
  if (!sub.id) return;

  const record = await prisma.platformSubscription.findFirst({
    where: { stripeSubscriptionId: sub.id },
    select: { id: true, userId: true },
  });
  if (!record) return;

  // Dönem sonuna kadar erişim korunur — `*Until` alanı bilinçli olarak
  // geri alınmaz; kullanıcı ödediği ayı tamamlar.
  await prisma.platformSubscription.update({
    where: { id: record.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  notify({
    userId: record.userId,
    type: "SYSTEM",
    title: "Aboneliğin iptal edildi",
    body: "Mevcut dönem sonuna kadar erişimin devam eder.",
    url: "/panel/abonelik",
  });
}

async function onPaymentFailed(event: StripeEventPayload) {
  const intent = event.data.object as { id?: string; last_payment_error?: { message?: string } };
  if (!intent.id) return;
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: intent.id, status: "PENDING" },
    data: { status: "FAILED", failureReason: intent.last_payment_error?.message ?? "Ödeme reddedildi" },
  });
}

async function onRefunded(event: StripeEventPayload) {
  const charge = event.data.object as { payment_intent?: string };
  if (!charge.payment_intent) return;
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: charge.payment_intent },
    data: { status: "REFUNDED", refundedAt: new Date() },
  });
}

/** Connect Express onboarding tamamlandığında satıcı para almaya hazır olur. */
async function onAccountUpdated(event: StripeEventPayload) {
  const account = event.data.object as {
    id?: string;
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
  };
  if (!account.id) return;

  const ready = Boolean(account.charges_enabled && account.payouts_enabled);
  await prisma.user.updateMany({
    where: { stripeAccountId: account.id },
    data: { connectStatus: ready ? "ACTIVE" : "RESTRICTED" },
  });
  await prisma.gym.updateMany({
    where: { stripeAccountId: account.id },
    data: { connectStatus: ready ? "ACTIVE" : "RESTRICTED" },
  });
}
