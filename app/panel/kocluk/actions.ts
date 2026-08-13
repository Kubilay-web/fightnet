"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notify, audit } from "@/lib/notify";
import { uniqueSlug } from "@/lib/utils";
import { COACHING_FEE_RATE } from "@/lib/constants";
import { isRestrictedMinor } from "@/lib/guardian";
import { entitlementsFor } from "@/lib/billing";
import { moderate, attachResult } from "@/lib/moderation";
import {
  coachingOfferSchema,
  coachingRequestSchema,
  coachingScheduleSchema,
  coachingCompleteSchema,
  coachingReviewSchema,
} from "@/lib/validators";
import type { ActionState } from "@/app/panel/actions";

/**
 * §4.3 — Online koçluk.
 *
 * İlan açmak Seviye 2 doğrulanmış antrenör gerektirir: koçluk parayla
 * satılan bir hizmet olduğu için kimliği ve antrenörlük durumu doğrulanmamış
 * kişiler ilan açamaz (§4.5 ile aynı güven zinciri).
 *
 * Ödeme akışı: sporcu talep eder → Stripe Checkout → webhook ACCEPTED yapar →
 * antrenör tarih ve bağlantı girer → seans tamamlanır → sporcu puanlar.
 */

function zodFail(issues: readonly { path: readonly PropertyKey[]; message: string }[]): ActionState {
  const fields: Record<string, string> = {};
  for (const i of issues) fields[i.path.map(String).join(".") || "_"] ??= i.message;
  return { error: "Lütfen alanları kontrol edin", fields };
}

function formToObject(fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (k.endsWith("[]")) {
      const key = k.slice(0, -2);
      (out[key] ??= [] as unknown[]);
      (out[key] as unknown[]).push(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Antrenör tarafı — ilan yönetimi
// ---------------------------------------------------------------------------

export async function createCoachingOffer(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { error: "Koçluk ilanı yalnızca antrenör hesaplarıyla açılabilir." };
  }
  if (user.verification !== "LEVEL_2") {
    return {
      error:
        "Koçluk ilanı için Seviye 2 doğrulama gerekir. Panel → Doğrulama üzerinden antrenör lisansını yükle.",
    };
  }

  const raw = formToObject(fd);
  const parsed = coachingOfferSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const decision = await moderate({
    targetType: "COACHING_OFFER",
    userId: user.id,
    kind: "TEXT",
    text: `${d.title} ${d.description}`,
  });
  if (decision.state === "REMOVED") return { error: decision.message ?? "İlan yayınlanamadı" };

  const offer = await prisma.coachingOffer.create({
    data: {
      coachId: user.id,
      slug: uniqueSlug(d.title),
      title: d.title,
      description: d.description,
      format: d.format,
      disciplines: d.disciplines,
      level: (d.level || null) as never,
      price: d.price,
      durationMin: d.durationMin,
      capacity: d.capacity,
      coverUrl: d.coverUrl || null,
      coverId: d.coverId || null,
      minorsAllowed: d.minorsAllowed,
      isActive: decision.state === "APPROVED" && d.isActive,
    },
    select: { id: true },
  });

  await attachResult({ targetType: "COACHING_OFFER", targetId: offer.id, decision });
  audit({ userId: user.id, action: "COACHING_OFFER_CREATE", targetType: "COACHING_OFFER", targetId: offer.id });

  revalidatePath("/panel/kocluk");
  revalidatePath("/kocluk");
  redirect("/panel/kocluk");
}

export async function toggleCoachingOffer(offerId: string) {
  const user = await requireUser();
  const offer = await prisma.coachingOffer.findFirst({
    where: { id: offerId, coachId: user.id },
    select: { isActive: true },
  });
  if (!offer) return;

  await prisma.coachingOffer.update({
    where: { id: offerId },
    data: { isActive: !offer.isActive },
  });
  revalidatePath("/panel/kocluk");
  revalidatePath("/kocluk");
}

// ---------------------------------------------------------------------------
// Sporcu tarafı — talep
// ---------------------------------------------------------------------------

export async function requestCoaching(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = coachingRequestSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const offer = await prisma.coachingOffer.findFirst({
    where: { id: d.offerId, isActive: true },
    select: {
      id: true, coachId: true, price: true, title: true, capacity: true, minorsAllowed: true,
    },
  });
  if (!offer) return { error: "İlan bulunamadı veya kapalı." };
  if (offer.coachId === user.id) return { error: "Kendi ilanına başvuramazsın." };

  // §11.1 — reşit olmayanlar veli onayı olmadan ücretli hizmet satın alamaz
  if (isRestrictedMinor(user)) {
    return { error: "Hesabın 18 yaş altı olarak işaretli. Koçluk talebi için velinin onayı gerekiyor." };
  }
  if (user.isMinor && !offer.minorsAllowed) {
    return { error: "Bu ilan 18 yaş altı sporculara kapalı." };
  }

  const active = await prisma.coachingSession.count({
    where: { offerId: offer.id, status: { in: ["ACCEPTED", "SCHEDULED"] } },
  });
  if (active >= offer.capacity) return { error: "Bu antrenörün kontenjanı şu an dolu." };

  const duplicate = await prisma.coachingSession.findFirst({
    where: { offerId: offer.id, athleteId: user.id, status: { in: ["REQUESTED", "ACCEPTED", "SCHEDULED"] } },
    select: { id: true },
  });
  if (duplicate) return { error: "Bu ilan için zaten açık bir talebin var." };

  // §4.3 — Antrenör-Araç abonesi olan antrenörden komisyon indirimli alınır
  const coachPerks = await entitlementsFor(offer.coachId);
  const feeRate = coachPerks.coachTools ? COACHING_FEE_RATE / 2 : COACHING_FEE_RATE;

  const session = await prisma.coachingSession.create({
    data: {
      offerId: offer.id,
      coachId: offer.coachId,
      athleteId: user.id,
      price: offer.price,
      platformFee: Math.round(offer.price * feeRate * 100) / 100,
      athleteNote: d.note || null,
      scheduledAt: d.preferredAt ? new Date(d.preferredAt) : null,
    },
    select: { id: true },
  });

  notify({
    userId: offer.coachId,
    actorId: user.id,
    type: "SYSTEM",
    title: `${user.name} koçluk talebi gönderdi`,
    body: offer.title,
    url: "/panel/kocluk",
  });

  revalidatePath("/panel/kocluk");
  return {
    ok: true,
    message: "Talebin oluşturuldu. Ödemeyi tamamladığında antrenöre iletilir.",
    fields: { sessionId: session.id },
  };
}

// ---------------------------------------------------------------------------
// Seans yaşam döngüsü
// ---------------------------------------------------------------------------

export async function scheduleCoaching(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = coachingScheduleSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const session = await prisma.coachingSession.findFirst({
    where: { id: d.sessionId, coachId: user.id, status: "ACCEPTED" },
    select: { id: true, athleteId: true, offer: { select: { title: true } } },
  });
  if (!session) return { error: "Seans bulunamadı veya henüz ödenmedi." };

  await prisma.coachingSession.update({
    where: { id: session.id },
    data: { status: "SCHEDULED", scheduledAt: new Date(d.scheduledAt), meetingUrl: d.meetingUrl },
  });

  notify({
    userId: session.athleteId,
    actorId: user.id,
    type: "SYSTEM",
    title: "Koçluk seansın planlandı",
    body: session.offer.title,
    url: "/panel/kocluk",
  });

  revalidatePath("/panel/kocluk");
  return { ok: true, message: "Seans planlandı ve sporcuya bildirildi." };
}

export async function completeCoaching(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = coachingCompleteSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);

  const session = await prisma.coachingSession.findFirst({
    where: { id: parsed.data.sessionId, coachId: user.id, status: { in: ["ACCEPTED", "SCHEDULED"] } },
    select: { id: true, athleteId: true, offerId: true },
  });
  if (!session) return { error: "Seans bulunamadı." };

  await prisma.$transaction([
    prisma.coachingSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        coachNote: parsed.data.coachNote || null,
      },
    }),
    prisma.coachingOffer.update({
      where: { id: session.offerId },
      data: { sessionCount: { increment: 1 } },
    }),
  ]);

  notify({
    userId: session.athleteId,
    actorId: user.id,
    type: "SYSTEM",
    title: "Koçluk seansın tamamlandı",
    body: "Antrenörünü değerlendirebilirsin.",
    url: "/panel/kocluk",
  });

  revalidatePath("/panel/kocluk");
  return { ok: true, message: "Seans tamamlandı." };
}

export async function reviewCoaching(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = coachingReviewSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const session = await prisma.coachingSession.findFirst({
    where: { id: d.sessionId, athleteId: user.id, status: "COMPLETED", rating: null },
    select: { id: true, offerId: true },
  });
  if (!session) return { error: "Değerlendirilecek seans bulunamadı." };

  const offer = await prisma.coachingOffer.findUnique({
    where: { id: session.offerId },
    select: { ratingAvg: true, ratingCount: true },
  });
  if (!offer) return { error: "İlan bulunamadı." };

  const count = offer.ratingCount + 1;
  const avg = Math.round(((offer.ratingAvg * offer.ratingCount + d.rating) / count) * 10) / 10;

  await prisma.$transaction([
    prisma.coachingSession.update({
      where: { id: session.id },
      data: { rating: d.rating, review: d.review || null },
    }),
    prisma.coachingOffer.update({
      where: { id: session.offerId },
      data: { ratingAvg: avg, ratingCount: count },
    }),
  ]);

  revalidatePath("/panel/kocluk");
  revalidatePath("/kocluk");
  return { ok: true, message: "Değerlendirmen kaydedildi." };
}

export async function cancelCoaching(sessionId: string) {
  const user = await requireUser();
  const session = await prisma.coachingSession.findFirst({
    where: {
      id: sessionId,
      OR: [{ athleteId: user.id }, { coachId: user.id }],
      status: { in: ["REQUESTED", "ACCEPTED", "SCHEDULED"] },
    },
    select: { id: true, athleteId: true, coachId: true, status: true },
  });
  if (!session) return;

  await prisma.coachingSession.update({
    where: { id: session.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  const other = user.id === session.athleteId ? session.coachId : session.athleteId;
  notify({
    userId: other,
    actorId: user.id,
    type: "SYSTEM",
    title: "Koçluk seansı iptal edildi",
    body:
      session.status === "REQUESTED"
        ? "Ödeme alınmamıştı."
        : "Ödeme alınmış seanslarda iade Stripe üzerinden yapılır.",
    url: "/panel/kocluk",
  });

  revalidatePath("/panel/kocluk");
}
