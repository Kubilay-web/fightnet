import "server-only";
import prisma from "./prisma";

/**
 * §7 — Anahtar göstergeler ve Dur/Devam kapıları.
 *
 * North Star: MAVU (Aylık Aktif Doğrulanmış Kullanıcı). Her gün bir anlık
 * görüntü alınır; trend bu kayıtlardan okunur, canlı sayım her sayfa
 * açılışında yeniden hesaplanmaz.
 */

export interface KpiValues {
  mavu: number;
  dau: number;
  mau: number;
  payingGyms: number;
  waitlistCount: number;
  loiCount: number;
  vouchCount: number;
  profileCompletion: number;
  mrr: number;
  newUsers: number;
  reportsCount: number;
}

/** §7.1–7.3 — tüm göstergeleri tek turda hesaplar */
export async function computeKpi(): Promise<KpiValues> {
  const monthAgo = new Date(Date.now() - 30 * 864e5);
  const dayAgo = new Date(Date.now() - 864e5);

  const [
    mavu, dau, mau, payingGyms, waitlistCount, loiCount,
    vouchCount, profileAgg, mrrAgg, newUsers, reportsCount,
  ] = await Promise.all([
    // MAVU: aylık aktif + doğrulanmış
    prisma.user.count({
      where: { verification: { not: "LEVEL_0" }, lastActiveAt: { gte: monthAgo }, isActive: true, isBanned: false },
    }),
    prisma.user.count({ where: { lastActiveAt: { gte: dayAgo }, isActive: true } }),
    prisma.user.count({ where: { lastActiveAt: { gte: monthAgo }, isActive: true } }),
    // §7.3 — Ödeyen Kurucu Üyeler
    prisma.gym.count({ where: { status: "ACTIVE", plan: { in: ["FOUNDER", "STANDARD"] }, planPrice: { gt: 0 } } }),
    prisma.waitlistEntry.count(),
    // LOI = niyet mektubu bırakmış salon adayları (davet edilmiş bekleme kaydı)
    prisma.waitlistEntry.count({ where: { role: "GYM_OWNER", status: { in: ["INVITED", "CONVERTED"] } } }),
    // §7.3 / §10.3 H3 — antrenör kefaletleri ölçekleme mekanizmasının kanıtı
    prisma.vouch.count({ where: { status: "ACCEPTED" } }),
    prisma.user.aggregate({ where: { isActive: true }, _avg: { profileScore: true } }),
    prisma.gym.aggregate({ where: { status: "ACTIVE" }, _sum: { planPrice: true } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.report.count({ where: { createdAt: { gte: monthAgo } } }),
  ]);

  return {
    mavu,
    dau,
    mau,
    payingGyms,
    waitlistCount,
    loiCount,
    vouchCount,
    profileCompletion: Math.round((profileAgg._avg.profileScore ?? 0) * 10) / 10,
    mrr: mrrAgg._sum.planPrice ?? 0,
    newUsers,
    reportsCount,
  };
}

/** Günlük anlık görüntü — aynı gün ikinci kez çalışırsa üzerine yazar */
export async function snapshotKpi(): Promise<KpiValues & { date: Date }> {
  const values = await computeKpi();
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);

  await prisma.kpiSnapshot.upsert({
    where: { date },
    update: values,
    create: { date, ...values },
  });

  return { ...values, date };
}

// ---------------------------------------------------------------------------
// §7.4 — Dur/Devam kapıları
// ---------------------------------------------------------------------------

export type GateLight = "GREEN" | "YELLOW" | "RED" | "PENDING";

export interface GateResult {
  month: number;
  title: string;
  light: GateLight;
  detail: string;
  /** §7.5 — her renk için ne yapılır */
  action: string;
}

const ACTIONS: Record<Exclude<GateLight, "PENDING">, string> = {
  GREEN: "Planlanan gibi devam et, hızlandır.",
  YELLOW: "Neden plan altında? 2-3 ayarlama yap, tekrar ölç.",
  RED: "Mini-Pivot değerlendirmesi. 8 hafta sonra hâlâ kırmızıysa Full-Pivot veya vazgeçme.",
};

/** Programın kaçıncı ayındayız (1 tabanlı) */
export function programMonth(startedAt: Date): number {
  const months =
    (new Date().getFullYear() - startedAt.getFullYear()) * 12 +
    (new Date().getMonth() - startedAt.getMonth());
  return Math.max(1, months + 1);
}

/**
 * §7.4 tablosunu canlı verilerle değerlendirir.
 * Henüz ayına gelinmemiş kapılar PENDING kalır — erken alarm üretmez.
 */
export function evaluateGates(
  values: Pick<KpiValues, "mavu" | "payingGyms" | "waitlistCount" | "loiCount">,
  currentMonth: number,
): GateResult[] {
  const gates: { month: number; title: string; evaluate: () => { light: Exclude<GateLight, "PENDING">; detail: string } }[] = [
    {
      month: 4,
      title: "Bekleme listesi ilgisi",
      evaluate: () => {
        const n = values.waitlistCount;
        const light = n >= 20 ? "GREEN" : n >= 10 ? "YELLOW" : "RED";
        return { light, detail: `${n} bekleme listesi kaydı (hedef ≥20)` };
      },
    },
    {
      month: 5,
      title: "Niyet mektupları (LOI)",
      evaluate: () => {
        const n = values.loiCount;
        const light = n >= 5 ? "GREEN" : n >= 2 ? "YELLOW" : "RED";
        return { light, detail: `${n} LOI (hedef ≥5)` };
      },
    },
    {
      month: 6,
      title: "İlk ödeyen Kurucu Üyeler",
      evaluate: () => {
        const g = values.payingGyms;
        const m = values.mavu;
        const light = g >= 5 && m >= 50 ? "GREEN" : g >= 3 ? "YELLOW" : "RED";
        return { light, detail: `${g} ödeyen salon · ${m} MAVU (hedef ≥5 ve ≥50)` };
      },
    },
    {
      month: 9,
      title: "Beta 3 açık",
      evaluate: () => {
        const g = values.payingGyms;
        const m = values.mavu;
        const light = g >= 10 && m >= 200 ? "GREEN" : g >= 5 ? "YELLOW" : "RED";
        return { light, detail: `${g} ödeyen salon · ${m} MAVU (hedef ≥10 ve ≥200)` };
      },
    },
    {
      month: 12,
      title: "Tam lansman",
      evaluate: () => {
        const g = values.payingGyms;
        const m = values.mavu;
        const light = g >= 20 && m >= 500 ? "GREEN" : g >= 10 ? "YELLOW" : "RED";
        return { light, detail: `${g} salon · ${m} MAVU (hedef ≥20 ve ≥500)` };
      },
    },
  ];

  return gates.map((g) => {
    if (currentMonth < g.month) {
      return {
        month: g.month,
        title: g.title,
        light: "PENDING" as const,
        detail: `Ay ${g.month}'de ölçülecek`,
        action: "Henüz sırası gelmedi.",
      };
    }
    const { light, detail } = g.evaluate();
    return { month: g.month, title: g.title, light, detail, action: ACTIONS[light] };
  });
}

/** §11.7 — moderatör kurulumu ölçekleme tetikleyicileri */
export function moderationTrigger(mavu: number, monthlyReports: number): { level: string; note: string } | null {
  if (mavu >= 5000 || monthlyReports >= 300) {
    return { level: "Yarı zamanlı moderatör", note: "1.500–2.500 €/ay — 5.000 MAVU veya 300+ rapor/ay eşiği aşıldı." };
  }
  if (mavu >= 2500 || monthlyReports >= 150) {
    return { level: "Werkstudent zorunlu", note: "2.500 MAVU veya 150+ rapor/ay eşiği aşıldı." };
  }
  if (mavu >= 1000 || monthlyReports >= 50) {
    return { level: "Werkstudent araması başlat", note: "500–1.000 €/ay — 1.000 MAVU veya 50+ rapor/ay eşiği aşıldı." };
  }
  return null;
}
