import "server-only";

/**
 * §5.3 / §5.7 — PostHog (KVKK uyumlu, AB barındırma) olay gönderimi.
 *
 * Kullanıcı izni olmadan hiçbir olay gönderilmez: §8.2 "Value First" ve
 * çerez banner'ındaki granüler izin kaydı (User.consent.analytics) esas alınır.
 * Anahtar yoksa çağrı no-op olur.
 */

const KEY = process.env.POSTHOG_API_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

export const analyticsConfigured = Boolean(KEY);

export interface AnalyticsEvent {
  event: string;
  /** Anonim kullanıcılar için oturum/istek kimliği */
  distinctId: string;
  properties?: Record<string, unknown>;
  /** İzin verilmediyse olay hiç gönderilmez */
  consented: boolean;
}

export function capture(input: AnalyticsEvent): Promise<void> {
  if (!KEY || !input.consented) return Promise.resolve();
  return fetch(`${HOST}/i/v0/e/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: KEY,
      event: input.event,
      distinct_id: input.distinctId,
      properties: { ...input.properties, $lib: "fightnet-server" },
      timestamp: new Date().toISOString(),
    }),
    cache: "no-store",
  })
    .then(() => undefined)
    .catch(() => undefined);
}

/** §5.7 — silme hakkı: PostHog tarafındaki kişi kaydı da silinmeli. */
export async function deletePerson(distinctId: string): Promise<boolean> {
  const personalKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!personalKey || !projectId) return false;
  try {
    const res = await fetch(
      `${HOST}/api/projects/${projectId}/persons/?distinct_id=${encodeURIComponent(distinctId)}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${personalKey}` }, cache: "no-store" },
    );
    return res.ok;
  } catch {
    return false;
  }
}
