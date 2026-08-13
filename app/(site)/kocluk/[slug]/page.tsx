import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Users, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Alert } from "@/components/ui";
import { ReportButton } from "@/components/report-button";
import { CoachingRequestForm } from "@/components/coaching-forms";
import { formatMoney } from "@/lib/utils";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { labelsFor, type CoachingFormatKey } from "@/lib/i18n/labels";
import { coachingCopy } from "@/lib/i18n/pages/coaching";

type Params = Promise<{ slug: string }>;

async function loadOffer(slug: string) {
  return prisma.coachingOffer.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, title: true, description: true, price: true, durationMin: true,
      format: true, disciplines: true, level: true, capacity: true, coverUrl: true,
      minorsAllowed: true, isActive: true, sessionCount: true, ratingAvg: true, ratingCount: true,
      coach: {
        select: {
          id: true, name: true, slug: true, avatarUrl: true, verification: true,
          city: true, bio: true, isFounder: true,
        },
      },
      sessions: {
        where: { rating: { not: null }, review: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 8,
        select: {
          id: true, rating: true, review: true, completedAt: true,
          athlete: { select: { name: true, slug: true, avatarUrl: true } },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [offer, locale] = await Promise.all([safe(() => loadOffer(slug), null), getLocale()]);
  const c = coachingCopy[locale].detail;
  const alternates = await metadataAlternates(`/kocluk/${slug}`);
  if (!offer) return { title: c.notFound, alternates };
  return {
    title: `${offer.title} — ${offer.coach.name}`,
    description: offer.description.slice(0, 155),
    alternates,
    openGraph: {
      title: offer.title,
      description: offer.description.slice(0, 155),
      images: offer.coverUrl ? [offer.coverUrl] : undefined,
    },
  };
}

export default async function CoachingOfferPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [offer, session, locale] = await Promise.all([
    safe(() => loadOffer(slug), null),
    getSession(),
    getLocale(),
  ]);
  if (!offer) notFound();

  const c = coachingCopy[locale].detail;
  const L = labelsFor(locale);
  const isOwnOffer = session?.sub === offer.coach.id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-16 sm:px-6 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          {offer.coverUrl && (
            <div className="relative aspect-video overflow-hidden rounded-2xl">
              <Image
                src={offer.coverUrl}
                alt={offer.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover"
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="red">{L.coachingFormat[offer.format as CoachingFormatKey]}</Badge>
              {offer.disciplines.map((d) => (
                <Badge key={d} tone="neutral">{L.discipline[d]}</Badge>
              ))}
              {offer.level && <Badge tone="neutral">{L.skill[offer.level]}</Badge>}
            </div>

            <h1 className="font-display text-3xl font-black leading-tight">{offer.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Clock className="size-4" /> {c.duration.replace("{minutes}", String(offer.durationMin))}</span>
              <span className="flex items-center gap-1.5"><Users className="size-4" /> {c.sessions.replace("{count}", String(offer.sessionCount))}</span>
              {offer.ratingCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="size-4" /> {offer.ratingAvg} ({offer.ratingCount})
                </span>
              )}
            </div>
          </div>

          <div className="prose-fn whitespace-pre-line text-[15px] leading-relaxed">{offer.description}</div>

          {!offer.minorsAllowed && (
            <Alert tone="neutral">{c.minorsNotAllowed}</Alert>
          )}

          {offer.sessions.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-black">{c.reviews}</h2>
              {offer.sessions.map((s) => (
                <Card key={s.id}>
                  <CardBody className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={s.athlete.avatarUrl} name={s.athlete.name} size="sm" />
                      <Link href={`/dovuscular/${s.athlete.slug}`} className="text-sm font-bold hover:text-blood-500">
                        {s.athlete.name}
                      </Link>
                      <span className="ml-auto text-sm text-gold-500">{"★".repeat(s.rating ?? 0)}</span>
                    </div>
                    <p className="text-sm text-muted">{s.review}</p>
                  </CardBody>
                </Card>
              ))}
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar src={offer.coach.avatarUrl} name={offer.coach.name} size="lg" ring />
                <div className="min-w-0">
                  <Link
                    href={`/dovuscular/${offer.coach.slug}`}
                    className="flex items-center gap-1 font-bold hover:text-blood-500"
                  >
                    <span className="truncate">{offer.coach.name}</span>
                    <VerifiedMark level={offer.coach.verification} />
                  </Link>
                  {offer.coach.city && <p className="text-xs text-muted">{offer.coach.city}</p>}
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 border-t border-[var(--border)] pt-4">
                <span className="font-display text-3xl font-black">{formatMoney(offer.price, "EUR", LOCALE_TAG[locale])}</span>
                <span className="text-sm text-muted">{c.perSession}</span>
              </div>

              {!offer.isActive ? (
                <Alert tone="amber">{c.inactive}</Alert>
              ) : isOwnOffer ? (
                <Alert tone="neutral">{c.ownOffer}</Alert>
              ) : (
                <CoachingRequestForm offerId={offer.id} format={offer.format} authed={Boolean(session)} />
              )}

              <p className="text-xs text-muted">{c.paymentNote}</p>
            </CardBody>
          </Card>

          <ReportButton
            targetType="COACHING_OFFER"
            targetId={offer.id}
            reportedUserId={offer.coach.id}
            authed={Boolean(session)}
          />
        </aside>
      </div>
    </div>
  );
}
