"use server";

import { revalidatePath, updateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/queries";
import { destroyAsset } from "@/lib/cloudinary";
import { notify, audit } from "@/lib/notify";
import { randomCode, slugify } from "@/lib/utils";
import { snapshotKpi } from "@/lib/kpi";
import type { ActionState } from "@/app/panel/actions";
import { adSchema, betaCodeSchema, spotlightSchema, adminUserSchema, sponsorOfferSchema } from "@/lib/validators";

function fail(error: string): ActionState {
  return { error };
}

// ---------------------------------------------------------------------------
// Doğrulama kuyruğu (§4.5)
// ---------------------------------------------------------------------------

export async function reviewVerification(id: string, approve: boolean, note?: string) {
  const session = await requireAdmin();

  const req = await prisma.verificationRequest.findUnique({
    where: { id },
    select: {
      id: true, userId: true, targetLevel: true, claimedRole: true, status: true,
      idDocId: true, selfieId: true, proofIds: true,
    },
  });
  if (!req || req.status !== "PENDING") return;

  await prisma.verificationRequest.update({
    where: { id },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      reviewerId: session.sub,
      reviewNote: note ?? null,
      reviewedAt: new Date(),
    },
  });

  if (approve) {
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        verification: req.targetLevel,
        ...(req.claimedRole ? { role: req.claimedRole } : {}),
      },
    });

    // KYC belgeleri onay sonrası silinir — §5.7 veri minimizasyonu
    destroyAsset(req.idDocId);
    destroyAsset(req.selfieId);
    await prisma.verificationRequest.update({
      where: { id },
      data: { idDocUrl: null, idDocId: null, selfieUrl: null, selfieId: null },
    });
  }

  notify({
    userId: req.userId,
    actorId: session.sub,
    type: "VERIFICATION",
    title: approve ? "Doğrulaman onaylandı 🎉" : "Doğrulama talebin reddedildi",
    body: note ?? undefined,
    url: "/panel/dogrulama",
  });

  audit({
    userId: session.sub,
    action: approve ? "VERIFICATION_APPROVE" : "VERIFICATION_REJECT",
    targetType: "USER",
    targetId: req.userId,
  });

  updateTag(CACHE_TAGS.fighters);
  revalidatePath("/admin/dogrulama");
}

export async function reviewPassportDoc(id: string, approve: boolean, note?: string) {
  const session = await requireAdmin();
  const doc = await prisma.passportDocument.findUnique({ where: { id }, select: { userId: true, title: true } });
  if (!doc) return;

  await prisma.passportDocument.update({
    where: { id },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      reviewNote: note ?? null,
      reviewedAt: new Date(),
      isShareable: approve,
    },
  });

  notify({
    userId: doc.userId,
    actorId: session.sub,
    type: "VERIFICATION",
    title: approve ? `"${doc.title}" belgen onaylandı` : `"${doc.title}" belgen reddedildi`,
    body: note ?? undefined,
    url: "/panel/passport",
  });

  revalidatePath("/admin/passport");
}

// ---------------------------------------------------------------------------
// Moderasyon (§11.3 Notice-and-Action)
// ---------------------------------------------------------------------------

export async function resolveReport(id: string, action: "REMOVE" | "DISMISS" | "BAN") {
  const session = await requireAdmin();

  const report = await prisma.report.findUnique({
    where: { id },
    select: { id: true, targetType: true, targetId: true, reportedUserId: true, reason: true },
  });
  if (!report) return;

  if (action === "REMOVE") {
    switch (report.targetType) {
      case "POST":
        await prisma.post.update({ where: { id: report.targetId }, data: { moderation: "REMOVED" } }).catch(() => {});
        break;
      case "COMMENT":
        await prisma.postComment.update({ where: { id: report.targetId }, data: { moderation: "REMOVED" } }).catch(() => {});
        break;
      case "THREAD":
        await prisma.forumThread.update({ where: { id: report.targetId }, data: { moderation: "REMOVED" } }).catch(() => {});
        break;
      case "FORUM_POST":
        await prisma.forumPost.update({ where: { id: report.targetId }, data: { moderation: "REMOVED" } }).catch(() => {});
        break;
      case "MESSAGE":
        await prisma.message.update({ where: { id: report.targetId }, data: { moderation: "REMOVED" } }).catch(() => {});
        break;
    }
    updateTag(CACHE_TAGS.posts);
  }

  if (action === "BAN" && report.reportedUserId) {
    await prisma.user.update({
      where: { id: report.reportedUserId },
      data: {
        isBanned: true,
        banReason: `Moderasyon kararı: ${report.reason}`,
        bannedUntil: new Date(Date.now() + 30 * 864e5),
      },
    });
    notify({
      userId: report.reportedUserId,
      type: "SYSTEM",
      title: "Hesabın 30 gün askıya alındı",
      body: `Sebep: ${report.reason}. İtiraz için destek ile iletişime geç.`,
    });
  }

  await prisma.report.update({
    where: { id },
    data: {
      status: action === "DISMISS" ? "DISMISSED" : "RESOLVED",
      handlerId: session.sub,
      resolution: action,
      resolvedAt: new Date(),
    },
  });

  audit({ userId: session.sub, action: `REPORT_${action}`, targetType: report.targetType, targetId: report.targetId });
  revalidatePath("/admin/raporlar");
}

export async function moderatePost(id: string, state: "APPROVED" | "REMOVED") {
  const session = await requireAdmin();
  await prisma.post.update({ where: { id }, data: { moderation: state } });
  audit({ userId: session.sub, action: `POST_${state}`, targetType: "POST", targetId: id });
  updateTag(CACHE_TAGS.posts);
  revalidatePath("/admin/raporlar");
}

// ---------------------------------------------------------------------------
// Kullanıcı yönetimi
// ---------------------------------------------------------------------------

export async function updateUserAdmin(userId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") return fail("Bu işlem için ADMIN yetkisi gerekir");
  if (userId === session.sub) return fail("Kendi hesabını buradan değiştiremezsin");

  const parsed = adminUserSchema.safeParse({
    role: fd.get("role"),
    verification: fd.get("verification"),
    isActive: fd.get("isActive") === "on",
    isBanned: fd.get("isBanned") === "on",
    isFounder: fd.get("isFounder") === "on",
    banReason: fd.get("banReason") ?? "",
  });
  if (!parsed.success) return fail("Geçersiz veri");
  const d = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: d.role,
      verification: d.verification,
      isActive: d.isActive,
      isBanned: d.isBanned,
      isFounder: d.isFounder,
      banReason: d.isBanned ? d.banReason || "Yönetici kararı" : null,
      bannedUntil: d.isBanned ? new Date(Date.now() + 365 * 864e5) : null,
      founderSince: d.isFounder ? new Date() : null,
    },
  });

  audit({ userId: session.sub, action: "USER_UPDATE", targetType: "USER", targetId: userId, meta: d });
  updateTag(CACHE_TAGS.fighters);
  revalidatePath("/admin/kullanicilar");
  return { ok: true, message: "Kullanıcı güncellendi" };
}

// ---------------------------------------------------------------------------
// Salonlar
// ---------------------------------------------------------------------------

export async function setGymStatus(
  id: string,
  data: { status?: "PENDING" | "ACTIVE" | "SUSPENDED"; isVerified?: boolean; isFounder?: boolean; isHalo?: boolean },
) {
  const session = await requireAdmin();
  await prisma.gym.update({ where: { id }, data });
  audit({ userId: session.sub, action: "GYM_UPDATE", targetType: "GYM", targetId: id, meta: data });
  updateTag(CACHE_TAGS.gyms);
  revalidatePath("/admin/salonlar");
}

// ---------------------------------------------------------------------------
// Etkinlik / Livescore kontrolü
// ---------------------------------------------------------------------------

export async function setEventStatus(id: string, status: "DRAFT" | "PUBLISHED" | "LIVE" | "FINISHED" | "CANCELLED") {
  const session = await requireAdmin();
  await prisma.event.update({ where: { id }, data: { status } });
  audit({ userId: session.sub, action: "EVENT_STATUS", targetType: "EVENT", targetId: id, meta: { status } });
  updateTag(CACHE_TAGS.events);
  revalidatePath("/admin/etkinlikler");
}

// ---------------------------------------------------------------------------
// Spotlight (§4.1)
// ---------------------------------------------------------------------------

export async function setSpotlight(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const parsed = spotlightSchema.safeParse({
    userId: fd.get("userId"),
    date: fd.get("date"),
    headline: fd.get("headline") ?? "",
    blurb: fd.get("blurb") ?? "",
  });
  if (!parsed.success) return fail("Geçersiz veri");
  const d = parsed.data;

  const date = new Date(d.date);
  date.setHours(0, 0, 0, 0);

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: d.userId }, { id: d.userId }] },
    select: { id: true, name: true },
  });
  if (!user) return fail("Sporcu bulunamadı (kullanıcı adı veya ID girin)");

  await prisma.spotlight.upsert({
    where: { date },
    update: { userId: user.id, headline: d.headline || null, blurb: d.blurb || null, isActive: true },
    create: { userId: user.id, date, headline: d.headline || null, blurb: d.blurb || null },
  });

  audit({ userId: session.sub, action: "SPOTLIGHT_SET", targetType: "USER", targetId: user.id });
  updateTag(CACHE_TAGS.spotlight);
  revalidatePath("/admin/spotlight");
  revalidatePath("/");
  return { ok: true, message: `${user.name} spotlight'a alındı` };
}

export async function deleteSpotlight(id: string) {
  await requireAdmin();
  await prisma.spotlight.delete({ where: { id } }).catch(() => {});
  updateTag(CACHE_TAGS.spotlight);
  revalidatePath("/admin/spotlight");
}

// ---------------------------------------------------------------------------
// Reklamlar (§4.2 — spor bahis reklamı yok)
// ---------------------------------------------------------------------------

export async function createAd(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") return fail("ADMIN yetkisi gerekir");

  const parsed = adSchema.safeParse({
    name: fd.get("name"),
    advertiser: fd.get("advertiser"),
    imageUrl: fd.get("imageUrl"),
    imageId: fd.get("imageId") ?? "",
    linkUrl: fd.get("linkUrl"),
    placement: fd.get("placement"),
    disciplines: fd.getAll("disciplines[]"),
    cities: String(fd.get("cities") ?? "").split(",").map((c) => c.trim()).filter(Boolean),
    startsAt: fd.get("startsAt"),
    endsAt: fd.get("endsAt"),
    isActive: fd.get("isActive") === "on",
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Geçersiz veri");
  const d = parsed.data;

  await prisma.ad.create({
    data: {
      name: d.name,
      advertiser: d.advertiser,
      imageUrl: d.imageUrl,
      imageId: d.imageId || null,
      linkUrl: d.linkUrl,
      placement: d.placement,
      disciplines: d.disciplines as never,
      cities: d.cities as string[],
      startsAt: new Date(d.startsAt),
      endsAt: new Date(d.endsAt),
      isActive: d.isActive,
    },
  });

  updateTag(CACHE_TAGS.ads);
  revalidatePath("/admin/reklamlar");
  return { ok: true, message: "Reklam oluşturuldu" };
}

export async function toggleAd(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.ad.update({ where: { id }, data: { isActive } });
  updateTag(CACHE_TAGS.ads);
  revalidatePath("/admin/reklamlar");
}

export async function deleteAd(id: string) {
  await requireAdmin();
  const ad = await prisma.ad.findUnique({ where: { id }, select: { imageId: true } });
  await prisma.ad.delete({ where: { id } }).catch(() => {});
  destroyAsset(ad?.imageId);
  updateTag(CACHE_TAGS.ads);
  revalidatePath("/admin/reklamlar");
}

// ---------------------------------------------------------------------------
// Beta kodları & bekleme listesi (§6)
// ---------------------------------------------------------------------------

export async function createBetaCode(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") return fail("ADMIN yetkisi gerekir");

  const parsed = betaCodeSchema.safeParse({
    code: fd.get("code") ?? "",
    label: fd.get("label") ?? "",
    maxUses: fd.get("maxUses"),
    isFounder: fd.get("isFounder") === "on",
    grantsRole: fd.get("grantsRole") ?? "",
    expiresAt: fd.get("expiresAt") ?? "",
  });
  if (!parsed.success) return fail("Geçersiz veri");
  const d = parsed.data;

  const code = d.code || `FN-${randomCode(6)}`;

  try {
    await prisma.betaCode.create({
      data: {
        code,
        label: d.label || null,
        maxUses: d.maxUses,
        isFounder: d.isFounder,
        grantsRole: (d.grantsRole || null) as never,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      },
    });
  } catch {
    return fail("Bu kod zaten var");
  }

  revalidatePath("/admin/beta-kodlari");
  return { ok: true, message: `Kod oluşturuldu: ${code}` };
}

export async function toggleBetaCode(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.betaCode.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/beta-kodlari");
}

export async function inviteWaitlist(id: string) {
  const session = await requireAdmin();
  const entry = await prisma.waitlistEntry.findUnique({ where: { id }, select: { email: true, betaCode: true } });
  if (!entry) return;

  const code = entry.betaCode ?? `FN-${randomCode(6)}`;
  if (!entry.betaCode) {
    await prisma.betaCode.create({
      data: { code, label: `Bekleme listesi: ${entry.email}`, maxUses: 1 },
    });
  }

  await prisma.waitlistEntry.update({
    where: { id },
    data: { status: "INVITED", invitedAt: new Date(), betaCode: code },
  });

  audit({ userId: session.sub, action: "WAITLIST_INVITE", targetType: "WAITLIST", targetId: id });
  revalidatePath("/admin/bekleme-listesi");
}

// ---------------------------------------------------------------------------
// Forum yönetimi
// ---------------------------------------------------------------------------

export async function createForumCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  if (name.length < 2) return fail("Kategori adı çok kısa");

  try {
    await prisma.forumCategory.create({
      data: {
        name,
        slug: slugify(name),
        description: String(fd.get("description") ?? "") || null,
        discipline: (fd.get("discipline") || null) as never,
        order: Number(fd.get("order") ?? 0) || 0,
      },
    });
  } catch {
    return fail("Bu kategori zaten var");
  }

  updateTag(CACHE_TAGS.forum);
  revalidatePath("/admin/forum");
  return { ok: true, message: "Kategori oluşturuldu" };
}

export async function toggleThreadPin(id: string, isPinned: boolean) {
  await requireAdmin();
  await prisma.forumThread.update({ where: { id }, data: { isPinned } });
  updateTag(CACHE_TAGS.forum);
  revalidatePath("/admin/forum");
}

export async function toggleThreadLock(id: string, isLocked: boolean) {
  await requireAdmin();
  await prisma.forumThread.update({ where: { id }, data: { isLocked } });
  updateTag(CACHE_TAGS.forum);
  revalidatePath("/admin/forum");
}

// ---------------------------------------------------------------------------
// §7 — KPI
// ---------------------------------------------------------------------------

/** Zamanlanmış görevi beklemeden anlık görüntü alır */
export async function takeKpiSnapshot() {
  const session = await requireAdmin();
  await snapshotKpi();
  audit({ userId: session.sub, action: "KPI_SNAPSHOT" });
  revalidatePath("/admin/kpi");
}

// ---------------------------------------------------------------------------
// §11.5 — DSA itirazları
// ---------------------------------------------------------------------------

/**
 * İtirazı sonuçlandırır. Karar gerekçesi kullanıcıya bildirim olarak gider ve
 * sonuç şeffaflık raporunda toplu olarak sayılır.
 */
export async function resolveAppeal(
  id: string,
  status: "UPHELD" | "OVERTURNED" | "DISMISSED",
  decision: string,
): Promise<ActionState> {
  const session = await requireAdmin();

  const appeal = await prisma.appeal.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true, targetType: true, targetId: true },
  });
  if (!appeal) return fail("İtiraz bulunamadı");
  if (appeal.status !== "OPEN") return fail("Bu itiraz zaten sonuçlandırılmış");
  if (decision.trim().length < 10) return fail("Karar gerekçesi en az 10 karakter olmalı");

  await prisma.appeal.update({
    where: { id },
    data: { status, decision: decision.trim(), handlerId: session.sub, resolvedAt: new Date() },
  });

  const label = {
    UPHELD: "reddedildi — moderasyon kararı korundu",
    OVERTURNED: "kabul edildi — karar geri alındı",
    DISMISSED: "işleme alınmadı",
  }[status];

  notify({
    userId: appeal.userId,
    actorId: session.sub,
    type: "SYSTEM",
    title: `İtirazın ${label}`,
    body: decision.trim(),
    url: "/panel/itirazlar",
  });

  audit({
    userId: session.sub,
    action: "APPEAL_RESOLVE",
    targetType: appeal.targetType,
    targetId: appeal.targetId,
    meta: { appealId: id, status },
  });

  revalidatePath("/admin/itirazlar");
  return { ok: true, message: `İtiraz ${label}` };
}

// ---------------------------------------------------------------------------
// §4.3 — Sponsor portalı
// ---------------------------------------------------------------------------

export async function createSponsor(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") return fail("Bu işlem için ADMIN yetkisi gerekir");

  const name = String(fd.get("name") ?? "").trim();
  const website = String(fd.get("website") ?? "").trim();
  const about = String(fd.get("about") ?? "").trim();
  const logoUrl = String(fd.get("logoUrl") ?? "").trim();
  const logoId = String(fd.get("logoId") ?? "").trim();
  const budgetMin = Number(fd.get("budgetMin")) || null;
  const budgetMax = Number(fd.get("budgetMax")) || null;
  const disciplines = fd.getAll("disciplines[]").filter((d): d is string => typeof d === "string");

  if (name.length < 2) return fail("Marka adı en az 2 karakter olmalı");

  await prisma.sponsor.create({
    data: {
      slug: `${slugify(name)}-${randomCode(4).toLowerCase()}`,
      name,
      website: website || null,
      about: about || null,
      logoUrl: logoUrl || null,
      logoId: logoId || null,
      budgetMin,
      budgetMax,
      disciplines: disciplines as never,
    },
  });

  audit({ userId: session.sub, action: "SPONSOR_CREATE", targetType: "SPONSOR" });
  revalidatePath("/admin/sponsorlar");
  return { ok: true, message: "Sponsor eklendi" };
}

export async function createSponsorOffer(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") return fail("Bu işlem için ADMIN yetkisi gerekir");

  const parsed = sponsorOfferSchema.safeParse({
    sponsorId: fd.get("sponsorId"),
    title: fd.get("title"),
    description: fd.get("description"),
    disciplines: fd.getAll("disciplines[]").filter(Boolean),
    minFollowers: fd.get("minFollowers") ?? 0,
    minLevel: fd.get("minLevel") ?? "BEGINNER",
    region: fd.get("region") ?? "",
    value: fd.get("value") ?? "",
    deadline: fd.get("deadline") ?? "",
  });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[i.path.map(String).join(".") || "_"] ??= i.message;
    return { error: "Lütfen alanları kontrol edin", fields };
  }
  const d = parsed.data;

  const sponsor = await prisma.sponsor.findUnique({ where: { id: d.sponsorId }, select: { id: true } });
  if (!sponsor) return fail("Sponsor bulunamadı");

  await prisma.sponsorOffer.create({
    data: {
      sponsorId: d.sponsorId,
      title: d.title,
      description: d.description,
      disciplines: d.disciplines,
      minFollowers: d.minFollowers,
      minLevel: d.minLevel,
      region: d.region || null,
      value: d.value || null,
      deadline: d.deadline ? new Date(d.deadline) : null,
    },
  });

  audit({ userId: session.sub, action: "SPONSOR_OFFER_CREATE", targetType: "SPONSOR_OFFER" });
  revalidatePath("/admin/sponsorlar");
  revalidatePath("/sponsorluk");
  return { ok: true, message: "Teklif yayınlandı" };
}

export async function setOfferStatus(id: string, status: "OPEN" | "CLOSED") {
  const session = await requireAdmin();
  await prisma.sponsorOffer.update({ where: { id }, data: { status } });
  audit({ userId: session.sub, action: "SPONSOR_OFFER_STATUS", targetType: "SPONSOR_OFFER", targetId: id });
  revalidatePath("/admin/sponsorlar");
  revalidatePath("/sponsorluk");
}

/** Sporcunun başvurusunu sonuçlandırır — karar sporcuya bildirilir */
export async function reviewSponsorApplication(id: string, status: "ACCEPTED" | "REJECTED") {
  const session = await requireAdmin();

  const application = await prisma.sponsorApplication.findUnique({
    where: { id },
    select: { id: true, userId: true, offer: { select: { title: true, sponsor: { select: { name: true } } } } },
  });
  if (!application) return;

  await prisma.sponsorApplication.update({ where: { id }, data: { status } });

  notify({
    userId: application.userId,
    actorId: session.sub,
    type: "SYSTEM",
    title: status === "ACCEPTED" ? "Sponsorluk başvurun kabul edildi 🎉" : "Sponsorluk başvurun sonuçlandı",
    body: `${application.offer.sponsor.name} · ${application.offer.title}`,
    url: "/sponsorluk",
  });

  audit({ userId: session.sub, action: `SPONSOR_APPLICATION_${status}`, targetType: "SPONSOR_APPLICATION", targetId: id });
  revalidatePath("/admin/sponsorlar");
}
