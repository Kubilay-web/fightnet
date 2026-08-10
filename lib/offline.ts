/**
 * §5.2 — "Antrenman günlüğü çevrimdışı kaydedilebilmeli"
 *
 * Bağlantı yokken kayıt tarayıcıda kuyruğa alınır, bağlantı geri geldiğinde
 * `/api/training/sync` üzerinden toplu gönderilir. Her kaydın `clientId`'si
 * vardır; sunucu aynı `clientId`'yi ikinci kez yazmaz, bu yüzden kuyruk
 * tekrar gönderilse bile veri çoğalmaz.
 *
 * Yalnızca istemci tarafında kullanılır.
 */

export const TRAINING_QUEUE_KEY = "fn-offline-trainings";

export interface QueuedTraining {
  clientId: string;
  date: string;
  discipline: string;
  durationMin: number;
  intensity: number;
  type?: string;
  gymId?: string;
  rounds?: number;
  techniques: string[];
  notes?: string;
  mood?: number;
  weightKg?: number;
  visibility: string;
  queuedAt: number;
}

/** Kuyruğun tek okuma noktası — bozuk JSON sessizce boş kuyruk olur */
export function readQueue(): QueuedTraining[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRAINING_QUEUE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as QueuedTraining[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedTraining[]) {
  try {
    localStorage.setItem(TRAINING_QUEUE_KEY, JSON.stringify(items));
  } catch {
    // Kota dolduysa en eskiyi at, kullanıcının son kaydı korunsun
    try {
      localStorage.setItem(TRAINING_QUEUE_KEY, JSON.stringify(items.slice(-20)));
    } catch {}
  }
  window.dispatchEvent(new CustomEvent("fn-queue-change", { detail: items.length }));
}

/** FormData → kuyruk kaydı. Form alanları `trainingSchema` ile aynı adlarda. */
export function formDataToTraining(fd: FormData): QueuedTraining {
  const str = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };
  const num = (k: string) => {
    const v = str(k);
    return v === undefined ? undefined : Number(v);
  };

  return {
    clientId: str("clientId") ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: str("date") ?? new Date().toISOString().slice(0, 10),
    discipline: str("discipline") ?? "MMA",
    durationMin: num("durationMin") ?? 60,
    intensity: num("intensity") ?? 3,
    type: str("type"),
    gymId: str("gymId"),
    rounds: num("rounds"),
    techniques: fd.getAll("techniques[]").filter((t): t is string => typeof t === "string"),
    notes: str("notes"),
    mood: num("mood"),
    weightKg: num("weightKg"),
    visibility: str("visibility") ?? "PRIVATE",
    queuedAt: Date.now(),
  };
}

export function enqueueTraining(entry: QueuedTraining) {
  const queue = readQueue();
  if (queue.some((q) => q.clientId === entry.clientId)) return;
  writeQueue([...queue, entry]);
}

export function queueSize(): number {
  return readQueue().length;
}

let flushing = false;

/**
 * Kuyruğu sunucuya gönderir. Aynı anda ikinci bir gönderim başlatmaz.
 * @returns yazılan kayıt sayısı
 */
export async function flushTrainingQueue(): Promise<number> {
  if (flushing || typeof navigator === "undefined" || !navigator.onLine) return 0;
  const queue = readQueue();
  if (!queue.length) return 0;

  flushing = true;
  try {
    const res = await fetch("/api/training/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: queue.slice(0, 50) }),
    });
    if (!res.ok) return 0;

    const data = (await res.json()) as { accepted?: string[] };
    const accepted = new Set(data.accepted ?? []);
    if (!accepted.size) return 0;

    // Yalnızca sunucunun onayladıklarını düş — gerisi bir sonraki denemede
    writeQueue(readQueue().filter((q) => !accepted.has(q.clientId)));
    return accepted.size;
  } catch {
    return 0;
  } finally {
    flushing = false;
  }
}
