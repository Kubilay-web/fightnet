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

/** §7.4 tablosundaki kapı satırları — metin `lib/i18n/pages/admin-kpi.ts` içinde. */
export type GateKey = "waitlist" | "loi" | "firstPaying" | "beta3" | "launch";

/**
 * Kapı sonucu yalnızca ÖLÇÜM taşır; başlık/açıklama/aksiyon metni dile göre
 * sunum katmanında üretilir. Ölçülen değerler `metrics` içinde ham sayı olarak
 * durur, böylece eşikler tek kaynakta (burada) kalır.
 */
export interface GateResult {
  month: number;
  key: GateKey;
  light: GateLight;
  /** Kapının değerlendirdiği ham sayılar — çeviri metnine gömülür */
  metrics: { gyms?: number; mavu?: number; count?: number };
}

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
  const gates: {
    month: number;
    key: GateKey;
    evaluate: () => { light: Exclude<GateLight, "PENDING">; metrics: GateResult["metrics"] };
  }[] = [
    {
      month: 4,
      key: "waitlist",
      evaluate: () => {
        const n = values.waitlistCount;
        const light = n >= 20 ? "GREEN" : n >= 10 ? "YELLOW" : "RED";
        return { light, metrics: { count: n } };
      },
    },
    {
      month: 5,
      key: "loi",
      evaluate: () => {
        const n = values.loiCount;
        const light = n >= 5 ? "GREEN" : n >= 2 ? "YELLOW" : "RED";
        return { light, metrics: { count: n } };
      },
    },
    {
      month: 6,
      key: "firstPaying",
      evaluate: () => {
        const g = values.payingGyms;
        const m = values.mavu;
        const light = g >= 5 && m >= 50 ? "GREEN" : g >= 3 ? "YELLOW" : "RED";
        return { light, metrics: { gyms: g, mavu: m } };
      },
    },
    {
      month: 9,
      key: "beta3",
      evaluate: () => {
        const g = values.payingGyms;
        const m = values.mavu;
        const light = g >= 10 && m >= 200 ? "GREEN" : g >= 5 ? "YELLOW" : "RED";
        return { light, metrics: { gyms: g, mavu: m } };
      },
    },
    {
      month: 12,
      key: "launch",
      evaluate: () => {
        const g = values.payingGyms;
        const m = values.mavu;
        const light = g >= 20 && m >= 500 ? "GREEN" : g >= 10 ? "YELLOW" : "RED";
        return { light, metrics: { gyms: g, mavu: m } };
      },
    },
  ];

  return gates.map((g) => {
    if (currentMonth < g.month) {
      return { month: g.month, key: g.key, light: "PENDING" as const, metrics: {} };
    }
    const { light, metrics } = g.evaluate();
    return { month: g.month, key: g.key, light, metrics };
  });
}

/** §11.7 — moderatör kurulumu ölçekleme kademeleri; metin sunum katmanında. */
export type ModerationTier = "PART_TIME" | "WERKSTUDENT_REQUIRED" | "WERKSTUDENT_SEARCH";

/** §11.7 — moderatör kurulumu ölçekleme tetikleyicileri */
export function moderationTrigger(mavu: number, monthlyReports: number): ModerationTier | null {
  if (mavu >= 5000 || monthlyReports >= 300) return "PART_TIME";
  if (mavu >= 2500 || monthlyReports >= 150) return "WERKSTUDENT_REQUIRED";
  if (mavu >= 1000 || monthlyReports >= 50) return "WERKSTUDENT_SEARCH";
  return null;
}
