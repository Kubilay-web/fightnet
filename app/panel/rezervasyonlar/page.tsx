import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { CalendarCheck, MapPin } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, ButtonLink, Section, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { BOOKING_TYPE_LABEL, BOOKING_STATUS_LABEL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG, type Locale } from "@/lib/i18n/config";
import { panelBookingsCopy } from "@/lib/i18n/pages/panel-bookings";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelBookingsCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const t = panelBookingsCopy[locale].list;

  const bookings = await safe(
    () =>
      prisma.booking.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 50,
        select: {
          id: true, date: true, type: true, status: true, price: true, note: true,
          gym: { select: { name: true, slug: true, city: true, phone: true } },
          class: { select: { name: true, startTime: true, endTime: true } },
        },
      }),
    [],
  );

  const now = Date.now();
  const upcoming = bookings.filter((b) => b.date.getTime() >= now && b.status !== "CANCELLED");
  const past = bookings.filter((b) => b.date.getTime() < now || b.status === "CANCELLED");

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={t.title}
        subtitle={t.subtitle}
        action={
          <ButtonLink href="/salonlar" variant="outline" size="sm">
            {t.findGym}
          </ButtonLink>
        }
      />

      <Section title={t.upcoming}>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck className="size-10" />}
            title={t.emptyTitle}
            description={t.emptyDescription}
            action={
              <ButtonLink href="/salonlar" size="sm" className="mt-2">
                {t.emptyAction}
              </ButtonLink>
            }
          />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {upcoming.map((b) => (
                <BookingRow key={b.id} b={b} locale={locale} />
              ))}
            </ul>
          </Card>
        )}
      </Section>

      {past.length > 0 && (
        <Section title={t.past}>
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {past.map((b) => (
                <BookingRow key={b.id} b={b} locale={locale} muted />
              ))}
            </ul>
          </Card>
        </Section>
      )}
    </div>
  );
}

function BookingRow({
  b,
  locale,
  muted,
}: {
  b: {
    id: string;
    date: Date;
    type: string;
    status: string;
    price: number;
    gym: { name: string; slug: string; city: string; phone: string | null };
    class: { name: string; startTime: string; endTime: string } | null;
  };
  locale: Locale;
  muted?: boolean;
}) {
  return (
    <li className={`flex flex-wrap items-center gap-3 p-4 ${muted ? "opacity-70" : ""}`}>
      <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
        <span className="text-sm font-black leading-none">{b.date.getDate()}</span>
        <span className="text-[10px] font-bold uppercase">
          {b.date.toLocaleDateString(LOCALE_TAG[locale], { month: "short" })}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <Link href={`/salonlar/${b.gym.slug}`} className="truncate font-bold hover:text-blood-500">
          {b.gym.name}
        </Link>
        <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" /> {b.gym.city}
          </span>
          <span>{formatDate(b.date, LOCALE_TAG[locale])}</span>
          {b.class && (
            <span>
              {b.class.name} · {b.class.startTime}–{b.class.endTime}
            </span>
          )}
          {b.price > 0 && <span>{b.price} €</span>}
        </p>
      </div>

      {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
      <div className="flex flex-wrap gap-1.5">
        <Badge>{BOOKING_TYPE_LABEL[b.type]}</Badge>
        <Badge
          tone={
            b.status === "CONFIRMED" || b.status === "ATTENDED"
              ? "green"
              : b.status === "PENDING"
                ? "amber"
                : "neutral"
          }
        >
          {BOOKING_STATUS_LABEL[b.status]}
        </Badge>
      </div>
    </li>
  );
}
