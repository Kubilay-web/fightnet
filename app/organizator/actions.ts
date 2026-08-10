"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/queries";
import { notify, notifyMany } from "@/lib/notify";
import { uniqueSlug } from "@/lib/utils";
import { eventSchema, fightSchema, fightResultSchema, registrationReviewSchema } from "@/lib/validators";
import type { ActionState } from "@/app/panel/actions";

function zodFail(issues: readonly { path: readonly PropertyKey[]; message: string }[]): ActionState {
  const fields: Record<string, string> = {};
  for (const i of issues) fields[i.path.map(String).join(".") || "_"] ??= i.message;
  return { error: "Lütfen alanları kontrol edin", fields };
}

function toObject(fd: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (k.endsWith("[]")) {
      const key = k.slice(0, -2);
      (o[key] as unknown[]) ??= [];
      (o[key] as unknown[]).push(v);
    } else o[k] = v;
  }
  return o;
}

async function assertOrganizer(eventId: string, userId: string, role: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true, organizerId: true },
  });
  if (!event) return null;
  if (event.organizerId !== userId && role !== "ADMIN") return null;
  return event;
}

export async function createEvent(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.role !== "ORGANIZER" && session.role !== "GYM_OWNER" && session.role !== "ADMIN") {
    return { error: "Etkinlik oluşturmak için Organizatör rolüne geçmelisin" };
  }

  const raw = toObject(fd);
  raw.disciplines = fd.getAll("disciplines[]").filter(Boolean);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const event = await prisma.event.create({
    data: {
      slug: uniqueSlug(d.title),
      title: d.title,
      organizerId: session.sub,
      description: d.description || null,
      type: d.type,
      status: d.status,
      disciplines: d.disciplines as never,
      startsAt: new Date(d.startsAt),
      endsAt: d.endsAt ? new Date(d.endsAt) : null,
      doorsAt: d.doorsAt ? new Date(d.doorsAt) : null,
      venueName: d.venueName || null,
      street: d.street || null,
      city: d.city,
      postalCode: d.postalCode || null,
      country: d.country,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
      ticketUrl: d.ticketUrl || null,
      ticketPrice: d.ticketPrice ?? null,
      capacity: d.capacity ?? null,
      streamUrl: d.streamUrl || null,
      isPPV: d.isPPV,
      ppvPrice: d.ppvPrice ?? null,
      registrationOpen: d.registrationOpen,
      posterUrl: (fd.get("posterUrl") as string) || null,
      posterId: (fd.get("posterId") as string) || null,
    },
    select: { id: true },
  });

  updateTag(CACHE_TAGS.events);
  redirect(`/organizator/${event.id}`);
}

export async function updateEvent(eventId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  const owned = await assertOrganizer(eventId, session.sub, session.role);
  if (!owned) return { error: "Yetkin yok" };

  const raw = toObject(fd);
  raw.disciplines = fd.getAll("disciplines[]").filter(Boolean);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title: d.title,
      description: d.description || null,
      type: d.type,
      status: d.status,
      disciplines: d.disciplines as never,
      startsAt: new Date(d.startsAt),
      endsAt: d.endsAt ? new Date(d.endsAt) : null,
      doorsAt: d.doorsAt ? new Date(d.doorsAt) : null,
      venueName: d.venueName || null,
      street: d.street || null,
      city: d.city,
      postalCode: d.postalCode || null,
      country: d.country,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
      ticketUrl: d.ticketUrl || null,
      ticketPrice: d.ticketPrice ?? null,
      capacity: d.capacity ?? null,
      streamUrl: d.streamUrl || null,
      isPPV: d.isPPV,
      ppvPrice: d.ppvPrice ?? null,
      registrationOpen: d.registrationOpen,
      posterUrl: (fd.get("posterUrl") as string) || null,
      posterId: (fd.get("posterId") as string) || null,
    },
  });

  updateTag(CACHE_TAGS.events);
  revalidatePath(`/etkinlikler/${owned.slug}`);
  revalidatePath(`/organizator/${eventId}`);
  return { ok: true, message: "Etkinlik güncellendi" };
}

export async function addFight(eventId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  const owned = await assertOrganizer(eventId, session.sub, session.role);
  if (!owned) return { error: "Yetkin yok" };

  const parsed = fightSchema.safeParse({ ...toObject(fd), eventId });
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  // Kullanıcı adıyla girilen dövüşçüler platform profiline bağlanır
  const [red, blue] = await Promise.all([
    d.redId ? prisma.user.findFirst({ where: { OR: [{ id: d.redId }, { username: d.redId }] }, select: { id: true } }) : null,
    d.blueId ? prisma.user.findFirst({ where: { OR: [{ id: d.blueId }, { username: d.blueId }] }, select: { id: true } }) : null,
  ]);

  await prisma.fight.create({
    data: {
      eventId,
      order: d.order,
      isMainEvent: d.isMainEvent,
      isTitleFight: d.isTitleFight,
      discipline: d.discipline,
      weightClass: d.weightClass || null,
      rounds: d.rounds,
      roundMinutes: d.roundMinutes,
      redId: red?.id ?? null,
      redName: d.redName,
      redRecord: d.redRecord || null,
      blueId: blue?.id ?? null,
      blueName: d.blueName,
      blueRecord: d.blueRecord || null,
    },
  });

  updateTag(CACHE_TAGS.events);
  revalidatePath(`/etkinlikler/${owned.slug}`);
  revalidatePath(`/organizator/${eventId}`);
  return { ok: true, message: "Müsabaka eklendi" };
}

export async function deleteFight(eventId: string, fightId: string) {
  const session = await getSession();
  if (!session) return;
  const owned = await assertOrganizer(eventId, session.sub, session.role);
  if (!owned) return;

  await prisma.fight.deleteMany({ where: { id: fightId, eventId } });
  updateTag(CACHE_TAGS.events);
  revalidatePath(`/organizator/${eventId}`);
}

/** §4.1 — Canlı skor girişi: raunt ilerletme ve sonuç bildirimi */
export async function updateFightResult(eventId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  const owned = await assertOrganizer(eventId, session.sub, session.role);
  if (!owned) return { error: "Yetkin yok" };

  const parsed = fightResultSchema.safeParse(toObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const fight = await prisma.fight.findFirst({
    where: { id: d.fightId, eventId },
    select: { id: true, redName: true, blueName: true, redId: true, blueId: true },
  });
  if (!fight) return { error: "Müsabaka bulunamadı" };

  const finished = d.status === "FINISHED";

  await prisma.fight.update({
    where: { id: d.fightId },
    data: {
      status: d.status,
      winnerCorner: (d.winnerCorner || null) as never,
      method: (d.method || null) as never,
      endRound: d.endRound ?? null,
      endTime: d.endTime || null,
      currentRound: d.currentRound,
      notes: d.notes || null,
      startedAt: d.status === "LIVE" ? new Date() : undefined,
      finishedAt: finished ? new Date() : undefined,
    },
  });

  // Sonuç açıklandığında resmi canlı yorum kaydı düşülür
  if (finished && d.winnerCorner) {
    const winner = d.winnerCorner === "RED" ? fight.redName : fight.blueName;
    await prisma.liveComment.create({
      data: {
        eventId,
        fightId: fight.id,
        userId: session.sub,
        body: `Kazanan: ${winner}${d.method ? ` (${d.method})` : ""}${d.endRound ? ` — R${d.endRound}` : ""}`,
        kind: "RESULT",
        isOfficial: true,
        round: d.endRound ?? null,
      },
    });

    // Dövüşçüleri takip edenlere bildirim
    const fighterIds = [fight.redId, fight.blueId].filter(Boolean) as string[];
    if (fighterIds.length) {
      const followers = await prisma.follow.findMany({
        where: { followingId: { in: fighterIds } },
        select: { followerId: true },
        take: 1000,
      });
      notifyMany(
        [...new Set(followers.map((f) => f.followerId))],
        {
          actorId: session.sub,
          type: "LIVESCORE",
          title: `${winner} kazandı`,
          body: `${fight.redName} vs ${fight.blueName}`,
          url: `/etkinlikler/${owned.slug}`,
        },
      );
    }
  }

  updateTag(CACHE_TAGS.events);
  revalidatePath(`/etkinlikler/${owned.slug}`);
  revalidatePath(`/organizator/${eventId}`);
  return { ok: true, message: "Sonuç güncellendi" };
}

// ---------------------------------------------------------------------------
// §4.4 — Müsabaka kayıtları
// ---------------------------------------------------------------------------

/** Organizatör sporcunun kaydını kabul eder, yedeğe alır veya reddeder */
export async function reviewRegistration(
  eventId: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");

  const owned = await assertOrganizer(eventId, session.sub, session.role);
  if (!owned) return { error: "Bu etkinlik üzerinde yetkin yok" };

  const parsed = registrationReviewSchema.safeParse(toObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const registration = await prisma.eventRegistration.findFirst({
    where: { id: d.registrationId, eventId },
    select: { id: true, userId: true, user: { select: { name: true } } },
  });
  if (!registration) return { error: "Kayıt bulunamadı" };

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: d.status, reviewNote: d.reviewNote || null, reviewedAt: new Date() },
  });

  const label = {
    ACCEPTED: "kabul edildi",
    WAITLISTED: "yedek listesine alındı",
    REJECTED: "reddedildi",
  }[d.status];

  notify({
    userId: registration.userId,
    actorId: session.sub,
    type: "EVENT",
    title: `Müsabaka kaydın ${label}`,
    body: d.reviewNote || undefined,
    url: `/etkinlikler/${owned.slug}#kayit`,
  });

  revalidatePath(`/organizator/${eventId}`);
  revalidatePath(`/etkinlikler/${owned.slug}`);
  return { ok: true, message: `Kayıt ${label}` };
}
