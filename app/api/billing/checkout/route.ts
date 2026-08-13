import { z } from "zod";
import prisma from "@/lib/prisma";
import { guard, isResponse, ok, fail, parseBody } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { startCheckout, payoutAccountFor, PaymentUnavailableError } from "@/lib/billing";
import { PLATFORM_PLANS, PPV_FEE_RATE, MARKETPLACE_FEE_RATE } from "@/lib/constants";
import { stripeConfigured } from "@/lib/services/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ödeme başlatma. Tutar ve alıcı hesabı **her zaman sunucuda** belirlenir;
 * istemciden yalnızca neyin satın alındığı gelir. Aksi halde fiyat oynanabilirdi.
 */

const schema = z.discriminatedUnion("purpose", [
  z.object({ purpose: z.literal("PREMIUM") }),
  z.object({ purpose: z.literal("COACH_TOOLS") }),
  z.object({ purpose: z.literal("PPV_TICKET"), eventId: z.string().min(1) }),
  z.object({ purpose: z.literal("COACHING_SESSION"), sessionId: z.string().min(1) }),
  z.object({ purpose: z.literal("MARKETPLACE_ORDER"), orderId: z.string().min(1) }),
  z.object({ purpose: z.literal("GYM_PLAN"), gymId: z.string().min(1) }),
]);

export async function POST(req: Request) {
  const g = await guard({ bucket: "checkout", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;

  if (!stripeConfigured) {
    return fail("Ödeme altyapısı henüz yapılandırılmadı.", 503, { code: "payments_unavailable" });
  }

  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const body = parsed.data;

  try {
    switch (body.purpose) {
      case "PREMIUM":
      case "COACH_TOOLS": {
        const plan = PLATFORM_PLANS[body.purpose];
        if (body.purpose === "COACH_TOOLS" && !["COACH", "ADMIN"].includes(session.role)) {
          return fail("Antrenör Araçları yalnızca antrenör hesaplarında açılabilir", 403);
        }
        const result = await startCheckout({
          userId: session.sub,
          userEmail: session.email,
          purpose: body.purpose,
          mode: "subscription",
          amount: plan.price,
          refType: "PLATFORM_PLAN",
          refId: body.purpose,
          lines: [{ name: `FIGHTNET ${plan.label}`, description: plan.tagline, amount: plan.price, recurring: "month" }],
          successPath: "/panel/abonelik",
          cancelPath: "/panel/abonelik",
        });
        return ok(result);
      }

      case "PPV_TICKET": {
        const event = await prisma.event.findUnique({
          where: { id: body.eventId },
          select: {
            id: true, title: true, slug: true, isPPV: true, ppvPrice: true,
            status: true, organizerId: true,
          },
        });
        if (!event || !event.isPPV || !event.ppvPrice) return fail("Bu etkinlik için PPV satışı yok", 404);
        if (event.status === "CANCELLED") return fail("Etkinlik iptal edildi", 409);

        const existing = await prisma.ppvPurchase.findUnique({
          where: { eventId_userId: { eventId: event.id, userId: session.sub } },
          select: { id: true, status: true },
        });
        if (existing?.status === "PAID") return fail("Bu etkinliği zaten satın aldın", 409);

        const platformFee = Math.round(event.ppvPrice * PPV_FEE_RATE * 100) / 100;
        const purchase = existing
          ? existing
          : await prisma.ppvPurchase.create({
              data: {
                eventId: event.id,
                userId: session.sub,
                price: event.ppvPrice,
                platformFee,
              },
              select: { id: true, status: true },
            });

        const result = await startCheckout({
          userId: session.sub,
          userEmail: session.email,
          purpose: "PPV_TICKET",
          amount: event.ppvPrice,
          platformFee,
          refType: "PPV",
          refId: purchase.id,
          destinationAccount: await payoutAccountFor(event.organizerId),
          lines: [{ name: `PPV — ${event.title}`, description: "Canlı yayın erişimi", amount: event.ppvPrice }],
          successPath: `/etkinlikler/${event.slug}`,
          cancelPath: `/etkinlikler/${event.slug}`,
        });
        return ok(result);
      }

      case "COACHING_SESSION": {
        const cs = await prisma.coachingSession.findFirst({
          where: { id: body.sessionId, athleteId: session.sub },
          select: {
            id: true, price: true, platformFee: true, status: true, coachId: true,
            offer: { select: { title: true, durationMin: true } },
          },
        });
        if (!cs) return fail("Seans bulunamadı", 404);
        if (cs.status !== "REQUESTED") return fail("Bu seans ödemeye uygun değil", 409);

        const result = await startCheckout({
          userId: session.sub,
          userEmail: session.email,
          purpose: "COACHING_SESSION",
          amount: cs.price,
          platformFee: cs.platformFee,
          refType: "COACHING",
          refId: cs.id,
          destinationAccount: await payoutAccountFor(cs.coachId),
          lines: [
            {
              name: cs.offer.title,
              description: `Online koçluk · ${cs.offer.durationMin} dk`,
              amount: cs.price,
            },
          ],
          successPath: "/panel/kocluk",
          cancelPath: "/panel/kocluk",
        });
        return ok(result);
      }

      case "MARKETPLACE_ORDER": {
        const order = await prisma.order.findFirst({
          where: { id: body.orderId, userId: session.sub },
          select: {
            id: true, total: true, status: true,
            items: { select: { quantity: true, price: true, product: { select: { title: true } } } },
          },
        });
        if (!order) return fail("Sipariş bulunamadı", 404);
        if (order.status !== "PENDING") return fail("Bu sipariş zaten işlendi", 409);

        const result = await startCheckout({
          userId: session.sub,
          userEmail: session.email,
          purpose: "MARKETPLACE_ORDER",
          amount: order.total,
          platformFee: Math.round(order.total * MARKETPLACE_FEE_RATE * 100) / 100,
          refType: "ORDER",
          refId: order.id,
          lines: order.items.map((i) => ({ name: i.product.title, amount: i.price, quantity: i.quantity })),
          successPath: "/panel/pazar",
          cancelPath: "/panel/pazar",
        });
        return ok(result);
      }

      case "GYM_PLAN": {
        const gym = await prisma.gym.findFirst({
          where: { id: body.gymId, ownerId: session.sub },
          select: { id: true, name: true, plan: true, planPrice: true, isFounder: true },
        });
        if (!gym) return fail("Salon bulunamadı veya sahibi değilsin", 404);

        // §6.4 — Kurucu Üye ömür boyu 50 €, sonraki salonlar tam fiyat
        const price = gym.isFounder ? 50 : (gym.planPrice > 0 ? gym.planPrice : 120);

        const result = await startCheckout({
          userId: session.sub,
          userEmail: session.email,
          purpose: "GYM_PLAN",
          mode: "subscription",
          amount: price,
          refType: "GYM",
          refId: gym.id,
          lines: [
            {
              name: `FIGHTNET Salon Aboneliği — ${gym.name}`,
              description: gym.isFounder ? "Kurucu Üye fiyatı" : "Standart plan",
              amount: price,
              recurring: "month",
            },
          ],
          successPath: `/salon-yonetimi/${gym.id}`,
          cancelPath: `/salon-yonetimi/${gym.id}`,
        });
        return ok(result);
      }
    }
  } catch (err) {
    if (err instanceof PaymentUnavailableError) return fail(err.message, 503);
    return fail(err instanceof Error ? err.message : "Ödeme başlatılamadı", 502);
  }
}
