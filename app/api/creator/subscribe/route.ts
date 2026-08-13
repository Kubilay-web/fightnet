import prisma from "@/lib/prisma";
import { guard, isResponse, ok, fail } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import { startCheckout, payoutAccountFor, PaymentUnavailableError } from "@/lib/billing";
import { stripeConfigured } from "@/lib/services/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * §4.7 — Creator aboneliği.
 *
 * Kayıt önce `PAST_DUE` (ödeme bekleniyor) olarak açılır ve Stripe Checkout'a
 * yönlendirilir. `ACTIVE`'e çeviren tek yer webhook'tur — bu yüzden ödeme
 * tamamlanmadan özel içerik açılmaz. Komisyon (%15) platformda kalır, kalanı
 * Connect hesabı hazırsa doğrudan creator'a aktarılır.
 */

export async function POST(req: Request) {
  const g = await guard({ bucket: "subscribe", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;

  const { creatorId, tierId } = (await req.json().catch(() => ({}))) as {
    creatorId?: string;
    tierId?: string;
  };
  if (!creatorId || !tierId) return fail("Eksik parametre", 400);
  if (creatorId === session.sub) return fail("Kendine abone olamazsın", 400);

  if (!stripeConfigured) {
    return fail("Ödeme altyapısı henüz yapılandırılmadı.", 503, { code: "payments_unavailable" });
  }

  const tier = await prisma.creatorTier.findFirst({
    where: { id: tierId, creatorId, isActive: true },
    select: { id: true, price: true, name: true, creator: { select: { name: true, username: true } } },
  });
  if (!tier) return fail("Kademe bulunamadı", 404);

  const existing = await prisma.creatorSubscription.findUnique({
    where: { creatorId_subscriberId: { creatorId, subscriberId: session.sub } },
    select: { id: true, status: true },
  });
  if (existing?.status === "ACTIVE") return fail("Zaten abonesin", 409);

  const platformFee = Math.round(tier.price * PLATFORM_FEE_RATE * 100) / 100;
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const subscription = await prisma.creatorSubscription.upsert({
    where: { creatorId_subscriberId: { creatorId, subscriberId: session.sub } },
    update: {
      tierId: tier.id,
      status: "PAST_DUE",
      price: tier.price,
      platformFee,
      currentPeriodEnd: periodEnd,
      cancelledAt: null,
    },
    create: {
      creatorId,
      subscriberId: session.sub,
      tierId: tier.id,
      status: "PAST_DUE",
      price: tier.price,
      platformFee,
      currentPeriodEnd: periodEnd,
    },
    select: { id: true },
  });

  try {
    const result = await startCheckout({
      userId: session.sub,
      userEmail: session.email,
      purpose: "CREATOR_SUBSCRIPTION",
      mode: "subscription",
      amount: tier.price,
      platformFee,
      refType: "CREATOR_SUB",
      refId: subscription.id,
      destinationAccount: await payoutAccountFor(creatorId),
      lines: [
        {
          name: `${tier.creator.name} — ${tier.name}`,
          description: "FIGHTNET Creator aboneliği",
          amount: tier.price,
          recurring: "month",
        },
      ],
      successPath: `/creator/${tier.creator.username}`,
      cancelPath: `/creator/${tier.creator.username}`,
    });
    return ok(result, { status: 201 });
  } catch (err) {
    if (err instanceof PaymentUnavailableError) return fail(err.message, 503);
    return fail(err instanceof Error ? err.message : "Ödeme başlatılamadı", 502);
  }
}

export async function DELETE(req: Request) {
  const g = await guard({ bucket: "subscribe", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;

  const { creatorId } = (await req.json().catch(() => ({}))) as { creatorId?: string };
  if (!creatorId) return fail("Eksik parametre", 400);

  const cancelled = await prisma.creatorSubscription
    .update({
      where: { creatorId_subscriberId: { creatorId, subscriberId: session.sub } },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      select: { creatorId: true },
    })
    .catch(() => null);

  if (cancelled) {
    notify({
      userId: cancelled.creatorId,
      actorId: session.sub,
      type: "SUBSCRIPTION",
      title: "Bir abone ayrıldı",
      body: "Abonelik dönem sonunda kapanır.",
      url: "/panel/creator",
    });
  }

  return ok({ ok: true });
}
