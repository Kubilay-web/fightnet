import type { Metadata } from "next";
import Link from "next/link";
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
import { KPI_GATES, REPORT_REASON_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();

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
      <Section title="Genel Bakış" subtitle="Platform sağlığı ve KPI takibi" />

      {queueTotal > 0 && (
        <Alert tone="amber" title={`${queueTotal} işlem bekliyor`}>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            {d.pendingVerifications > 0 && (
              <Link href="/admin/dogrulama" className="font-bold underline">
                {d.pendingVerifications} doğrulama talebi
              </Link>
            )}
            {d.openReports > 0 && (
              <Link href="/admin/raporlar" className="font-bold underline">
                {d.openReports} açık rapor
              </Link>
            )}
            {d.pendingPassport > 0 && (
              <Link href="/admin/passport" className="font-bold underline">
                {d.pendingPassport} passport belgesi
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
              North Star Metric
            </p>
            <p className="mt-1 font-display text-5xl font-black tabular-nums">{compact(d.mavu)}</p>
            <p className="text-sm text-muted">MAVU — Aylık Aktif Doğrulanmış Kullanıcı</p>
          </div>
          <div className="flex flex-wrap gap-6 border-l border-[var(--border)] pl-6">
            <MiniKpi label="DAU" value={compact(d.dau)} />
            <MiniKpi label="DAU/Toplam" value={`%${dauMau}`} tone={dauMau >= 20 ? "green" : "amber"} />
            <MiniKpi label="MRR" value={formatMoney(d.mrr)} />
            <MiniKpi label="Ödeyen salon" value={String(d.payingGyms)} />
          </div>
        </CardBody>
      </Card>

      {/* Ana metrikler */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Toplam kullanıcı" value={compact(d.totalUsers)} hint={`+${d.newUsers30} son 30 gün`} />
        <Stat label="Doğrulanmış" value={compact(d.verifiedUsers)} tone="green" />
        <Stat label="Aktif salon" value={d.activeGyms} hint={`${d.payingGyms} ödeyen`} />
        <Stat label="Bekleme listesi" value={compact(d.waitlist)} hint={`+${d.waitlistNew} son 30 gün`} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Canlı etkinlik" value={d.liveEvents} tone={d.liveEvents ? "red" : "neutral"} />
        <Stat label="Yaklaşan etkinlik" value={d.upcomingEvents} />
        <Stat label="Antrenman kaydı" value={compact(d.totalTrainings)} />
        <Stat label="Açık rapor" value={d.openReports} tone={d.openReports > 5 ? "red" : "neutral"} />
      </div>

      {/* §7.4 — Dur/Devam kapıları */}
      <Section title="Dur/Devam Kapıları" subtitle="Beta programı kilometre taşları">
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase tracking-wider text-muted">
                <th className="py-2 pr-3">Ay</th>
                <th className="py-2 pr-3">🟢 Yeşil</th>
                <th className="py-2 pr-3">🟡 Sarı</th>
                <th className="py-2">🔴 Kırmızı</th>
              </tr>
            </thead>
            <tbody>
              {KPI_GATES.map((g) => (
                <tr key={g.month} className="border-b border-[var(--border)]">
                  <td className="py-2.5 pr-3 font-black">Ay {g.month}</td>
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
          title="Öncelikli Raporlar"
          action={
            <Link href="/admin/raporlar" className="text-sm font-bold text-blood-500 hover:underline">
              Tümü →
            </Link>
          }
        >
          {d.recentReports.length === 0 ? (
            <EmptyState icon={<Flag className="size-8" />} title="Açık rapor yok" description="Moderasyon kuyruğu temiz." />
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
                        {r.targetType} · {r.reporter.name} · {timeAgo(r.createdAt)}
                      </p>
                    </div>
                    {r.priority >= 2 && <Badge tone="red">Acil</Badge>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Section>

        {/* Yeni kullanıcılar */}
        <Section
          title="Yeni Kayıtlar"
          action={
            <Link href="/admin/kullanicilar" className="text-sm font-bold text-blood-500 hover:underline">
              Tümü →
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
                      @{u.username} · {timeAgo(u.createdAt)}
                    </p>
                  </div>
                  <Badge>{u.role}</Badge>
                </li>
              ))}
              {d.recentUsers.length === 0 && (
                <li className="p-6 text-center text-sm text-muted">Henüz kullanıcı yok</li>
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
