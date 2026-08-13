import type { Metadata } from "next";
import { TrendingUp, TrendingDown, Minus, ShieldAlert } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { computeKpi, evaluateGates, moderationTrigger, programMonth, type GateLight } from "@/lib/kpi";
import { Badge, Card, CardBody, Section, Stat, Alert, EmptyState } from "@/components/ui";
import { SnapshotButton } from "@/components/kpi-actions";
import { compact, formatDate, formatMoney, cn } from "@/lib/utils";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { adminCoreCopy } from "@/lib/i18n/pages/admin-core";
import { adminKpiGatesCopy, gateDetailText } from "@/lib/i18n/pages/admin-kpi";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminCoreCopy[await getLocale()].kpi;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

/** Işık rengi ve tonu dilden bağımsız; etiket copy modülünden gelir. */
const LIGHT_STYLE: Record<GateLight, { tone: "green" | "amber" | "red" | "neutral"; dot: string }> = {
  GREEN: { tone: "green", dot: "bg-emerald-500" },
  YELLOW: { tone: "amber", dot: "bg-amber-500" },
  RED: { tone: "red", dot: "bg-blood-500" },
  PENDING: { tone: "neutral", dot: "bg-ink-400" },
};

export default async function KpiPage() {
  await requireAdmin();
  const locale = await getLocale();
  const all = adminCoreCopy[locale];
  const c = all.kpi;
  const gateCopy = adminKpiGatesCopy[locale];
  const tag = LOCALE_TAG[locale];

  const [values, history, programSetting] = await Promise.all([
    safe(computeKpi, {
      mavu: 0, dau: 0, mau: 0, payingGyms: 0, waitlistCount: 0, loiCount: 0,
      vouchCount: 0, profileCompletion: 0, mrr: 0, newUsers: 0, reportsCount: 0,
    }),
    safe(
      () => prisma.kpiSnapshot.findMany({ orderBy: { date: "desc" }, take: 30 }),
      [] as Awaited<ReturnType<typeof prisma.kpiSnapshot.findMany>>,
    ),
    safe(() => prisma.siteSetting.findUnique({ where: { key: "program" } }), null),
  ]);

  const startedAt = (programSetting?.value as { startedAt?: string } | null)?.startedAt;
  const month = startedAt ? programMonth(new Date(startedAt)) : 1;
  const gates = evaluateGates(values, month);
  const trigger = moderationTrigger(values.mavu, values.reportsCount);

  // 30 gün öncesine göre değişim
  const oldest = history.at(-1);
  const delta = oldest ? values.mavu - oldest.mavu : 0;
  const dauMau = values.mau > 0 ? Math.round((values.dau / values.mau) * 100) : 0;

  const maxMavu = Math.max(1, ...history.map((h) => h.mavu), values.mavu);

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={c.title}
        subtitle={`${c.programMonth(month)} · ${startedAt ? c.startedAt(formatDate(startedAt, tag)) : c.noStartDate}`}
        action={<SnapshotButton />}
      />

      {/* §7.1 North Star */}
      <Card className="border-blood-500/40">
        <CardBody className="flex flex-wrap items-center gap-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-blood-500">{c.northStar}</p>
            <p className="mt-1 font-display text-5xl font-black tabular-nums">{compact(values.mavu)}</p>
            <p className="text-sm text-muted">{c.mavuLabel}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
            {delta > 0 ? (
              <TrendingUp className="size-5 text-emerald-500" />
            ) : delta < 0 ? (
              <TrendingDown className="size-5 text-blood-500" />
            ) : (
              <Minus className="size-5 text-muted" />
            )}
            <div>
              <p className="text-sm font-black tabular-nums">
                {delta > 0 ? "+" : ""}
                {delta}
              </p>
              <p className="text-[11px] text-muted">{c.measurements(history.length || 0)}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* §7.3 — İkincil KPI'lar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={c.payingGyms} value={values.payingGyms} hint={c.payingGymsHint} tone={values.payingGyms ? "green" : "neutral"} />
        <Stat label={c.waitlist} value={compact(values.waitlistCount)} hint={c.waitlistHint} />
        <Stat label={c.loi} value={values.loiCount} hint={c.loiHint} />
        <Stat label={c.profileCompletion} value={all.percent(values.profileCompletion)} hint={c.profileCompletionHint} tone={values.profileCompletion >= 60 ? "green" : "amber"} />
        <Stat label={c.vouches} value={values.vouchCount} hint={c.vouchesHint} />
        <Stat label={c.dauMau} value={all.percent(dauMau)} hint={c.dauMauHint} tone={dauMau >= 20 ? "green" : "amber"} />
        <Stat label={c.mrr} value={formatMoney(values.mrr, "EUR", tag)} hint={c.mrrHint} />
        <Stat label={c.reports30} value={values.reportsCount} tone={values.reportsCount > 50 ? "amber" : "neutral"} />
      </div>

      {/* §11.7 — moderatör ölçekleme tetikleyicisi */}
      {trigger && (
        <Alert tone="amber" title={c.moderationThreshold(gateCopy.moderation[trigger].level)}>
          <span className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            {gateCopy.moderation[trigger].note}
          </span>
        </Alert>
      )}

      {/* §7.4 — Dur/Devam kapıları, canlı değerlendirme */}
      <Section title={c.gates.title} subtitle={c.gates.subtitle}>
        <div className="flex flex-col gap-2">
          {gates.map((g) => {
            const s = LIGHT_STYLE[g.light];
            return (
              <Card key={g.month}>
                <CardBody className="flex flex-wrap items-center gap-3">
                  <span className={cn("size-3 shrink-0 rounded-full", s.dot)} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {c.gates.monthPrefix(g.month)} · {gateCopy.gateTitles[g.key]}
                    </p>
                    <p className="text-sm text-muted">{gateDetailText(gateCopy, g)}</p>
                    {g.light !== "PENDING" && (
                      <p className="mt-0.5 text-xs text-muted">{gateCopy.actions[g.light]}</p>
                    )}
                  </div>
                  <Badge tone={s.tone}>{c.lights[g.light]}</Badge>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Trend */}
      <Section title={c.trend.title} subtitle={c.trend.subtitle}>
        {history.length === 0 ? (
          <EmptyState
            title={c.empty.title}
            description={c.empty.description}
          />
        ) : (
          <Card>
            <CardBody className="flex flex-col gap-4">
              <div className="flex h-32 items-end gap-1" role="img" aria-label={c.chartLabel}>
                {[...history].reverse().map((h) => (
                  <span
                    key={h.id}
                    title={c.snapshotTitle(formatDate(h.date, tag), h.mavu)}
                    className="flex-1 rounded-t bg-gradient-to-t from-blood-700 to-blood-500"
                    style={{ height: `${Math.max(3, (h.mavu / maxMavu) * 100)}%` }}
                  />
                ))}
              </div>

              <div className="no-scrollbar overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase tracking-wider text-muted">
                      <th className="py-2 pr-3">{c.table.date}</th>
                      <th className="py-2 pr-3">{c.table.mavu}</th>
                      <th className="py-2 pr-3">{c.table.dau}</th>
                      <th className="py-2 pr-3">{c.table.paying}</th>
                      <th className="py-2 pr-3">{c.table.waitlist}</th>
                      <th className="py-2">{c.table.mrr}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-3">{formatDate(h.date, tag)}</td>
                        <td className="py-2 pr-3 font-bold tabular-nums">{h.mavu}</td>
                        <td className="py-2 pr-3 tabular-nums">{h.dau}</td>
                        <td className="py-2 pr-3 tabular-nums">{h.payingGyms}</td>
                        <td className="py-2 pr-3 tabular-nums">{h.waitlistCount}</td>
                        <td className="py-2 tabular-nums">{formatMoney(h.mrr, "EUR", tag)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </Section>
    </div>
  );
}
