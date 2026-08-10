import type { Metadata } from "next";
import { TrendingUp, TrendingDown, Minus, ShieldAlert } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { computeKpi, evaluateGates, moderationTrigger, programMonth, type GateLight } from "@/lib/kpi";
import { Badge, Card, CardBody, Section, Stat, Alert, EmptyState } from "@/components/ui";
import { SnapshotButton } from "@/components/kpi-actions";
import { compact, formatDate, formatMoney, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "KPI Takibi", robots: { index: false } };
export const dynamic = "force-dynamic";

const LIGHT_STYLE: Record<GateLight, { tone: "green" | "amber" | "red" | "neutral"; label: string; dot: string }> = {
  GREEN: { tone: "green", label: "Yeşil", dot: "bg-emerald-500" },
  YELLOW: { tone: "amber", label: "Sarı", dot: "bg-amber-500" },
  RED: { tone: "red", label: "Kırmızı", dot: "bg-blood-500" },
  PENDING: { tone: "neutral", label: "Sırada", dot: "bg-ink-400" },
};

export default async function KpiPage() {
  await requireAdmin();

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
        title="KPI Takibi"
        subtitle={`Program ayı ${month} · ${startedAt ? `başlangıç ${formatDate(startedAt)}` : "başlangıç tarihi ayarlanmamış"}`}
        action={<SnapshotButton />}
      />

      {/* §7.1 North Star */}
      <Card className="border-blood-500/40">
        <CardBody className="flex flex-wrap items-center gap-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-blood-500">North Star Metric</p>
            <p className="mt-1 font-display text-5xl font-black tabular-nums">{compact(values.mavu)}</p>
            <p className="text-sm text-muted">MAVU — Aylık Aktif Doğrulanmış Kullanıcı</p>
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
              <p className="text-[11px] text-muted">son {history.length || 0} ölçüm</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* §7.3 — İkincil KPI'lar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Ödeyen salon" value={values.payingGyms} hint="haftalık takip" tone={values.payingGyms ? "green" : "neutral"} />
        <Stat label="Bekleme listesi" value={compact(values.waitlistCount)} hint="uygulama öncesi ilgi" />
        <Stat label="LOI" value={values.loiCount} hint="niyet mektupları" />
        <Stat label="Profil tamamlanma" value={`%${values.profileCompletion}`} hint="hedef ≥%60 (H2)" tone={values.profileCompletion >= 60 ? "green" : "amber"} />
        <Stat label="Antrenör kefaleti" value={values.vouchCount} hint="ölçekleme mekanizması (H3)" />
        <Stat label="DAU/MAU" value={`%${dauMau}`} hint="yapışkanlık, hedef ≥%20 (H5)" tone={dauMau >= 20 ? "green" : "amber"} />
        <Stat label="MRR" value={formatMoney(values.mrr)} hint="aylık yinelenen ciro" />
        <Stat label="Rapor / 30 gün" value={values.reportsCount} tone={values.reportsCount > 50 ? "amber" : "neutral"} />
      </div>

      {/* §11.7 — moderatör ölçekleme tetikleyicisi */}
      {trigger && (
        <Alert tone="amber" title={`Moderasyon eşiği aşıldı: ${trigger.level}`}>
          <span className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            {trigger.note}
          </span>
        </Alert>
      )}

      {/* §7.4 — Dur/Devam kapıları, canlı değerlendirme */}
      <Section title="Dur/Devam Kapıları" subtitle="§7.4 — canlı verilerle değerlendirildi">
        <div className="flex flex-col gap-2">
          {gates.map((g) => {
            const s = LIGHT_STYLE[g.light];
            return (
              <Card key={g.month}>
                <CardBody className="flex flex-wrap items-center gap-3">
                  <span className={cn("size-3 shrink-0 rounded-full", s.dot)} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      Ay {g.month} · {g.title}
                    </p>
                    <p className="text-sm text-muted">{g.detail}</p>
                    {g.light !== "PENDING" && <p className="mt-0.5 text-xs text-muted">{g.action}</p>}
                  </div>
                  <Badge tone={s.tone}>{s.label}</Badge>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Trend */}
      <Section title="MAVU Trendi" subtitle="Günlük anlık görüntüler">
        {history.length === 0 ? (
          <EmptyState
            title="Henüz anlık görüntü yok"
            description="Yukarıdaki düğmeyle ilkini al veya /api/cron/kpi uç noktasını günlük zamanlanmış göreve bağla."
          />
        ) : (
          <Card>
            <CardBody className="flex flex-col gap-4">
              <div className="flex h-32 items-end gap-1" role="img" aria-label="MAVU trend grafiği">
                {[...history].reverse().map((h) => (
                  <span
                    key={h.id}
                    title={`${formatDate(h.date)}: ${h.mavu} MAVU`}
                    className="flex-1 rounded-t bg-gradient-to-t from-blood-700 to-blood-500"
                    style={{ height: `${Math.max(3, (h.mavu / maxMavu) * 100)}%` }}
                  />
                ))}
              </div>

              <div className="no-scrollbar overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase tracking-wider text-muted">
                      <th className="py-2 pr-3">Tarih</th>
                      <th className="py-2 pr-3">MAVU</th>
                      <th className="py-2 pr-3">DAU</th>
                      <th className="py-2 pr-3">Ödeyen</th>
                      <th className="py-2 pr-3">Bekleme</th>
                      <th className="py-2">MRR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-3">{formatDate(h.date)}</td>
                        <td className="py-2 pr-3 font-bold tabular-nums">{h.mavu}</td>
                        <td className="py-2 pr-3 tabular-nums">{h.dau}</td>
                        <td className="py-2 pr-3 tabular-nums">{h.payingGyms}</td>
                        <td className="py-2 pr-3 tabular-nums">{h.waitlistCount}</td>
                        <td className="py-2 tabular-nums">{formatMoney(h.mrr)}</td>
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
