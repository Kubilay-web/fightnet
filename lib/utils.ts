import type { Discipline } from "@prisma/client";

/** className birleştirici — clsx bağımlılığı olmadan */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const SLUG_MAP: Record<string, string> = {
  ä: "ae", ö: "oe", ü: "ue", ß: "ss",
  ç: "c", ğ: "g", ı: "i", İ: "i", ş: "s",
  á: "a", à: "a", â: "a", é: "e", è: "e", ê: "e",
  í: "i", ó: "o", ô: "o", ú: "u", ñ: "n",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äöüßçğıİşáàâéèêíóôúñ]/g, (c) => SLUG_MAP[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function uniqueSlug(base: string): string {
  return `${slugify(base)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(date: Date | string, locale = "tr-TR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string, locale = "tr-TR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatTime(date: Date | string, locale = "tr-TR"): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

/**
 * Göreli zaman birimleri — `Intl.RelativeTimeFormat` yerine el yazımı tablo,
 * çünkü kart köşelerindeki rozet tek satırda kalmak zorunda ve Türkçe biçim
 * ("3 sa") mevcut tasarımda birebir korunuyor.
 */
const TIME_AGO_UNITS: Record<string, { now: string; min: string; hour: string; day: string; week: string; month: string; year: string }> = {
  de: { now: "gerade eben", min: "Min.", hour: "Std.", day: "Tage", week: "Wo.", month: "Mon.", year: "Jahre" },
  en: { now: "just now", min: "min", hour: "h", day: "d", week: "w", month: "mo", year: "y" },
  tr: { now: "az önce", min: "dk", hour: "sa", day: "gün", week: "hf", month: "ay", year: "yıl" },
};

export function timeAgo(date: Date | string, locale = "tr"): string {
  const u = TIME_AGO_UNITS[locale] ?? TIME_AGO_UNITS.tr;
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return u.now;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} ${u.min}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${u.hour}`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ${u.day}`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} ${u.week}`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} ${u.month}`;
  return `${Math.floor(d / 365)} ${u.year}`;
}

export function formatMoney(value: number, currency = "EUR", locale = "de-DE"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

export function compact(n: number): string {
  return new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Müsabaka bilançosu: 12-3-1 */
export function formatRecord(w: number, l: number, d: number, nc = 0): string {
  return nc > 0 ? `${w}-${l}-${d} (${nc} NC)` : `${w}-${l}-${d}`;
}

export function age(birth: Date | string | null | undefined): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  const diff = Date.now() - b.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

/** Haversine — km cinsinden mesafe */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

/** MongoDB coğrafi kutu filtresi — indeks dostu, hızlı */
export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180) || 1);
  return {
    lat: { gte: lat - latDelta, lte: lat + latDelta },
    lng: { gte: lng - lngDelta, lte: lng + lngDelta },
  };
}

/** Antrenman streak hesabı — §4.1 */
export function calcStreak(dates: Date[]): number {
  if (!dates.length) return 0;
  const days = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  // Bugün antrenman yoksa dünden başla (streak henüz kırılmadı)
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Keşfet akışı sıralaması — Hacker News tarzı zaman sönümü */
export function engagementScore(likes: number, comments: number, views: number, createdAt: Date): number {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
  const raw = likes * 3 + comments * 5 + views * 0.1;
  return Math.round((raw / Math.pow(hours + 2, 1.5)) * 1000) / 1000;
}

/** Profil tamamlanma oranı — H2 hipotezi ölçümü (§10.2) */
export function profileCompletion(u: {
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  birthDate?: Date | null;
  heightCm?: number | null;
  sportProfiles?: unknown[];
  gymMemberships?: unknown[];
}): number {
  const checks = [
    !!u.avatarUrl,
    !!u.bio && u.bio.length > 20,
    !!u.city,
    !!u.birthDate,
    !!u.heightCm,
    (u.sportProfiles?.length ?? 0) > 0,
    (u.gymMemberships?.length ?? 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function truncate(text: string, max = 140): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function parseIntSafe(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export function disciplineGradient(d: Discipline | string): string {
  const map: Record<string, string> = {
    MMA: "from-red-600 to-orange-500",
    BOXING: "from-amber-500 to-red-600",
    BJJ: "from-blue-600 to-indigo-600",
    MUAY_THAI: "from-rose-600 to-pink-600",
    KICKBOXING: "from-orange-500 to-amber-400",
    WRESTLING: "from-emerald-600 to-teal-500",
    JUDO: "from-sky-600 to-blue-500",
    KARATE: "from-violet-600 to-purple-500",
    SAMBO: "from-lime-600 to-green-500",
    TAEKWONDO: "from-cyan-600 to-sky-500",
    GRAPPLING: "from-teal-600 to-cyan-500",
    KRAV_MAGA: "from-slate-600 to-zinc-500",
  };
  return map[d] ?? "from-red-600 to-orange-500";
}

export function absoluteUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function randomCode(len = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
