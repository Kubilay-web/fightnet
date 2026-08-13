import prisma from "@/lib/prisma";
import { guard, isResponse, ok, fail } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/utils";
import { createBillingPortalSession, stripeConfigured } from "@/lib/services/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe müşteri portalı — abonelik iptali, ödeme yöntemi değişimi ve
 * fatura geçmişi. İptal akışını kendimiz yazmak yerine Stripe'a devretmek
 * SCA ve SEPA mandat iptali gibi ayrıntıları da doğru çözer.
 */
export async function POST() {
  const g = await guard({ bucket: "portal", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;

  if (!stripeConfigured) {
    return fail("Ödeme altyapısı henüz yapılandırılmadı.", 503, { code: "payments_unavailable" });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) return fail("Henüz bir ödeme kaydın yok", 409);

  try {
    const portal = await createBillingPortalSession({
      customer: user.stripeCustomerId,
      returnUrl: absoluteUrl("/panel/abonelik"),
    });
    return ok({ url: portal.url });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Portal açılamadı", 502);
  }
}
