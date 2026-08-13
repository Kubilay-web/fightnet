import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2, ExternalLink, ClipboardList } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { deleteFight } from "@/app/organizator/actions";
import { Badge, Card, CardBody, Section, EmptyState, ButtonLink, LiveBadge } from "@/components/ui";
import { StreamSetup } from "@/components/stream-setup";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { EventForm, FightForm, FightResultForm } from "@/components/event-forms";
import { RegistrationReview } from "@/components/registration-review";
import { DISCIPLINE_LABEL, FIGHT_METHOD_LABEL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { organizerCopy } from "@/lib/i18n/pages/organizer";

const REG_TONE: Record<string, "amber" | "green" | "blue" | "red" | "neutral"> = {
  PENDING: "amber",
  ACCEPTED: "green",
  WAITLISTED: "blue",
  REJECTED: "red",
  WITHDRAWN: "neutral",
};

export async function generateMetadata(): Promise<Metadata> {
  const copy = organizerCopy[await getLocale()].manage;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

/** datetime-local input için yerel saat formatı */
function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export default async function EventManagePage({ params }: { params: Params }) {
  const [{ id }, user, locale] = await Promise.all([params, requireUser(), getLocale()]);
  const t = organizerCopy[locale].manage;

  const event = await safe(
    () =>
      prisma.event.findUnique({
        where: { id },
        select: {
          id: true, slug: true, title: true, description: true, type: true, status: true,
          disciplines: true, startsAt: true, endsAt: true, doorsAt: true,
          venueName: true, street: true, city: true, postalCode: true, country: true,
          lat: true, lng: true, ticketUrl: true, ticketPrice: true, capacity: true,
          streamUrl: true, isPPV: true, ppvPrice: true, registrationOpen: true,
          streamChannel: {
            select: {
              provider: true, playbackUrl: true, streamKey: true, ingestEndpoint: true,
              status: true, authorized: true, viewerPeak: true,
            },
          },
          posterUrl: true, posterId: true, organizerId: true,
          fights: {
            orderBy: [{ isMainEvent: "desc" }, { order: "asc" }],
            select: {
              id: true, order: true, isMainEvent: true, isTitleFight: true,
              discipline: true, weightClass: true, rounds: true,
              redName: true, redRecord: true, blueName: true, blueRecord: true,
              status: true, winnerCorner: true, method: true, endRound: true,
              endTime: true, currentRound: true,
            },
          },
          // §4.4 — Müsabaka kayıtları
          registrations: {
            orderBy: [{ status: "asc" }, { createdAt: "asc" }],
            select: {
              id: true, status: true, discipline: true, weightClass: true, weightKg: true,
              record: true, coachName: true, gymName: true, emergency: true, note: true,
              medicalConfirmed: true, guardianApproved: true, createdAt: true,
              user: {
                select: { id: true, name: true, slug: true, avatarUrl: true, verification: true, isMinor: true },
              },
            },
          },
        },
      }),
    null,
  );

  if (!event) notFound();
  if (event.organizerId !== user.id && user.role !== "ADMIN") notFound();

  const isLive = event.status === "LIVE";

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={event.title}
        subtitle={`${event.city} · ${event.fights.length} ${t.fights}`}
        action={
          <div className="flex gap-2">
            {isLive && <LiveBadge />}
            <ButtonLink href={`/etkinlikler/${event.slug}`} target="_blank" variant="outline" size="sm">
              <ExternalLink className="size-4" /> {t.viewPage}
            </ButtonLink>
          </div>
        }
      />

      {/* Canlı skor paneli */}
      <Section
        id="canli"
        title={t.scoring.title}
        subtitle={t.scoring.subtitle}
      >
        {event.fights.length === 0 ? (
          <EmptyState title={t.scoring.emptyTitle} description={t.scoring.emptyDescription} />
        ) : (
          <div className="flex flex-col gap-4">
            {event.fights.map((f) => (
              <Card key={f.id} className={f.status === "LIVE" ? "border-blood-500" : undefined}>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {f.isMainEvent && <Badge tone="gold">{t.mainEvent}</Badge>}
                    {f.isTitleFight && <Badge tone="red">{t.titleFight}</Badge>}
                    {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                    <Badge>{DISCIPLINE_LABEL[f.discipline]}</Badge>
                    {f.weightClass && <span className="text-xs text-muted">{f.weightClass}</span>}
                    <span className="text-xs text-muted">{f.rounds} {t.rounds}</span>
                    {f.status === "LIVE" && <LiveBadge />}
                    {f.status === "FINISHED" && f.method && (
                      <Badge tone="green">
                        {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                        {f.winnerCorner === "RED" ? f.redName : f.blueName} · {FIGHT_METHOD_LABEL[f.method]}
                      </Badge>
                    )}
                    <form action={deleteFight.bind(null, event.id, f.id)} className="ml-auto">
                      <button
                        type="submit"
                        aria-label={t.deleteFight}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-blood-500/10 hover:text-blood-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </div>

                  <p className="font-display text-lg font-black">
                    <span className="text-blood-500">{f.redName}</span>
                    <span className="mx-2 text-muted">{t.vs}</span>
                    <span className="text-blue-500">{f.blueName}</span>
                  </p>

                  <FightResultForm eventId={event.id} fight={f} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* §4.4 — Müsabaka kayıtları */}
      <Section
        title={t.registrations.title}
        subtitle={
          event.registrationOpen
            ? t.registrations.openSubtitle(event.registrations.length)
            : t.registrations.closedSubtitle
        }
      >
        {event.registrations.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-8" />}
            title={t.registrations.emptyTitle}
            description={t.registrations.emptyDescription}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {event.registrations.map((r) => (
              <Card key={r.id}>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Avatar src={r.user.avatarUrl} name={r.user.name} size="sm" href={`/dovuscular/${r.user.slug}`} />
                    <span className="flex items-center gap-1.5 font-bold">
                      {r.user.name}
                      <VerifiedMark level={r.user.verification} />
                    </span>
                    <Badge tone={REG_TONE[r.status]}>{t.registrations.status[r.status]}</Badge>
                    {r.user.isMinor && (
                      <Badge tone={r.guardianApproved ? "amber" : "red"}>
                        {r.guardianApproved ? t.registrations.minorApproved : t.registrations.minorNotApproved}
                      </Badge>
                    )}
                    {!r.medicalConfirmed && <Badge tone="red">{t.registrations.noMedical}</Badge>}
                  </div>

                  <p className="text-sm text-muted">
                    {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                    {DISCIPLINE_LABEL[r.discipline]}
                    {r.weightClass && ` · ${r.weightClass}`}
                    {r.weightKg && ` · ${r.weightKg} kg`}
                    {r.record && ` · ${t.registrations.record} ${r.record}`}
                    {r.gymName && ` · ${r.gymName}`}
                    {r.coachName && ` · ${t.registrations.coach}: ${r.coachName}`}
                  </p>
                  <p className="text-xs text-muted">{t.registrations.emergency}: {r.emergency}</p>
                  {r.note && <p className="text-xs italic text-muted">&ldquo;{r.note}&rdquo;</p>}

                  <RegistrationReview eventId={event.id} registrationId={r.id} status={r.status} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* §4.4 — Canlı yayın kanalı ve PPV */}
      <Section
        title={t.stream.title}
        subtitle={event.isPPV ? t.stream.ppv(event.ppvPrice ?? 0) : t.stream.free}
      >
        <StreamSetup eventId={event.id} isPPV={event.isPPV} channel={event.streamChannel} />
      </Section>

      <Section title={t.addFight}>
        <Card>
          <CardBody>
            <FightForm eventId={event.id} />
          </CardBody>
        </Card>
      </Section>

      <Section title={t.eventInfo}>
        <Card>
          <CardBody>
            <EventForm
              initial={{
                ...event,
                startsAt: toLocalInput(event.startsAt),
                endsAt: toLocalInput(event.endsAt),
                doorsAt: toLocalInput(event.doorsAt),
              }}
            />
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
