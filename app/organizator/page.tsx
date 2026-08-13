import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { CalendarDays, Plus, Settings, Radio } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, EmptyState, ButtonLink, LiveBadge, Stat, Alert } from "@/components/ui";
import { formatDateTime, compact } from "@/lib/utils";
import { EVENT_TYPE_LABEL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { organizerCopy } from "@/lib/i18n/pages/organizer";

export async function generateMetadata(): Promise<Metadata> {
  const copy = organizerCopy[await getLocale()].index;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function OrganizerPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const t = organizerCopy[locale].index;

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
        title={t.title}
        subtitle={t.subtitle}
        action={
          <ButtonLink href="/organizator/etkinlikler/yeni" size="sm">
            <Plus className="size-4" /> {t.addEvent}
          </ButtonLink>
        }
      />

      {user.role !== "ORGANIZER" && user.role !== "GYM_OWNER" && user.role !== "ADMIN" && (
        <Alert tone="amber" title={t.roleAlert.title}>
          {t.roleAlert.body}{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">
            {t.roleAlert.cta}
          </Link>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Stat label={t.stats.total} value={events.length} />
        <Stat label={t.stats.live} value={live} tone={live ? "red" : "neutral"} />
        <Stat label={t.stats.upcoming} value={upcoming} />
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-10" />}
          title={t.empty.title}
          description={t.empty.description}
          action={
            <ButtonLink href="/organizator/etkinlikler/yeni" size="sm" className="mt-2">
              {t.empty.action}
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
                    {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                    <Badge tone="red">{EVENT_TYPE_LABEL[e.type]}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {formatDateTime(e.startsAt, LOCALE_TAG[locale])} · {e.city} · {e._count.fights} {t.fights} ·{" "}
                    {e._count.liveComments} {t.comments} · {compact(e.viewCount)} {t.views}
                  </p>
                </div>

                <div className="flex gap-2">
                  <ButtonLink href={`/etkinlikler/${e.slug}`} target="_blank" size="sm" variant="ghost">
                    {t.view}
                  </ButtonLink>
                  <ButtonLink href={`/organizator/${e.id}`} size="sm" variant="outline">
                    <Settings className="size-4" /> {t.manage}
                  </ButtonLink>
                  {e.status === "LIVE" && (
                    <ButtonLink href={`/organizator/${e.id}#canli`} size="sm" variant="danger">
                      <Radio className="size-4" /> {t.live}
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
