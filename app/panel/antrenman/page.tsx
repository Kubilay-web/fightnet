import type { Metadata } from "next";
import { Dumbbell, Flame, Clock, TrendingUp, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { deleteTraining } from "@/app/panel/actions";
import { Card, CardBody, ButtonLink, Section, Stat, EmptyState, Badge, Pagination } from "@/components/ui";
import { StreakCalendar } from "@/components/streak-calendar";
import { formatDate } from "@/lib/utils";
import { DISCIPLINE_LABEL, PAGE_SIZE } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { panelTrainingCopy } from "@/lib/i18n/pages/panel-training";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelTrainingCopy[await getLocale()];
  return { title: copy.meta.list, robots: { index: false } };
}

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function TrainingPage({ searchParams }: { searchParams: SP }) {
  const [user, sp, locale] = await Promise.all([requireUser(), searchParams, getLocale()]);
  const t = panelTrainingCopy[locale].list;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const data = await safe(
    async () => {
      const monthAgo = new Date(Date.now() - 30 * 864e5);
      const yearAgo = new Date(Date.now() - 365 * 864e5);

      const [logs, total, monthAgg, byDiscipline, calendarLogs] = await Promise.all([
        prisma.trainingLog.findMany({
          where: { userId: user.id },
          orderBy: { date: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        prisma.trainingLog.count({ where: { userId: user.id } }),
        prisma.trainingLog.aggregate({
          where: { userId: user.id, date: { gte: monthAgo } },
          _sum: { durationMin: true },
          _count: true,
          _avg: { intensity: true },
        }),
        prisma.trainingLog.groupBy({
          by: ["discipline"],
          where: { userId: user.id },
          _count: true,
          _sum: { durationMin: true },
        }),
        prisma.trainingLog.findMany({
          where: { userId: user.id, date: { gte: yearAgo } },
          select: { date: true, durationMin: true },
          orderBy: { date: "asc" },
        }),
      ]);
      return { logs, total, monthAgg, byDiscipline, calendarLogs };
    },
    { logs: [], total: 0, monthAgg: { _sum: { durationMin: 0 }, _count: 0, _avg: { intensity: 0 } }, byDiscipline: [], calendarLogs: [] },
  );

  return (
    <div className="flex flex-col gap-6">
      <Section
        title={t.title}
        subtitle={t.subtitle}
        action={
          <ButtonLink href="/panel/antrenman/yeni" size="sm">
            <Dumbbell className="size-4" /> {t.add}
          </ButtonLink>
        }
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label={t.stats.streak} value={`${user.trainingStreak} ${t.stats.dayUnit}`} tone="red" />
          <Stat label={t.stats.total} value={data.total} hint={t.stats.totalHint} />
          <Stat
            label={t.stats.last30}
            value={data.monthAgg._count}
            hint={`${data.monthAgg._sum.durationMin ?? 0} ${t.stats.minuteUnit}`}
          />
          <Stat
            label={t.stats.avgIntensity}
            value={data.monthAgg._avg.intensity ? `${data.monthAgg._avg.intensity.toFixed(1)}/5` : "—"}
          />
        </div>
      </Section>

      {/* Yıllık ısı haritası */}
      <Card>
        <CardBody>
          <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
            <Flame className="size-3.5 text-blood-500" /> {t.heatmap}
          </h2>
          <StreakCalendar
            days={data.calendarLogs.map((l) => ({
              date: l.date.toISOString().slice(0, 10),
              minutes: l.durationMin,
            }))}
          />
        </CardBody>
      </Card>

      {/* Disipline göre dağılım */}
      {data.byDiscipline.length > 0 && (
        <Section title={t.byDiscipline}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.byDiscipline.map((d) => (
              <Card key={d.discipline}>
                <CardBody>
                  {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                  <p className="truncate text-sm font-bold">{DISCIPLINE_LABEL[d.discipline]}</p>
                  <p className="mt-1 text-xl font-black tabular-nums">{d._count}</p>
                  <p className="text-xs text-muted">
                    {Math.round((d._sum.durationMin ?? 0) / 60)} {t.hourUnit}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section title={t.records}>
        {data.logs.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="size-10" />}
            title={t.emptyTitle}
            description={t.emptyDescription}
            action={
              <ButtonLink href="/panel/antrenman/yeni" size="sm" className="mt-2">
                {t.emptyAction}
              </ButtonLink>
            }
          />
        ) : (
          <>
            <Card>
              <ul className="divide-y divide-[var(--border)]">
                {data.logs.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center gap-3 p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
                      <Dumbbell className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                      <p className="truncate font-bold">
                        {DISCIPLINE_LABEL[l.discipline]}
                        {l.type ? ` · ${l.type}` : ""}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
                        <span>{formatDate(l.date, LOCALE_TAG[locale])}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {l.durationMin} {t.minuteShort}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="size-3" /> {l.intensity}/5
                        </span>
                        {l.rounds ? (
                          <span>
                            {l.rounds} {t.roundUnit}
                          </span>
                        ) : null}
                        {l.weightKg ? <span>{l.weightKg} kg</span> : null}
                      </p>
                      {l.techniques.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {l.techniques.slice(0, 5).map((tech) => (
                            <Badge key={tech}>{tech}</Badge>
                          ))}
                        </div>
                      )}
                      {l.notes && <p className="mt-1 line-clamp-2-safe text-xs text-muted">{l.notes}</p>}
                    </div>
                    <form action={deleteTraining.bind(null, l.id)}>
                      <button
                        type="submit"
                        aria-label={t.deleteAria}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-blood-500/10 hover:text-blood-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </Card>
            <Pagination
              page={page}
              totalPages={Math.ceil(data.total / PAGE_SIZE)}
              basePath="/panel/antrenman"
              params={sp}
            />
          </>
        )}
      </Section>
    </div>
  );
}
