import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import prisma from "./prisma";
import { age } from "./utils";
import { recalcStreak } from "@/app/panel/actions";
import {
  disciplineFromActivity,
  hashDeviceToken,
  intensityFromHeartRate,
  type HealthProvider,
  type HealthSampleInput,
} from "./services/health";

/**
 * §4.4 — Sağlık örneklerinin tek yazma yolu.
 *
 * Hem cihaz üstü ingest ucu (`/api/health/ingest`) hem de bulut sağlayıcı
 * webhook'ları (`/api/health/webhook/[provider]`) aynı fonksiyonu kullanır;
 * aksi halde tekillik ve antrenman türetme kuralları iki yerde ayrışır.
 */

export interface IngestResult {
  /** İstemcinin kuyruğundan düşebileceği örnekler (yeni yazılan + zaten yazılmış) */
  accepted: string[];
  created: number;
  trainings: number;
}

export async function ingestHealthSamples(input: {
  connectionId: string;
  userId: string;
  samples: HealthSampleInput[];
}): Promise<IngestResult> {
  const { connectionId, userId, samples } = input;
  const externalIds = samples.map((s) => s.externalId);

  // Tekillik: aynı externalId ikinci kez yazılmaz. Zaten yazılmış örnekler de
  // "kabul edildi" sayılır, yoksa istemci aynı paketi sonsuza dek gönderir.
  const existing = await prisma.healthSample.findMany({
    where: { connectionId, externalId: { in: externalIds } },
    select: { externalId: true },
  });
  const already = new Set(existing.map((e) => e.externalId));
  const fresh = samples.filter((s) => !already.has(s.externalId));

  if (!fresh.length) {
    await touchConnection(connectionId, 0);
    return { accepted: externalIds, created: 0, trainings: 0 };
  }

  // Yoğunluk nabızdan türetildiği için yaş bir kez okunur.
  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: { birthDate: true },
  });
  const userAge = age(owner?.birthDate);

  let created = 0;
  let trainings = 0;

  for (const s of fresh) {
    // Eşzamanlı iki gönderim yarışırsa benzersiz indeks devreye girer;
    // bu durumda örnek zaten yazılmıştır ve sessizce atlanır.
    const sample = await prisma.healthSample
      .create({
        data: {
          connectionId,
          userId,
          externalId: s.externalId,
          startedAt: s.startedAt,
          durationMin: Math.max(0, Math.round(s.durationMin)),
          activityType: s.activityType,
          calories: s.calories,
          avgHeartRate: s.avgHeartRate,
          maxHeartRate: s.maxHeartRate,
          distanceM: s.distanceMeters,
        },
        select: { id: true },
      })
      .catch(() => null);
    if (!sample) continue;
    created++;

    // Yalnızca dövüş sporu aktiviteleri günlüğe düşer; koşu, yürüyüş gibi
    // kayıtlar sağlık örneği olarak kalır ve antrenman sayılmaz.
    const discipline = disciplineFromActivity(s.activityType);
    if (!discipline || s.durationMin < 1) continue;

    const log = await prisma.trainingLog.create({
      data: {
        userId,
        date: s.startedAt,
        discipline,
        durationMin: Math.round(s.durationMin),
        intensity: intensityFromHeartRate(s.avgHeartRate, userAge),
        type: "cihaz",
        caloriesKcal: s.calories,
        notes: s.activityType ? `Cihazdan otomatik alındı (${s.activityType})` : "Cihazdan otomatik alındı",
        // Çevrimdışı kuyrukla aynı alan: aynı örnek elle de girilse ayırt edilir.
        clientId: `health:${connectionId}:${s.externalId}`,
        syncedAt: new Date(),
      },
      select: { id: true },
    });

    await prisma.healthSample.update({
      where: { id: sample.id },
      data: { trainingLogId: log.id },
    });
    trainings++;
  }

  await touchConnection(connectionId, created);
  // Streak yalnızca antrenman yazıldıysa değişir, gereksiz hesaplama yapılmaz.
  if (trainings) await recalcStreak(userId);

  return { accepted: externalIds, created, trainings };
}

async function touchConnection(connectionId: string, created: number) {
  await prisma.deviceConnection
    .update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date(), sampleCount: { increment: created } },
    })
    .catch(() => null);
}

// ---------------------------------------------------------------------------
// Cihaz jetonu ile kimlik
// ---------------------------------------------------------------------------

/** `Authorization: Bearer fnh_…` başlığından aktif bağlantıyı çözer. */
export async function connectionFromBearer(header: string | null) {
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token || !token.startsWith("fnh_")) return null;

  return prisma.deviceConnection.findFirst({
    where: { tokenHash: hashDeviceToken(token), isActive: true, revokedAt: null },
    select: { id: true, userId: true, provider: true },
  });
}

// ---------------------------------------------------------------------------
// OAuth durumu — imzalı çerez
// ---------------------------------------------------------------------------

/**
 * PKCE doğrulayıcısı ile CSRF nonce'u DB'ye yazılmaz: tek kullanımlık ve
 * kısa ömürlü oldukları için HMAC ile imzalanmış HttpOnly çerezde taşınır.
 * Böylece yarım kalan yetkilendirmeler artık kayıt bırakmaz.
 */
export const HEALTH_OAUTH_COOKIE = "fn_health_oauth";

const STATE_TTL_MS = 10 * 60_000;

export interface HealthOAuthState {
  provider: HealthProvider;
  userId: string;
  verifier: string;
  nonce: string;
  exp: number;
}

function stateSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET tanımlı değil veya 32 karakterden kısa.");
  }
  return secret;
}

export function createOAuthState(input: {
  provider: HealthProvider;
  userId: string;
  verifier: string;
}): { cookie: string; state: string } {
  const payload: HealthOAuthState = {
    ...input,
    nonce: randomBytes(16).toString("base64url"),
    exp: Date.now() + STATE_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return { cookie: `${body}.${sig}`, state: payload.nonce };
}

export function readOAuthState(raw: string | undefined, state: string | null): HealthOAuthState | null {
  if (!raw || !state) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as HealthOAuthState;
    // Sağlayıcıdan dönen `state` çerezle eşleşmezse istek başka bir sekmeden
    // enjekte edilmiş demektir (CSRF).
    if (payload.nonce !== state || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const oauthCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: STATE_TTL_MS / 1000,
};
