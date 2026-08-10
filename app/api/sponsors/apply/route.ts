import prisma from "@/lib/prisma";
import { guard, isResponse, ok, fail } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard({ bucket: "sponsor-apply", auth: true, limit: 10, window: 3600_000 });
  if (isResponse(g)) return g;
  const session = g.session!;

  if (session.verification === "LEVEL_0") {
    return fail("Sponsorluk başvurusu için Seviye 1 doğrulama gerekir", 403);
  }

  const { offerId, pitch } = (await req.json().catch(() => ({}))) as { offerId?: string; pitch?: string };
  if (!offerId || !pitch || pitch.trim().length < 20) {
    return fail("Başvuru metni en az 20 karakter olmalı", 422);
  }

  const offer = await prisma.sponsorOffer.findUnique({
    where: { id: offerId },
    select: { id: true, status: true, minFollowers: true, deadline: true },
  });
  if (!offer || offer.status !== "OPEN") return fail("Teklif bulunamadı veya kapalı", 404);
  if (offer.deadline && offer.deadline < new Date()) return fail("Başvuru süresi doldu", 400);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { followerCount: true },
  });
  if ((user?.followerCount ?? 0) < offer.minFollowers) {
    return fail(`Bu teklif için en az ${offer.minFollowers} takipçi gerekiyor`, 403);
  }

  try {
    await prisma.sponsorApplication.create({
      data: { offerId, userId: session.sub, pitch: pitch.trim() },
    });
  } catch {
    return fail("Bu teklife zaten başvurdun", 409);
  }

  return ok({ ok: true }, { status: 201 });
}
