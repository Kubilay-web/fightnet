import type { Metadata } from "next";
import { Suspense } from "react";
import { Link } from "@/components/i18n/link";
import { Swords, MapPin, Weight, Clock } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, EmptyState, Pagination, Skeleton, Section, ButtonLink, Alert } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { SparringRequestButton } from "@/components/sparring-request";
import { PAGE_SIZE } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import {
  disciplineOptions, skillOptions, sparringIntensityOptions, labelsFor,
  type AvailabilitySlotKey, type SparringIntensityKey,
} from "@/lib/i18n/labels";
import { sparringCopy } from "@/lib/i18n/pages/sparring";

export async function generateMetadata(): Promise<Metadata> {
  const c = sparringCopy[await getLocale()];
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: await metadataAlternates("/sparring"),
  };
}

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function SparringPage({ searchParams }: { searchParams: SP }) {
  const [sp, session, locale] = await Promise.all([searchParams, getSession(), getLocale()]);
  const c = sparringCopy[locale];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title={c.title}
        subtitle={c.subtitle}
        action={
          <ButtonLink href="/panel/sparring/yeni" size="sm">
            <Swords className="size-4" /> {c.createListing}
          </ButtonLink>
        }
      >
        {/* §11.2 — Sparring güvenliği kapısı */}
        <Alert tone="amber" title={c.safetyTitle}>
          {c.safetyBody}{" "}
          <Link href="/sparring-sozlesmesi" className="font-bold underline">
            {c.safetyLink}
          </Link>
        </Alert>

        <FilterBar
          basePath="/sparring"
          current={sp}
          filters={[
            { key: "discipline", label: c.filterDiscipline, options: disciplineOptions(locale) },
            { key: "level", label: c.filterLevel, options: skillOptions(locale) },
            { key: "intensity", label: c.filterIntensity, options: sparringIntensityOptions(locale) },
            {
              key: "weight",
              label: c.filterWeight,
              options: [
                { value: "0-65", label: c.weightUnder65 },
                { value: "65-80", label: c.weight65to80 },
                { value: "80-95", label: c.weight80to95 },
                { value: "95-200", label: c.weightOver95 },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder={c.searchPlaceholder}
        />

        <Suspense key={JSON.stringify(sp)} fallback={<ListSkeleton />}>
          <SparringResults sp={sp} viewerId={session?.sub} authed={!!session} verified={session?.verification} />
        </Suspense>
      </Section>
    </div>
  );
}

async function SparringResults({
  sp,
  viewerId,
  authed,
  verified,
}: {
  sp: Record<string, string | undefined>;
  viewerId?: string;
  authed: boolean;
  verified?: string;
}) {
  const locale = await getLocale();
  const c = sparringCopy[locale];
  const L = labelsFor(locale);
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const q = sp.q?.trim();

  const where: Prisma.SparringListingWhereInput = { status: "OPEN" };
  if (sp.discipline) where.discipline = sp.discipline as never;
  if (sp.level) where.level = sp.level as never;
  if (sp.intensity) where.intensity = sp.intensity;
  if (q) {
    where.OR = [
      { city: { contains: q, mode: "insensitive" } },
      { postalCode: { startsWith: q } },
    ];
  }
  if (sp.weight) {
    const [min, max] = sp.weight.split("-").map(Number);
    where.weightKg = { gte: min, lte: max };
  }

  const [listings, total] = await Promise.all([
    safe(
      () =>
        prisma.sparringListing.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true, discipline: true, level: true, weightKg: true, weightTolerance: true,
            city: true, postalCode: true, radiusKm: true, availability: true,
            intensity: true, note: true, createdAt: true,
            user: {
              select: {
                id: true, name: true, slug: true, avatarUrl: true, verification: true,
                city: true, isFounder: true,
                sportProfiles: {
                  select: { discipline: true, level: true, wins: true, losses: true, draws: true },
                  take: 2,
                },
              },
            },
            requests: viewerId ? { where: { senderId: viewerId }, select: { id: true, status: true } } : false,
          },
        }),
      [],
    ),
    safe(() => prisma.sparringListing.count({ where }), 0),
  ]);

  if (!listings.length) {
    return (
      <EmptyState
        icon={<Swords className="size-10" />}
        title={c.emptyTitle}
        description={c.emptyBody}
        action={
          <ButtonLink href="/panel/sparring/yeni" size="sm" className="mt-2">
            {c.createListing}
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <p className="text-sm text-muted">{c.resultCount.replace("{count}", String(total))}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {listings.map((l) => {
          const existing = Array.isArray(l.requests) ? l.requests[0] : undefined;
          const isOwn = l.user.id === viewerId;
          const intensityKey = l.intensity as SparringIntensityKey | null;
          return (
            <Card key={l.id} hover>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Avatar src={l.user.avatarUrl} name={l.user.name} size="lg" href={`/dovuscular/${l.user.slug}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <Link href={`/dovuscular/${l.user.slug}`} className="truncate font-bold hover:text-blood-500">
                        {l.user.name}
                      </Link>
                      <VerifiedMark level={l.user.verification} />
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <MapPin className="size-3.5" />
                      {l.city}
                      {l.postalCode && ` ${l.postalCode}`} · {c.radius.replace("{km}", String(l.radiusKm))}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted">{timeAgo(l.createdAt, locale)}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="red">{L.discipline[l.discipline]}</Badge>
                  <Badge>{L.skill[l.level]}</Badge>
                  {intensityKey && (
                    <Badge tone={intensityKey === "HARD" ? "red" : intensityKey === "LIGHT" ? "green" : "amber"}>
                      {L.sparringIntensity[intensityKey]}
                    </Badge>
                  )}
                  {l.weightKg && (
                    <Badge tone="blue">
                      <Weight className="size-3" /> {l.weightKg} ±{l.weightTolerance} kg
                    </Badge>
                  )}
                </div>

                {l.availability.length > 0 && (
                  <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <Clock className="size-3.5 shrink-0" />
                    {l.availability
                      .map((a) => L.availabilitySlot[a as AvailabilitySlotKey] ?? a)
                      .join(" · ")}
                  </p>
                )}

                {l.note && <p className="text-sm text-muted">{l.note}</p>}

                <div className="flex items-center gap-2 border-t border-[var(--border)] pt-3">
                  {isOwn ? (
                    <span className="text-xs text-muted">{c.ownListing}</span>
                  ) : existing ? (
                    <Badge tone={existing.status === "ACCEPTED" ? "green" : "neutral"}>
                      {existing.status === "PENDING" ? c.requestSent : existing.status === "ACCEPTED" ? c.requestAccepted : c.requestRejected}
                    </Badge>
                  ) : (
                    <SparringRequestButton
                      listingId={l.id}
                      authed={authed}
                      canRequest={verified !== "LEVEL_0"}
                      partnerName={l.user.name}
                    />
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
      <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/sparring" params={sp} />
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-56" />
      ))}
    </div>
  );
}
