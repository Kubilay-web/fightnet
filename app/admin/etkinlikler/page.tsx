import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Radio, Check, X } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { setEventStatus } from "@/app/admin/actions";
import { Badge, Card, Section, EmptyState, Button, LiveBadge, Pagination } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { formatDateTime } from "@/lib/utils";
import { EVENT_TYPE_LABEL, PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = { title: "Etkinlikler", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function AdminEventsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where: Prisma.EventWhereInput = {};
  if (sp.status) where.status = sp.status as never;
  if (sp.q) where.title = { contains: sp.q, mode: "insensitive" };

  const [events, total] = await Promise.all([
    safe(
      () =>
        prisma.event.findMany({
          where,
          orderBy: { startsAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true, slug: true, title: true, status: true, type: true,
            startsAt: true, city: true, viewCount: true,
            organizer: { select: { name: true, slug: true } },
            _count: { select: { fights: true, liveComments: true } },
          },
        }),
      [],
    ),
    safe(() => prisma.event.count({ where }), 0),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Etkinlikler" subtitle={`${total} etkinlik — yayın durumu ve canlı skor kontrolü`}>
        <FilterBar
          basePath="/admin/etkinlikler"
          current={sp}
          filters={[
            {
              key: "status",
              label: "Durum",
              options: [
                { value: "DRAFT", label: "Taslak" },
                { value: "PUBLISHED", label: "Yayında" },
                { value: "LIVE", label: "Canlı" },
                { value: "FINISHED", label: "Tamamlandı" },
                { value: "CANCELLED", label: "İptal" },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder="Etkinlik ara…"
        />
      </Section>

      {events.length === 0 ? (
        <EmptyState icon={<CalendarDays className="size-10" />} title="Etkinlik bulunamadı" />
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <Card key={e.id}>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <Link href={`/etkinlikler/${e.slug}`} target="_blank" className="font-bold hover:text-blood-500">
                        {e.title}
                      </Link>
                      {e.status === "LIVE" ? <LiveBadge /> : <Badge>{e.status}</Badge>}
                      <Badge tone="red">{EVENT_TYPE_LABEL[e.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted">
                      {formatDateTime(e.startsAt)} · {e.city} · {e.organizer.name}
                    </p>
                    <p className="text-xs text-muted">
                      {e._count.fights} müsabaka · {e._count.liveComments} canlı yorum · {e.viewCount} görüntülenme
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                  {e.status !== "PUBLISHED" && (
                    <form action={setEventStatus.bind(null, e.id, "PUBLISHED")}>
                      <Button type="submit" size="sm">
                        <Check className="size-4" /> Yayınla
                      </Button>
                    </form>
                  )}
                  {e.status !== "LIVE" && (
                    <form action={setEventStatus.bind(null, e.id, "LIVE")}>
                      <Button type="submit" size="sm" variant="danger">
                        <Radio className="size-4" /> Canlıya Al
                      </Button>
                    </form>
                  )}
                  {e.status === "LIVE" && (
                    <form action={setEventStatus.bind(null, e.id, "FINISHED")}>
                      <Button type="submit" size="sm" variant="outline">
                        Bitir
                      </Button>
                    </form>
                  )}
                  <form action={setEventStatus.bind(null, e.id, "CANCELLED")}>
                    <Button type="submit" size="sm" variant="outline">
                      <X className="size-4" /> İptal
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/etkinlikler" params={sp} />
    </div>
  );
}
