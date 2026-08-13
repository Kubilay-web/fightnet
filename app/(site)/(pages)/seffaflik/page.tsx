import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { Card, CardBody, Alert } from "@/components/ui";
import { REPORT_REASON_LABEL } from "@/lib/constants";
import { moderationStats } from "@/lib/moderation";
import { moderationProviders, moderationConfigured } from "@/lib/services/moderation";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { transparencyCopy } from "@/lib/i18n/pages/transparency";

export async function generateMetadata(): Promise<Metadata> {
  const copy = transparencyCopy[await getLocale()];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: await metadataAlternates("/seffaflik"),
  };
}

// Rapor gün içinde birkaç kez tazelenir; canlı sayaç olması gerekmiyor
export const revalidate = 3600;

/**
 * §11.5 Kapı 5 — DSA Light uyum: "Yıllık şeffaflık raporu".
 *
 * Rakamlar elle güncellenmez; doğrudan moderasyon kayıtlarından üretilir.
 * Sayılar toplamdır — hiçbir kullanıcı, içerik veya bildiren kişi
 * tanımlanabilir değildir.
 */
async function loadReport() {
  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

  const [total, byReason, byStatus, resolvedSample, appeals, appealsByStatus, autoFilter] = await Promise.all([
    prisma.report.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.report.groupBy({
      by: ["reason"],
      where: { createdAt: { gte: yearStart } },
      _count: { _all: true },
    }),
    prisma.report.groupBy({
      by: ["status"],
      where: { createdAt: { gte: yearStart } },
      _count: { _all: true },
    }),
    // Ortalama tepki süresi için çözülmüş bildirimlerin zaman damgaları
    prisma.report.findMany({
      where: { createdAt: { gte: yearStart }, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      take: 500,
      orderBy: { resolvedAt: "desc" },
    }),
    prisma.appeal.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.appeal.groupBy({
      by: ["status"],
      where: { createdAt: { gte: yearStart } },
      _count: { _all: true },
    }),
    // §11.3 — otomatik ön filtrenin bu yılki kararları
    moderationStats(366),
  ]);

  const durations = resolvedSample
    .map((r) => (r.resolvedAt!.getTime() - r.createdAt.getTime()) / 36e5)
    .filter((h) => h >= 0);
  const avgHours = durations.length
    ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
    : null;
  const within24h = durations.length
    ? Math.round((durations.filter((h) => h <= 24).length / durations.length) * 100)
    : null;

  return {
    year: now.getUTCFullYear(),
    total,
    byReason: byReason.map((r) => ({ reason: r.reason, count: r._count._all })).sort((a, b) => b.count - a.count),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])) as Record<string, number>,
    avgHours,
    within24h,
    appeals,
    appealsByStatus: Object.fromEntries(appealsByStatus.map((s) => [s.status, s._count._all])) as Record<string, number>,
    autoFilter,
  };
}

const EMPTY = {
  year: new Date().getUTCFullYear(),
  total: 0,
  byReason: [] as { reason: string; count: number }[],
  byStatus: {} as Record<string, number>,
  avgHours: null as number | null,
  within24h: null as number | null,
  appeals: 0,
  appealsByStatus: {} as Record<string, number>,
  autoFilter: { total: 0, blocked: 0, review: 0, reviewed: 0, approved: 0 },
};

export default async function TransparencyPage() {
  const [d, locale] = await Promise.all([safe(loadReport, EMPTY), getLocale()]);
  const t = transparencyCopy[locale];
  const year = String(d.year);

  return (
    <>
      <h1 className="font-display text-3xl font-black tracking-tight">
        {t.title.replace("{year}", year)}
      </h1>
      <p>{t.intro}</p>

      <Alert tone="neutral" title={t.betaTitle}>
        {t.betaBody}
      </Alert>

      <h2>{t.reportsHeading}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label={t.reportsTotal} value={String(d.total)} />
        <MetricCard label={t.reportsOpen} value={String((d.byStatus.OPEN ?? 0) + (d.byStatus.IN_REVIEW ?? 0))} />
        <MetricCard label={t.reportsResolved} value={String(d.byStatus.RESOLVED ?? 0)} />
        <MetricCard label={t.reportsDismissed} value={String(d.byStatus.DISMISSED ?? 0)} />
      </div>

      <h2>{t.responseHeading}</h2>
      <p>{t.responseBody}</p>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label={t.avgResponse}
          value={d.avgHours === null ? "—" : `${d.avgHours} ${t.hoursSuffix}`}
        />
        <MetricCard
          label={t.within24h}
          value={d.within24h === null ? "—" : `%${d.within24h}`}
        />
      </div>

      <h2>{t.reasonsHeading}</h2>
      {d.byReason.length === 0 ? (
        <p>{t.reasonsEmpty}</p>
      ) : (
        <Card>
          <ul className="divide-y divide-[var(--border)]">
            {d.byReason.map((r) => (
              <li key={r.reason} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-sm">{REPORT_REASON_LABEL[r.reason] ?? r.reason}</span>
                <span className="text-sm font-black tabular-nums">{r.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <h2>{t.appealsHeading}</h2>
      <p>{t.appealsBody}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label={t.appealsTotal} value={String(d.appeals)} />
        <MetricCard label={t.appealsOpen} value={String(d.appealsByStatus.OPEN ?? 0)} />
        <MetricCard label={t.appealsUpheld} value={String(d.appealsByStatus.UPHELD ?? 0)} />
        <MetricCard label={t.appealsOverturned} value={String(d.appealsByStatus.OVERTURNED ?? 0)} />
      </div>

      <h2>{t.howHeading}</h2>
      <ul>
        <li>{t.howFlag}</li>
        <li>
          {t.howContactPre}
          <Link href="/iletisim" className="font-semibold text-blood-500 hover:underline">
            {t.howContactLink}
          </Link>
          {t.howContactPost}
        </li>
        <li>
          {t.howAppealPre}
          <Link href="/panel/itirazlar" className="font-semibold text-blood-500 hover:underline">
            {t.howAppealLink}
          </Link>
          {t.howAppealPost}
        </li>
      </ul>

      <h2>{t.autoHeading}</h2>
      <p>{t.autoBody1}</p>
      <p>
        {t.autoBody2Pre}
        <Link href="/panel/itirazlar" className="font-semibold text-blood-500 hover:underline">
          {t.autoBody2Link}
        </Link>
        {t.autoBody2Post}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label={t.autoScanned} value={String(d.autoFilter.total)} />
        <MetricCard label={t.autoApproved} value={String(d.autoFilter.approved)} />
        <MetricCard label={t.autoReview} value={String(d.autoFilter.review)} />
        <MetricCard label={t.autoBlocked} value={String(d.autoFilter.blocked)} />
      </div>
      <p className="text-sm text-muted">
        {t.autoTools
          .replace("{text}", moderationProviders.text)
          .replace("{image}", moderationProviders.image)}
        {!moderationConfigured && t.autoToolsFallback}
      </p>

      <h2>{t.docsHeading}</h2>
      <ul>
        <li>
          <Link href="/topluluk-kurallari" className="font-semibold text-blood-500 hover:underline">
            {t.docsRules}
          </Link>{" "}
          — {t.docsRulesNote}
        </li>
        <li>
          <Link href="/gizlilik" className="font-semibold text-blood-500 hover:underline">
            {t.docsPrivacy}
          </Link>{" "}
          — {t.docsPrivacyNote}
        </li>
        <li>
          <Link href="/kunye" className="font-semibold text-blood-500 hover:underline">
            {t.docsImprint}
          </Link>{" "}
          — {t.docsImprintNote}
        </li>
      </ul>

      <p className="text-xs">{t.footerNote.replace("{year}", year)}</p>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody className="p-3 sm:p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 font-display text-2xl font-black tabular-nums">{value}</p>
      </CardBody>
    </Card>
  );
}
