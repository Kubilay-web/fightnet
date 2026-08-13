import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { Discipline } from "@prisma/client";

/**
 * §4.4 — Donanım entegrasyonu (Apple HealthKit, Google Health, Garmin, Polar).
 *
 * İki farklı bağlantı biçimi vardır ve ikisi de burada karşılanır:
 *
 *   1. Cihaz üstü (Apple HealthKit / Google Health Connect) — veri yalnızca
 *      telefonda okunabilir. Sunucu tarafı bir OAuth akışı yoktur; native
 *      istemci normalize edilmiş örnekleri `/api/health/ingest` ucuna gönderir.
 *      Bağlantı, kullanıcının panelden ürettiği cihaz jetonuyla kurulur.
 *
 *   2. Bulut API (Garmin Health, Polar AccessLink) — OAuth 2.0 + PKCE ile
 *      yetki alınır, sağlayıcı yeni aktivite geldikçe webhook atar.
 *
 * §5.7: Sağlık verisi KVKK Madde 9 özel kategorisidir. Bu yüzden bağlantı
 * ayrı ve açık izinle kurulur, izin geri alındığında örnekler silinir ve
 * veriler antrenman günlüğü dışında hiçbir yerde kullanılmaz.
 */

export type HealthProvider = "APPLE_HEALTH" | "GOOGLE_HEALTH" | "GARMIN" | "POLAR";

export const HEALTH_PROVIDERS: { value: HealthProvider; label: string; kind: "device" | "cloud" }[] = [
  { value: "APPLE_HEALTH", label: "Apple HealthKit", kind: "device" },
  { value: "GOOGLE_HEALTH", label: "Google Health Connect", kind: "device" },
  { value: "GARMIN", label: "Garmin Connect", kind: "cloud" },
  { value: "POLAR", label: "Polar Flow", kind: "cloud" },
];

const GARMIN_ID = process.env.GARMIN_CLIENT_ID;
const GARMIN_SECRET = process.env.GARMIN_CLIENT_SECRET;
const POLAR_ID = process.env.POLAR_CLIENT_ID;
const POLAR_SECRET = process.env.POLAR_CLIENT_SECRET;

export function providerConfigured(provider: HealthProvider): boolean {
  switch (provider) {
    // Cihaz üstü sağlayıcılar sunucu anahtarı gerektirmez: jeton akışı yeterli.
    case "APPLE_HEALTH":
    case "GOOGLE_HEALTH":
      return true;
    case "GARMIN":
      return Boolean(GARMIN_ID && GARMIN_SECRET);
    case "POLAR":
      return Boolean(POLAR_ID && POLAR_SECRET);
  }
}

export const healthCloudConfigured = providerConfigured("GARMIN") || providerConfigured("POLAR");

// ---------------------------------------------------------------------------
// Cihaz jetonu — native istemcinin kimliği
// ---------------------------------------------------------------------------

export interface DeviceToken {
  /** İstemciye bir kez gösterilir */
  plain: string;
  /** DB'de yalnızca bu tutulur */
  hash: string;
}

export function createDeviceToken(): DeviceToken {
  const plain = `fnh_${randomBytes(24).toString("base64url")}`;
  return { plain, hash: hashDeviceToken(plain) };
}

export function hashDeviceToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

// ---------------------------------------------------------------------------
// OAuth — Garmin / Polar
// ---------------------------------------------------------------------------

const AUTHORIZE_URL: Partial<Record<HealthProvider, string>> = {
  GARMIN: "https://connect.garmin.com/oauth2Confirm",
  POLAR: "https://flow.polar.com/oauth2/authorization",
};

const TOKEN_URL: Partial<Record<HealthProvider, string>> = {
  GARMIN: "https://diauth.garmin.com/di-oauth2-service/oauth/token",
  POLAR: "https://polarremote.com/v2/oauth2/token",
};

export function pkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function authorizeUrl(input: {
  provider: HealthProvider;
  redirectUri: string;
  state: string;
  challenge: string;
}): string | null {
  const base = AUTHORIZE_URL[input.provider];
  if (!base || !providerConfigured(input.provider)) return null;

  const clientId = input.provider === "GARMIN" ? GARMIN_ID : POLAR_ID;
  const params = new URLSearchParams({
    client_id: clientId!,
    response_type: "code",
    redirect_uri: input.redirectUri,
    state: input.state,
  });
  if (input.provider === "GARMIN") {
    params.set("code_challenge", input.challenge);
    params.set("code_challenge_method", "S256");
  }
  return `${base}?${params.toString()}`;
}

export interface HealthTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  externalUserId: string | null;
}

export async function exchangeCode(input: {
  provider: HealthProvider;
  code: string;
  redirectUri: string;
  verifier?: string;
}): Promise<HealthTokens | null> {
  const url = TOKEN_URL[input.provider];
  if (!url || !providerConfigured(input.provider)) return null;

  const clientId = input.provider === "GARMIN" ? GARMIN_ID : POLAR_ID;
  const clientSecret = input.provider === "GARMIN" ? GARMIN_SECRET : POLAR_SECRET;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
  });
  if (input.verifier) body.set("code_verifier", input.verifier);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      x_user_id?: number | string;
      user_id?: string;
    };
    if (!json.access_token) return null;

    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? null,
      expiresAt: new Date(Date.now() + (json.expires_in ?? 3600) * 1000),
      externalUserId: String(json.x_user_id ?? json.user_id ?? "") || null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Örnek normalizasyonu — sağlayıcıdan bağımsız tek biçim
// ---------------------------------------------------------------------------

export interface HealthSampleInput {
  externalId: string;
  startedAt: Date;
  durationMin: number;
  activityType: string | null;
  calories: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  distanceMeters: number | null;
}

/** Sağlayıcı aktivite adlarını platform disiplinlerine eşler. */
const ACTIVITY_TO_DISCIPLINE: Record<string, Discipline> = {
  boxing: "BOXING",
  kickboxing: "KICKBOXING",
  martial_arts: "MMA",
  mixed_martial_arts: "MMA",
  wrestling: "WRESTLING",
  judo: "JUDO",
  karate: "KARATE",
  taekwondo: "TAEKWONDO",
  muay_thai: "MUAY_THAI",
  jiu_jitsu: "BJJ",
};

export function disciplineFromActivity(activity: string | null): Discipline | null {
  if (!activity) return null;
  const key = activity.toLowerCase().replace(/[\s-]+/g, "_");
  return ACTIVITY_TO_DISCIPLINE[key] ?? null;
}

/** Nabız ortalamasından 1–5 arası yoğunluk türetir (maks. nabız 220-yaş). */
export function intensityFromHeartRate(avgHr: number | null, age: number | null): number {
  if (!avgHr) return 3;
  const max = 220 - (age ?? 30);
  const ratio = avgHr / max;
  if (ratio >= 0.9) return 5;
  if (ratio >= 0.8) return 4;
  if (ratio >= 0.7) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

export interface PolarExercise {
  id?: number | string;
  "start-time"?: string;
  duration?: string;
  sport?: string;
  calories?: number;
  "heart-rate"?: { average?: number; maximum?: number };
  distance?: number;
}

/** ISO 8601 süre (PT1H30M) → dakika */
export function parseIsoDuration(value: string | undefined): number {
  if (!value) return 0;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?$/.exec(value);
  if (!m) return 0;
  return Math.round(Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0) + Number(m[3] ?? 0) / 60);
}

export function normalizePolarExercise(ex: PolarExercise): HealthSampleInput | null {
  if (!ex["start-time"]) return null;
  return {
    externalId: String(ex.id ?? ex["start-time"]),
    startedAt: new Date(ex["start-time"]),
    durationMin: parseIsoDuration(ex.duration),
    activityType: ex.sport ?? null,
    calories: ex.calories ?? null,
    avgHeartRate: ex["heart-rate"]?.average ?? null,
    maxHeartRate: ex["heart-rate"]?.maximum ?? null,
    distanceMeters: ex.distance ?? null,
  };
}

export interface GarminActivity {
  summaryId?: string;
  startTimeInSeconds?: number;
  durationInSeconds?: number;
  activityType?: string;
  activeKilocalories?: number;
  averageHeartRateInBeatsPerMinute?: number;
  maxHeartRateInBeatsPerMinute?: number;
  distanceInMeters?: number;
}

export function normalizeGarminActivity(a: GarminActivity): HealthSampleInput | null {
  if (!a.startTimeInSeconds) return null;
  return {
    externalId: String(a.summaryId ?? a.startTimeInSeconds),
    startedAt: new Date(a.startTimeInSeconds * 1000),
    durationMin: Math.round((a.durationInSeconds ?? 0) / 60),
    activityType: a.activityType ?? null,
    calories: a.activeKilocalories ?? null,
    avgHeartRate: a.averageHeartRateInBeatsPerMinute ?? null,
    maxHeartRate: a.maxHeartRateInBeatsPerMinute ?? null,
    distanceMeters: a.distanceInMeters ?? null,
  };
}
