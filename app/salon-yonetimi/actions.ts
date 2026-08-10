"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession, requireUser } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/queries";
import { notify } from "@/lib/notify";
import { uniqueSlug } from "@/lib/utils";
import { gymSchema, gymClassSchema } from "@/lib/validators";
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

/** Salonun sahibi mi? */
async function assertOwner(gymId: string, userId: string, role: string) {
  const gym = await prisma.gym.findUnique({ where: { id: gymId }, select: { ownerId: true, slug: true } });
  if (!gym) return null;
  if (gym.ownerId !== userId && role !== "ADMIN") return null;
  return gym;
}

export async function createGym(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.role !== "GYM_OWNER" && session.role !== "ADMIN") {
    return { error: "Salon eklemek için Salon İşletmecisi rolüne geçmelisin (Ayarlar → Doğrulama)" };
  }

  const raw = toObject(fd);
  raw.disciplines = fd.getAll("disciplines[]").filter(Boolean);
  raw.amenities = fd.getAll("amenities[]").filter(Boolean);
  const parsed = gymSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const gym = await prisma.gym.create({
    data: {
      slug: uniqueSlug(d.name),
      name: d.name,
      ownerId: session.sub,
      description: d.description || null,
      disciplines: d.disciplines as never,
      street: d.street || null,
      city: d.city,
      postalCode: d.postalCode || null,
      country: d.country,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
      phone: d.phone || null,
      email: d.email || null,
      website: d.website || null,
      amenities: d.amenities as string[],
      trialEnabled: d.trialEnabled,
      dropInPrice: d.dropInPrice ?? null,
      logoUrl: (fd.get("logoUrl") as string) || null,
      logoId: (fd.get("logoId") as string) || null,
      coverUrl: (fd.get("coverUrl") as string) || null,
      coverId: (fd.get("coverId") as string) || null,
      status: "PENDING",
    },
    select: { id: true },
  });

  updateTag(CACHE_TAGS.gyms);
  revalidatePath("/salon-yonetimi");
  redirect(`/salon-yonetimi/${gym.id}`);
}

export async function updateGym(gymId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  const owned = await assertOwner(gymId, session.sub, session.role);
  if (!owned) return { error: "Bu salonu düzenleme yetkin yok" };

  const raw = toObject(fd);
  raw.disciplines = fd.getAll("disciplines[]").filter(Boolean);
  raw.amenities = fd.getAll("amenities[]").filter(Boolean);
  const parsed = gymSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  await prisma.gym.update({
    where: { id: gymId },
    data: {
      name: d.name,
      description: d.description || null,
      disciplines: d.disciplines as never,
      street: d.street || null,
      city: d.city,
      postalCode: d.postalCode || null,
      country: d.country,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
      phone: d.phone || null,
      email: d.email || null,
      website: d.website || null,
      amenities: d.amenities as string[],
      trialEnabled: d.trialEnabled,
      dropInPrice: d.dropInPrice ?? null,
      logoUrl: (fd.get("logoUrl") as string) || null,
      logoId: (fd.get("logoId") as string) || null,
      coverUrl: (fd.get("coverUrl") as string) || null,
      coverId: (fd.get("coverId") as string) || null,
    },
  });

  updateTag(CACHE_TAGS.gyms);
  revalidatePath(`/salon-yonetimi/${gymId}`);
  revalidatePath(`/salonlar/${owned.slug}`);
  return { ok: true, message: "Salon güncellendi" };
}

export async function createGymClass(gymId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  const owned = await assertOwner(gymId, session.sub, session.role);
  if (!owned) return { error: "Yetkin yok" };

  const parsed = gymClassSchema.safeParse(toObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  await prisma.gymClass.create({
    data: {
      gymId,
      name: d.name,
      discipline: d.discipline,
      level: d.level,
      description: d.description || null,
      coachName: d.coachName || null,
      weekday: d.weekday,
      startTime: d.startTime,
      endTime: d.endTime,
      capacity: d.capacity,
      price: d.price,
      isTrialOk: d.isTrialOk,
    },
  });

  updateTag(CACHE_TAGS.gyms);
  revalidatePath(`/salon-yonetimi/${gymId}`);
  revalidatePath(`/salonlar/${owned.slug}`);
  return { ok: true, message: "Ders eklendi" };
}

export async function deleteGymClass(gymId: string, classId: string) {
  const session = await getSession();
  if (!session) return;
  const owned = await assertOwner(gymId, session.sub, session.role);
  if (!owned) return;

  await prisma.gymClass.deleteMany({ where: { id: classId, gymId } });
  updateTag(CACHE_TAGS.gyms);
  revalidatePath(`/salon-yonetimi/${gymId}`);
}

export async function setBookingStatus(
  bookingId: string,
  status: "CONFIRMED" | "CANCELLED" | "ATTENDED" | "NO_SHOW",
) {
  const session = await getSession();
  if (!session) return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, gymId: true, userId: true, gym: { select: { ownerId: true, name: true } } },
  });
  if (!booking) return;
  if (booking.gym.ownerId !== session.sub && session.role !== "ADMIN") return;

  await prisma.booking.update({ where: { id: bookingId }, data: { status } });

  if (status === "CONFIRMED" || status === "CANCELLED") {
    notify({
      userId: booking.userId,
      actorId: session.sub,
      type: "BOOKING",
      title:
        status === "CONFIRMED"
          ? `${booking.gym.name} rezervasyonunu onayladı`
          : `${booking.gym.name} rezervasyonunu iptal etti`,
      url: "/panel/rezervasyonlar",
    });
  }

  revalidatePath("/salon-yonetimi");
}
