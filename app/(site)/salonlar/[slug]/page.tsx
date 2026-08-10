import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Phone, Mail, Globe, Star, Users, Clock,
  CheckCircle2, Building2, CalendarPlus,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState } from "@/components/ui";
import { TrialBookingForm } from "@/components/trial-booking-form";
import { ReportButton } from "@/components/report-button";
import { GymReviewForm } from "@/components/gym-review-form";
import { cld } from "@/lib/image";
import { cn, compact, timeAgo } from "@/lib/utils";
import { DISCIPLINE_LABEL, SKILL_LABEL, WEEKDAYS, WEEKDAYS_SHORT } from "@/lib/constants";

export const revalidate = 180;

type Params = Promise<{ slug: string }>;

async function loadGym(slug: string) {
  return safe(
    () =>
      prisma.gym.findUnique({
        where: { slug },
        select: {
          id: true, slug: true, name: true, description: true, disciplines: true,
          logoUrl: true, coverUrl: true, gallery: true,
          street: true, city: true, postalCode: true, country: true, lat: true, lng: true,
          phone: true, email: true, website: true, openingHours: true, amenities: true,
          status: true, isVerified: true, isFounder: true, isHalo: true,
          trialEnabled: true, dropInPrice: true,
          memberCount: true, ratingAvg: true, ratingCount: true,
          classes: {
            where: { isActive: true },
            orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
            select: {
              id: true, name: true, discipline: true, level: true, coachName: true,
              weekday: true, startTime: true, endTime: true, capacity: true, price: true, isTrialOk: true,
            },
          },
          coaches: {
            select: {
              title: true, isHead: true, verified: true, disciplines: true,
              user: { select: { name: true, slug: true, avatarUrl: true, verification: true } },
            },
            orderBy: { isHead: "desc" },
          },
          reviews: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true, rating: true, comment: true, createdAt: true, userId: true,
              user: { select: { name: true, slug: true, avatarUrl: true, verification: true } },
            },
          },
          _count: { select: { memberships: true, events: true } },
        },
      }),
    null,
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const g = await loadGym(slug);
  if (!g) return { title: "Salon bulunamadı" };
  return {
    title: `${g.name} — ${g.city}`,
    description:
      g.description?.slice(0, 155) ??
      `${g.name}, ${g.city} — ${g.disciplines.map((d) => DISCIPLINE_LABEL[d]).join(", ")}. Deneme antrenmanı için rezervasyon yap.`,
    openGraph: { images: g.coverUrl ? [{ url: cld(g.coverUrl, { w: 1200, h: 630 }) }] : undefined },
  };
}

export default async function GymPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [g, session] = await Promise.all([loadGym(slug), getSession()]);
  if (!g) notFound();

  // Kullanıcının kendi değerlendirmesi — formda önceden dolu gelir
  const myReview = session ? (g.reviews.find((r) => r.userId === session.sub) ?? null) : null;

  const gallery = (g.gallery ?? []) as { url: string; publicId?: string }[];
  const hours = (g.openingHours ?? {}) as Record<string, { open: string; close: string }[]>;
  const byDay = WEEKDAYS.map((_, i) => g.classes.filter((c) => c.weekday === i));

  return (
    <>
      <div className="relative h-44 overflow-hidden bg-ink-800 sm:h-64">
        {g.coverUrl ? (
          <Image src={cld(g.coverUrl, { w: 1600, h: 500 })} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="size-full bg-gradient-to-br from-ink-700 to-ink-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
          {g.logoUrl ? (
            <Image
              src={cld(g.logoUrl, { w: 224, h: 224 })}
              alt={g.name}
              width={112}
              height={112}
              priority
              className="size-24 rounded-2xl border-4 border-[var(--bg)] object-cover sm:size-28"
            />
          ) : (
            <span className="flex size-24 items-center justify-center rounded-2xl border-4 border-[var(--bg)] bg-ink-200 sm:size-28 dark:bg-ink-800">
              <Building2 className="size-9 text-muted" />
            </span>
          )}

          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-black sm:text-4xl">{g.name}</h1>
              {g.isVerified && <VerifiedMark level="LEVEL_2" />}
              {g.isHalo && <Badge tone="gold">Halo Salon</Badge>}
              {g.isFounder && <Badge tone="gold">Kurucu Salon</Badge>}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {[g.street, g.postalCode, g.city].filter(Boolean).join(", ")}
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {compact(g._count.memberships)} üye
              </span>
              {g.ratingCount > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-gold-500 text-gold-500" />
                  {g.ratingAvg.toFixed(1)} ({g.ratingCount})
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2 pb-1">
            <ReportButton targetType="GYM" targetId={g.id} authed={!!session} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {g.disciplines.map((d) => (
            <Badge key={d} tone="red">
              {DISCIPLINE_LABEL[d]}
            </Badge>
          ))}
        </div>

        <div className="mt-8 grid gap-6 pb-16 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            {g.description && (
              <Card>
                <CardBody>
                  <h2 className="mb-2 text-xs font-black uppercase tracking-wider text-muted">Salon Hakkında</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{g.description}</p>
                </CardBody>
              </Card>
            )}

            {gallery.length > 0 && (
              <div className="no-scrollbar scroll-snap-x flex gap-3 overflow-x-auto">
                {gallery.map((img, i) => (
                  <div key={img.url} className="snap-item relative aspect-[4/3] w-64 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={cld(img.url, { w: 512, h: 384 })} alt="" fill sizes="256px" className="object-cover" loading={i > 1 ? "lazy" : undefined} />
                  </div>
                ))}
              </div>
            )}

            {/* Ders programı */}
            <Section title="Ders Programı">
              {g.classes.length === 0 ? (
                <EmptyState title="Program henüz eklenmemiş" description="Salon yakında ders programını paylaşacak." />
              ) : (
                <div className="no-scrollbar overflow-x-auto">
                  <div className="grid min-w-[720px] grid-cols-7 gap-2">
                    {WEEKDAYS_SHORT.map((day, i) => (
                      <div key={day} className="flex flex-col gap-2">
                        <p className="sticky top-16 rounded-lg bg-[var(--bg-subtle)] py-1.5 text-center text-xs font-black uppercase">
                          {day}
                        </p>
                        {byDay[i].length === 0 && <p className="text-center text-xs text-muted">—</p>}
                        {byDay[i].map((c) => (
                          <div key={c.id} className="surface rounded-xl p-2.5">
                            <p className="text-xs font-black tabular-nums text-blood-500">
                              {c.startTime}–{c.endTime}
                            </p>
                            <p className="mt-0.5 truncate text-xs font-bold">{c.name}</p>
                            <p className="truncate text-[11px] text-muted">
                              {DISCIPLINE_LABEL[c.discipline]} · {SKILL_LABEL[c.level]}
                            </p>
                            {c.coachName && <p className="truncate text-[11px] text-muted">{c.coachName}</p>}
                            {c.isTrialOk && <Badge tone="green" className="mt-1">Deneme OK</Badge>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* Antrenörler */}
            {g.coaches.length > 0 && (
              <Section title="Antrenörler">
                <div className="grid gap-3 sm:grid-cols-2">
                  {g.coaches.map((c) => (
                    <Link
                      key={c.user.slug}
                      href={`/dovuscular/${c.user.slug}`}
                      className="surface flex items-center gap-3 rounded-2xl p-3 transition-colors hover:border-blood-500/40"
                    >
                      <Avatar src={c.user.avatarUrl} name={c.user.name} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="truncate font-bold">{c.user.name}</p>
                          <VerifiedMark level={c.user.verification} />
                        </div>
                        <p className="truncate text-xs text-muted">
                          {c.title ?? "Antrenör"}
                          {c.isHead && " · Baş Antrenör"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.disciplines.slice(0, 2).map((d) => (
                            <Badge key={d}>{DISCIPLINE_LABEL[d]}</Badge>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            {/* Değerlendirmeler */}
            <Section
              title="Değerlendirmeler"
              subtitle={
                g.ratingCount > 0
                  ? `${g.ratingAvg.toFixed(1)} / 5 · ${g.ratingCount} değerlendirme`
                  : "Henüz değerlendirme yok — ilk sen yaz"
              }
            >
              <div className="flex flex-col gap-3">
                {g.reviews.map((r) => (
                  <Card key={r.id}>
                    <CardBody className="flex gap-3">
                      <Avatar src={r.user.avatarUrl} name={r.user.name} size="sm" href={`/dovuscular/${r.user.slug}`} />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
                          <Link href={`/dovuscular/${r.user.slug}`} className="hover:underline">
                            {r.user.name}
                          </Link>
                          <VerifiedMark level={r.user.verification} />
                          <span className="text-xs font-normal text-muted">{timeAgo(r.createdAt)}</span>
                        </p>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn("size-4", i < r.rating ? "fill-gold-500 text-gold-500" : "text-ink-300 dark:text-ink-700")}
                            />
                          ))}
                        </div>
                        {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                      </div>
                    </CardBody>
                  </Card>
                ))}

                <Card>
                  <CardBody>
                    <GymReviewForm
                      gymId={g.id}
                      authed={!!session}
                      initial={myReview ? { rating: myReview.rating, comment: myReview.comment } : null}
                    />
                  </CardBody>
                </Card>
              </div>
            </Section>
          </div>

          {/* Yan panel */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
            {/* §4.2 — Deneme antrenmanı akışı */}
            {g.trialEnabled && (
              <Card className="border-blood-500/40">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarPlus className="size-5 text-blood-500" />
                    <h2 className="font-bold">Deneme Antrenmanı</h2>
                  </div>
                  <p className="text-sm text-muted">
                    İlk kez mi geliyorsun? Deneme antrenmanı için özel akışla kayıt ol —
                    salon seni bekliyor olacak.
                  </p>
                  <TrialBookingForm
                    gymId={g.id}
                    classes={g.classes.filter((c) => c.isTrialOk).map((c) => ({
                      id: c.id,
                      label: `${WEEKDAYS_SHORT[c.weekday]} ${c.startTime} · ${c.name}`,
                    }))}
                    authed={!!session}
                    dropInPrice={g.dropInPrice}
                  />
                </CardBody>
              </Card>
            )}

            {/* İletişim */}
            <Card>
              <CardBody className="flex flex-col gap-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-muted">İletişim</h2>
                {g.phone && (
                  <a href={`tel:${g.phone}`} className="flex items-center gap-2 text-sm hover:text-blood-500">
                    <Phone className="size-4 shrink-0" /> {g.phone}
                  </a>
                )}
                {g.email && (
                  <a href={`mailto:${g.email}`} className="flex items-center gap-2 truncate text-sm hover:text-blood-500">
                    <Mail className="size-4 shrink-0" /> {g.email}
                  </a>
                )}
                {g.website && (
                  <a href={g.website} target="_blank" rel="noopener nofollow" className="flex items-center gap-2 truncate text-sm hover:text-blood-500">
                    <Globe className="size-4 shrink-0" /> Web sitesi
                  </a>
                )}
                {g.lat && g.lng && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${g.lat},${g.lng}`}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 text-sm hover:text-blood-500"
                  >
                    <MapPin className="size-4 shrink-0" /> Yol tarifi al
                  </a>
                )}
              </CardBody>
            </Card>

            {/* Açılış saatleri */}
            {Object.keys(hours).length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
                    <Clock className="size-3.5" /> Açılış Saatleri
                  </h2>
                  <dl className="flex flex-col gap-1 text-sm">
                    {WEEKDAYS.map((day, i) => {
                      const slots = hours[String(i)] ?? [];
                      return (
                        <div key={day} className="flex justify-between gap-2">
                          <dt className="text-muted">{day}</dt>
                          <dd className="font-semibold tabular-nums">
                            {slots.length ? slots.map((s) => `${s.open}–${s.close}`).join(", ") : "Kapalı"}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </CardBody>
              </Card>
            )}

            {/* Olanaklar */}
            {g.amenities.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="mb-2 text-xs font-black uppercase tracking-wider text-muted">Olanaklar</h2>
                  <ul className="grid grid-cols-2 gap-1.5">
                    {g.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
