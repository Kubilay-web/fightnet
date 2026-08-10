import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "", "/dovuscular", "/salonlar", "/etkinlikler", "/sparring", "/akis",
    "/forum", "/creator", "/pazar", "/sponsorluk", "/harita",
    "/hakkinda", "/salonlar-icin", "/beta", "/iletisim",
    "/gizlilik", "/sartlar", "/topluluk-kurallari", "/sparring-sozlesmesi", "/kunye",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const empty: MetadataRoute.Sitemap = [];
  const dynamicRoutes = await safe<MetadataRoute.Sitemap>(
    async () => {
      const [fighters, gyms, events, threads] = await Promise.all([
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
      ]);

      return [
        ...fighters.map((f) => ({ url: `${BASE}/dovuscular/${f.slug}`, lastModified: f.updatedAt, priority: 0.8 })),
        ...gyms.map((g) => ({ url: `${BASE}/salonlar/${g.slug}`, lastModified: g.updatedAt, priority: 0.8 })),
        ...events.map((e) => ({ url: `${BASE}/etkinlikler/${e.slug}`, lastModified: e.updatedAt, priority: 0.9 })),
        ...threads.map((t) => ({ url: `${BASE}/forum/${t.slug}`, lastModified: t.updatedAt, priority: 0.5 })),
      ];
    },
    empty,
  );

  return [...staticRoutes, ...dynamicRoutes];
}
