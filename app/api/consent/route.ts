import { z } from "zod";
import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * §5.7 — İzin kaydı. Oturum açık kullanıcının çerez/veri tercihi hesaba
 * işlenir; KVKK'nın ispat yükümlülüğü için zaman damgasıyla saklanır.
 * Oturum yoksa karar yalnızca cihazda kalır — bu da geçerli bir izindir.
 */
const consentSchema = z.object({
  version: z.number().int().min(1).max(100),
  analytics: z.boolean(),
  marketing: z.boolean(),
  health: z.boolean(),
});

export async function POST(req: Request) {
  const g = await guard({ bucket: "consent", ...LIMITS.write });
  if (isResponse(g)) return g;

  const parsed = await parseBody(req, consentSchema);
  if ("error" in parsed) return parsed.error;

  if (!g.session) return ok({ ok: true, stored: "device" });

  await prisma.user.update({
    where: { id: g.session.sub },
    data: { consent: parsed.data, consentAt: new Date() },
  });

  return ok({ ok: true, stored: "account" });
}
