import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe, userCardSelect } from "@/lib/queries";
import { FighterCard } from "@/components/cards";
import { EmptyState, Pagination, Skeleton, Section } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { DISCIPLINES, SKILL_LEVELS, PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dövüşçüler",
  description:
    "DACH bölgesindeki doğrulanmış dövüşçü profillerini keşfet. Disiplin, seviye, şehir ve kilo sınıfına göre filtrele.",
};

export const revalidate = 120;

type SP = Promise<Record<string, string | undefined>>;

export default async function FightersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title="Dövüşçüler"
        subtitle="Amatörden profesyonele — doğrulanmış profiller"
      >
        <FilterBar
          basePath="/dovuscular"
          current={sp}
          filters={[
            {
              key: "discipline",
              label: "Disiplin",
              options: DISCIPLINES.map((d) => ({ value: d.value, label: d.label })),
            },
            {
              key: "level",
              label: "Seviye",
              options: SKILL_LEVELS.map((l) => ({ value: l.value, label: l.label })),
            },
            {
              key: "verified",
              label: "Doğrulama",
              options: [
                { value: "1", label: "Kimlik doğrulanmış" },
                { value: "2", label: "Durum doğrulanmış" },
              ],
            },
            {
              key: "sort",
              label: "Sıralama",
              options: [
                { value: "followers", label: "En popüler" },
                { value: "new", label: "En yeni" },
                { value: "record", label: "En çok galibiyet" },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder="İsim veya kullanıcı adı ara…"
        />

        <Suspense key={JSON.stringify(sp)} fallback={<GridSkeleton />}>
          <FighterResults sp={sp} />
        </Suspense>
      </Section>
    </div>
  );
}

async function FighterResults({ sp }: { sp: Record<string, string | undefined> }) {
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
        title="Dövüşçü bulunamadı"
        description="Filtreleri değiştirerek tekrar dene ya da ilk sen kaydol."
      />
    );
  }

  return (
    <>
      <p className="text-sm text-muted">{total} dövüşçü bulundu</p>
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
