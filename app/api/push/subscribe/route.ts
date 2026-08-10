import { z } from "zod";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok, fail } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { pushConfigured } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** §4.1 — Cihazın Web Push aboneliğini kaydeder / siler */

const subscribeSchema = z.object({
  endpoint: z.string().url().max(600),
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(100),
  }),
});

export async function POST(req: Request) {
  const g = await guard({ bucket: "push-sub", ...LIMITS.write, auth: true });
  if (isResponse(g)) return g;
  if (!pushConfigured) return fail("Push bildirimleri bu ortamda yapılandırılmamış", 503);

  const parsed = await parseBody(req, subscribeSchema);
  if ("error" in parsed) return parsed.error;
  const { endpoint, keys } = parsed.data;

  const h = await headers();
  const userId = g.session!.sub;

  // Aynı endpoint başka bir hesapta kayıtlıysa (paylaşılan cihaz) sahibi güncellenir
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId, p256dh: keys.p256dh, auth: keys.auth, lastUsedAt: new Date() },
    create: {
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: h.get("user-agent")?.slice(0, 200) ?? null,
    },
  });

  await prisma.user.update({ where: { id: userId }, data: { pushEnabled: true } });

  return ok({ ok: true });
}

export async function DELETE(req: Request) {
  const g = await guard({ bucket: "push-sub", ...LIMITS.write, auth: true });
  if (isResponse(g)) return g;

  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint");
  const userId = g.session!.sub;

  // endpoint verilmezse kullanıcının tüm cihazları kapatılır
  await prisma.pushSubscription.deleteMany({
    where: { userId, ...(endpoint ? { endpoint } : {}) },
  });

  return ok({ ok: true });
}
