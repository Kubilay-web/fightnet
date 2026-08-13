import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { DEFAULT_LOCALE, LOCALES, localizePath } from "@/lib/i18n/config";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const revalidate = 3600;

/**
 * §5.2 — Her sayfa üç dilde yayınlanır.
 *
 * Site haritasına her URL'in dil sürümü ayrı satır olarak girer ve her satır
 * `alternates.languages` ile diğer sürümlere işaret eder. Bu olmadan arama
 * motorları üç sürümü yinelenen içerik sayar ve yalnızca birini indeksler.
 */
function withAlternates(canonicalPath: string, lastModified: Date, priority: number): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [locale, `${BASE}${localizePath(canonicalPath, locale)}`]),
  );

  return LOCALES.map((locale) => ({
    url: `${BASE}${localizePath(canonicalPath, locale)}`,
    lastModified,
    priority,
    changeFrequency: (canonicalPath === "/" ? "daily" : "weekly") as "daily" | "weekly",
    alternates: {
      languages: { ...languages, "x-default": `${BASE}${localizePath(canonicalPath, DEFAULT_LOCALE)}` },
    },
  }));
}

const STATIC_PATHS = [
  "/", "/dovuscular", "/salonlar", "/etkinlikler", "/sparring", "/kocluk", "/akis",
  "/forum", "/creator", "/pazar", "/sponsorluk", "/harita",
  "/hakkinda", "/salonlar-icin", "/beta", "/iletisim", "/premium", "/veri-lisansi",
  "/gizlilik", "/sartlar", "/topluluk-kurallari", "/sparring-sozlesmesi", "/kunye", "/seffaflik",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = STATIC_PATHS.flatMap((p) => withAlternates(p, now, p === "/" ? 1 : 0.7));

  const empty: MetadataRoute.Sitemap = [];
  const dynamicRoutes = await safe<MetadataRoute.Sitemap>(
    async () => {
      const [fighters, gyms, events, threads, coaching] = await Promise.all([
        prisma.user.findMany({
          where: { isActive: true, isBanned: false, visibility: "PUBLIC", verification: { not: "LEVEL_0" } },
          select: { slug: true, updatedAt: true },
          take: 5000,
        }),
        prisma.gym.findMany({
          where: { status: "ACTIVE" },
          select: { slug: true, updatedAt: true },
          take: 2000,
        }),
        prisma.event.findMany({
          where: { status: { in: ["PUBLISHED", "LIVE", "FINISHED"] } },
          select: { slug: true, updatedAt: true },
          take: 3000,
        }),
        prisma.forumThread.findMany({
          where: { moderation: "APPROVED" },
          select: { slug: true, updatedAt: true },
          take: 3000,
        }),
        prisma.coachingOffer.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
          take: 1000,
        }),
      ]);

      return [
        ...fighters.flatMap((f) => withAlternates(`/dovuscular/${f.slug}`, f.updatedAt, 0.8)),
        ...gyms.flatMap((g) => withAlternates(`/salonlar/${g.slug}`, g.updatedAt, 0.8)),
        ...events.flatMap((e) => withAlternates(`/etkinlikler/${e.slug}`, e.updatedAt, 0.9)),
        ...threads.flatMap((t) => withAlternates(`/forum/${t.slug}`, t.updatedAt, 0.5)),
        ...coaching.flatMap((c) => withAlternates(`/kocluk/${c.slug}`, c.updatedAt, 0.6)),
      ];
    },
    empty,
  );

  return [...staticRoutes, ...dynamicRoutes];
}
