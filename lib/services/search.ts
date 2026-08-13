import "server-only";

/**
 * §5.3 — Algolia arama adaptörü.
 *
 * Algolia ücretli bir servistir; anahtar tanımlı değilse tüm arama akışı
 * mevcut PostgreSQL/Mongo sorgularıyla çalışmaya devam eder (`searchConfigured`
 * false). İndeksleme çağrıları bu durumda sessizce no-op olur, böylece
 * uygulama kodu iki yolu ayrı ayrı bilmek zorunda kalmaz.
 */

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

export const searchConfigured = Boolean(APP_ID && ADMIN_KEY);

export type SearchIndex = "fighters" | "gyms" | "events" | "posts" | "products";

const INDEX_PREFIX = process.env.ALGOLIA_INDEX_PREFIX ?? "fightnet";

function indexName(index: SearchIndex): string {
  return `${INDEX_PREFIX}_${index}`;
}

async function algolia<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE" | "GET",
  body?: unknown,
): Promise<T | null> {
  if (!APP_ID || !ADMIN_KEY) return null;
  try {
    const res = await fetch(`https://${APP_ID}.algolia.net${path}`, {
      method,
      headers: {
        "X-Algolia-Application-Id": APP_ID,
        "X-Algolia-API-Key": ADMIN_KEY,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface SearchRecord {
  objectID: string;
  [key: string]: unknown;
}

/** Tek kayıt yaz/güncelle — kritik yol dışında çağrılır, hata isteği bloklamaz. */
export function indexRecord(index: SearchIndex, record: SearchRecord): Promise<unknown> {
  if (!searchConfigured) return Promise.resolve(null);
  return algolia(`/1/indexes/${indexName(index)}/${encodeURIComponent(record.objectID)}`, "PUT", record);
}

export function indexRecords(index: SearchIndex, records: SearchRecord[]): Promise<unknown> {
  if (!searchConfigured || !records.length) return Promise.resolve(null);
  return algolia(`/1/indexes/${indexName(index)}/batch`, "POST", {
    requests: records.map((body) => ({ action: "updateObject", body })),
  });
}

export function deleteRecord(index: SearchIndex, objectID: string): Promise<unknown> {
  if (!searchConfigured) return Promise.resolve(null);
  return algolia(`/1/indexes/${indexName(index)}/${encodeURIComponent(objectID)}`, "DELETE");
}

export interface SearchHit {
  objectID: string;
  [key: string]: unknown;
}

/**
 * @returns null → Algolia yapılandırılmamış; çağıran veritabanı aramasına düşmeli.
 */
export async function search(
  index: SearchIndex,
  query: string,
  opts?: { hitsPerPage?: number; filters?: string; page?: number },
): Promise<{ hits: SearchHit[]; nbHits: number } | null> {
  const res = await algolia<{ hits: SearchHit[]; nbHits: number }>(
    `/1/indexes/${indexName(index)}/query`,
    "POST",
    {
      query,
      hitsPerPage: opts?.hitsPerPage ?? 20,
      page: opts?.page ?? 0,
      ...(opts?.filters ? { filters: opts.filters } : {}),
    },
  );
  return res;
}
