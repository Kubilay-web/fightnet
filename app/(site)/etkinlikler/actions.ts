"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notify, audit } from "@/lib/notify";
import { isRestrictedMinor } from "@/lib/guardian";
import { eventRegistrationSchema } from "@/lib/validators";
import { formatRecord } from "@/lib/utils";
import type { ActionState } from "@/app/panel/actions";

/**
 * §4.4 — Müsabaka kayıt aracılığı: "Doğrudan turnuvalara kayıt".
 *
 * Kayıt bir başvurudur; organizatör kabul/bekleme/ret kararını verir.
 * Kayıt kapısı üç koşula bağlıdır:
 *   • Seviye 1 doğrulama (§4.5) — gerçek kimlik olmadan müsabaka kaydı olmaz
 *   • §11.1 Kapı 1 — reşit olmayanda veli onayı
 *   • Sağlık beyanı ve sorumluluk feragatnamesi onayı
 */
export async function registerForEvent(eventId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  if (user.verification === "LEVEL_0") {
    return { error: "Müsabaka kaydı için Seviye 1 (kimlik) doğrulaması gerekir." };
  }
  if (isRestrictedMinor(user)) {
    return { error: "18 yaş altı sporcular müsabakaya yalnızca veli onayıyla kaydolabilir." };
  }

  const raw: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) raw[k] = v;
  const parsed = eventRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[i.path.map(String).join(".") || "_"] ??= i.message;
    return { error: "Lütfen alanları kontrol edin", fields };
  }
  const d = parsed.data;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true, slug: true, title: true, status: true, organizerId: true,
      registrationOpen: true, registrationDeadline: true,
    },
  });
  if (!event) return { error: "Etkinlik bulunamadı" };
  if (!event.registrationOpen || event.status === "CANCELLED" || event.status === "FINISHED") {
    return { error: "Bu etkinlik için kayıtlar kapalı." };
  }
  if (event.registrationDeadline && event.registrationDeadline < new Date()) {
    return { error: "Kayıt süresi doldu." };
  }
  if (event.organizerId === user.id) return { error: "Kendi etkinliğine kaydolamazsın." };

  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
    select: { id: true, status: true },
  });
  if (existing && existing.status !== "WITHDRAWN") {
    return { error: "Bu etkinliğe zaten kayıt oldun." };
  }

  // Bilanço, sporcunun kendi disiplin profilinden okunur — elle beyan edilmez
  const sport = await prisma.sportProfile.findUnique({
    where: { userId_discipline: { userId: user.id, discipline: d.discipline } },
    select: { wins: true, losses: true, draws: true, noContests: true },
  });
  const record = sport ? formatRecord(sport.wins, sport.losses, sport.draws, sport.noContests) : null;

  const data = {
    discipline: d.discipline,
    weightClass: d.weightClass || null,
    weightKg: d.weightKg ?? null,
    record,
    coachName: d.coachName || null,
    gymName: d.gymName || null,
    emergency: d.emergency,
    medicalConfirmed: d.medicalConfirmed,
    waiverAccepted: d.waiverAccepted,
    guardianApproved: user.isMinor ? user.guardianConsent : true,
    note: d.note || null,
    status: "PENDING" as const,
    reviewNote: null,
    reviewedAt: null,
  };

  if (existing) {
    await prisma.eventRegistration.update({ where: { id: existing.id }, data });
  } else {
    await prisma.eventRegistration.create({ data: { eventId, userId: user.id, ...data } });
  }

  notify({
    userId: event.organizerId,
    actorId: user.id,
    type: "EVENT",
    title: `${user.name} müsabaka kaydı yaptı`,
    body: `${event.title} · ${d.weightClass ?? d.discipline}`,
    url: `/organizator/${event.id}`,
  });

  audit({ userId: user.id, action: "EVENT_REGISTER", targetType: "EVENT", targetId: eventId });
  revalidatePath(`/etkinlikler/${event.slug}`);
  return { ok: true, message: "Kaydın organizatöre iletildi. Karar bildirim olarak gelecek." };
}

/** Sporcu kaydını geri çeker */
export async function withdrawRegistration(eventId: string) {
  const user = await requireUser();
  await prisma.eventRegistration.updateMany({
    where: { eventId, userId: user.id, status: { in: ["PENDING", "ACCEPTED", "WAITLISTED"] } },
    data: { status: "WITHDRAWN" },
  });
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
  if (event) revalidatePath(`/etkinlikler/${event.slug}`);
}
