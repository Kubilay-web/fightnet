import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { deleteGymClass } from "@/app/salon-yonetimi/actions";
import { Badge, Card, CardBody, Section, EmptyState, ButtonLink } from "@/components/ui";
import { GymForm, GymClassForm } from "@/components/gym-forms";
import { DISCIPLINE_LABEL, SKILL_LABEL, WEEKDAYS } from "@/lib/constants";

export const metadata: Metadata = { title: "Salon Düzenle", robots: { index: false } };
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function GymEditPage({ params }: { params: Params }) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);

  const gym = await safe(
    () =>
      prisma.gym.findUnique({
        where: { id },
        select: {
          id: true, slug: true, name: true, description: true, disciplines: true,
          street: true, city: true, postalCode: true, country: true, lat: true, lng: true,
          phone: true, email: true, website: true, amenities: true,
          trialEnabled: true, dropInPrice: true, status: true,
          logoUrl: true, logoId: true, coverUrl: true, coverId: true,
          ownerId: true,
          classes: {
            orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
            select: {
              id: true, name: true, discipline: true, level: true, weekday: true,
              startTime: true, endTime: true, capacity: true, price: true, isTrialOk: true, coachName: true,
            },
          },
        },
      }),
    null,
  );

  if (!gym) notFound();
  if (gym.ownerId !== user.id && user.role !== "ADMIN") notFound();

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={gym.name}
        subtitle={`${gym.city} · ${gym.status === "ACTIVE" ? "Yayında" : gym.status === "PENDING" ? "Onay bekliyor" : "Askıda"}`}
        action={
          <ButtonLink href={`/salonlar/${gym.slug}`} target="_blank" variant="outline" size="sm">
            <ExternalLink className="size-4" /> Sayfayı gör
          </ButtonLink>
        }
      />

      <Section title="Salon Bilgileri">
        <Card>
          <CardBody>
            <GymForm initial={gym} />
          </CardBody>
        </Card>
      </Section>

      <Section title="Ders Programı" subtitle={`${gym.classes.length} ders`}>
        {gym.classes.length === 0 ? (
          <EmptyState title="Ders yok" description="Haftalık programını ekle — üyeler ne zaman geleceğini bilsin." />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {gym.classes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 p-3">
                  <span className="flex w-20 shrink-0 flex-col rounded-xl bg-blood-600/10 px-2 py-1.5 text-center">
                    <span className="text-[11px] font-black uppercase text-blood-500">
                      {WEEKDAYS[c.weekday].slice(0, 3)}
                    </span>
                    <span className="text-xs font-bold tabular-nums">{c.startTime}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{c.name}</p>
                    <p className="truncate text-xs text-muted">
                      {DISCIPLINE_LABEL[c.discipline]} · {SKILL_LABEL[c.level]} · {c.startTime}–{c.endTime}
                      {c.coachName && ` · ${c.coachName}`} · {c.capacity} kişi
                      {c.price > 0 && ` · ${c.price} €`}
                    </p>
                  </div>
                  {c.isTrialOk && <Badge tone="green">Deneme OK</Badge>}
                  <form action={deleteGymClass.bind(null, gym.id, c.id)}>
                    <button
                      type="submit"
                      aria-label="Dersi sil"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-blood-500/10 hover:text-blood-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card>
          <CardBody>
            <GymClassForm gymId={gym.id} />
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
