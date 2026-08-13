import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Handshake } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireRole } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState } from "@/components/ui";
import {
  SponsorForm,
  SponsorOfferForm,
  OfferStatusToggle,
  ApplicationActions,
} from "@/components/sponsor-admin-forms";
import { formatDate, timeAgo, truncate, compact } from "@/lib/utils";
import { DISCIPLINE_LABEL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { adminSponsorsCopy } from "@/lib/i18n/pages/admin-ops";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminSponsorsCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

const APP_TONE: Record<string, "amber" | "green" | "red" | "neutral"> = {
  APPLIED: "amber",
  ACCEPTED: "green",
  REJECTED: "red",
  OPEN: "neutral",
  CLOSED: "neutral",
};

export default async function AdminSponsorsPage() {
  await requireRole("ADMIN");
  const locale = await getLocale();
  const t = adminSponsorsCopy[locale];

  const data = await safe(
    async () => {
      const [sponsors, offers, applications] = await Promise.all([
        prisma.sponsor.findMany({
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, slug: true, website: true, budgetMin: true, budgetMax: true, disciplines: true },
        }),
        prisma.sponsorOffer.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true, title: true, status: true, region: true, value: true, deadline: true,
            minFollowers: true, disciplines: true, createdAt: true,
            sponsor: { select: { name: true } },
            _count: { select: { applications: true } },
          },
        }),
        prisma.sponsorApplication.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true, pitch: true, status: true, createdAt: true,
            offer: { select: { title: true, sponsor: { select: { name: true } } } },
            user: {
              select: { name: true, slug: true, avatarUrl: true, verification: true, followerCount: true },
            },
          },
        }),
      ]);
      return { sponsors, offers, applications };
    },
    { sponsors: [], offers: [], applications: [] },
  );

  const pending = data.applications.filter((a) => a.status === "APPLIED").length;

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={t.title}
        subtitle={t.subtitle(data.sponsors.length, data.offers.length, pending)}
      />

      {/* Başvurular */}
      <Section title={t.applications.heading} subtitle={t.applications.subtitle}>
        {data.applications.length === 0 ? (
          <EmptyState icon={<Handshake className="size-8" />} title={t.applications.empty} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.applications.map((a) => {
                const tone = APP_TONE[a.status] ?? APP_TONE.APPLIED;
                const label = t.appStatus[a.status as keyof typeof t.appStatus] ?? t.appStatus.APPLIED;
                return (
                  <li key={a.id} className="flex flex-col gap-2 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Avatar src={a.user.avatarUrl} name={a.user.name} size="sm" href={`/dovuscular/${a.user.slug}`} />
                      <Link href={`/dovuscular/${a.user.slug}`} className="font-bold hover:underline">
                        {a.user.name}
                      </Link>
                      <VerifiedMark level={a.user.verification} />
                      <span className="text-xs text-muted">{compact(a.user.followerCount)} {t.followers}</span>
                      <Badge tone={tone}>{label}</Badge>
                      <span className="ml-auto text-xs text-muted">{timeAgo(a.createdAt, locale)}</span>
                    </div>
                    <p className="text-xs text-muted">
                      {a.offer.sponsor.name} · {a.offer.title}
                    </p>
                    <p className="text-sm">{truncate(a.pitch, 300)}</p>
                    <ApplicationActions id={a.id} status={a.status} />
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </Section>

      {/* Teklifler */}
      <Section title={t.offers.heading}>
        {data.offers.length === 0 ? (
          <EmptyState title={t.offers.empty} description={t.offers.emptyDescription} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.offers.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{o.title}</p>
                    <p className="text-xs text-muted">
                      {o.sponsor.name}
                      {o.region && ` · ${o.region}`}
                      {o.value && ` · ${o.value}`}
                      {o.minFollowers > 0 && ` · ${t.minFollowers(compact(o.minFollowers))}`}
                      {o.deadline && ` · ${t.deadline(formatDate(o.deadline, LOCALE_TAG[locale]))}`}
                      {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                      {o.disciplines.length > 0 &&
                        ` · ${o.disciplines.map((d) => DISCIPLINE_LABEL[d]).join(", ")}`}
                    </p>
                  </div>
                  <Badge>{t.applicationsBadge(o._count.applications)}</Badge>
                  <Badge tone={o.status === "OPEN" ? "green" : "neutral"}>
                    {o.status === "OPEN" ? t.open : t.closed}
                  </Badge>
                  <OfferStatusToggle id={o.id} status={o.status} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={t.newOffer}>
          <Card>
            <CardBody>
              <SponsorOfferForm sponsors={data.sponsors} />
            </CardBody>
          </Card>
        </Section>

        <Section title={t.newSponsor}>
          <Card>
            <CardBody>
              <SponsorForm />
            </CardBody>
          </Card>
        </Section>
      </div>
    </div>
  );
}
