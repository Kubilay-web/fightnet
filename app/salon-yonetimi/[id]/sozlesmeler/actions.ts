"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notify, audit } from "@/lib/notify";
import { issueInvoice } from "@/lib/invoicing";
import { renderMembershipContract } from "@/lib/contract-template";
import {
  isValidIban,
  maskIban,
  ibanFingerprint,
  mandateReference,
  collectionDate,
  buildPain008,
  vatRateFor,
  CREDITOR_ID,
  sepaConfigured,
  type DirectDebitEntry,
  type MandateSequence,
} from "@/lib/services/banking";
import { signDocument } from "@/lib/services/esign";
import { gymContractSchema, sepaMandateSchema } from "@/lib/validators";
import { MAX_CONTRACT_TERM_MONTHS } from "@/lib/constants";
import type { ActionState } from "@/app/panel/actions";

/**
 * §4.6 — Salon sözleşme yönetimi.
 *
 * Akış: salon sahibi taslak sözleşme oluşturur → üyeye bildirim gider →
 * ÜYE kendi panelinden IBAN ve açık onayla imzalar (eIDAS FES mührü + SEPA
 * mandatı) → sözleşme ACTIVE olur → aylık fatura GoBD numarasıyla kesilir.
 *
 * İki kural hiçbir koşulda esnetilmez:
 *   1. Sözleşmeyi yalnızca üyenin kendisi imzalayabilir — salon sahibi
 *      üyenin adına imza atamaz, aksi hâlde mühür kanıt değeri taşımaz.
 *   2. Ham IBAN hiçbir tabloya, loga veya audit kaydına yazılmaz; yalnızca
 *      maske ve parmak izi saklanır (§6 sözleşme metni bunu taahhüt eder).
 */

function zodFail(issues: readonly { path: readonly PropertyKey[]; message: string }[]): ActionState {
  const fields: Record<string, string> = {};
  for (const i of issues) fields[i.path.map(String).join(".") || "_"] ??= i.message;
  return { error: "Lütfen alanları kontrol edin", fields };
}

function toObject(fd: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) o[k] = v;
  return o;
}

const GYM_SELECT = {
  id: true,
  name: true,
  street: true,
  postalCode: true,
  city: true,
  country: true,
  ownerId: true,
  contractsEnabled: true,
  billingIban: true,
  billingBic: true,
} as const;

type GymRow = Prisma.GymGetPayload<{ select: typeof GYM_SELECT }>;

/** Sözleşme modülü yalnızca salonun sahibine (ve yöneticiye) açıktır. */
async function ownedGym(gymId: string, userId: string, role: string): Promise<GymRow | null> {
  const gym = await prisma.gym.findUnique({ where: { id: gymId }, select: GYM_SELECT });
  if (!gym) return null;
  if (gym.ownerId !== userId && role !== "ADMIN") return null;
  return gym;
}

function gymAddress(gym: GymRow): string {
  return [gym.street, [gym.postalCode, gym.city].filter(Boolean).join(" "), gym.country]
    .filter(Boolean)
    .join(", ");
}

function addMonths(date: Date, months: number): Date {
  const out = new Date(date.getTime());
  const day = out.getUTCDate();
  out.setUTCMonth(out.getUTCMonth() + months);
  if (out.getUTCDate() < day) out.setUTCDate(0);
  return out;
}

/**
 * `SZ-{yıl}-{sıra}` — sıra yıl içinde platform genelinde artar, böylece
 * contractNo'nun global tekilliği (@unique) bozulmaz. Sayaç yarışında
 * P2002 alınır ve bir sonraki numara denenir.
 */
async function nextContractNo(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const from = new Date(Date.UTC(year, 0, 1));
  const used = await prisma.gymContract.count({ where: { createdAt: { gte: from } } });
  return `SZ-${year}-${String(used + 1).padStart(4, "0")}`;
}

async function requestContext() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
    userAgent: h.get("user-agent") ?? null,
  };
}

function refreshViews(gymId: string) {
  revalidatePath(`/salon-yonetimi/${gymId}/sozlesmeler`);
  revalidatePath("/panel/sozlesmelerim");
}

// ---------------------------------------------------------------------------
// Salon tarafı — taslak sözleşme
// ---------------------------------------------------------------------------

export async function createContract(gymId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const gym = await ownedGym(gymId, user.id, user.role);
  if (!gym) return { error: "Bu salonun sözleşmelerini yönetme yetkin yok" };
  if (!gym.contractsEnabled) {
    return {
      error:
        "Sözleşme modülü bu salon için henüz açık değil. §4.6 uyarınca modül önce Hessen / Rhein-Main pilotundaki, mevcut üyelik yazılımı olmayan salonlarda devreye alınıyor.",
    };
  }

  const raw = toObject(fd);
  raw.gymId = gymId;
  const parsed = gymContractSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  if (d.termMonths > MAX_CONTRACT_TERM_MONTHS) {
    return {
      error: `Asgari süre BGB §309 Nr. 9 uyarınca ${MAX_CONTRACT_TERM_MONTHS} ayı aşamaz`,
      fields: { termMonths: `En fazla ${MAX_CONTRACT_TERM_MONTHS} ay` },
    };
  }

  const startsAt = new Date(d.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Başlangıç tarihi geçersiz", fields: { startsAt: "Geçerli bir tarih seç" } };
  }

  const member = await prisma.user.findUnique({
    where: { email: d.memberEmail },
    select: { id: true, name: true, email: true },
  });
  if (!member) {
    return {
      error: `${d.memberEmail} adresiyle kayıtlı bir üye bulunamadı. Üye önce FIGHTNET hesabı açmalı.`,
      fields: { memberEmail: "Bu e-posta ile kayıtlı kullanıcı yok" },
    };
  }
  if (member.id === user.id) return { error: "Kendinle sözleşme yapamazsın" };

  const existing = await prisma.gymContract.findFirst({
    where: { gymId, memberId: member.id, status: { in: ["DRAFT", "SENT", "SIGNED", "ACTIVE"] } },
    select: { contractNo: true },
  });
  if (existing) {
    return { error: `Bu üyenin zaten açık bir sözleşmesi var (${existing.contractNo})` };
  }

  // Mandat referansı sözleşme metnine gömülür; metin imzanın dayanağı olduğu
  // için referans imzadan ÖNCE belli olmalı. Tekillik için sözleşme numarası
  // kullanılır — aynı salonda aynı gün iki sözleşme çakışmasın.
  const contractNo = await nextContractNo();
  const mandateRef = mandateReference(contractNo.replace(/-/g, ""), startsAt);

  const documentText = renderMembershipContract({
    gymName: gym.name,
    gymAddress: gymAddress(gym),
    memberName: member.name,
    memberEmail: member.email,
    planName: d.planName,
    monthlyFee: d.monthlyFee,
    termMonths: d.termMonths,
    noticeDays: d.noticeDays,
    startsAt,
    contractNo,
    creditorId: CREDITOR_ID,
    mandateRef,
    vatRate: vatRateFor(gym.country),
  });

  try {
    await prisma.gymContract.create({
      data: {
        gymId,
        memberId: member.id,
        contractNo,
        status: "DRAFT",
        planName: d.planName,
        monthlyFee: d.monthlyFee,
        termMonths: d.termMonths,
        noticeDays: d.noticeDays,
        startsAt,
        documentText,
      },
      select: { id: true },
    });
  } catch {
    return { error: "Sözleşme numarası oluşturulamadı, lütfen tekrar dene" };
  }

  notify({
    userId: member.id,
    actorId: user.id,
    type: "SYSTEM",
    title: `${gym.name} sana bir üyelik sözleşmesi gönderdi`,
    body: `${d.planName} · ${d.monthlyFee} €/ay · ${d.termMonths} ay asgari süre`,
    url: "/panel/sozlesmelerim",
  });
  audit({ userId: user.id, action: "CONTRACT_CREATE", targetType: "GYM_CONTRACT", targetId: contractNo });

  refreshViews(gymId);
  return { ok: true, message: `${contractNo} oluşturuldu ve üyeye iletildi` };
}

// ---------------------------------------------------------------------------
// Üye tarafı — imza + SEPA mandatı
// ---------------------------------------------------------------------------

export async function signContract(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = sepaMandateSchema.safeParse(toObject(fd));
  if (!parsed.success) return zodFail(parsed.error.issues);
  const d = parsed.data;

  const contract = await prisma.gymContract.findUnique({
    where: { id: d.contractId },
    select: {
      id: true, gymId: true, memberId: true, contractNo: true, status: true,
      documentText: true, planName: true, monthlyFee: true,
      gym: { select: { name: true, ownerId: true, contractsEnabled: true } },
    },
  });
  if (!contract) return { error: "Sözleşme bulunamadı" };

  // Vekaleten imza yok: mühür ancak imzalayanın kendi oturumuyla kanıt değeri taşır.
  if (contract.memberId !== user.id) {
    return { error: "Bu sözleşmeyi yalnızca sözleşmenin üyesi imzalayabilir" };
  }
  if (contract.status !== "DRAFT" && contract.status !== "SENT") {
    return { error: "Bu sözleşme imza aşamasında değil" };
  }
  if (!contract.gym.contractsEnabled) {
    return { error: "Salonun sözleşme modülü şu anda kapalı" };
  }

  if (!isValidIban(d.iban)) {
    return {
      error: "IBAN doğrulanamadı — kontrol hanesi (mod-97) tutmuyor",
      fields: { iban: "Geçerli bir IBAN gir" },
    };
  }

  const { ip, userAgent } = await requestContext();
  const seal = signDocument({
    documentText: contract.documentText,
    documentTitle: `Üyelik Sözleşmesi ${contract.contractNo}`,
    signerId: user.id,
    signerName: user.name,
    signerEmail: user.email,
    ip,
    userAgent,
  });

  const mandateRef = mandateReference(contract.contractNo.replace(/-/g, ""), new Date(seal.signedAt));
  const signedAt = new Date(seal.signedAt);

  // İmza ve mandat tek işlemde yazılır: mandatsız ACTIVE sözleşme tahsilat
  // dayanağı olmayan bir borç doğururdu.
  await prisma.$transaction([
    prisma.gymContract.update({
      where: { id: contract.id },
      data: {
        // SIGNED ara durumu yalnızca harici QTSP akışında beklenir; içeride
        // imza anında yürürlüğe girer.
        status: "ACTIVE",
        signedAt,
        signature: seal as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.sepaMandate.create({
      data: {
        contractId: contract.id,
        mandateRef,
        status: "ACTIVE",
        debtorName: d.debtorName,
        // Ham IBAN buraya kadar geldi ve burada bırakılıyor — saklanan tek şey
        // maske ve geri döndürülemez parmak izi.
        ibanMasked: maskIban(d.iban),
        ibanFingerprint: ibanFingerprint(d.iban),
        bic: d.bic ? d.bic.toUpperCase() : null,
        sequence: "FRST",
        signedAt,
      },
    }),
  ]);

  if (contract.gym.ownerId) {
    notify({
      userId: contract.gym.ownerId,
      actorId: user.id,
      type: "SYSTEM",
      title: `${user.name} ${contract.contractNo} sözleşmesini imzaladı`,
      body: `${contract.planName} · SEPA mandatı ${mandateRef}`,
      url: `/salon-yonetimi/${contract.gymId}/sozlesmeler`,
    });
  }
  audit({
    userId: user.id,
    action: "CONTRACT_SIGN",
    targetType: "GYM_CONTRACT",
    targetId: contract.contractNo,
    // Kanıt için özet ve mandat referansı yeterli; IBAN'a yer yok.
    meta: { documentHash: seal.documentHash, level: seal.level, mandateRef },
    ip,
  });

  refreshViews(contract.gymId);
  return { ok: true, message: "Sözleşme imzalandı ve SEPA mandatı oluşturuldu" };
}

// ---------------------------------------------------------------------------
// Fesih
// ---------------------------------------------------------------------------

/**
 * Fesih tarihi iki sınırın geç olanıdır: ihbar süresinin dolduğu gün ve
 * asgari sürenin bittiği gün. Böylece BGB §309 Nr. 9 kapsamındaki asgari
 * süre korunur, ihbar süresi de kısaltılmış olmaz.
 */
export async function terminateContract(contractId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const contract = await prisma.gymContract.findUnique({
    where: { id: contractId },
    select: {
      id: true, gymId: true, memberId: true, contractNo: true, status: true,
      startsAt: true, termMonths: true, noticeDays: true,
      gym: { select: { name: true, ownerId: true } },
      member: { select: { name: true } },
    },
  });
  if (!contract) return { error: "Sözleşme bulunamadı" };

  const isMember = contract.memberId === user.id;
  const isOwner = contract.gym.ownerId === user.id || user.role === "ADMIN";
  if (!isMember && !isOwner) return { error: "Bu sözleşmeyi feshetme yetkin yok" };

  if (contract.status === "TERMINATED" || contract.status === "CANCELLED") {
    return { error: "Bu sözleşme zaten sona ermiş" };
  }

  const reason = ((fd.get("reason") as string) ?? "").trim().slice(0, 500);

  const now = new Date();
  const noticeEnd = new Date(now.getTime());
  noticeEnd.setUTCDate(noticeEnd.getUTCDate() + contract.noticeDays);
  const minimumEnd = addMonths(contract.startsAt, contract.termMonths);
  const endsAt = noticeEnd > minimumEnd ? noticeEnd : minimumEnd;

  await prisma.gymContract.update({
    where: { id: contract.id },
    data: {
      status: "TERMINATED",
      terminatedAt: now,
      endsAt,
      terminationReason: reason || (isMember ? "Üye feshi" : "Salon feshi"),
    },
  });

  // Fesih sonrası tahsilat dayanağı kalmaz — mandat da geri alınır.
  await prisma.sepaMandate.updateMany({
    where: { contractId: contract.id, status: "ACTIVE" },
    data: { status: "REVOKED", revokedAt: now },
  });

  // Karşı tarafa bildir — salonun sahibi henüz atanmamış olabilir.
  const counterparty = isMember ? contract.gym.ownerId : contract.memberId;
  if (counterparty) {
    notify({
      userId: counterparty,
      actorId: user.id,
      type: "SYSTEM",
      title: isMember
        ? `${contract.member.name} ${contract.contractNo} sözleşmesini feshetti`
        : `${contract.gym.name} ${contract.contractNo} sözleşmesini feshetti`,
      body: `Sözleşme ${endsAt.toISOString().slice(0, 10)} tarihinde sona erecek`,
      url: isMember ? `/salon-yonetimi/${contract.gymId}/sozlesmeler` : "/panel/sozlesmelerim",
    });
  }
  audit({
    userId: user.id,
    action: "CONTRACT_TERMINATE",
    targetType: "GYM_CONTRACT",
    targetId: contract.contractNo,
    meta: { endsAt: endsAt.toISOString(), byMember: isMember },
  });

  refreshViews(contract.gymId);
  return { ok: true, message: `Fesih kaydedildi — sözleşme ${endsAt.toISOString().slice(0, 10)} tarihinde biter` };
}

// ---------------------------------------------------------------------------
// Faturalama
// ---------------------------------------------------------------------------

/** Aylık aidat faturası — KDV oranı salonun ülkesinden gelir (§4.6 DACH). */
export async function issueContractInvoice(contractId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const contract = await prisma.gymContract.findUnique({
    where: { id: contractId },
    select: {
      id: true, gymId: true, memberId: true, contractNo: true, status: true,
      planName: true, monthlyFee: true,
      gym: { select: { ownerId: true, country: true, contractsEnabled: true } },
    },
  });
  if (!contract) return { error: "Sözleşme bulunamadı" };
  if (contract.gym.ownerId !== user.id && user.role !== "ADMIN") {
    return { error: "Fatura kesme yetkin yok" };
  }
  if (contract.status !== "ACTIVE" && contract.status !== "TERMINATED") {
    return { error: "Yalnızca imzalanmış sözleşmeler için fatura kesilebilir" };
  }

  const periodRaw = (fd.get("period") as string) ?? "";
  const period = /^\d{4}-\d{2}$/.test(periodRaw) ? periodRaw : new Date().toISOString().slice(0, 7);

  // GoBD: kesilen fatura düzeltilemez, ancak Storno ile ters kaydedilir.
  // Bu yüzden aynı dönemin ikinci kez faturalanması baştan engellenir.
  const [y, m] = period.split("-").map(Number);
  const periodStart = new Date(Date.UTC(y, m - 1, 1));
  const periodEnd = new Date(Date.UTC(y, m, 1));
  const already = await prisma.invoice.findFirst({
    where: {
      contractId: contract.id,
      cancelledAt: null,
      issuedAt: { gte: periodStart, lt: periodEnd },
    },
    select: { invoiceNo: true },
  });
  if (already) return { error: `${period} dönemi zaten ${already.invoiceNo} ile faturalandı` };

  const invoice = await issueInvoice({
    lines: [
      {
        description: `${contract.planName} — üyelik aidatı ${period} (${contract.contractNo})`,
        quantity: 1,
        unitGross: contract.monthlyFee,
      },
    ],
    country: contract.gym.country,
    userId: contract.memberId,
    gymId: contract.gymId,
    contractId: contract.id,
    dueInDays: 14,
  });

  notify({
    userId: contract.memberId,
    actorId: user.id,
    type: "SYSTEM",
    title: `Yeni fatura: ${invoice.invoiceNo}`,
    body: `${contract.planName} · ${period}`,
    url: "/panel/sozlesmelerim",
  });
  audit({
    userId: user.id,
    action: "INVOICE_ISSUE",
    targetType: "INVOICE",
    targetId: invoice.invoiceNo,
    meta: { contractNo: contract.contractNo, period },
  });

  refreshViews(contract.gymId);
  return { ok: true, message: `${invoice.invoiceNo} kesildi (${period})` };
}

// ---------------------------------------------------------------------------
// SEPA toplu tahsilat dosyası (pain.008)
// ---------------------------------------------------------------------------

/**
 * Kendi banka hesabından tahsilat yapan salonlar için ISO 20022 dosyası üretir.
 *
 * Önemli sınır: platform ham IBAN saklamadığı için dosyadaki borçlu hesap
 * alanları MASKELİ gelir. Dosya bu hâliyle bir hazırlık/kontrol çıktısıdır;
 * borçlu IBAN'ları tahsilat anında ödeme kuruluşu (Stripe SEPA Direct Debit)
 * veya salonun banka portalı tamamlar. Veri asgariliği bilerek tercih edildi.
 */
export async function exportDirectDebitBatch(gymId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const gym = await ownedGym(gymId, user.id, user.role);
  if (!gym) return { error: "Bu salonun sözleşmelerini yönetme yetkin yok" };

  if (!sepaConfigured) {
    return {
      error:
        "SEPA alacaklı kimliği (SEPA_CREDITOR_ID) tanımlı değil. Bundesbank'tan alınan Gläubiger-ID girilmeden tahsilat dosyası üretilemez.",
    };
  }
  if (!gym.billingIban) {
    return { error: "Salonun tahsilat IBAN'ı (billingIban) tanımlı değil — dosya alacaklı hesabı olmadan üretilemez." };
  }

  const raw = (fd.get("sequence") as string) ?? "FRST";
  const sequence: MandateSequence = raw === "RCUR" ? "RCUR" : "FRST";

  const contracts = await prisma.gymContract.findMany({
    where: { gymId, status: "ACTIVE", mandate: { status: "ACTIVE", sequence } },
    orderBy: { contractNo: "asc" },
    select: {
      contractNo: true,
      planName: true,
      monthlyFee: true,
      mandate: { select: { mandateRef: true, debtorName: true, ibanMasked: true, signedAt: true } },
    },
  });

  const entries: DirectDebitEntry[] = contracts.flatMap((c) =>
    c.mandate
      ? [
          {
            endToEndId: c.contractNo,
            amount: c.monthlyFee,
            debtorName: c.mandate.debtorName,
            debtorIban: c.mandate.ibanMasked,
            mandateId: c.mandate.mandateRef,
            mandateSignedAt: c.mandate.signedAt ?? new Date(),
            remittanceInfo: `${gym.name} ${c.planName} ${c.contractNo}`,
            sequence,
          },
        ]
      : [],
  );

  if (!entries.length) {
    return { error: `${sequence} dizisinde tahsil edilecek aktif mandat yok` };
  }

  const requestedCollectionDate = collectionDate(sequence);
  const messageId = `FN-DD-${gymId.slice(-8).toUpperCase()}-${Date.now()}`;
  const xml = buildPain008({
    messageId,
    creditorIban: gym.billingIban,
    creditorBic: gym.billingBic ?? undefined,
    entries,
    requestedCollectionDate,
    sequence,
  });

  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  audit({
    userId: user.id,
    action: "SEPA_BATCH_EXPORT",
    targetType: "GYM",
    targetId: gymId,
    meta: { messageId, count: entries.length, total, sequence },
  });

  // Mandat dizisi (FRST → RCUR) burada değişmez: dosya üretilmiş olması
  // tahsilatın bankaca kabul edildiği anlamına gelmez, geçiş tahsilat
  // onayıyla yapılır.
  return {
    ok: true,
    message: `${entries.length} tahsilat · ${total.toFixed(2)} € · tahsilat tarihi ${requestedCollectionDate
      .toISOString()
      .slice(0, 10)}`,
    fields: { xml, messageId },
  };
}
