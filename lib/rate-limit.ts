/**
 * Bellek içi kayan pencere hız sınırlayıcı.
 * Redis gerektirmeden tek örnek üzerinde kötüye kullanımı engeller;
 * çok örnekli dağıtımda Upstash/Redis ile değiştirilebilir.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
    if (!bucket.hits.length) buckets.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInSec: number;
}

export function rateLimit(key: string, limit = 20, windowMs = 60_000): RateLimitResult {
  sweep(windowMs);
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0];
    return {
      success: false,
      remaining: 0,
      resetInSec: Math.ceil((windowMs - (now - oldest)) / 1000),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { success: true, remaining: limit - bucket.hits.length, resetInSec: Math.ceil(windowMs / 1000) };
}

export const LIMITS = {
  auth: { limit: 8, window: 60_000 },
  write: { limit: 30, window: 60_000 },
  comment: { limit: 15, window: 60_000 },
  upload: { limit: 20, window: 60_000 },
  search: { limit: 60, window: 60_000 },
  report: { limit: 10, window: 300_000 },
} as const;
