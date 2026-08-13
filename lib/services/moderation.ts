import "server-only";
import { awsConfigured, awsRequest } from "./aws";

/**
 * §11.3 Kapı 3 — otomatik içerik ön filtresi.
 *
 * Üç katman, hepsi aynı sonucu üretir:
 *   1. Metin  → Google Perspective API (anahtar varsa)
 *   2. Görsel → AWS Rekognition DetectModerationLabels (kimlik bilgisi varsa)
 *   3. Fallback → yerel sözlük heuristiği (anahtar yokken de filtre ÇALIŞIR)
 *
 * Üçüncü katman bilinçlidir: Şartlar, Topluluk Kuralları ve Şeffaflık Raporu
 * sayfaları kullanıcıya "içerikler otomatik ön filtreden geçer" taahhüdü
 * veriyor. Harici servis yapılandırılmamış olsa bile bu taahhüt karşılanmalı;
 * aksi halde metin ile davranış çelişirdi.
 */

export type ModerationVerdict = "APPROVED" | "PENDING" | "REJECTED";

export interface ModerationOutcome {
  verdict: ModerationVerdict;
  /** 0 (temiz) – 1 (kesin ihlal) */
  score: number;
  labels: string[];
  provider: string;
  reason: string | null;
}

/** Otomatik ret eşiği — üzerinde insan incelemesi beklenmez */
const REJECT_AT = 0.85;
/** İnsan incelemesi eşiği */
const REVIEW_AT = 0.35;

const PERSPECTIVE_KEY = process.env.PERSPECTIVE_API_KEY;

export const moderationProviders = {
  text: PERSPECTIVE_KEY ? "perspective" : "heuristic",
  image: awsConfigured ? "rekognition" : "heuristic",
} as const;

export const moderationConfigured = Boolean(PERSPECTIVE_KEY) || awsConfigured;

// ---------------------------------------------------------------------------
// Katman 3 — yerel sözlük. DE / EN / TR, §11.3'teki yasak kategoriler.
// ---------------------------------------------------------------------------

interface Rule {
  label: string;
  weight: number;
  terms: string[];
}

const RULES: Rule[] = [
  {
    label: "WEIGHT_CUT",
    weight: 0.9,
    terms: [
      // TR
      "su yükle", "sauna torbası", "kilo kır", "aç kal", "sıvı kısıtla", "diüretik",
      // DE
      "wasserentzug", "entwässerungstabletten", "hungern", "abführmittel",
      // EN
      "water cut", "dehydrate before weigh", "diuretic", "starve yourself", "laxative",
    ],
  },
  {
    label: "DOPING",
    weight: 0.9,
    terms: [
      "anabolik", "steroid", "epo kullan", "sustanon", "trenbolon", "clenbuterol",
      "testosteron kürü", "dopingle", "peds cycle", "sarms",
    ],
  },
  {
    label: "EATING_DISORDER",
    weight: 0.95,
    terms: ["anorek", "bulimi", "thinspo", "pro-ana", "kusarak", "erbrechen nach dem essen"],
  },
  {
    label: "SEXUAL_CONTENT",
    weight: 0.9,
    terms: ["porn", "nude", "nackt", "çıplak fotoğraf", "sikiş", "onlyfans link"],
  },
  {
    label: "HARASSMENT",
    weight: 0.6,
    terms: [
      "gebereceksin", "seni öldür", "ich bring dich um", "i will kill you",
      "orospu", "hurensohn", "piç", "amk", "wichser",
    ],
  },
  {
    label: "MINOR_SAFETY",
    weight: 0.95,
    terms: ["13 yaşında sevgili", "minderjährig nackt", "underage nude"],
  },
];

/** Aksan/diakritik ve tekrar eden harfleri sadeleştirir — basit kaçırma denemelerini yakalar. */
function normalize(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function heuristicScreen(text: string): ModerationOutcome {
  const haystack = normalize(text);
  if (!haystack) return clean("heuristic");

  const labels: string[] = [];
  let score = 0;

  for (const rule of RULES) {
    const hit = rule.terms.some((t) => haystack.includes(normalize(t)));
    if (hit) {
      labels.push(rule.label);
      score = Math.max(score, rule.weight);
    }
  }

  return {
    verdict: verdictFor(score),
    score,
    labels,
    provider: "heuristic",
    reason: labels.length ? `Yerel sözlük eşleşmesi: ${labels.join(", ")}` : null,
  };
}

function clean(provider: string): ModerationOutcome {
  return { verdict: "APPROVED", score: 0, labels: [], provider, reason: null };
}

function verdictFor(score: number): ModerationVerdict {
  if (score >= REJECT_AT) return "REJECTED";
  if (score >= REVIEW_AT) return "PENDING";
  return "APPROVED";
}

// ---------------------------------------------------------------------------
// Katman 1 — Perspective API
// ---------------------------------------------------------------------------

const PERSPECTIVE_ATTRIBUTES = [
  "TOXICITY",
  "SEVERE_TOXICITY",
  "THREAT",
  "INSULT",
  "IDENTITY_ATTACK",
] as const;

interface PerspectiveResponse {
  attributeScores?: Record<string, { summaryScore?: { value?: number } }>;
}

export async function screenText(text: string): Promise<ModerationOutcome> {
  const local = heuristicScreen(text);
  if (!PERSPECTIVE_KEY || !text.trim()) return local;

  try {
    const res = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: { text: text.slice(0, 3000) },
          languages: ["tr", "de", "en"],
          doNotStore: true, // KVKK: Google'da örnek saklanmaz
          requestedAttributes: Object.fromEntries(
            PERSPECTIVE_ATTRIBUTES.map((a) => [a, {}]),
          ),
        }),
        cache: "no-store",
      },
    );
    if (!res.ok) return local;

    const json = (await res.json()) as PerspectiveResponse;
    const labels: string[] = [];
    let score = 0;
    for (const attr of PERSPECTIVE_ATTRIBUTES) {
      const value = json.attributeScores?.[attr]?.summaryScore?.value ?? 0;
      if (value >= REVIEW_AT) labels.push(attr);
      score = Math.max(score, attr === "SEVERE_TOXICITY" || attr === "THREAT" ? value : value * 0.9);
    }

    // Yerel sözlük her zaman geçerli: harici skor düşük olsa da doping/kilo
    // düşürme gibi spora özel ihlaller Perspective tarafından bilinmez.
    const merged = Math.max(score, local.score);
    return {
      verdict: verdictFor(merged),
      score: Math.round(merged * 100) / 100,
      labels: [...new Set([...labels, ...local.labels])],
      provider: local.labels.length ? "perspective+heuristic" : "perspective",
      reason: merged >= REVIEW_AT ? `Metin risk skoru ${(merged * 100).toFixed(0)}%` : null,
    };
  } catch {
    return local;
  }
}

// ---------------------------------------------------------------------------
// Katman 2 — Rekognition DetectModerationLabels
// ---------------------------------------------------------------------------

interface RekognitionResponse {
  ModerationLabels?: { Name?: string; ParentName?: string; Confidence?: number }[];
}

/** Rekognition'a gönderilecek en büyük kare (5 MB API limiti) */
const MAX_IMAGE_BYTES = 4_500_000;

/**
 * Görsel/karede müstehcenlik, şiddet ve uyuşturucu tespiti.
 * Video için Cloudinary'nin ürettiği poster karesi (thumbUrl) taranır —
 * tam video analizi S3 + asenkron iş gerektirir, o Faz 3 kapsamında.
 */
export async function screenImage(url: string): Promise<ModerationOutcome> {
  if (!awsConfigured || !url) return clean("heuristic");

  try {
    const imgRes = await fetch(url, { cache: "no-store" });
    if (!imgRes.ok) return clean("rekognition");
    const buf = Buffer.from(await imgRes.arrayBuffer());
    if (buf.byteLength > MAX_IMAGE_BYTES) return clean("rekognition");

    const json = await awsRequest<RekognitionResponse>({
      service: "rekognition",
      target: "RekognitionService.DetectModerationLabels",
      body: { Image: { Bytes: buf.toString("base64") }, MinConfidence: 50 },
    });

    const labels = json.ModerationLabels ?? [];
    if (!labels.length) return clean("rekognition");

    const score = Math.max(...labels.map((l) => (l.Confidence ?? 0) / 100));
    return {
      verdict: verdictFor(score),
      score: Math.round(score * 100) / 100,
      labels: [...new Set(labels.map((l) => l.Name ?? l.ParentName ?? "UNKNOWN"))],
      provider: "rekognition",
      reason: `Görsel etiketi: ${labels.map((l) => l.Name).filter(Boolean).join(", ")}`,
    };
  } catch {
    return clean("rekognition");
  }
}

// ---------------------------------------------------------------------------
// Birleşik giriş noktası
// ---------------------------------------------------------------------------

export interface ScreenInput {
  text?: string | null;
  imageUrl?: string | null;
  kind: "TEXT" | "IMAGE" | "VIDEO";
}

/**
 * §11.3 — "Videolar otomatik ön filtreden geçer, sonra insan incelemesi yapılır".
 * Bu yüzden video otomatik ONAY alamaz: en iyi ihtimalle PENDING'e düşer.
 */
export async function screenContent(input: ScreenInput): Promise<ModerationOutcome> {
  const [textOut, imageOut] = await Promise.all([
    input.text ? screenText(input.text) : Promise.resolve(clean(moderationProviders.text)),
    input.imageUrl ? screenImage(input.imageUrl) : Promise.resolve(clean(moderationProviders.image)),
  ]);

  const score = Math.max(textOut.score, imageOut.score);
  const labels = [...new Set([...textOut.labels, ...imageOut.labels])];
  const providers = [...new Set([textOut.provider, imageOut.provider])].join("+");
  let verdict = verdictFor(score);

  if (input.kind === "VIDEO" && verdict === "APPROVED") verdict = "PENDING";

  return {
    verdict,
    score: Math.round(score * 100) / 100,
    labels,
    provider: providers,
    reason: textOut.reason ?? imageOut.reason,
  };
}
