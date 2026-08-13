import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { formatMoney } from "@/lib/utils";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import {
  coachingFormatOptions, disciplineOptions, skillOptions, labelsFor,
  type CoachingFormatKey,
} from "@/lib/i18n/labels";
import { coachingCopy } from "@/lib/i18n/pages/coaching";

export async function generateMetadata(): Promise<Metadata> {
  const c = coachingCopy[await getLocale()].list;
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: await metadataAlternates("/kocluk"),
  };
}

export const revalidate = 300;

type SP = Promise<Record<string, string | undefined>>;

export default async function CoachingListPage({ searchParams }: { searchParams: SP }) {
  const [sp, locale] = await Promise.all([searchParams, getLocale()]);
  const c = coachingCopy[locale].list;
  const L = labelsFor(locale);

  const where: Prisma.CoachingOfferWhereInput = { isActive: true };
  if (sp.discipline) where.disciplines = { has: sp.discipline as never };
  if (sp.format) where.format = sp.format as never;
  if (sp.level) where.level = sp.level as never;

  const offers = await safe(
    () =>
      prisma.coachingOffer.findMany({
        where,
        orderBy: [{ ratingAvg: "desc" }, { sessionCount: "desc" }],
        take: 40,
        select: {
          id: true, slug: true, title: true, description: true, price: true, durationMin: true,
          format: true, disciplines: true, coverUrl: true, ratingAvg: true, ratingCount: true,
          sessionCount: true,
          coach: { select: { name: true, slug: true, avatarUrl: true, verification: true, city: true } },
        },
      }),
    [],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-16 sm:px-6 sm:py-12">
      <Section title={c.title} subtitle={c.subtitle} />

      <div className="mt-4">
        <FilterBar
          basePath="/kocluk"
          current={sp}
          filters={[
            {
              key: "discipline",
              label: c.filterDiscipline,
              options: disciplineOptions(locale),
            },
            {
              key: "format",
              label: c.filterFormat,
              options: coachingFormatOptions(locale),
            },
            {
              key: "level",
              label: c.filterLevel,
              options: skillOptions(locale),
            },
          ]}
        />
      </div>

      {offers.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={c.emptyTitle}
            description={c.emptyBody}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <Card key={o.id} hover>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Avatar src={o.coach.avatarUrl} name={o.coach.name} size="sm" />
                  <div className="min-w-0">
                    <span className="flex items-center gap-1 text-sm font-bold">
                      <span className="truncate">{o.coach.name}</span>
                      <VerifiedMark level={o.coach.verification} />
                    </span>
                    {o.coach.city && <span className="text-xs text-muted">{o.coach.city}</span>}
                  </div>
                </div>

                <Link href={`/kocluk/${o.slug}`} className="font-display text-lg font-black leading-tight hover:text-blood-500">
                  {o.title}
                </Link>
                <p className="line-clamp-2-safe text-sm text-muted">{o.description}</p>

                <div className="flex flex-wrap gap-1">
                  <Badge tone="red">{L.coachingFormat[o.format as CoachingFormatKey]}</Badge>
                  {o.disciplines.slice(0, 3).map((d) => (
                    <Badge key={d} tone="neutral">{L.discipline[d]}</Badge>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <span className="text-sm text-muted">
                    {c.duration.replace("{minutes}", String(o.durationMin))}
                    {o.ratingCount > 0 && ` · ★ ${o.ratingAvg}`}
                  </span>
                  <span className="font-black tabular-nums">{formatMoney(o.price, "EUR", LOCALE_TAG[locale])}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
