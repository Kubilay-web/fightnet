import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe, userCardSelect } from "@/lib/queries";
import { FighterCard } from "@/components/cards";
import { EmptyState, Pagination, Skeleton, Section } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { PAGE_SIZE } from "@/lib/constants";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { disciplineOptions, skillOptions } from "@/lib/i18n/labels";
import { fightersCopy } from "@/lib/i18n/pages/fighters";

export async function generateMetadata(): Promise<Metadata> {
  const c = fightersCopy[await getLocale()].list;
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: await metadataAlternates("/dovuscular"),
  };
}

export const revalidate = 120;

type SP = Promise<Record<string, string | undefined>>;

export default async function FightersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const c = fightersCopy[locale].list;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title={c.title}
        subtitle={c.subtitle}
      >
        <FilterBar
          basePath="/dovuscular"
          current={sp}
          filters={[
            {
              key: "discipline",
              label: c.filterDiscipline,
              options: disciplineOptions(locale),
            },
            {
              key: "level",
              label: c.filterLevel,
              options: skillOptions(locale),
            },
            {
              key: "verified",
              label: c.filterVerification,
              options: [
                { value: "1", label: c.verifiedIdentity },
                { value: "2", label: c.verifiedStatus },
              ],
            },
            {
              key: "sort",
              label: c.filterSort,
              options: [
                { value: "followers", label: c.sortPopular },
                { value: "new", label: c.sortNew },
                { value: "record", label: c.sortWins },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder={c.searchPlaceholder}
        />

        <Suspense key={JSON.stringify(sp)} fallback={<GridSkeleton />}>
          <FighterResults sp={sp} />
        </Suspense>
      </Section>
    </div>
  );
}

async function FighterResults({ sp }: { sp: Record<string, string | undefined> }) {
  const c = fightersCopy[await getLocale()].list;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const q = sp.q?.trim();

  const where: Prisma.UserWhereInput = {
    isActive: true,
    isBanned: false,
    visibility: "PUBLIC",
  };

  if (sp.verified === "1") where.verification = { in: ["LEVEL_1", "LEVEL_2"] };
  if (sp.verified === "2") where.verification = "LEVEL_2";

  if (sp.discipline || sp.level) {
    where.sportProfiles = {
      some: {
        ...(sp.discipline ? { discipline: sp.discipline as never } : {}),
        ...(sp.level ? { level: sp.level as never } : {}),
      },
    };
  }

  if (sp.city) where.city = { equals: sp.city, mode: "insensitive" };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { username: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.UserOrderByWithRelationInput =
    sp.sort === "new" ? { createdAt: "desc" } : { followerCount: "desc" };

  const [fighters, total] = await Promise.all([
    safe(
      () =>
        prisma.user.findMany({
          where,
          select: userCardSelect,
          orderBy,
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
      [],
    ),
    safe(() => prisma.user.count({ where }), 0),
  ]);

  if (!fighters.length) {
    return (
      <EmptyState
        icon={<Users className="size-10" />}
        title={c.emptyTitle}
        description={c.emptyBody}
      />
    );
  }

  return (
    <>
      <p className="text-sm text-muted">{c.resultCount.replace("{count}", String(total))}</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {fighters.map((f, i) => (
          <FighterCard key={f.id} f={f} priority={i < 4} />
        ))}
      </div>
      <Pagination
        page={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        basePath="/dovuscular"
        params={sp}
      />
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  );
}
