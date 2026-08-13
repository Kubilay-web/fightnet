import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import {
  Users, ShieldCheck, Building2, CalendarDays, Flag, TrendingUp,
  Euro, ListChecks, AlertTriangle, ArrowRight, Dumbbell,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { Badge, Card, CardBody, Section, Stat, Alert, EmptyState } from "@/components/ui";
import { Avatar } from "@/components/ui/avatar";
import { compact, formatMoney, timeAgo, cn } from "@/lib/utils";
// TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir
import { KPI_GATES, REPORT_REASON_LABEL } from "@/lib/constants";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { adminCoreCopy } from "@/lib/i18n/pages/admin-core";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminCoreCopy[await getLocale()].home;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  const locale = await getLocale();
  const t = adminCoreCopy[locale];
  const c = t.home;

  const d = await safe(
    async () => {
      const now = new Date();
      const monthAgo = new Date(Date.now() - 30 * 864e5);
      const dayAgo = new Date(Date.now() - 864e5);

      const [
        totalUsers, verifiedUsers, mavu, dau, newUsers30,
        activeGyms, payingGyms, liveEvents, upcomingEvents,
        openReports, pendingVerifications, pendingPassport, waitlist, waitlistNew,
        totalTrainings, mrr, recentReports, recentUsers,
      ] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { verification: { not: "LEVEL_0" } } }),
        // §7.1 — MAVU: Aylık Aktif Doğrulanmış Kullanıcı
        prisma.user.count({
          where: { verification: { not: "LEVEL_0" }, lastActiveAt: { gte: monthAgo }, isActive: true },
        }),
        prisma.user.count({ where: { lastActiveAt: { gte: dayAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
        prisma.gym.count({ where: { status: "ACTIVE" } }),
        prisma.gym.count({ where: { status: "ACTIVE", plan: { in: ["FOUNDER", "STANDARD"] } } }),
        prisma.event.count({ where: { status: "LIVE" } }),
        prisma.event.count({ where: { status: "PUBLISHED", startsAt: { gte: now } } }),
        prisma.report.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
        prisma.verificationRequest.count({ where: { status: "PENDING" } }),
        prisma.passportDocument.count({ where: { status: "PENDING" } }),
        prisma.waitlistEntry.count(),
        prisma.waitlistEntry.count({ where: { createdAt: { gte: monthAgo } } }),
        prisma.trainingLog.count(),
        prisma.gym.aggregate({ where: { status: "ACTIVE" }, _sum: { planPrice: true } }),
        prisma.report.findMany({
          where: { status: { in: ["OPEN", "IN_REVIEW"] } },
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
          take: 5,
          select: {
            id: true, reason: true, targetType: true, createdAt: true, priority: true,
            reporter: { select: { name: true } },
          },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, name: true, username: true, slug: true, avatarUrl: true, role: true, createdAt: true },
        }),
      ]);

      return {
        totalUsers, verifiedUsers, mavu, dau, newUsers30,
        activeGyms, payingGyms, liveEvents, upcomingEvents,
        openReports, pendingVerifications, pendingPassport, waitlist, waitlistNew,
        totalTrainings, mrr: mrr._sum.planPrice ?? 0, recentReports, recentUsers,
      };
    },
    {
      totalUsers: 0, verifiedUsers: 0, mavu: 0, dau: 0, newUsers30: 0,
      activeGyms: 0, payingGyms: 0, liveEvents: 0, upcomingEvents: 0,
      openReports: 0, pendingVerifications: 0, pendingPassport: 0, waitlist: 0, waitlistNew: 0,
      totalTrainings: 0, mrr: 0, recentReports: [], recentUsers: [],
    },
  );

  const dauMau = d.totalUsers > 0 ? Math.round((d.dau / d.totalUsers) * 100) : 0;
  const queueTotal = d.pendingVerifications + d.pendingPassport + d.openReports;

  return (
    <div className="flex flex-col gap-8">
      <Section title={c.title} subtitle={c.subtitle} />

      {queueTotal > 0 && (
        <Alert tone="amber" title={c.queueTitle(queueTotal)}>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            {d.pendingVerifications > 0 && (
              <Link href="/admin/dogrulama" className="font-bold underline">
                {c.pendingVerifications(d.pendingVerifications)}
              </Link>
            )}
            {d.openReports > 0 && (
              <Link href="/admin/raporlar" className="font-bold underline">
                {c.openReportsLink(d.openReports)}
              </Link>
            )}
            {d.pendingPassport > 0 && (
              <Link href="/admin/passport" className="font-bold underline">
                {c.pendingPassport(d.pendingPassport)}
              </Link>
            )}
          </span>
        </Alert>
      )}

      {/* North Star Metric */}
      <Card className="border-blood-500/40">
        <CardBody className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-blood-500">
              {c.northStar}
            </p>
            <p className="mt-1 font-display text-5xl font-black tabular-nums">{compact(d.mavu)}</p>
            <p className="text-sm text-muted">{c.mavuLabel}</p>
          </div>
          <div className="flex flex-wrap gap-6 border-l border-[var(--border)] pl-6">
            <MiniKpi label={c.dau} value={compact(d.dau)} />
            <MiniKpi label={c.dauTotal} value={t.percent(dauMau)} tone={dauMau >= 20 ? "green" : "amber"} />
            <MiniKpi label={c.mrr} value={formatMoney(d.mrr, "EUR", LOCALE_TAG[locale])} />
            <MiniKpi label={c.payingGyms} value={String(d.payingGyms)} />
          </div>
        </CardBody>
      </Card>

      {/* Ana metrikler */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={c.totalUsers} value={compact(d.totalUsers)} hint={c.last30(d.newUsers30)} />
        <Stat label={c.verified} value={compact(d.verifiedUsers)} tone="green" />
        <Stat label={c.activeGyms} value={d.activeGyms} hint={c.payingHint(d.payingGyms)} />
        <Stat label={c.waitlist} value={compact(d.waitlist)} hint={c.last30(d.waitlistNew)} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={c.liveEvents} value={d.liveEvents} tone={d.liveEvents ? "red" : "neutral"} />
        <Stat label={c.upcomingEvents} value={d.upcomingEvents} />
        <Stat label={c.trainingLogs} value={compact(d.totalTrainings)} />
        <Stat label={c.openReports} value={d.openReports} tone={d.openReports > 5 ? "red" : "neutral"} />
      </div>

      {/* §7.4 — Dur/Devam kapıları */}
      <Section title={c.gates.title} subtitle={c.gates.subtitle}>
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase tracking-wider text-muted">
                <th className="py-2 pr-3">{c.gates.month}</th>
                <th className="py-2 pr-3">{c.gates.green}</th>
                <th className="py-2 pr-3">{c.gates.yellow}</th>
                <th className="py-2">{c.gates.red}</th>
              </tr>
            </thead>
            <tbody>
              {/* TODO(i18n): KPI_GATES eşik metinleri hâlâ Türkçe — lib/constants.ts merkezî kaynak */}
              {KPI_GATES.map((g) => (
                <tr key={g.month} className="border-b border-[var(--border)]">
                  <td className="py-2.5 pr-3 font-black">{c.gates.monthCell(g.month)}</td>
                  <td className="py-2.5 pr-3 text-emerald-500">{g.green}</td>
                  <td className="py-2.5 pr-3 text-amber-500">{g.yellow}</td>
                  <td className="py-2.5 text-blood-500">{g.red}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Öncelikli raporlar */}
        <Section
          title={c.priorityReports}
          action={
            <Link href="/admin/raporlar" className="text-sm font-bold text-blood-500 hover:underline">
              {c.seeAll}
            </Link>
          }
        >
          {d.recentReports.length === 0 ? (
            <EmptyState icon={<Flag className="size-8" />} title={c.noReports.title} description={c.noReports.description} />
          ) : (
            <Card>
              <ul className="divide-y divide-[var(--border)]">
                {d.recentReports.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 p-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        r.priority >= 2 ? "bg-blood-500/10 text-blood-500" : "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      <AlertTriangle className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{REPORT_REASON_LABEL[r.reason]}</p>
                      <p className="text-xs text-muted">
                        {r.targetType} · {r.reporter.name} · {timeAgo(r.createdAt, locale)}
                      </p>
                    </div>
                    {r.priority >= 2 && <Badge tone="red">{c.urgent}</Badge>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Section>

        {/* Yeni kullanıcılar */}
        <Section
          title={c.newSignups}
          action={
            <Link href="/admin/kullanicilar" className="text-sm font-bold text-blood-500 hover:underline">
              {c.seeAll}
            </Link>
          }
        >
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {d.recentUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-3 p-3">
                  <Avatar src={u.avatarUrl} name={u.name} size="sm" href={`/dovuscular/${u.slug}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{u.name}</p>
                    <p className="text-xs text-muted">
                      @{u.username} · {timeAgo(u.createdAt, locale)}
                    </p>
                  </div>
                  <Badge>{u.role}</Badge>
                </li>
              ))}
              {d.recentUsers.length === 0 && (
                <li className="p-6 text-center text-sm text-muted">{c.noUsers}</li>
              )}
            </ul>
          </Card>
        </Section>
      </div>
    </div>
  );
}

function MiniKpi({ label, value, tone }: { label: string; value: string; tone?: "green" | "amber" }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p
        className={cn(
          "text-xl font-black tabular-nums",
          tone === "green" && "text-emerald-500",
          tone === "amber" && "text-amber-500",
        )}
      >
        {value}
      </p>
    </div>
  );
}
