import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/components/i18n/link";
import { Trash2, ExternalLink, FileSignature } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { deleteGymClass } from "@/app/salon-yonetimi/actions";
import { Badge, Card, CardBody, Section, EmptyState, ButtonLink } from "@/components/ui";
import { GymForm, GymClassForm } from "@/components/gym-forms";
import { DISCIPLINE_LABEL, SKILL_LABEL, WEEKDAYS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { gymAdminCopy } from "@/lib/i18n/pages/gym-admin";

export async function generateMetadata(): Promise<Metadata> {
  const copy = gymAdminCopy[await getLocale()].edit;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function GymEditPage({ params }: { params: Params }) {
  const [{ id }, user, locale] = await Promise.all([params, requireUser(), getLocale()]);
  const t = gymAdminCopy[locale].edit;

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

  const statusLabel =
    gym.status === "ACTIVE"
      ? t.gymStatus.active
      : gym.status === "PENDING"
        ? t.gymStatus.pending
        : t.gymStatus.suspended;

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={gym.name}
        subtitle={`${gym.city} · ${statusLabel}`}
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/salon-yonetimi/${gym.id}/sozlesmeler`} variant="outline" size="sm">
              <FileSignature className="size-4" /> {t.contracts}
            </ButtonLink>
            <ButtonLink href={`/salonlar/${gym.slug}`} target="_blank" variant="outline" size="sm">
              <ExternalLink className="size-4" /> {t.viewPage}
            </ButtonLink>
          </div>
        }
      />

      <Section title={t.gymInfo}>
        <Card>
          <CardBody>
            <GymForm initial={gym} />
          </CardBody>
        </Card>
      </Section>

      <Section title={t.schedule.title} subtitle={t.schedule.subtitle(gym.classes.length)}>
        {gym.classes.length === 0 ? (
          <EmptyState title={t.schedule.emptyTitle} description={t.schedule.emptyDescription} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {gym.classes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 p-3">
                  <span className="flex w-20 shrink-0 flex-col rounded-xl bg-blood-600/10 px-2 py-1.5 text-center">
                    <span className="text-[11px] font-black uppercase text-blood-500">
                      {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                      {WEEKDAYS[c.weekday].slice(0, 3)}
                    </span>
                    <span className="text-xs font-bold tabular-nums">{c.startTime}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{c.name}</p>
                    <p className="truncate text-xs text-muted">
                      {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                      {DISCIPLINE_LABEL[c.discipline]} · {SKILL_LABEL[c.level]} · {c.startTime}–{c.endTime}
                      {c.coachName && ` · ${c.coachName}`} · {t.schedule.capacity(c.capacity)}
                      {c.price > 0 && ` · ${c.price} €`}
                    </p>
                  </div>
                  {c.isTrialOk && <Badge tone="green">{t.schedule.trialOk}</Badge>}
                  <form action={deleteGymClass.bind(null, gym.id, c.id)}>
                    <button
                      type="submit"
                      aria-label={t.schedule.deleteClass}
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
