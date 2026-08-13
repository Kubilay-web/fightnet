import prisma from "@/lib/prisma";
import { fail, pagination } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { authenticateLicense, hasScope, DATASETS, type Dataset } from "@/lib/data-license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ dataset: string }> };

/**
 * §4.4 — Lisanslı veri API'si (B2B).
 *
 * Erişim `Authorization: Bearer fnk_…` ile. Yalnızca §8.3'e göre herkese açık
 * kayıtlar döner: gizliliğini kısıtlamış sporcular, taslak etkinlikler ve
 * moderasyonda bekleyen içerik hiçbir kapsamda görünmez.
 *
 * Hız sınırı lisans başına tanımlıdır ve `X-RateLimit-*` başlıklarıyla bildirilir.
 */
export async function GET(req: Request, { params }: Ctx) {
  const { dataset } = await params;

  if (!(dataset in DATASETS)) {
    return fail(`Bilinmeyen veri kümesi. Geçerli olanlar: ${Object.keys(DATASETS).join(", ")}`, 404);
  }
  const ds = dataset as Dataset;

  const license = await authenticateLicense(req.headers.get("authorization"));
  if (!license) return fail("Geçersiz veya süresi dolmuş API anahtarı", 401);
  if (!hasScope(license, ds)) return fail(`Lisansın '${ds}' kapsamını içermiyor`, 403);

  const rl = rateLimit(`license:${license.id}`, license.rateLimit, 60_000);
  if (!rl.success) {
    return new Response(JSON.stringify({ error: "Hız sınırı aşıldı" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rl.resetInSec),
        "X-RateLimit-Limit": String(license.rateLimit),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  const url = new URL(req.url);
  const { skip, take, page } = pagination(url, 50, 200);
  const since = url.searchParams.get("since");
  const sinceDate = since ? new Date(since) : null;
  const updatedFilter = sinceDate && !Number.isNaN(sinceDate.getTime()) ? { gte: sinceDate } : undefined;

  const data = await loadDataset(ds, { skip, take, updatedFilter });

  return new Response(JSON.stringify({ dataset: ds, page, count: data.length, data }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=60",
      "X-RateLimit-Limit": String(license.rateLimit),
      "X-RateLimit-Remaining": String(rl.remaining),
      "X-License-Org": license.organization,
    },
  });
}

async function loadDataset(
  ds: Dataset,
  opts: { skip: number; take: number; updatedFilter?: { gte: Date } },
) {
  const { skip, take, updatedFilter } = opts;

  switch (ds) {
    case "events":
      return prisma.event.findMany({
        // Taslak ve iptal edilmiş etkinlikler lisansa dahil değildir
        where: { status: { in: ["PUBLISHED", "LIVE", "FINISHED"] }, ...(updatedFilter ? { updatedAt: updatedFilter } : {}) },
        orderBy: { startsAt: "desc" },
        skip,
        take,
        select: {
          id: true, slug: true, title: true, type: true, status: true, disciplines: true,
          startsAt: true, endsAt: true, venueName: true, city: true, country: true,
          lat: true, lng: true, updatedAt: true,
        },
      });

    case "fights":
      return prisma.fight.findMany({
        where: {
          event: { status: { in: ["PUBLISHED", "LIVE", "FINISHED"] } },
          ...(updatedFilter ? { updatedAt: updatedFilter } : {}),
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take,
        select: {
          id: true, eventId: true, order: true, isMainEvent: true, isTitleFight: true,
          discipline: true, weightClass: true, rounds: true,
          redName: true, redRecord: true, blueName: true, blueRecord: true,
          status: true, winnerCorner: true, method: true, endRound: true, updatedAt: true,
        },
      });

    case "gyms":
      return prisma.gym.findMany({
        where: { status: "ACTIVE", ...(updatedFilter ? { updatedAt: updatedFilter } : {}) },
        orderBy: { updatedAt: "desc" },
        skip,
        take,
        select: {
          id: true, slug: true, name: true, disciplines: true, city: true, postalCode: true,
          country: true, lat: true, lng: true, isVerified: true, website: true, updatedAt: true,
        },
      });

    case "athletes_public":
      return prisma.user.findMany({
        // §8.3 — yalnızca profilini herkese açık yapmış, aktif ve doğrulanmış sporcular
        where: {
          visibility: "PUBLIC",
          isActive: true,
          isBanned: false,
          isMinor: false, // §11.1 — reşit olmayanlar hiçbir lisansta yer almaz
          verification: { in: ["LEVEL_1", "LEVEL_2"] },
          ...(updatedFilter ? { updatedAt: updatedFilter } : {}),
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take,
        select: {
          id: true, slug: true, name: true, city: true, country: true,
          verification: true, updatedAt: true,
          sportProfiles: {
            // Sporcu tek tek spor profilini de gizleyebilir — §8.3
            where: { visibility: "PUBLIC" },
            select: { discipline: true, level: true, weightClass: true, wins: true, losses: true, draws: true },
          },
        },
      });
  }
}
