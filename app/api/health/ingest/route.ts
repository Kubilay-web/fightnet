import { guard, isResponse, parseBody, ok, fail } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { healthIngestSchema } from "@/lib/validators";
import { connectionFromBearer, ingestHealthSamples } from "@/lib/health-sync";
import type { HealthSampleInput } from "@/lib/services/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * §4.4 — Cihaz üstü sağlayıcıların (Apple HealthKit, Google Health Connect)
 * yazma ucu.
 *
 * Oturum çerezi yoktur: native istemci panelden aldığı cihaz jetonuyla
 * kimliklenir. Yanıt kabul edilen `externalId` listesidir; istemci yalnızca
 * bunları kuyruğundan düşer, gerisi bir sonraki denemede tekrar gelir.
 */
export async function POST(req: Request) {
  const g = await guard({ bucket: "health-ingest", ...LIMITS.write });
  if (isResponse(g)) return g;

  const connection = await connectionFromBearer(req.headers.get("authorization"));
  if (!connection) return fail("Geçersiz veya iptal edilmiş cihaz jetonu", 401);

  const parsed = await parseBody(req, healthIngestSchema);
  if ("error" in parsed) return parsed.error;

  const samples: HealthSampleInput[] = parsed.data.samples
    .map((s) => ({
      externalId: s.externalId,
      startedAt: new Date(s.startedAt),
      durationMin: s.durationMin,
      activityType: s.activityType || null,
      calories: s.calories ?? null,
      avgHeartRate: s.avgHeartRate ?? null,
      maxHeartRate: s.maxHeartRate ?? null,
      distanceMeters: s.distanceMeters ?? null,
    }))
    // Geçersiz tarih tüm paketi düşürmez, yalnızca o örnek elenir.
    .filter((s) => !Number.isNaN(s.startedAt.getTime()));

  if (!samples.length) return fail("Geçerli başlangıç zamanı olan örnek yok", 422);

  const result = await ingestHealthSamples({
    connectionId: connection.id,
    userId: connection.userId,
    samples,
  });

  return ok({
    ok: true,
    accepted: result.accepted,
    created: result.created,
    trainings: result.trainings,
  });
}
