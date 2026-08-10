import { z } from "zod";
import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { trainingSchema } from "@/lib/validators";
import { recalcStreak } from "@/app/panel/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * §5.2 — Çevrimdışı antrenman kuyruğunun toplu senkronu.
 *
 * İstemci bağlantı gelince biriken kayıtları buraya gönderir. Yanıt, gerçekten
 * yazılan (veya zaten yazılmış olan) `clientId` listesidir; istemci yalnızca
 * bunları kuyruğundan düşer, gerisi bir sonraki denemede tekrar gelir.
 */

const syncSchema = z.object({
  entries: z
    .array(trainingSchema.extend({ clientId: z.string().min(1).max(64) }))
    .min(1)
    .max(50),
});

export async function POST(req: Request) {
  const g = await guard({ bucket: "training-sync", ...LIMITS.write, auth: true });
  if (isResponse(g)) return g;
  const userId = g.session!.sub;

  const parsed = await parseBody(req, syncSchema);
  if ("error" in parsed) return parsed.error;

  const entries = parsed.data.entries;
  const clientIds = entries.map((e) => e.clientId);

  // Tekillik: aynı clientId ikinci kez yazılmaz. Zaten yazılmış olanlar da
  // "kabul edildi" sayılır, aksi halde kuyrukta sonsuza dek takılı kalırlar.
  const existing = await prisma.trainingLog.findMany({
    where: { userId, clientId: { in: clientIds } },
    select: { clientId: true },
  });
  const already = new Set(existing.map((e) => e.clientId));

  const fresh = entries.filter((e) => !already.has(e.clientId));

  if (fresh.length) {
    await prisma.trainingLog.createMany({
      data: fresh.map((d) => ({
        userId,
        date: new Date(d.date),
        discipline: d.discipline,
        durationMin: d.durationMin,
        intensity: d.intensity,
        type: d.type || null,
        gymId: d.gymId || null,
        rounds: d.rounds ?? null,
        techniques: d.techniques,
        notes: d.notes || null,
        mood: d.mood ?? null,
        weightKg: d.weightKg ?? null,
        visibility: d.visibility,
        clientId: d.clientId,
        syncedAt: new Date(),
      })),
    });
    await recalcStreak(userId);
  }

  return ok({ ok: true, synced: fresh.length, accepted: clientIds });
}
