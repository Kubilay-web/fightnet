import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2, Map } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe, gymCardSelect } from "@/lib/queries";
import { GymCard } from "@/components/cards";
import { EmptyState, Pagination, Skeleton, Section, ButtonLink } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { PAGE_SIZE, TARGET_CITIES } from "@/lib/constants";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { disciplineOptions } from "@/lib/i18n/labels";
import { gymsCopy } from "@/lib/i18n/pages/gyms";

export async function generateMetadata(): Promise<Metadata> {
  const c = gymsCopy[await getLocale()].list;
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: await metadataAlternates("/salonlar"),
  };
}

export const revalidate = 180;

type SP = Promise<Record<string, string | undefined>>;

export default async function GymsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const c = gymsCopy[locale].list;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title={c.title}
        subtitle={c.subtitle}
        action={
          <ButtonLink href="/harita" variant="outline" size="sm">
            <Map className="size-4" /> {c.mapCta}
          </ButtonLink>
        }
      >
        <FilterBar
          basePath="/salonlar"
          current={sp}
          filters={[
            {
              key: "discipline",
              label: c.filterDiscipline,
              options: disciplineOptions(locale),
            },
            {
              key: "city",
              label: c.filterCity,
              options: TARGET_CITIES.map((city) => ({ value: city, label: city })),
            },
            {
              key: "trial",
              label: c.filterTrial,
              options: [{ value: "1", label: c.trialAvailable }],
            },
            {
              key: "sort",
              label: c.filterSort,
              options: [
                { value: "members", label: c.sortMembers },
                { value: "rating", label: c.sortRating },
                { value: "new", label: c.sortNew },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder={c.searchPlaceholder}
        />

        <Suspense key={JSON.stringify(sp)} fallback={<GridSkeleton />}>
          <GymResults sp={sp} />
        </Suspense>
      </Section>
    </div>
  );
}

async function GymResults({ sp }: { sp: Record<string, string | undefined> }) {
  const c = gymsCopy[await getLocale()].list;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const q = sp.q?.trim();

  const where: Prisma.GymWhereInput = { status: "ACTIVE" };
  if (sp.discipline) where.disciplines = { has: sp.discipline as never };
  if (sp.city) where.city = { equals: sp.city, mode: "insensitive" };
  if (sp.trial === "1") where.trialEnabled = true;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { postalCode: { startsWith: q } },
    ];
  }

  const orderBy: Prisma.GymOrderByWithRelationInput[] =
    sp.sort === "rating"
      ? [{ ratingAvg: "desc" }, { ratingCount: "desc" }]
      : sp.sort === "new"
        ? [{ createdAt: "desc" }]
        : [{ isHalo: "desc" }, { isFounder: "desc" }, { memberCount: "desc" }];

  const [gyms, total] = await Promise.all([
    safe(
      () =>
        prisma.gym.findMany({
          where,
          select: gymCardSelect,
          orderBy,
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
      [],
    ),
    safe(() => prisma.gym.count({ where }), 0),
  ]);

  if (!gyms.length) {
    return (
      <EmptyState
        icon={<Building2 className="size-10" />}
        title={c.emptyTitle}
        description={c.emptyBody}
        action={
          <ButtonLink href="/salonlar-icin" size="sm" className="mt-2">
            {c.emptyCta}
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <p className="text-sm text-muted">{c.resultCount.replace("{count}", String(total))}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gyms.map((g, i) => (
          <GymCard key={g.id} g={g} priority={i < 3} />
        ))}
      </div>
      <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/salonlar" params={sp} />
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-72" />
      ))}
    </div>
  );
}
