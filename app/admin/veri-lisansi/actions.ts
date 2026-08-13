"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/notify";
import { issueApiKey } from "@/lib/data-license";
import { dataLicenseReviewSchema } from "@/lib/validators";
import type { ActionState } from "@/app/panel/actions";

/** Lisans süresi §9.3 gereği 12 ay; otomatik yenileme yok */
const LICENSE_MONTHS = 12;

function fail(error: string): ActionState {
  return { error };
}

/**
 * §4.4 — Veri lisansı değerlendirmesi.
 *
 * APPROVE'da anahtar burada üretilir ve düz hâli yalnızca bu dönüşte görünür;
 * veritabanında sadece SHA-256 özeti saklandığı için sonradan okunamaz.
 */
export async function reviewDataLicense(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") return fail("Bu işlem için ADMIN yetkisi gerekir");

  const parsed = dataLicenseReviewSchema.safeParse({
    licenseId: fd.get("licenseId"),
    decision: fd.get("decision"),
    annualFee: fd.get("annualFee") ?? 0,
    rateLimit: fd.get("rateLimit") ?? 60,
    reviewNote: fd.get("reviewNote") ?? "",
  });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[i.path.map(String).join(".") || "_"] ??= i.message;
    return { error: "Lütfen alanları kontrol edin", fields };
  }
  const d = parsed.data;

  const license = await prisma.dataLicense.findUnique({
    where: { id: d.licenseId },
    select: { id: true, organization: true, status: true, scopes: true },
  });
  if (!license) return fail("Başvuru bulunamadı");

  const reviewNote = d.reviewNote || null;

  if (d.decision === "REJECT") {
    await prisma.dataLicense.update({
      where: { id: license.id },
      data: { status: "REJECTED", reviewNote, keyHash: null, keyPrefix: null, expiresAt: new Date() },
    });
    audit({
      userId: session.sub,
      action: "DATA_LICENSE_REJECT",
      targetType: "DATA_LICENSE",
      targetId: license.id,
    });
    revalidatePath("/admin/veri-lisansi");
    return { ok: true, message: `${license.organization} başvurusu reddedildi.` };
  }

  if (d.decision === "SUSPEND") {
    // Anahtar özeti korunur: askı kaldırılırsa aynı anahtar tekrar çalışır
    await prisma.dataLicense.update({
      where: { id: license.id },
      data: { status: "SUSPENDED", reviewNote },
    });
    audit({
      userId: session.sub,
      action: "DATA_LICENSE_SUSPEND",
      targetType: "DATA_LICENSE",
      targetId: license.id,
    });
    revalidatePath("/admin/veri-lisansi");
    return { ok: true, message: `${license.organization} lisansı askıya alındı. API erişimi anında kapandı.` };
  }

  if (license.scopes.length === 0) {
    return fail("Başvuruda hiç veri kümesi yok, onaylanamaz");
  }

  const key = issueApiKey();
  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setMonth(expiresAt.getMonth() + LICENSE_MONTHS);

  try {
    await prisma.dataLicense.update({
      where: { id: license.id },
      data: {
        status: "ACTIVE",
        keyHash: key.hash,
        keyPrefix: key.prefix,
        annualFee: d.annualFee,
        rateLimit: d.rateLimit,
        startsAt,
        expiresAt,
        reviewNote,
      },
    });
  } catch {
    return fail("Lisans güncellenemedi, lütfen tekrar deneyin");
  }

  audit({
    userId: session.sub,
    action: "DATA_LICENSE_APPROVE",
    targetType: "DATA_LICENSE",
    targetId: license.id,
    meta: { scopes: license.scopes, annualFee: d.annualFee, rateLimit: d.rateLimit },
  });
  revalidatePath("/admin/veri-lisansi");

  return {
    ok: true,
    message: `Lisans aktif. Anahtarı ŞİMDİ kopyala — bir daha gösterilmeyecek: ${key.plain}`,
  };
}
