import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, MapPin } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, ButtonLink, Section, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { BOOKING_TYPE_LABEL, BOOKING_STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Rezervasyonlarım", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const user = await requireUser();

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
        title="Rezervasyonlarım"
        subtitle="Deneme antrenmanları, drop-in ve ders kayıtların"
        action={
          <ButtonLink href="/salonlar" variant="outline" size="sm">
            Salon Bul
          </ButtonLink>
        }
      />

      <Section title="Yaklaşan">
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck className="size-10" />}
            title="Yaklaşan rezervasyon yok"
            description="Bölgendeki salonlarda ücretsiz deneme antrenmanı ayarla."
            action={
              <ButtonLink href="/salonlar" size="sm" className="mt-2">
                Salon Bulucu
              </ButtonLink>
            }
          />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {upcoming.map((b) => (
                <BookingRow key={b.id} b={b} />
              ))}
            </ul>
          </Card>
        )}
      </Section>

      {past.length > 0 && (
        <Section title="Geçmiş">
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {past.map((b) => (
                <BookingRow key={b.id} b={b} muted />
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
  muted?: boolean;
}) {
  return (
    <li className={`flex flex-wrap items-center gap-3 p-4 ${muted ? "opacity-70" : ""}`}>
      <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
        <span className="text-sm font-black leading-none">{b.date.getDate()}</span>
        <span className="text-[10px] font-bold uppercase">
          {b.date.toLocaleDateString("tr-TR", { month: "short" })}
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
          <span>{formatDate(b.date)}</span>
          {b.class && (
            <span>
              {b.class.name} · {b.class.startTime}–{b.class.endTime}
            </span>
          )}
          {b.price > 0 && <span>{b.price} €</span>}
        </p>
      </div>

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
