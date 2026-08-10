import "server-only";
import { unstable_cache } from "next/cache";
import prisma from "./prisma";

/**
 * Ortak sorgu katmanı.
 * Public veriler `unstable_cache` ile etiketlenerek önbelleğe alınır —
 * aynı veri ikinci kez DB'ye gitmez, mutasyonda `revalidateTag` ile tazelenir.
 */

/**
 * DB erişilemediğinde (build zamanı ön-render, geçici kesinti) sayfa
 * çökmez — boş veri ile render edilir ve `revalidate` süresinde tazelenir.
 */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("[query]", err);
    return fallback;
  }
}

export const CACHE_TAGS = {
  fighters: "fighters",
  gyms: "gyms",
  events: "events",
  posts: "posts",
  forum: "forum",
  spotlight: "spotlight",
  ads: "ads",
  stats: "stats",
} as const;

// ---------------------------------------------------------------------------
// Ortak select'ler — sadece gereken alanlar çekilir
// ---------------------------------------------------------------------------

export const userCardSelect = {
  id: true,
  name: true,
  username: true,
  slug: true,
  avatarUrl: true,
  city: true,
  country: true,
  verification: true,
  isFounder: true,
  followerCount: true,
  role: true,
  sportProfiles: {
    select: {
      discipline: true,
      level: true,
      belt: true,
      weightClass: true,
      wins: true,
      losses: true,
      draws: true,
      isPrimary: true,
      isPro: true,
    },
    orderBy: { isPrimary: "desc" as const },
    take: 3,
  },
} as const;

export const gymCardSelect = {
  id: true,
  slug: true,
  name: true,
  city: true,
  country: true,
  logoUrl: true,
  coverUrl: true,
  disciplines: true,
  isVerified: true,
  isFounder: true,
  isHalo: true,
  memberCount: true,
  ratingAvg: true,
  ratingCount: true,
  trialEnabled: true,
  lat: true,
  lng: true,
} as const;

export const eventCardSelect = {
  id: true,
  slug: true,
  title: true,
  posterUrl: true,
  startsAt: true,
  city: true,
  country: true,
  venueName: true,
  type: true,
  status: true,
  disciplines: true,
  ticketPrice: true,
  isPPV: true,
  _count: { select: { fights: true } },
} as const;

export const postCardSelect = {
  id: true,
  type: true,
  body: true,
  mediaUrl: true,
  thumbUrl: true,
  durationSec: true,
  discipline: true,
  tags: true,
  likeCount: true,
  commentCount: true,
  viewCount: true,
  createdAt: true,
  user: {
    select: {
      id: true, name: true, username: true, slug: true,
      avatarUrl: true, verification: true, isFounder: true,
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Ana sayfa verisi — tek turda paralel
// ---------------------------------------------------------------------------

const EMPTY_HOME = {
  spotlight: null as Awaited<ReturnType<typeof loadHome>>["spotlight"],
  liveEvents: [],
  upcomingEvents: [],
  topFighters: [],
  featuredGyms: [],
  latestPosts: [],
  stats: { fighters: 0, gyms: 0, events: 0, verified: 0, trainings: 0 },
};

async function loadHome() {
  const now = new Date();

  const [spotlight, liveEvents, upcomingEvents, topFighters, featuredGyms, latestPosts, stats] =
      await Promise.all([
        prisma.spotlight.findFirst({
          where: { isActive: true, date: { lte: now } },
          orderBy: { date: "desc" },
          select: {
            headline: true,
            blurb: true,
            imageUrl: true,
            user: { select: userCardSelect },
          },
        }),
        prisma.event.findMany({
          where: { status: "LIVE" },
          select: eventCardSelect,
          orderBy: { startsAt: "asc" },
          take: 3,
        }),
        prisma.event.findMany({
          where: { status: "PUBLISHED", startsAt: { gte: now } },
          select: eventCardSelect,
          orderBy: { startsAt: "asc" },
          take: 6,
        }),
        prisma.user.findMany({
          where: { isActive: true, isBanned: false, verification: { not: "LEVEL_0" }, visibility: "PUBLIC" },
          select: userCardSelect,
          orderBy: { followerCount: "desc" },
          take: 8,
        }),
        prisma.gym.findMany({
          where: { status: "ACTIVE" },
          select: gymCardSelect,
          orderBy: [{ isHalo: "desc" }, { isFounder: "desc" }, { memberCount: "desc" }],
          take: 6,
        }),
        prisma.post.findMany({
          where: { visibility: "PUBLIC", moderation: "APPROVED" },
          select: postCardSelect,
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
        getPlatformStats(),
      ]);

  return { spotlight, liveEvents, upcomingEvents, topFighters, featuredGyms, latestPosts, stats };
}

export const getHomeData = unstable_cache(
  () => safe(loadHome, EMPTY_HOME as unknown as Awaited<ReturnType<typeof loadHome>>),
  ["home-data"],
  { revalidate: 60, tags: [CACHE_TAGS.spotlight, CACHE_TAGS.events, CACHE_TAGS.fighters, CACHE_TAGS.gyms, CACHE_TAGS.posts] },
);

export async function getPlatformStats() {
  const [fighters, gyms, events, verified, trainings] = await Promise.all([
    prisma.user.count({ where: { isActive: true, isBanned: false } }),
    prisma.gym.count({ where: { status: "ACTIVE" } }),
    prisma.event.count({ where: { status: { in: ["PUBLISHED", "LIVE", "FINISHED"] } } }),
    prisma.user.count({ where: { verification: { not: "LEVEL_0" } } }),
    prisma.trainingLog.count(),
  ]);
  return { fighters, gyms, events, verified, trainings };
}

// ---------------------------------------------------------------------------
// Reklam seçimi (§4.2 banner reklamı)
// ---------------------------------------------------------------------------

export const getActiveAd = unstable_cache(
  (placement: string) =>
    safe(async () => {
      const now = new Date();
      const ads = await prisma.ad.findMany({
        where: { isActive: true, placement, startsAt: { lte: now }, endsAt: { gte: now } },
        select: { id: true, name: true, imageUrl: true, linkUrl: true, advertiser: true },
        take: 5,
      });
      if (!ads.length) return null;
      return ads[Math.floor(Math.random() * ads.length)];
    }, null),
  ["active-ad"],
  { revalidate: 300, tags: [CACHE_TAGS.ads] },
);

// ---------------------------------------------------------------------------
// Forum kategorileri
// ---------------------------------------------------------------------------

export const getForumCategories = unstable_cache(
  () =>
    safe(
      () =>
        prisma.forumCategory.findMany({
          orderBy: { order: "asc" },
          select: { id: true, slug: true, name: true, description: true, icon: true, threadCount: true, discipline: true },
        }),
      [],
    ),
  ["forum-categories"],
  { revalidate: 600, tags: [CACHE_TAGS.forum] },
);
