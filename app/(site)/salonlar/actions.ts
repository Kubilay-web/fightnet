"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/queries";
import { audit } from "@/lib/notify";
import type { ActionState } from "@/app/panel/actions";

/**
 * Salon değerlendirmesi.
 *
 * Yalnızca salonla gerçek teması olanlar yazabilir: üyelik kaydı veya
 * katılmış/onaylanmış bir rezervasyon. Bu kısıt, dövüş sporu sahnesinde
 * rakip salonların birbirini puanlamasını engeller (§8.4 Trust by Design).
 * Her kullanıcı salon başına tek değerlendirme yazar, güncelleyebilir.
 */
export async function submitGymReview(gymId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const rating = Number(fd.get("rating"));
  const comment = String(fd.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "1 ile 5 arasında puan ver", fields: { rating: "Puan gerekli" } };
  }
  if (comment.length > 1000) return { error: "Yorum en fazla 1000 karakter olabilir" };

  const gym = await prisma.gym.findUnique({ where: { id: gymId }, select: { id: true, slug: true, ownerId: true } });
  if (!gym) return { error: "Salon bulunamadı" };
  if (gym.ownerId === user.id) return { error: "Kendi salonunu değerlendiremezsin." };

  const [membership, attended] = await Promise.all([
    prisma.gymMembership.findFirst({ where: { gymId, userId: user.id }, select: { id: true } }),
    prisma.booking.findFirst({
      where: { gymId, userId: user.id, status: { in: ["ATTENDED", "CONFIRMED"] } },
      select: { id: true },
    }),
  ]);
  if (!membership && !attended) {
    return {
      error:
        "Yalnızca bu salonda antrenman yapmış üyeler değerlendirme yazabilir. Önce bir deneme antrenmanı rezervasyonu oluştur.",
    };
  }

  await prisma.gymReview.upsert({
    where: { gymId_userId: { gymId, userId: user.id } },
    update: { rating, comment: comment || null },
    create: { gymId, userId: user.id, rating, comment: comment || null },
  });

  // Ortalama denormalize tutulur — liste sayfaları tek sorguda okur
  const agg = await prisma.gymReview.aggregate({
    where: { gymId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.gym.update({
    where: { id: gymId },
    data: {
      ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      ratingCount: agg._count._all,
    },
  });

  audit({ userId: user.id, action: "GYM_REVIEW", targetType: "GYM", targetId: gymId });
  updateTag(CACHE_TAGS.gyms);
  revalidatePath(`/salonlar/${gym.slug}`);
  return { ok: true, message: "Değerlendirmen yayınlandı" };
}
