import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok, fail } from "@/lib/api";
import { bookingSchema } from "@/lib/validators";
import { LIMITS } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";
import { BOOKING_TYPE_LABEL } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard({ bucket: "booking", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;

  const parsed = await parseBody(req, bookingSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  const date = new Date(d.date);
  if (Number.isNaN(date.getTime())) return fail("Geçersiz tarih", 422);
  if (date < new Date(Date.now() - 864e5)) return fail("Geçmiş bir tarih seçilemez", 422);

  const gym = await prisma.gym.findUnique({
    where: { id: d.gymId },
    select: { id: true, name: true, slug: true, ownerId: true, status: true, trialEnabled: true, dropInPrice: true },
  });
  if (!gym || gym.status !== "ACTIVE") return fail("Salon bulunamadı", 404);
  if (d.type === "TRIAL" && !gym.trialEnabled) return fail("Bu salon deneme antrenmanı sunmuyor", 400);

  // Aynı gün için tekrarlanan talep engeli
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
  const dup = await prisma.booking.findFirst({
    where: {
      userId: session.sub,
      gymId: gym.id,
      date: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { id: true },
  });
  if (dup) return fail("Bu salon için o tarihte zaten bir rezervasyonun var", 409);

  const booking = await prisma.booking.create({
    data: {
      gymId: gym.id,
      classId: d.classId || null,
      userId: session.sub,
      type: d.type,
      date,
      experience: d.experience || null,
      goals: d.goals || null,
      contactPhone: d.contactPhone || null,
      note: d.note || null,
      price: d.type === "DROP_IN" ? (gym.dropInPrice ?? 0) : 0,
    },
    select: { id: true },
  });

  if (gym.ownerId) {
    notify({
      userId: gym.ownerId,
      actorId: session.sub,
      type: "BOOKING",
      title: `Yeni ${BOOKING_TYPE_LABEL[d.type].toLowerCase()} talebi`,
      body: `${session.name} · ${date.toLocaleDateString("tr-TR")}`,
      url: "/salon-yonetimi/rezervasyonlar",
    });
  }

  return ok({ ok: true, id: booking.id }, { status: 201 });
}
