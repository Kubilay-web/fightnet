import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import {
  Flame, Dumbbell, Users, Swords, Bell, BadgeCheck, TrendingUp,
  CalendarCheck, ArrowRight, Sparkles,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Avatar, VerifiedMark, FounderMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, ButtonLink, Section, Stat, EmptyState, Alert } from "@/components/ui";
import { GuardianNotice } from "@/components/guardian-notice";
import { compact, formatDate, timeAgo, cn } from "@/lib/utils";
// TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir
import { DISCIPLINE_LABEL, VERIFICATION_LABEL, BOOKING_STATUS_LABEL } from "@/lib/constants";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { panelHomeCopy } from "@/lib/i18n/pages/panel-home";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelHomeCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function PanelHome() {
  const user = await requireUser();
  const locale = await getLocale();
  const t = panelHomeCopy[locale];

  const data = await safe(
    async () => {
      const now = new Date();
      const weekAgo = new Date(Date.now() - 7 * 864e5);

      const [
        trainingsThisWeek, totalMinutes, pendingRequests, upcomingBookings,
        unreadNotifs, recentTrainings, sportProfiles, verificationReq, openListings,
      ] = await Promise.all([
        prisma.trainingLog.count({ where: { userId: user.id, date: { gte: weekAgo } } }),
        prisma.trainingLog.aggregate({
          where: { userId: user.id, date: { gte: weekAgo } },
          _sum: { durationMin: true },
        }),
        prisma.sparringRequest.count({ where: { receiverId: user.id, status: "PENDING" } }),
        prisma.booking.findMany({
          where: { userId: user.id, date: { gte: now }, status: { in: ["PENDING", "CONFIRMED"] } },
          orderBy: { date: "asc" },
          take: 3,
          select: {
            id: true, date: true, type: true, status: true,
            gym: { select: { name: true, slug: true, city: true } },
          },
        }),
        prisma.notification.count({ where: { userId: user.id, isRead: false } }),
        prisma.trainingLog.findMany({
          where: { userId: user.id },
          orderBy: { date: "desc" },
          take: 5,
          select: { id: true, date: true, discipline: true, durationMin: true, intensity: true, type: true },
        }),
        prisma.sportProfile.findMany({
          where: { userId: user.id },
          orderBy: { isPrimary: "desc" },
          select: { discipline: true, wins: true, losses: true, draws: true, level: true },
        }),
        prisma.verificationRequest.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: { status: true, targetLevel: true },
        }),
        prisma.sparringListing.count({ where: { userId: user.id, status: "OPEN" } }),
      ]);

      return {
        trainingsThisWeek,
        weekMinutes: totalMinutes._sum.durationMin ?? 0,
        pendingRequests,
        upcomingBookings,
        unreadNotifs,
        recentTrainings,
        sportProfiles,
        verificationReq,
        openListings,
      };
    },
    {
      trainingsThisWeek: 0, weekMinutes: 0, pendingRequests: 0, upcomingBookings: [],
      unreadNotifs: 0, recentTrainings: [], sportProfiles: [], verificationReq: null, openListings: 0,
    },
  );

  const nextStep = getNextStep(user, data, t);

  return (
    <div className="flex flex-col gap-6">
      {/* Karşılama */}
      <div className="flex flex-wrap items-center gap-4">
        <Avatar src={user.avatarUrl} name={user.name} size="xl" priority />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-black sm:text-3xl">
              {t.greeting} {user.name.split(" ")[0]}
            </h1>
            <VerifiedMark level={user.verification} />
            {user.isFounder && <FounderMark />}
          </div>
          <p className="text-sm text-muted">
            {VERIFICATION_LABEL[user.verification]} · {t.profileComplete(user.profileScore)}
          </p>
        </div>
        <ButtonLink href={`/dovuscular/${user.slug}`} variant="outline" size="sm">
          {t.viewProfile}
        </ButtonLink>
      </div>

      {/* Profil tamamlama çubuğu — §10.2 H2 hipotezi */}
      {user.profileScore < 100 && (
        <Card>
          <CardBody className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold">{t.completion.title}</p>
              <span className="text-sm font-black tabular-nums">{t.completion.percent(user.profileScore)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blood-600 to-gold-500 transition-all"
                style={{ width: `${user.profileScore}%` }}
              />
            </div>
            <p className="text-xs text-muted">{nextStep.text}</p>
            <ButtonLink href={nextStep.href} size="sm" className="mt-1 w-fit">
              {nextStep.cta} <ArrowRight className="size-4" />
            </ButtonLink>
          </CardBody>
        </Card>
      )}

      {/* §11.1 Kapı 1 — çocuk koruması */}
      {user.isMinor && !user.guardianConsent && <GuardianNotice guardianEmail={user.guardianEmail} />}

      {/* Doğrulama durumu */}
      {user.verification === "LEVEL_0" && (
        <Alert tone="blue" title={t.verifyAlert.title}>
          {t.verifyAlert.body}
          {data.verificationReq?.status === "PENDING" ? (
            <>{t.verifyAlert.pending}</>
          ) : (
            <>
              {" "}
              <Link href="/panel/dogrulama" className="font-bold underline">
                {t.verifyAlert.start}
              </Link>
            </>
          )}
        </Alert>
      )}

      {/* Sayaçlar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t.stats.streak} value={`${user.trainingStreak}`} hint={t.stats.streakHint} tone="red" />
        <Stat label={t.stats.week} value={data.trainingsThisWeek} hint={t.stats.weekHint(data.weekMinutes)} />
        <Stat label={t.stats.followers} value={compact(user.followerCount)} />
        <Stat label={t.stats.pending} value={data.pendingRequests} hint={t.stats.pendingHint} tone={data.pendingRequests ? "amber" : "neutral"} />
      </div>

      {/* Hızlı işlemler */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction href="/panel/antrenman/yeni" icon={Dumbbell} label={t.quick.training} />
        <QuickAction href="/panel/sparring/yeni" icon={Swords} label={t.quick.sparring} />
        <QuickAction href="/panel/gonderi/yeni" icon={Sparkles} label={t.quick.post} />
        <QuickAction href="/salonlar" icon={CalendarCheck} label={t.quick.gym} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Son antrenmanlar */}
        <Section
          title={t.trainings.title}
          action={
            <ButtonLink href="/panel/antrenman" variant="ghost" size="sm">
              {t.trainings.all} <ArrowRight className="size-4" />
            </ButtonLink>
          }
        >
          {data.recentTrainings.length === 0 ? (
            <EmptyState
              icon={<Dumbbell className="size-8" />}
              title={t.trainings.emptyTitle}
              description={t.trainings.emptyBody}
              action={
                <ButtonLink href="/panel/antrenman/yeni" size="sm" className="mt-2">
                  {t.trainings.emptyCta}
                </ButtonLink>
              }
            />
          ) : (
            <Card>
              <ul className="divide-y divide-[var(--border)]">
                {data.recentTrainings.map((log) => (
                  <li key={log.id} className="flex items-center gap-3 p-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
                      <Dumbbell className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {DISCIPLINE_LABEL[log.discipline]}
                        {log.type ? ` · ${log.type}` : ""}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(log.date, LOCALE_TAG[locale])} · {log.durationMin} {t.trainings.minutesShort} ·{" "}
                        {t.trainings.intensity} {log.intensity}/5
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Section>

        {/* Yaklaşan rezervasyonlar */}
        <Section
          title={t.bookings.title}
          action={
            <ButtonLink href="/panel/rezervasyonlar" variant="ghost" size="sm">
              {t.bookings.all} <ArrowRight className="size-4" />
            </ButtonLink>
          }
        >
          {data.upcomingBookings.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="size-8" />}
              title={t.bookings.emptyTitle}
              description={t.bookings.emptyBody}
              action={
                <ButtonLink href="/salonlar" size="sm" className="mt-2">
                  {t.bookings.emptyCta}
                </ButtonLink>
              }
            />
          ) : (
            <Card>
              <ul className="divide-y divide-[var(--border)]">
                {data.upcomingBookings.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/salonlar/${b.gym.slug}`} className="truncate text-sm font-bold hover:text-blood-500">
                        {b.gym.name}
                      </Link>
                      <p className="text-xs text-muted">
                        {formatDate(b.date, LOCALE_TAG[locale])} · {b.gym.city}
                      </p>
                    </div>
                    <Badge tone={b.status === "CONFIRMED" ? "green" : "amber"}>
                      {BOOKING_STATUS_LABEL[b.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Section>
      </div>

      {/* Disiplinler */}
      {data.sportProfiles.length > 0 && (
        <Section
          title={t.disciplines.title}
          action={
            <ButtonLink href="/panel/profil" variant="ghost" size="sm">
              {t.disciplines.edit} <ArrowRight className="size-4" />
            </ButtonLink>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {data.sportProfiles.map((sp) => (
              <Card key={sp.discipline}>
                <CardBody>
                  <p className="font-bold">{DISCIPLINE_LABEL[sp.discipline]}</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">
                    {sp.wins}-{sp.losses}-{sp.draws}
                  </p>
                  <p className="text-xs text-muted">{t.disciplines.recordLegend}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Dumbbell;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="surface flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-colors hover:border-blood-500/40"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
        <Icon className="size-5" />
      </span>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}

function getNextStep(
  user: { avatarUrl: string | null; bio: string | null; city: string | null },
  data: { sportProfiles: unknown[] },
  t: (typeof panelHomeCopy)[keyof typeof panelHomeCopy],
): { text: string; href: string; cta: string } {
  if (!user.avatarUrl) return { ...t.nextStep.avatar, href: "/panel/profil" };
  if (!data.sportProfiles.length) return { ...t.nextStep.sport, href: "/panel/profil" };
  if (!user.bio) return { ...t.nextStep.bio, href: "/panel/profil" };
  if (!user.city) return { ...t.nextStep.city, href: "/panel/profil" };
  return { ...t.nextStep.verify, href: "/panel/dogrulama" };
}
