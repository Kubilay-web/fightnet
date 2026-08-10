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
import { DISCIPLINES, FEED_PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Keşfet",
  description: "Topluluktan antrenman videoları, teknik anlatımları ve müsabaka anları.",
};

export const revalidate = 30;

type SP = Promise<Record<string, string | undefined>>;

export default async function FeedPage({ searchParams }: { searchParams: SP }) {
  const [sp, session] = await Promise.all([searchParams, getSession()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title="Keşfet"
        subtitle="Topluluğun en yeni içerikleri — küratörlü akış"
        action={
          session ? (
            <ButtonLink href="/panel/gonderi/yeni" size="sm">
              Paylaş
            </ButtonLink>
          ) : (
            <ButtonLink href="/kayit" size="sm">
              Katıl ve Paylaş
            </ButtonLink>
          )
        }
      >
        <FilterBar
          basePath="/akis"
          current={sp}
          filters={[
            { key: "discipline", label: "Disiplin", options: DISCIPLINES.map((d) => ({ value: d.value, label: d.label })) },
            {
              key: "type",
              label: "Tür",
              options: [
                { value: "VIDEO", label: "Video" },
                { value: "IMAGE", label: "Görsel" },
                { value: "TEXT", label: "Metin" },
              ],
            },
            {
              key: "sort",
              label: "Sıralama",
              options: [
                { value: "new", label: "En yeni" },
                { value: "top", label: "En popüler" },
                { value: "trending", label: "Yükselen" },
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
        title="Henüz içerik yok"
        description="İlk paylaşımı sen yap ve topluluğu başlat."
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
