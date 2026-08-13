import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/components/i18n/link";
import Image from "next/image";
import { MapPin, Clock, Ticket, Radio, Building2, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Badge, Card, CardBody, LiveBadge, Section, ButtonLink } from "@/components/ui";
import { FightCardList } from "@/components/fight-card";
import { LiveFeed } from "@/components/live-feed";
import { LiveStream } from "@/components/live-stream";
import { EventRegistration } from "@/components/event-registration";
import { cld } from "@/lib/image";
import { formatDateTime, formatTime } from "@/lib/utils";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { labelsFor, type EventTypeKey } from "@/lib/i18n/labels";
import { eventsCopy } from "@/lib/i18n/pages/events";

type Params = Promise<{ slug: string }>;

// Canlı etkinliklerde sık, diğerlerinde seyrek tazeleme
export const revalidate = 20;

async function loadEvent(slug: string) {
  return safe(
    () =>
      prisma.event.findUnique({
        where: { slug },
        select: {
          id: true, slug: true, title: true, description: true, type: true, status: true,
          disciplines: true, posterUrl: true,
          startsAt: true, endsAt: true, doorsAt: true,
          venueName: true, street: true, city: true, postalCode: true, country: true, lat: true, lng: true,
          ticketUrl: true, ticketPrice: true, capacity: true, streamUrl: true, isPPV: true, ppvPrice: true,
          registrationOpen: true, registrationDeadline: true, viewCount: true,
          streamChannel: { select: { id: true, status: true, provider: true } },
          organizer: { select: { id: true, name: true, slug: true, avatarUrl: true, verification: true } },
          gym: { select: { slug: true, name: true, city: true, logoUrl: true } },
          fights: {
            orderBy: [{ isMainEvent: "desc" }, { order: "asc" }],
            select: {
              id: true, order: true, isMainEvent: true, isTitleFight: true,
              discipline: true, weightClass: true, rounds: true,
              redName: true, redRecord: true, redImage: true,
              blueName: true, blueRecord: true, blueImage: true,
              status: true, winnerCorner: true, method: true, endRound: true, endTime: true,
              currentRound: true,
              red: { select: { slug: true, avatarUrl: true, verification: true } },
              blue: { select: { slug: true, avatarUrl: true, verification: true } },
            },
          },
        },
      }),
    null,
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [e, locale] = await Promise.all([loadEvent(slug), getLocale()]);
  const c = eventsCopy[locale].detail;
  const alternates = await metadataAlternates(`/etkinlikler/${slug}`);
  if (!e) return { title: c.notFound, alternates };
  return {
    title: e.title,
    description:
      e.description?.slice(0, 155) ??
      c.metaDescription
        .replace("{title}", e.title)
        .replace("{date}", formatDateTime(e.startsAt, LOCALE_TAG[locale]))
        .replace("{city}", e.city),
    alternates,
    openGraph: { images: e.posterUrl ? [{ url: cld(e.posterUrl, { w: 1200, h: 630 }) }] : undefined },
  };
}

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [e, session, locale] = await Promise.all([loadEvent(slug), getSession(), getLocale()]);
  if (!e) notFound();

  const c = eventsCopy[locale].detail;
  const L = labelsFor(locale);
  const isLive = e.status === "LIVE";
  const canModerate =
    !!session && (session.sub === e.organizer.id || session.role === "ADMIN" || session.role === "MODERATOR");

  // Görüntülenme sayacı — kritik yolu bloklamaz
  prisma.event.update({ where: { id: e.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  // §4.4 — Müsabaka kaydı: yalnızca kayıt açıkken ve giriş yapmışken gösterilir
  const registrationOpen =
    e.registrationOpen &&
    e.status !== "CANCELLED" &&
    e.status !== "FINISHED" &&
    (!e.registrationDeadline || e.registrationDeadline > new Date());

  const myRegistration =
    session && registrationOpen
      ? await safe(
          () =>
            prisma.eventRegistration.findUnique({
              where: { eventId_userId: { eventId: e.id, userId: session.sub } },
              select: { status: true, reviewNote: true },
            }),
          null,
        )
      : null;

  return (
    <>
      {/* Afiş */}
      <div className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0">
          {e.posterUrl ? (
            <Image src={cld(e.posterUrl, { w: 1600, h: 600, blur: true })} alt="" fill className="object-cover opacity-30" sizes="100vw" />
          ) : (
            <div className="size-full mesh-hero" />
          )}
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:px-6 sm:py-12">
          {e.posterUrl && (
            <div className="relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-2xl sm:w-56">
              <Image src={cld(e.posterUrl, { w: 448, h: 597 })} alt={e.title} fill priority sizes="224px" className="object-cover" />
            </div>
          )}

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {isLive ? <LiveBadge /> : <Badge tone="red">{L.eventType[e.type as EventTypeKey]}</Badge>}
              {e.isPPV && <Badge tone="purple">PPV{e.ppvPrice ? ` · ${e.ppvPrice} €` : ""}</Badge>}
              {e.disciplines.map((d) => (
                <Badge key={d}>{L.discipline[d]}</Badge>
              ))}
            </div>

            <h1 className="font-display text-3xl font-black leading-tight sm:text-5xl">{e.title}</h1>

            <div className="flex flex-col gap-1.5 text-sm">
              <span className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-blood-500" />
                {formatDateTime(e.startsAt, LOCALE_TAG[locale])}
                {e.doorsAt && ` · ${c.doorsAt.replace("{time}", formatTime(e.doorsAt, LOCALE_TAG[locale]))}`}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-blood-500" />
                {[e.venueName, e.street, e.postalCode, e.city].filter(Boolean).join(", ")}
              </span>
              {e.capacity && (
                <span className="flex items-center gap-2 text-muted">
                  <Ticket className="size-4 shrink-0" />
                  {c.capacity}: {e.capacity}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {e.ticketUrl && (
                <ButtonLink href={e.ticketUrl} target="_blank" rel="noopener">
                  <Ticket className="size-4" /> {c.buyTicket}
                </ButtonLink>
              )}
              {/* Kanal bağlıysa yayın sayfa içinde oynatılır; yalnızca kanal
                  yokken organizatörün girdiği harici adres gösterilir. */}
              {!e.streamChannel && e.streamUrl && (
                <ButtonLink href={e.streamUrl} target="_blank" rel="noopener" variant="outline">
                  <Radio className="size-4" /> {c.liveStream}
                </ButtonLink>
              )}
              {e.lat && e.lng && (
                <ButtonLink
                  href={`https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`}
                  target="_blank"
                  rel="noopener"
                  variant="ghost"
                >
                  <ExternalLink className="size-4" /> {c.directions}
                </ButtonLink>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted">
              <Link href={`/dovuscular/${e.organizer.slug}`} className="hover:text-blood-500">
                {c.organizer}: <b>{e.organizer.name}</b>
              </Link>
              {e.gym && (
                <Link href={`/salonlar/${e.gym.slug}`} className="flex items-center gap-1 hover:text-blood-500">
                  <Building2 className="size-3.5" /> {e.gym.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 pb-16 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          {/* §4.4 — Canlı yayın / PPV. Oynatma adresi sunucudan, satın alma
              doğrulandıktan sonra alınır; HTML'e hiç gömülmez. */}
          {e.streamChannel && (
            <Section title={e.isPPV ? c.streamPpvTitle : c.streamTitle}>
              <LiveStream
                eventId={e.id}
                eventTitle={e.title}
                isPPV={e.isPPV}
                ppvPrice={e.ppvPrice}
              />
            </Section>
          )}

          {e.description && (
            <Card>
              <CardBody>
                <p className="whitespace-pre-line text-sm leading-relaxed">{e.description}</p>
              </CardBody>
            </Card>
          )}

          <Section title={c.fightCard} subtitle={c.fightCount.replace("{count}", String(e.fights.length))}>
            <FightCardList fights={e.fights} />
          </Section>

          {/* §4.4 — Müsabaka kayıt aracılığı */}
          {registrationOpen && (
            <Section
              id="kayit"
              title={c.registrationTitle}
              subtitle={c.registrationSubtitle}
            >
              <Card>
                <CardBody>
                  {session ? (
                    <EventRegistration
                      eventId={e.id}
                      disciplines={e.disciplines}
                      deadline={e.registrationDeadline}
                      existing={myRegistration}
                    />
                  ) : (
                    <div className="flex flex-col items-start gap-3">
                      <p className="text-sm text-muted">{c.registrationLoginBody}</p>
                      <ButtonLink href={`/giris?next=/etkinlikler/${e.slug}`} size="sm">
                        {c.login}
                      </ButtonLink>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Section>
          )}
        </div>

        {/* §4.1 — Etkinlik yorumlu livescore */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <LiveFeed
            eventId={e.id}
            isLive={isLive}
            authed={!!session}
            canModerate={canModerate}
            fights={e.fights.map((f) => ({ id: f.id, label: `${f.redName} vs ${f.blueName}` }))}
          />
        </aside>
      </div>
    </>
  );
}
