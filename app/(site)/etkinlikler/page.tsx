import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarDays } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe, eventCardSelect } from "@/lib/queries";
import { EventCard } from "@/components/cards";
import { EmptyState, Pagination, Skeleton, Section, ButtonLink } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { DISCIPLINES, PAGE_SIZE, EVENT_TYPE_LABEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description:
    "DACH bölgesindeki dövüş sporu etkinlikleri, turnuvalar ve galalar. Canlı skor ve yorum akışıyla takip et.",
};

export const revalidate = 60;

type SP = Promise<Record<string, string | undefined>>;

export default async function EventsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title="Etkinlik Takvimi"
        subtitle="Yerel ve küresel dövüş sporu etkinlikleri — canlı skorla"
        action={
          <ButtonLink href="/organizator/etkinlikler/yeni" variant="outline" size="sm">
            Etkinlik Ekle
          </ButtonLink>
        }
      >
        <FilterBar
          basePath="/etkinlikler"
          current={sp}
          filters={[
            {
              key: "discipline",
              label: "Disiplin",
              options: DISCIPLINES.map((d) => ({ value: d.value, label: d.label })),
            },
            {
              key: "type",
              label: "Tür",
              options: Object.entries(EVENT_TYPE_LABEL).map(([value, label]) => ({ value, label })),
            },
            {
              key: "status",
              label: "Durum",
              options: [
                { value: "LIVE", label: "Canlı" },
                { value: "PUBLISHED", label: "Yaklaşan" },
                { value: "FINISHED", label: "Tamamlanan" },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder="Etkinlik veya şehir ara…"
        />

        <Suspense key={JSON.stringify(sp)} fallback={<GridSkeleton />}>
          <EventResults sp={sp} />
        </Suspense>
      </Section>
    </div>
  );
}

async function EventResults({ sp }: { sp: Record<string, string | undefined> }) {
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const q = sp.q?.trim();
  const now = new Date();

  const where: Prisma.EventWhereInput = {};

  if (sp.status === "LIVE") where.status = "LIVE";
  else if (sp.status === "FINISHED") where.status = "FINISHED";
  else if (sp.status === "PUBLISHED") {
    where.status = "PUBLISHED";
    where.startsAt = { gte: now };
  } else {
    where.status = { in: ["PUBLISHED", "LIVE", "FINISHED"] };
  }

  if (sp.discipline) where.disciplines = { has: sp.discipline as never };
  if (sp.type) where.type = sp.type as never;
  if (sp.city) where.city = { equals: sp.city, mode: "insensitive" };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { venueName: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.EventOrderByWithRelationInput =
    sp.status === "FINISHED" ? { startsAt: "desc" } : { startsAt: "asc" };

  const [events, total] = await Promise.all([
    safe(
      () =>
        prisma.event.findMany({
          where,
          select: eventCardSelect,
          orderBy,
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
      [],
    ),
    safe(() => prisma.event.count({ where }), 0),
  ]);

  if (!events.length) {
    return (
      <EmptyState
        icon={<CalendarDays className="size-10" />}
        title="Etkinlik bulunamadı"
        description="Bu filtrelerle etkinlik yok. Yakında yenileri eklenecek."
      />
    );
  }

  return (
    <>
      <p className="text-sm text-muted">{total} etkinlik</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => (
          <EventCard key={e.id} e={e} priority={i < 3} />
        ))}
      </div>
      <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/etkinlikler" params={sp} />
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  );
}
