import { guard, isResponse, ok, fail } from "@/lib/api";
import prisma from "@/lib/prisma";
import { ingestHealthSamples } from "@/lib/health-sync";
import {
  HEALTH_PROVIDERS,
  normalizeGarminActivity,
  normalizePolarExercise,
  providerConfigured,
  type GarminActivity,
  type HealthSampleInput,
  type PolarExercise,
} from "@/lib/services/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ provider: string }> };

/**
 * §4.4 — Garmin / Polar bildirim ucu.
 *
 * Sağlayıcı, kullanıcı adına yeni aktivite kaydedildiğinde buraya POST atar.
 * Kimlik, yetkilendirme sırasında saklanan `externalUserId` üzerinden kurulur;
 * eşleşen aktif bağlantı yoksa bildirim sessizce yutulur (sağlayıcı aksi
 * halde kuyruğu tekrar tekrar dener).
 *
 * Yazma mantığı ingest ucuyla ortaktır: `ingestHealthSamples`.
 */
export async function POST(req: Request, { params }: Ctx) {
  const { provider: raw } = await params;
  const meta = HEALTH_PROVIDERS.find((p) => p.value === raw && p.kind === "cloud");
  if (!meta) return fail("Bu sağlayıcı için bildirim ucu tanımlı değil", 404);
  if (!providerConfigured(meta.value)) {
    return fail(`${meta.label} entegrasyonu bu kurulumda yapılandırılmadı.`, 503);
  }

  const g = await guard({ bucket: `health-webhook:${meta.value}`, limit: 300, window: 60_000 });
  if (isResponse(g)) return g;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  // Sağlayıcı doğrulama pingleri gövdesiz veya `event: PING` olarak gelir.
  if (!body || body.event === "PING") return ok({ ok: true });

  const groups =
    meta.value === "GARMIN" ? groupGarmin(body) : groupPolar(body);

  let created = 0;
  for (const [externalUserId, samples] of groups) {
    const connection = await prisma.deviceConnection.findFirst({
      where: { provider: meta.value, externalUserId, isActive: true, revokedAt: null },
      select: { id: true, userId: true, accessToken: true },
    });
    if (!connection) continue;

    const resolved =
      meta.value === "POLAR" ? await fetchPolarExercises(samples, connection.accessToken) : samples;
    if (!resolved.length) continue;

    const result = await ingestHealthSamples({
      connectionId: connection.id,
      userId: connection.userId,
      samples: resolved,
    });
    created += result.created;
  }

  return ok({ ok: true, created });
}

// ---------------------------------------------------------------------------
// Sağlayıcı gövdelerinin kullanıcıya göre gruplanması
// ---------------------------------------------------------------------------

interface PendingSample extends HealthSampleInput {
  /** Polar yalnızca kaynak adresi gönderir, ayrıntı sonradan çekilir. */
  fetchUrl?: string;
}

function groupGarmin(body: Record<string, unknown>): Map<string, PendingSample[]> {
  const out = new Map<string, PendingSample[]>();
  const activities = Array.isArray(body.activities) ? body.activities : [];

  for (const item of activities as (GarminActivity & { userId?: string })[]) {
    const userId = item.userId;
    if (!userId) continue;
    const sample = normalizeGarminActivity(item);
    if (!sample) continue;
    const list = out.get(userId) ?? [];
    list.push(sample);
    out.set(userId, list);
  }
  return out;
}

function groupPolar(body: Record<string, unknown>): Map<string, PendingSample[]> {
  const out = new Map<string, PendingSample[]>();
  if (body.event !== "EXERCISE") return out;

  const userId = body.user_id === undefined || body.user_id === null ? null : String(body.user_id);
  const entityId = typeof body.entity_id === "string" ? body.entity_id : null;
  const url = typeof body.url === "string" ? body.url : null;
  if (!userId || !entityId || !url) return out;

  // Ayrıntılar bildirimde gelmez: yer tutucu örnek `fetchUrl` ile tamamlanır.
  out.set(userId, [
    {
      externalId: entityId,
      startedAt: new Date(0),
      durationMin: 0,
      activityType: null,
      calories: null,
      avgHeartRate: null,
      maxHeartRate: null,
      distanceMeters: null,
      fetchUrl: url,
    },
  ]);
  return out;
}

/** Polar AccessLink egzersiz ayrıntısını kullanıcının jetonuyla çeker. */
async function fetchPolarExercises(
  pending: PendingSample[],
  accessToken: string | null,
): Promise<HealthSampleInput[]> {
  if (!accessToken) return [];
  const out: HealthSampleInput[] = [];

  for (const item of pending) {
    if (!item.fetchUrl) {
      out.push(item);
      continue;
    }
    try {
      const res = await fetch(item.fetchUrl, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const sample = normalizePolarExercise((await res.json()) as PolarExercise);
      if (sample) out.push(sample);
    } catch {
      // Sağlayıcı geçici olarak erişilemezse bildirim düşer; bir sonraki
      // bildirimde veya elle senkronda tekrar denenir.
    }
  }
  return out;
}
