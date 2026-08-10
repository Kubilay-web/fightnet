import prisma from "@/lib/prisma";
import { guard, isResponse, ok, fail } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";
import { PLATFORM_FEE_RATE } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * §4.7 — Creator aboneliği.
 * Ödeme sağlayıcısı (Stripe Connect) entegrasyonu Faz 2'de eklenecek;
 * bu uçta abonelik kaydı ve komisyon hesabı tutulur.
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

  const tier = await prisma.creatorTier.findFirst({
    where: { id: tierId, creatorId, isActive: true },
    select: { id: true, price: true, name: true },
  });
  if (!tier) return fail("Kademe bulunamadı", 404);

  const platformFee = Math.round(tier.price * PLATFORM_FEE_RATE * 100) / 100;
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.creatorSubscription.upsert({
    where: { creatorId_subscriberId: { creatorId, subscriberId: session.sub } },
    update: {
      tierId: tier.id,
      status: "ACTIVE",
      price: tier.price,
      platformFee,
      currentPeriodEnd: periodEnd,
      cancelledAt: null,
    },
    create: {
      creatorId,
      subscriberId: session.sub,
      tierId: tier.id,
      price: tier.price,
      platformFee,
      currentPeriodEnd: periodEnd,
    },
  });

  notify({
    userId: creatorId,
    actorId: session.sub,
    type: "SUBSCRIPTION",
    title: `${session.name} sana abone oldu`,
    body: `${tier.name} kademesi · ${tier.price} €/ay`,
    url: "/panel/creator",
  });

  return ok({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const g = await guard({ bucket: "subscribe", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;

  const { creatorId } = (await req.json().catch(() => ({}))) as { creatorId?: string };
  if (!creatorId) return fail("Eksik parametre", 400);

  await prisma.creatorSubscription
    .update({
      where: { creatorId_subscriberId: { creatorId, subscriberId: session.sub } },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    })
    .catch(() => null);

  return ok({ ok: true });
}
