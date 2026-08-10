import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Plus, Settings, Radio } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, EmptyState, ButtonLink, LiveBadge, Stat, Alert } from "@/components/ui";
import { formatDateTime, compact } from "@/lib/utils";
import { EVENT_TYPE_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Etkinliklerim", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrganizerPage() {
  const user = await requireUser();

  const events = await safe(
    () =>
      prisma.event.findMany({
        where: user.role === "ADMIN" ? {} : { organizerId: user.id },
        orderBy: { startsAt: "desc" },
        take: 50,
        select: {
          id: true, slug: true, title: true, status: true, type: true,
          startsAt: true, city: true, viewCount: true,
          _count: { select: { fights: true, liveComments: true } },
        },
      }),
    [],
  );

  const live = events.filter((e) => e.status === "LIVE").length;
  const upcoming = events.filter((e) => e.status === "PUBLISHED" && e.startsAt > new Date()).length;

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Etkinliklerim"
        subtitle="Etkinlik oluştur, dövüş kartını hazırla, canlı skoru yönet"
        action={
          <ButtonLink href="/organizator/etkinlikler/yeni" size="sm">
            <Plus className="size-4" /> Etkinlik Ekle
          </ButtonLink>
        }
      />

      {user.role !== "ORGANIZER" && user.role !== "GYM_OWNER" && user.role !== "ADMIN" && (
        <Alert tone="amber" title="Organizatör rolü gerekli">
          Etkinlik oluşturmak için Seviye 2 doğrulaması ile Organizatör rolüne geçmelisin.{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">
            Doğrulamayı başlat
          </Link>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Toplam" value={events.length} />
        <Stat label="Canlı" value={live} tone={live ? "red" : "neutral"} />
        <Stat label="Yaklaşan" value={upcoming} />
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-10" />}
          title="Etkinliğin yok"
          description="İlk etkinliğini oluştur — dövüş kartı, bilet ve canlı skor tek yerde."
          action={
            <ButtonLink href="/organizator/etkinlikler/yeni" size="sm" className="mt-2">
              Etkinlik Ekle
            </ButtonLink>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <Card key={e.id}>
              <CardBody className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <h3 className="min-w-0 max-w-full truncate font-bold">{e.title}</h3>
                    {e.status === "LIVE" ? <LiveBadge /> : <Badge>{e.status}</Badge>}
                    <Badge tone="red">{EVENT_TYPE_LABEL[e.type]}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {formatDateTime(e.startsAt)} · {e.city} · {e._count.fights} müsabaka ·{" "}
                    {e._count.liveComments} yorum · {compact(e.viewCount)} görüntülenme
                  </p>
                </div>

                <div className="flex gap-2">
                  <ButtonLink href={`/etkinlikler/${e.slug}`} target="_blank" size="sm" variant="ghost">
                    Gör
                  </ButtonLink>
                  <ButtonLink href={`/organizator/${e.id}`} size="sm" variant="outline">
                    <Settings className="size-4" /> Yönet
                  </ButtonLink>
                  {e.status === "LIVE" && (
                    <ButtonLink href={`/organizator/${e.id}#canli`} size="sm" variant="danger">
                      <Radio className="size-4" /> Canlı
                    </ButtonLink>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
