import { z } from "zod";
import prisma from "@/lib/prisma";
import { guard, isResponse, ok, fail, parseBody } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { ensureConnectOnboarding, PaymentUnavailableError } from "@/lib/billing";
import { createLoginLink, retrieveConnectAccount, stripeConfigured } from "@/lib/services/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * §4.7 — Creator, antrenör ve organizatörlerin para alabilmesi için
 * Stripe Connect Express onboarding'i. Hesap hazır olana kadar ilgili
 * satış akışlarında komisyon aktarımı yapılmaz (platform hesabında tutulur).
 */

const schema = z.object({
  action: z.enum(["onboard", "dashboard", "refresh"]).default("onboard"),
  returnPath: z.string().startsWith("/").max(200).default("/panel/odemeler"),
});

export async function POST(req: Request) {
  const g = await guard({ bucket: "connect", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;

  if (!stripeConfigured) {
    return fail("Ödeme altyapısı henüz yapılandırılmadı.", 503, { code: "payments_unavailable" });
  }

  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { stripeAccountId: true, connectStatus: true, email: true },
  });
  if (!user) return fail("Kullanıcı bulunamadı", 404);

  try {
    if (parsed.data.action === "dashboard") {
      if (!user.stripeAccountId) return fail("Önce hesabı oluşturmalısın", 409);
      const link = await createLoginLink(user.stripeAccountId);
      return ok({ url: link.url });
    }

    if (parsed.data.action === "refresh") {
      if (!user.stripeAccountId) return ok({ status: "NONE" });
      const account = await retrieveConnectAccount(user.stripeAccountId);
      const ready = account.charges_enabled && account.payouts_enabled;
      await prisma.user.update({
        where: { id: session.sub },
        data: { connectStatus: ready ? "ACTIVE" : "RESTRICTED" },
      });
      return ok({ status: ready ? "ACTIVE" : "RESTRICTED", detailsSubmitted: account.details_submitted });
    }

    const url = await ensureConnectOnboarding({
      userId: session.sub,
      email: user.email,
      returnPath: parsed.data.returnPath,
    });
    return ok({ url });
  } catch (err) {
    if (err instanceof PaymentUnavailableError) return fail(err.message, 503);
    return fail(err instanceof Error ? err.message : "Connect bağlantısı açılamadı", 502);
  }
}
