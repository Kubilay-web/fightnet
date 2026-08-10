"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession, requireUser, hashPassword, verifyPassword, refreshSession, destroySession } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/queries";
import { destroyAsset } from "@/lib/cloudinary";
import { notify, audit } from "@/lib/notify";
import { calcStreak, profileCompletion, slugify } from "@/lib/utils";
import { MAX_VOUCHES_PER_COACH } from "@/lib/constants";
import { requestGuardianConsent, isRestrictedMinor } from "@/lib/guardian";
import {
  profileSchema, sportProfileSchema, trainingSchema, sparringListingSchema,
  sparringReviewSchema, verificationSchema, passportDocSchema, creatorTierSchema,
  creatorPostSchema, postSchema, passwordChangeSchema,
} from "@/lib/validators";

export interface ActionState {
  ok?: boolean;
  error?: string;
  fields?: Record<string, string>;
  message?: string;
}

function zodFail(issues: readonly { path: readonly PropertyKey[]; message: string }[]): ActionState {
  const fields: Record<string, string> = {};
  for (const i of issues) {
    const k = i.path.map(String).join(".") || "_";
    fields[k] ??= i.message;
  }
  return { error: "Lütfen alanları kontrol edin", fields };
}

function formToObject(fd: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of fd.entries()) {
    if (key.endsWith("[]")) {
      const k = key.slice(0, -2);
      (obj[k] as unknown[]) ??= [];
      (obj[k] as unknown[]).push(value);
    } else if (key in obj) {
      const prev = obj[key];
      obj[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------

export async function updateProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const raw = formToObject(fd);
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const avatarUrl = (fd.get("avatarUrl") as string) || null;
  const avatarId = (fd.get("avatarId") as string) || null;
  const coverUrl = (fd.get("coverUrl") as string) || null;
  const coverId = (fd.get("coverId") as string) || null;

  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarId: true, coverId: true },
  });

  // Değişen medyanın eskisi Cloudinary'den silinir — depolama şişmez
  if (current?.avatarId && current.avatarId !== avatarId) destroyAsset(current.avatarId);
  if (current?.coverId && current.coverId !== coverId) destroyAsset(current.coverId);

  const [sportCount, gymCount] = await Promise.all([
    prisma.sportProfile.count({ where: { userId: user.id } }),
    prisma.gymMembership.count({ where: { userId: user.id, isActive: true } }),
  ]);

  const birthDate = d.birthDate ? new Date(d.birthDate) : null;
  const score = profileCompletion({
    avatarUrl,
    bio: d.bio,
    city: d.city,
    birthDate,
    heightCm: d.heightCm,
    sportProfiles: Array(sportCount).fill(0),
    gymMemberships: Array(gymCount).fill(0),
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      slug: slugify(`${d.name}-${user.username}`) || user.username,
      bio: d.bio || null,
      city: d.city || null,
      country: d.country,
      postalCode: d.postalCode || null,
      birthDate,
      nationality: d.nationality || null,
      heightCm: d.heightCm ?? null,
      reachCm: d.reachCm ?? null,
      stance: d.stance || null,
      website: d.website || null,
      socials: { instagram: d.instagram || null, youtube: d.youtube || null },
      visibility: d.visibility,
      avatarUrl,
      avatarId,
      coverUrl,
      coverId,
      profileScore: score,
    },
  });

  await refreshSession(user.id);
  updateTag(CACHE_TAGS.fighters);
  revalidatePath("/panel/profil");
  revalidatePath(`/dovuscular/${user.slug}`);
  return { ok: true, message: "Profil güncellendi" };
}

export async function upsertSportProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = sportProfileSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  if (d.isPrimary) {
    await prisma.sportProfile.updateMany({ where: { userId: user.id }, data: { isPrimary: false } });
  }

  await prisma.sportProfile.upsert({
    where: { userId_discipline: { userId: user.id, discipline: d.discipline } },
    update: {
      isPrimary: d.isPrimary, level: d.level, belt: d.belt, stripes: d.stripes,
      weightClass: d.weightClass || null, weightKg: d.weightKg ?? null,
      yearsActive: d.yearsActive, isPro: d.isPro,
      wins: d.wins, losses: d.losses, draws: d.draws, koWins: d.koWins, subWins: d.subWins,
      visibility: d.visibility,
    },
    create: {
      userId: user.id, discipline: d.discipline, isPrimary: d.isPrimary,
      level: d.level, belt: d.belt, stripes: d.stripes,
      weightClass: d.weightClass || null, weightKg: d.weightKg ?? null,
      yearsActive: d.yearsActive, isPro: d.isPro,
      wins: d.wins, losses: d.losses, draws: d.draws, koWins: d.koWins, subWins: d.subWins,
      visibility: d.visibility,
    },
  });

  updateTag(CACHE_TAGS.fighters);
  revalidatePath("/panel/profil");
  return { ok: true, message: "Disiplin kaydedildi" };
}

export async function deleteSportProfile(id: string) {
  const user = await requireUser();
  await prisma.sportProfile.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/panel/profil");
}

// ---------------------------------------------------------------------------
// Antrenman günlüğü
// ---------------------------------------------------------------------------

export async function createTraining(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const raw = formToObject(fd);
  raw.techniques = fd.getAll("techniques[]").filter(Boolean);
  const parsed = trainingSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  // §5.2 — Çevrimdışı senkron tekilliği: aynı clientId iki kez kaydedilmez
  if (d.clientId) {
    const existing = await prisma.trainingLog.findFirst({
      where: { userId: user.id, clientId: d.clientId },
      select: { id: true },
    });
    if (existing) redirect("/panel/antrenman");
  }

  await prisma.trainingLog.create({
    data: {
      userId: user.id,
      date: new Date(d.date),
      discipline: d.discipline,
      durationMin: d.durationMin,
      intensity: d.intensity,
      type: d.type || null,
      gymId: d.gymId || null,
      rounds: d.rounds ?? null,
      techniques: d.techniques as string[],
      notes: d.notes || null,
      mood: d.mood ?? null,
      weightKg: d.weightKg ?? null,
      visibility: d.visibility,
      clientId: d.clientId || null,
      syncedAt: new Date(),
    },
  });

  await recalcStreak(user.id);
  revalidatePath("/panel/antrenman");
  revalidatePath("/panel");
  redirect("/panel/antrenman");
}

export async function deleteTraining(id: string) {
  const user = await requireUser();
  await prisma.trainingLog.deleteMany({ where: { id, userId: user.id } });
  await recalcStreak(user.id);
  revalidatePath("/panel/antrenman");
}

/** §4.1 — Streak sayacı: art arda antrenman günleri */
export async function recalcStreak(userId: string) {
  const logs = await prisma.trainingLog.findMany({
    where: { userId, date: { gte: new Date(Date.now() - 400 * 864e5) } },
    select: { date: true },
    orderBy: { date: "desc" },
    take: 400,
  });
  const streak = calcStreak(logs.map((l) => l.date));
  const total = await prisma.trainingLog.count({ where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { longestStreak: true } });
  await prisma.user.update({
    where: { id: userId },
    data: {
      trainingStreak: streak,
      totalTrainings: total,
      longestStreak: Math.max(streak, user?.longestStreak ?? 0),
      lastActiveAt: new Date(),
    },
  });
}

// ---------------------------------------------------------------------------
// Sparring
// ---------------------------------------------------------------------------

export async function createSparringListing(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.verification === "LEVEL_0") {
    return { error: "Sparring ilanı için Seviye 1 doğrulama gerekir" };
  }

  // §11.1 Kapı 1 — veli onayı olmadan reşit olmayan üye sparring eşleşmesi açamaz
  const me = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { isMinor: true, guardianConsent: true },
  });
  if (me && isRestrictedMinor(me)) {
    return { error: "Sparring ilanı için velinin onayı gerekiyor. Panelden onay bağlantısı gönderebilirsin." };
  }

  const raw = formToObject(fd);
  raw.availability = fd.getAll("availability[]").filter(Boolean);
  const parsed = sparringListingSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  await prisma.sparringListing.create({
    data: {
      userId: session.sub,
      discipline: d.discipline,
      level: d.level,
      weightKg: d.weightKg ?? null,
      weightTolerance: d.weightTolerance,
      city: d.city,
      postalCode: d.postalCode || null,
      radiusKm: d.radiusKm,
      gymId: d.gymId || null,
      availability: d.availability as string[],
      intensity: d.intensity,
      genderPref: d.genderPref,
      minAge: d.minAge ?? null,
      maxAge: d.maxAge ?? null,
      note: d.note || null,
    },
  });

  revalidatePath("/panel/sparring");
  revalidatePath("/sparring");
  redirect("/panel/sparring");
}

export async function closeSparringListing(id: string) {
  const user = await requireUser();
  await prisma.sparringListing.updateMany({
    where: { id, userId: user.id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/panel/sparring");
  revalidatePath("/sparring");
}

/** §11.2 — Seans sonrası güvenlik değerlendirmesi */
export async function submitSparringReview(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = sparringReviewSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const request = await prisma.sparringRequest.findUnique({
    where: { id: d.requestId },
    select: { id: true, senderId: true, receiverId: true, status: true },
  });
  if (!request) return { error: "Talep bulunamadı" };
  if (request.status !== "ACCEPTED") return { error: "Yalnızca gerçekleşen sparringler değerlendirilebilir" };

  const targetId = request.senderId === user.id ? request.receiverId : request.senderId;
  if (targetId === user.id) return { error: "Kendini değerlendiremezsin" };

  try {
    await prisma.sparringReview.create({
      data: {
        requestId: d.requestId,
        authorId: user.id,
        targetId,
        safety: d.safety,
        technique: d.technique,
        punctuality: d.punctuality,
        wouldRepeat: d.wouldRepeat,
        comment: d.comment || null,
        flagUnsafe: d.flagUnsafe,
      },
    });
  } catch {
    return { error: "Bu sparring için zaten değerlendirme yaptın" };
  }

  // Güvensiz işaretlenirse otomatik rapor açılır
  if (d.flagUnsafe) {
    await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType: "USER",
        targetId,
        reportedUserId: targetId,
        reason: "UNSAFE_SPARRING",
        description: d.comment || "Sparring değerlendirmesinde güvensiz olarak işaretlendi",
        priority: 2,
      },
    });
  }

  await prisma.sparringRequest.update({ where: { id: d.requestId }, data: { status: "ACCEPTED" } });
  revalidatePath("/panel/sparring");
  return { ok: true, message: "Değerlendirmen kaydedildi" };
}

export async function respondSparringRequest(id: string, action: "ACCEPT" | "DECLINE") {
  const user = await requireUser();
  const request = await prisma.sparringRequest.findUnique({
    where: { id },
    select: { id: true, receiverId: true, senderId: true, listingId: true },
  });
  if (!request || request.receiverId !== user.id) return;

  await prisma.sparringRequest.update({
    where: { id },
    data: { status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED" },
  });

  if (action === "ACCEPT") {
    await prisma.sparringListing.update({ where: { id: request.listingId }, data: { status: "MATCHED" } });
    notify({
      userId: request.senderId,
      actorId: user.id,
      type: "SPARRING_ACCEPTED",
      title: `${user.name} sparring talebini kabul etti`,
      url: "/panel/sparring",
    });
  }

  revalidatePath("/panel/sparring");
}

// ---------------------------------------------------------------------------
// Doğrulama & Passport
// ---------------------------------------------------------------------------

export async function submitVerification(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const raw = formToObject(fd);
  raw.proofUrls = fd.getAll("proofUrls[]").filter(Boolean);
  raw.proofIds = fd.getAll("proofIds[]").filter(Boolean);
  const parsed = verificationSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const pending = await prisma.verificationRequest.findFirst({
    where: { userId: user.id, status: "PENDING" },
    select: { id: true },
  });
  if (pending) return { error: "Zaten inceleme bekleyen bir talebin var" };

  if (d.targetLevel === "LEVEL_1" && (!d.idDocUrl || !d.selfieUrl)) {
    return { error: "Seviye 1 için kimlik belgesi ve selfie gereklidir" };
  }
  if (d.targetLevel === "LEVEL_2" && !d.proofUrls.length) {
    return { error: "Seviye 2 için durum kanıtı yüklemelisin" };
  }

  await prisma.verificationRequest.create({
    data: {
      userId: user.id,
      targetLevel: d.targetLevel,
      claimedRole: (d.claimedRole || null) as never,
      idDocUrl: d.idDocUrl || null,
      idDocId: d.idDocId || null,
      selfieUrl: d.selfieUrl || null,
      selfieId: d.selfieId || null,
      proofUrls: d.proofUrls as string[],
      proofIds: d.proofIds as string[],
      note: d.note || null,
    },
  });

  audit({ userId: user.id, action: "VERIFICATION_SUBMIT", meta: { level: d.targetLevel } });
  revalidatePath("/panel/dogrulama");
  return { ok: true, message: "Talebin alındı, inceleme sonrası bildirim alacaksın" };
}

export async function addPassportDoc(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = passportDocSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  await prisma.passportDocument.create({
    data: {
      userId: user.id,
      kind: d.kind,
      title: d.title,
      issuer: d.issuer || null,
      issuedAt: d.issuedAt ? new Date(d.issuedAt) : null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      fileUrl: d.fileUrl,
      fileId: d.fileId || null,
    },
  });

  revalidatePath("/panel/passport");
  return { ok: true, message: "Belge yüklendi, admin incelemesine gönderildi" };
}

export async function deletePassportDoc(id: string) {
  const user = await requireUser();
  const doc = await prisma.passportDocument.findFirst({ where: { id, userId: user.id }, select: { fileId: true } });
  if (!doc) return;
  await prisma.passportDocument.delete({ where: { id } });
  destroyAsset(doc.fileId);
  revalidatePath("/panel/passport");
}

// ---------------------------------------------------------------------------
// Kefalet (§4.5) — antrenör başına maks. 20
// ---------------------------------------------------------------------------

export async function vouchAthlete(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.verification !== "LEVEL_2" || (session.role !== "COACH" && session.role !== "ADMIN")) {
    return { error: "Kefalet için Seviye 2 doğrulanmış antrenör olmalısın" };
  }

  const username = String(fd.get("username") ?? "").trim().toLowerCase();
  if (!username) return { error: "Kullanıcı adı gerekli", fields: { username: "Zorunlu" } };

  const athlete = await prisma.user.findUnique({ where: { username }, select: { id: true, name: true } });
  if (!athlete) return { error: "Sporcu bulunamadı", fields: { username: "Böyle bir kullanıcı yok" } };
  if (athlete.id === session.sub) return { error: "Kendine kefil olamazsın" };

  const count = await prisma.vouch.count({ where: { coachId: session.sub, status: "ACCEPTED" } });
  if (count >= MAX_VOUCHES_PER_COACH) {
    return { error: `Kefalet limitine ulaştın (${MAX_VOUCHES_PER_COACH} sporcu)` };
  }

  try {
    await prisma.vouch.create({
      data: {
        coachId: session.sub,
        athleteId: athlete.id,
        status: "ACCEPTED",
        note: (fd.get("note") as string) || null,
      },
    });
  } catch {
    return { error: "Bu sporcuya zaten kefil oldun" };
  }

  // Kefalet Seviye 1'e yükseltir — §4.5 ölçekleme mekanizması
  await prisma.user.update({
    where: { id: athlete.id },
    data: { verification: "LEVEL_1", role: "ATHLETE" },
  });

  notify({
    userId: athlete.id,
    actorId: session.sub,
    type: "VOUCH",
    title: `${session.name} sana kefil oldu`,
    body: "Profilin Seviye 1 olarak doğrulandı.",
    url: "/panel/dogrulama",
  });

  revalidatePath("/panel/kefalet");
  return { ok: true, message: `${athlete.name} için kefalet oluşturuldu` };
}

export async function revokeVouch(id: string) {
  const user = await requireUser();
  await prisma.vouch.updateMany({
    where: { id, coachId: user.id },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
  revalidatePath("/panel/kefalet");
}

// ---------------------------------------------------------------------------
// Gönderiler
// ---------------------------------------------------------------------------

export async function createPost(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const raw = formToObject(fd);
  raw.tags = String(fd.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 10);

  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  if (d.type !== "TEXT" && !d.mediaUrl) return { error: "Medya yüklemelisin" };
  if (d.type === "TEXT" && !d.body) return { error: "Metin boş olamaz" };

  await prisma.post.create({
    data: {
      userId: user.id,
      type: d.type,
      body: d.body || null,
      mediaUrl: d.mediaUrl || null,
      mediaId: d.mediaId || null,
      thumbUrl: d.thumbUrl || null,
      durationSec: d.durationSec ?? null,
      discipline: (d.discipline || null) as never,
      tags: d.tags as string[],
      visibility: d.visibility,
      // §11.3 — Video içerik otomatik ön filtre kuyruğuna girer
      moderation: d.type === "VIDEO" ? "PENDING" : "APPROVED",
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { postCount: { increment: 1 } } });
  updateTag(CACHE_TAGS.posts);
  revalidatePath("/panel/gonderi");
  redirect("/panel/gonderi");
}

export async function deletePost(id: string) {
  const user = await requireUser();
  const post = await prisma.post.findFirst({ where: { id, userId: user.id }, select: { mediaId: true, type: true } });
  if (!post) return;
  await prisma.post.delete({ where: { id } });
  destroyAsset(post.mediaId, post.type === "VIDEO" ? "video" : "image");
  await prisma.user.update({ where: { id: user.id }, data: { postCount: { decrement: 1 } } });
  updateTag(CACHE_TAGS.posts);
  revalidatePath("/panel/gonderi");
}

// ---------------------------------------------------------------------------
// Creator (§4.7)
// ---------------------------------------------------------------------------

export async function upsertCreatorTier(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.verification === "LEVEL_0") {
    return { error: "Creator sayfası için doğrulanmış hesap gerekir" };
  }

  const raw = formToObject(fd);
  raw.perks = fd.getAll("perks[]").filter(Boolean);
  const parsed = creatorTierSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  await prisma.creatorTier.upsert({
    where: { creatorId_tier: { creatorId: session.sub, tier: d.tier } },
    update: { name: d.name, price: d.price, description: d.description || null, perks: d.perks as string[] },
    create: {
      creatorId: session.sub, tier: d.tier, name: d.name, price: d.price,
      description: d.description || null, perks: d.perks as string[],
    },
  });

  revalidatePath("/panel/creator");
  return { ok: true, message: "Kademe kaydedildi" };
}

export async function createCreatorPost(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = creatorPostSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  await prisma.creatorPost.create({
    data: {
      creatorId: user.id,
      title: d.title,
      body: d.body || null,
      mediaUrl: d.mediaUrl || null,
      mediaId: d.mediaId || null,
      thumbUrl: d.thumbUrl || null,
      type: d.type,
      minTier: d.minTier,
    },
  });

  revalidatePath("/panel/creator");
  return { ok: true, message: "İçerik yayınlandı" };
}

// ---------------------------------------------------------------------------
// Bildirimler & ayarlar
// ---------------------------------------------------------------------------

export async function markNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/panel/bildirimler");
}

/**
 * §11.1 Kapı 1 — Veli onayı bağlantısını (yeniden) gönderir.
 * E-posta adresi değiştiyse önce kaydedilir.
 */
export async function resendGuardianConsent(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const email = String(fd.get("guardianEmail") ?? "").trim().toLowerCase();
  if (email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return { error: "Geçerli bir e-posta girin", fields: { guardianEmail: "Geçersiz e-posta" } };
    }
    await prisma.user.update({ where: { id: user.id }, data: { guardianEmail: email } });
  }

  const result = await requestGuardianConsent(user.id);
  if (!result.ok) return { error: result.error ?? "Onay bağlantısı gönderilemedi" };

  revalidatePath("/panel");
  return { ok: true, message: "Onay bağlantısı veliye gönderildi. Gelen kutusunu kontrol etmesini iste." };
}

export async function updateSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      locale: String(fd.get("locale") ?? "de"),
      theme: String(fd.get("theme") ?? "dark"),
      visibility: (fd.get("visibility") as never) ?? "PUBLIC",
      pushEnabled: fd.get("pushEnabled") === "on",
      emailEnabled: fd.get("emailEnabled") === "on",
    },
  });
  revalidatePath("/panel/ayarlar");
  return { ok: true, message: "Ayarlar kaydedildi" };
}

export async function changePassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = passwordChangeSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);

  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { password: true } });
  if (!record?.password || !(await verifyPassword(parsed.data.current, record.password))) {
    return { error: "Mevcut şifre hatalı", fields: { current: "Hatalı şifre" } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(parsed.data.next) },
  });

  audit({ userId: user.id, action: "PASSWORD_CHANGE" });
  return { ok: true, message: "Şifren güncellendi" };
}

/** §5.7 — Veri taşınabilirliği: JSON dışa aktarım */
export async function exportMyData(): Promise<string> {
  const user = await requireUser();
  const [profile, trainings, posts, bookings, sparring] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        email: true, username: true, name: true, bio: true, city: true, country: true,
        birthDate: true, createdAt: true, sportProfiles: true,
      },
    }),
    prisma.trainingLog.findMany({ where: { userId: user.id } }),
    prisma.post.findMany({ where: { userId: user.id }, select: { body: true, mediaUrl: true, createdAt: true } }),
    prisma.booking.findMany({ where: { userId: user.id }, select: { date: true, type: true, status: true } }),
    prisma.sparringListing.findMany({ where: { userId: user.id } }),
  ]);
  return JSON.stringify({ profile, trainings, posts, bookings, sparring, exportedAt: new Date() }, null, 2);
}

/** §5.7 — Silme hakkı */
export async function deleteAccount(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (String(fd.get("confirm")) !== user.username) {
    return { error: "Onay için kullanıcı adını doğru yazmalısın" };
  }
  await prisma.user.delete({ where: { id: user.id } });
  audit({ action: "ACCOUNT_DELETE", targetType: "USER", targetId: user.id });
  await destroySession();
  redirect("/");
}

// ---------------------------------------------------------------------------
// §11.5 — DSA itiraz mekanizması
// ---------------------------------------------------------------------------

/**
 * Moderasyon kararına itiraz. İtiraz, kararı veren kişiden bağımsız olarak
 * yeniden değerlendirilir; sonuç kullanıcıya bildirilir ve şeffaflık
 * raporunda toplu olarak yayınlanır.
 */
export async function createAppeal(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const targetType = String(fd.get("targetType") ?? "").trim().toUpperCase();
  const targetId = String(fd.get("targetId") ?? "").trim();
  const body = String(fd.get("body") ?? "").trim();

  const allowed = ["POST", "COMMENT", "USER", "THREAD", "FORUM_POST", "MESSAGE"];
  if (!allowed.includes(targetType)) return { error: "Geçersiz itiraz konusu", fields: { targetType: "Seçim yapın" } };
  if (!targetId) return { error: "İtiraz edilen içeriğin kimliği gerekli", fields: { targetId: "Bağlantı veya kimlik gerekli" } };
  if (body.length < 20) return { error: "Gerekçeni biraz daha açıkla", fields: { body: "En az 20 karakter" } };
  if (body.length > 2000) return { error: "İtiraz en fazla 2000 karakter olabilir" };

  const open = await prisma.appeal.count({ where: { userId: user.id, status: "OPEN" } });
  if (open >= 5) return { error: "Aynı anda en fazla 5 açık itirazın olabilir." };

  const duplicate = await prisma.appeal.findFirst({
    where: { userId: user.id, targetType, targetId, status: "OPEN" },
    select: { id: true },
  });
  if (duplicate) return { error: "Bu içerik için zaten açık bir itirazın var." };

  await prisma.appeal.create({
    data: { userId: user.id, targetType, targetId, body },
  });

  audit({ userId: user.id, action: "APPEAL_CREATE", targetType, targetId });
  revalidatePath("/panel/itirazlar");
  return { ok: true, message: "İtirazın alındı. Sonuç bildirim olarak gelecek." };
}
