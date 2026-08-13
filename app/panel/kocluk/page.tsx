import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Plus, Video } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, CardBody, Section, EmptyState, Alert, Stat } from "@/components/ui";
import { CheckoutButton } from "@/components/checkout-button";
import { CoachingScheduleForm, CoachingCompleteForm, CoachingReviewForm } from "@/components/coaching-forms";
import { toggleCoachingOffer, cancelCoaching } from "./actions";
import { formatMoney, formatDateTime } from "@/lib/utils";
// TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir
import { COACHING_FORMAT_LABEL, COACHING_STATUS_LABEL, DISCIPLINE_LABEL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { panelCoachingCopy } from "@/lib/i18n/pages/panel-coaching";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelCoachingCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "neutral" | "amber" | "green" | "red"> = {
  REQUESTED: "amber",
  ACCEPTED: "green",
  SCHEDULED: "green",
  COMPLETED: "neutral",
  CANCELLED: "red",
  REFUNDED: "red",
};

export default async function CoachingPanelPage() {
  const user = await requireUser();
  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  const locale = await getLocale();
  const copy = panelCoachingCopy[locale];
  const tag = LOCALE_TAG[locale];

  const data = await safe(
    async () => {
      const [offers, asCoach, asAthlete, earnings] = await Promise.all([
        isCoach
          ? prisma.coachingOffer.findMany({
              where: { coachId: user.id },
              orderBy: { createdAt: "desc" },
              select: {
                id: true, slug: true, title: true, price: true, format: true, isActive: true,
                capacity: true, sessionCount: true, ratingAvg: true, ratingCount: true, disciplines: true,
              },
            })
          : Promise.resolve([]),
        isCoach
          ? prisma.coachingSession.findMany({
              where: { coachId: user.id, status: { in: ["ACCEPTED", "SCHEDULED", "COMPLETED"] } },
              orderBy: { createdAt: "desc" },
              take: 30,
              select: {
                id: true, status: true, price: true, platformFee: true, scheduledAt: true,
                athleteNote: true, rating: true,
                athlete: { select: { name: true, slug: true, avatarUrl: true } },
                offer: { select: { title: true, durationMin: true } },
              },
            })
          : Promise.resolve([]),
        prisma.coachingSession.findMany({
          where: { athleteId: user.id },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true, status: true, price: true, scheduledAt: true, meetingUrl: true,
            coachNote: true, rating: true,
            coach: { select: { name: true, slug: true, avatarUrl: true } },
            offer: { select: { title: true, durationMin: true, format: true } },
          },
        }),
        isCoach
          ? prisma.coachingSession.aggregate({
              where: { coachId: user.id, status: "COMPLETED" },
              _sum: { price: true, platformFee: true },
            })
          : Promise.resolve(null),
      ]);
      return { offers, asCoach, asAthlete, earnings };
    },
    { offers: [], asCoach: [], asAthlete: [], earnings: null },
  );

  const net = data.earnings
    ? (data.earnings._sum.price ?? 0) - (data.earnings._sum.platformFee ?? 0)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={copy.title}
        subtitle={copy.subtitle}
      />

      {isCoach && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={copy.stats.activeOffers} value={data.offers.filter((o) => o.isActive).length} />
            <Stat label={copy.stats.openSessions} value={data.asCoach.filter((s) => s.status !== "COMPLETED").length} />
            <Stat label={copy.stats.completed} value={data.asCoach.filter((s) => s.status === "COMPLETED").length} />
            <Stat label={copy.stats.netEarnings} value={formatMoney(net, "EUR", tag)} hint={copy.stats.netHint} />
          </div>

          <Section title={copy.offers.heading} action={
            <ButtonLink href="/panel/kocluk/yeni" size="sm">
              <Plus className="size-4" /> {copy.offers.newOffer}
            </ButtonLink>
          }>
            {data.offers.length === 0 ? (
              <EmptyState
                title={copy.offers.emptyTitle}
                description={copy.offers.emptyDescription}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.offers.map((o) => (
                  <Card key={o.id}>
                    <CardBody className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/kocluk/${o.slug}`} className="font-bold hover:text-blood-500">
                          {o.title}
                        </Link>
                        <Badge tone={o.isActive ? "green" : "neutral"}>
                          {o.isActive ? copy.offers.published : copy.offers.closed}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">
                        {COACHING_FORMAT_LABEL[o.format]} · {formatMoney(o.price, "EUR", tag)} ·{" "}
                        {copy.offers.capacity.replace("{n}", String(o.capacity))}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {o.disciplines.map((d) => (
                          <Badge key={d} tone="neutral">{DISCIPLINE_LABEL[d]}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted">
                        {copy.offers.sessions.replace("{n}", String(o.sessionCount))}
                        {o.ratingCount > 0 && ` · ★ ${o.ratingAvg} (${o.ratingCount})`}
                      </p>
                      <form action={toggleCoachingOffer.bind(null, o.id)} className="pt-1">
                        <button type="submit" className="text-xs font-bold text-blood-500 hover:underline">
                          {o.isActive ? copy.offers.unpublish : copy.offers.publish}
                        </button>
                      </form>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </Section>

          <Section title={copy.incoming.heading} subtitle={copy.incoming.subtitle}>
            {data.asCoach.length === 0 ? (
              <EmptyState title={copy.incoming.emptyTitle} description={copy.incoming.emptyDescription} />
            ) : (
              <div className="flex flex-col gap-3">
                {data.asCoach.map((s) => (
                  <Card key={s.id}>
                    <CardBody className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Avatar src={s.athlete.avatarUrl} name={s.athlete.name} size="sm" />
                        <Link href={`/dovuscular/${s.athlete.slug}`} className="text-sm font-bold hover:text-blood-500">
                          {s.athlete.name}
                        </Link>
                        <Badge tone={STATUS_TONE[s.status]}>{COACHING_STATUS_LABEL[s.status]}</Badge>
                        <span className="ml-auto text-sm font-black tabular-nums">{formatMoney(s.price, "EUR", tag)}</span>
                      </div>
                      <p className="text-sm text-muted">
                        {s.offer.title} · {s.offer.durationMin} {copy.minutes}
                        {s.scheduledAt && ` · ${formatDateTime(s.scheduledAt, tag)}`}
                      </p>
                      {s.athleteNote && (
                        <p className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">{s.athleteNote}</p>
                      )}

                      {s.status === "ACCEPTED" && <CoachingScheduleForm sessionId={s.id} />}
                      {s.status === "SCHEDULED" && <CoachingCompleteForm sessionId={s.id} />}
                      {s.status !== "COMPLETED" && (
                        <form action={cancelCoaching.bind(null, s.id)}>
                          <button type="submit" className="text-xs font-bold text-muted hover:text-blood-500">
                            {copy.incoming.cancelSession}
                          </button>
                        </form>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        </>
      )}

      <Section title={copy.received.heading}>
        {data.asAthlete.length === 0 ? (
          <EmptyState
            title={copy.received.emptyTitle}
            description={copy.received.emptyDescription}
            action={<ButtonLink href="/kocluk" size="sm">{copy.received.browse}</ButtonLink>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {data.asAthlete.map((s) => (
              <Card key={s.id}>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Avatar src={s.coach.avatarUrl} name={s.coach.name} size="sm" />
                    <Link href={`/dovuscular/${s.coach.slug}`} className="text-sm font-bold hover:text-blood-500">
                      {s.coach.name}
                    </Link>
                    <Badge tone={STATUS_TONE[s.status]}>{COACHING_STATUS_LABEL[s.status]}</Badge>
                    <span className="ml-auto text-sm font-black tabular-nums">{formatMoney(s.price, "EUR", tag)}</span>
                  </div>
                  <p className="text-sm text-muted">
                    {s.offer.title} · {s.offer.durationMin} {copy.minutes}
                    {s.scheduledAt && ` · ${formatDateTime(s.scheduledAt, tag)}`}
                  </p>

                  {s.status === "REQUESTED" && (
                    <div className="flex flex-col gap-2">
                      <Alert tone="amber">
                        {copy.received.payAlert}
                      </Alert>
                      <CheckoutButton purpose="COACHING_SESSION" payload={{ sessionId: s.id }}>
                        {copy.received.payNow}
                      </CheckoutButton>
                    </div>
                  )}

                  {s.status === "SCHEDULED" && s.meetingUrl && (
                    <a
                      href={s.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-blood-600 px-3 py-2 text-sm font-bold text-white hover:bg-blood-500"
                    >
                      <Video className="size-4" /> {copy.received.joinSession}
                    </a>
                  )}

                  {s.coachNote && (
                    <p className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">
                      <span className="font-bold">{copy.received.coachNote}</span>
                      {s.coachNote}
                    </p>
                  )}

                  {s.status === "COMPLETED" && s.rating === null && <CoachingReviewForm sessionId={s.id} />}

                  {["REQUESTED", "ACCEPTED", "SCHEDULED"].includes(s.status) && (
                    <form action={cancelCoaching.bind(null, s.id)}>
                      <button type="submit" className="text-xs font-bold text-muted hover:text-blood-500">
                        {copy.received.cancel}
                      </button>
                    </form>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
