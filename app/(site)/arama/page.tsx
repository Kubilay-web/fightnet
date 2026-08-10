import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Search, Users, Building2, CalendarDays, MessageSquare } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe, userCardSelect, gymCardSelect, eventCardSelect } from "@/lib/queries";
import { FighterCard, GymCard, EventCard } from "@/components/cards";
import { Card, Section, EmptyState, Skeleton } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Arama",
  description: "FIGHTNET'te dövüşçü, salon, etkinlik ve forum konusu ara.",
};

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section title="Arama" subtitle="Dövüşçü, salon, etkinlik ve forum konularında ara">
        <FilterBar
          basePath="/arama"
          current={sp}
          filters={[]}
          searchKey="q"
          searchPlaceholder="Ne arıyorsun?"
        />

        {!sp.q ? (
          <EmptyState
            icon={<Search className="size-10" />}
            title="Aramaya başla"
            description="İsim, şehir, salon veya etkinlik adı yazabilirsin."
          />
        ) : (
          <Suspense key={sp.q} fallback={<Skeleton className="h-64" />}>
            <SearchResults q={sp.q} />
          </Suspense>
        )}
      </Section>
    </div>
  );
}

async function SearchResults({ q }: { q: string }) {
  const term = q.trim();

  const data = await safe(
    async () => {
      const [fighters, gyms, events, threads] = await Promise.all([
        prisma.user.findMany({
          where: {
            isActive: true, isBanned: false, visibility: "PUBLIC",
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { username: { contains: term, mode: "insensitive" } },
              { city: { contains: term, mode: "insensitive" } },
            ],
          },
          select: userCardSelect,
          orderBy: { followerCount: "desc" },
          take: 8,
        }),
        prisma.gym.findMany({
          where: {
            status: "ACTIVE",
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { city: { contains: term, mode: "insensitive" } },
            ],
          },
          select: gymCardSelect,
          take: 6,
        }),
        prisma.event.findMany({
          where: {
            status: { in: ["PUBLISHED", "LIVE", "FINISHED"] },
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { city: { contains: term, mode: "insensitive" } },
              { venueName: { contains: term, mode: "insensitive" } },
            ],
          },
          select: eventCardSelect,
          orderBy: { startsAt: "desc" },
          take: 6,
        }),
        prisma.forumThread.findMany({
          where: {
            moderation: "APPROVED",
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { body: { contains: term, mode: "insensitive" } },
            ],
          },
          select: {
            id: true, slug: true, title: true, replyCount: true, lastPostAt: true,
            category: { select: { name: true } },
          },
          orderBy: { lastPostAt: "desc" },
          take: 8,
        }),
      ]);
      return { fighters, gyms, events, threads };
    },
    { fighters: [], gyms: [], events: [], threads: [] },
  );

  const totalResults =
    data.fighters.length + data.gyms.length + data.events.length + data.threads.length;

  if (totalResults === 0) {
    return (
      <EmptyState
        icon={<Search className="size-10" />}
        title={`"${term}" için sonuç yok`}
        description="Farklı bir arama terimi dene."
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {data.fighters.length > 0 && (
        <Section title="Dövüşçüler">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {data.fighters.map((f) => (
              <FighterCard key={f.id} f={f} />
            ))}
          </div>
        </Section>
      )}

      {data.gyms.length > 0 && (
        <Section title="Salonlar">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.gyms.map((g) => (
              <GymCard key={g.id} g={g} />
            ))}
          </div>
        </Section>
      )}

      {data.events.length > 0 && (
        <Section title="Etkinlikler">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.events.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        </Section>
      )}

      {data.threads.length > 0 && (
        <Section title="Forum Konuları">
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/forum/${t.slug}`}
                    className="flex items-center gap-3 p-3 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{t.title}</p>
                      <p className="text-xs text-muted">
                        {t.category.name} · {t.replyCount} yanıt · {timeAgo(t.lastPostAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}
    </div>
  );
}
