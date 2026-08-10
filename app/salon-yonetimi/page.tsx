import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Building2, Users, CalendarCheck, Plus, Settings } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { setBookingStatus } from "@/app/salon-yonetimi/actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState, ButtonLink, Button, Alert, Stat } from "@/components/ui";
import { cld } from "@/lib/image";
import { formatDate, timeAgo } from "@/lib/utils";
import { BOOKING_TYPE_LABEL, BOOKING_STATUS_LABEL, DISCIPLINE_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Salon Yönetimi", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function GymAdminPage() {
  const user = await requireUser();

  const data = await safe(
    async () => {
      const gyms = await prisma.gym.findMany({
        where: user.role === "ADMIN" ? {} : { ownerId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, slug: true, name: true, city: true, status: true, logoUrl: true,
          isVerified: true, isFounder: true, disciplines: true, memberCount: true, plan: true,
          _count: { select: { memberships: true, classes: true, bookings: true } },
        },
      });

      const gymIds = gyms.map((g) => g.id);
      const bookings = gymIds.length
        ? await prisma.booking.findMany({
            where: { gymId: { in: gymIds }, status: { in: ["PENDING", "CONFIRMED"] } },
            orderBy: { date: "asc" },
            take: 30,
            select: {
              id: true, date: true, type: true, status: true, experience: true, goals: true,
              contactPhone: true, createdAt: true,
              gym: { select: { name: true } },
              user: { select: { name: true, slug: true, avatarUrl: true, verification: true } },
              class: { select: { name: true, startTime: true } },
            },
          })
        : [];

      return { gyms, bookings };
    },
    { gyms: [], bookings: [] },
  );

  const pendingBookings = data.bookings.filter((b) => b.status === "PENDING");

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Salon Yönetimi"
        subtitle="Salonların, ders programın ve rezervasyon talepleri"
        action={
          <ButtonLink href="/salon-yonetimi/yeni" size="sm">
            <Plus className="size-4" /> Salon Ekle
          </ButtonLink>
        }
      />

      {user.role !== "GYM_OWNER" && user.role !== "ADMIN" && (
        <Alert tone="amber" title="Salon İşletmecisi rolü gerekli">
          Salon eklemek için Seviye 2 doğrulaması ile Salon İşletmecisi rolüne geçmelisin.{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">
            Doğrulamayı başlat
          </Link>
        </Alert>
      )}

      {data.gyms.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-10" />}
          title="Henüz salonun yok"
          description="Salonunu FIGHTNET'e ekle — üyelerin seni bulsun, deneme antrenmanı alsın."
          action={
            <ButtonLink href="/salon-yonetimi/yeni" size="sm" className="mt-2">
              Salonumu Ekle
            </ButtonLink>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Salon" value={data.gyms.length} />
            <Stat label="Toplam üye" value={data.gyms.reduce((s, g) => s + g._count.memberships, 0)} />
            <Stat label="Bekleyen talep" value={pendingBookings.length} tone={pendingBookings.length ? "amber" : "neutral"} />
            <Stat label="Toplam ders" value={data.gyms.reduce((s, g) => s + g._count.classes, 0)} />
          </div>

          <Section title="Salonlarım">
            <div className="grid gap-4 sm:grid-cols-2">
              {data.gyms.map((g) => (
                <Card key={g.id}>
                  <CardBody className="flex items-center gap-3">
                    {g.logoUrl ? (
                      <Image
                        src={cld(g.logoUrl, { w: 112, h: 112 })}
                        alt={g.name}
                        width={56}
                        height={56}
                        className="size-14 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-ink-200 dark:bg-ink-800">
                        <Building2 className="size-6 text-muted" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <h3 className="min-w-0 max-w-full truncate font-bold">{g.name}</h3>
                        <Badge tone={g.status === "ACTIVE" ? "green" : g.status === "PENDING" ? "amber" : "red"}>
                          {g.status === "ACTIVE" ? "Yayında" : g.status === "PENDING" ? "Onay bekliyor" : "Askıda"}
                        </Badge>
                        {g.isFounder && <Badge tone="gold">Kurucu</Badge>}
                      </div>
                      <p className="truncate text-xs text-muted">
                        {g.city} · {g._count.memberships} üye · {g._count.classes} ders · {g._count.bookings} rezervasyon
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {g.disciplines.slice(0, 3).map((d) => (
                          <Badge key={d}>{DISCIPLINE_LABEL[d]}</Badge>
                        ))}
                      </div>
                    </div>
                    <ButtonLink href={`/salon-yonetimi/${g.id}`} size="sm" variant="outline">
                      <Settings className="size-4" />
                    </ButtonLink>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Section>

          {/* Rezervasyon talepleri */}
          <Section title="Rezervasyon Talepleri" subtitle={`${pendingBookings.length} onay bekliyor`}>
            {data.bookings.length === 0 ? (
              <EmptyState icon={<CalendarCheck className="size-8" />} title="Talep yok" />
            ) : (
              <div className="flex flex-col gap-3">
                {data.bookings.map((b) => (
                  <Card key={b.id}>
                    <CardBody className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Avatar src={b.user.avatarUrl} name={b.user.name} size="md" href={`/dovuscular/${b.user.slug}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{b.user.name}</p>
                          <p className="text-xs text-muted">
                            {b.gym.name} · {formatDate(b.date)}
                            {b.class && ` · ${b.class.name} ${b.class.startTime}`}
                            {b.contactPhone && ` · ${b.contactPhone}`}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge>{BOOKING_TYPE_LABEL[b.type]}</Badge>
                          <Badge tone={b.status === "CONFIRMED" ? "green" : "amber"}>
                            {BOOKING_STATUS_LABEL[b.status]}
                          </Badge>
                        </div>
                      </div>

                      {(b.experience || b.goals) && (
                        <div className="rounded-xl bg-[var(--bg-subtle)] p-3 text-sm">
                          {b.experience && (
                            <p>
                              <b className="text-xs uppercase text-muted">Deneyim:</b> {b.experience}
                            </p>
                          )}
                          {b.goals && (
                            <p className="mt-1">
                              <b className="text-xs uppercase text-muted">Hedef:</b> {b.goals}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                        {b.status === "PENDING" && (
                          <form action={setBookingStatus.bind(null, b.id, "CONFIRMED")}>
                            <Button type="submit" size="sm">
                              Onayla
                            </Button>
                          </form>
                        )}
                        {b.status === "CONFIRMED" && (
                          <>
                            <form action={setBookingStatus.bind(null, b.id, "ATTENDED")}>
                              <Button type="submit" size="sm">
                                Katıldı
                              </Button>
                            </form>
                            <form action={setBookingStatus.bind(null, b.id, "NO_SHOW")}>
                              <Button type="submit" size="sm" variant="outline">
                                Gelmedi
                              </Button>
                            </form>
                          </>
                        )}
                        <form action={setBookingStatus.bind(null, b.id, "CANCELLED")}>
                          <Button type="submit" size="sm" variant="outline">
                            İptal Et
                          </Button>
                        </form>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
