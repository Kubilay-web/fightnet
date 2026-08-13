import type { Metadata } from "next";
import { Suspense } from "react";
import { Compass } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe, postCardSelect } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { PostCard } from "@/components/cards";
import { EmptyState, Pagination, Skeleton, Section, ButtonLink } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { disciplineOptions } from "@/lib/i18n/labels";
import { feedCopy } from "@/lib/i18n/pages/feed";

export async function generateMetadata(): Promise<Metadata> {
  const c = feedCopy[await getLocale()].list;
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: await metadataAlternates("/akis"),
  };
}

export const revalidate = 30;

type SP = Promise<Record<string, string | undefined>>;

export default async function FeedPage({ searchParams }: { searchParams: SP }) {
  const [sp, session, locale] = await Promise.all([searchParams, getSession(), getLocale()]);
  const c = feedCopy[locale].list;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title={c.title}
        subtitle={c.subtitle}
        action={
          session ? (
            <ButtonLink href="/panel/gonderi/yeni" size="sm">
              {c.share}
            </ButtonLink>
          ) : (
            <ButtonLink href="/kayit" size="sm">
              {c.joinAndShare}
            </ButtonLink>
          )
        }
      >
        <FilterBar
          basePath="/akis"
          current={sp}
          filters={[
            { key: "discipline", label: c.filterDiscipline, options: disciplineOptions(locale) },
            {
              key: "type",
              label: c.filterType,
              options: [
                { value: "VIDEO", label: c.typeVideo },
                { value: "IMAGE", label: c.typeImage },
                { value: "TEXT", label: c.typeText },
              ],
            },
            {
              key: "sort",
              label: c.filterSort,
              options: [
                { value: "new", label: c.sortNew },
                { value: "top", label: c.sortTop },
                { value: "trending", label: c.sortTrending },
              ],
            },
          ]}
        />

        <Suspense key={JSON.stringify(sp)} fallback={<GridSkeleton />}>
          <FeedResults sp={sp} />
        </Suspense>
      </Section>
    </div>
  );
}

async function FeedResults({ sp }: { sp: Record<string, string | undefined> }) {
  const c = feedCopy[await getLocale()].list;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where: Prisma.PostWhereInput = { visibility: "PUBLIC", moderation: "APPROVED" };
  if (sp.discipline) where.discipline = sp.discipline as never;
  if (sp.type) where.type = sp.type as never;

  const orderBy: Prisma.PostOrderByWithRelationInput =
    sp.sort === "top" ? { likeCount: "desc" } : sp.sort === "trending" ? { score: "desc" } : { createdAt: "desc" };

  const [posts, total] = await Promise.all([
    safe(
      () =>
        prisma.post.findMany({
          where,
          select: postCardSelect,
          orderBy,
          skip: (page - 1) * FEED_PAGE_SIZE,
          take: FEED_PAGE_SIZE,
        }),
      [],
    ),
    safe(() => prisma.post.count({ where }), 0),
  ]);

  if (!posts.length) {
    return (
      <EmptyState
        icon={<Compass className="size-10" />}
        title={c.emptyTitle}
        description={c.emptyBody}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {posts.map((p, i) => (
          <PostCard key={p.id} p={p} priority={i < 4} />
        ))}
      </div>
      <Pagination page={page} totalPages={Math.ceil(total / FEED_PAGE_SIZE)} basePath="/akis" params={sp} />
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  );
}
