import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = { title: "Sponsorlar", robots: { index: false } };
export const dynamic = "force-dynamic";

const APP_STATUS: Record<string, { label: string; tone: "amber" | "green" | "red" | "neutral" }> = {
  APPLIED: { label: "Başvurdu", tone: "amber" },
  ACCEPTED: { label: "Kabul", tone: "green" },
  REJECTED: { label: "Ret", tone: "red" },
  OPEN: { label: "Açık", tone: "neutral" },
  CLOSED: { label: "Kapalı", tone: "neutral" },
};

export default async function AdminSponsorsPage() {
  await requireRole("ADMIN");

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
        title="Sponsor Portalı"
        subtitle={`${data.sponsors.length} marka · ${data.offers.length} teklif · ${pending} başvuru bekliyor`}
      />

      {/* Başvurular */}
      <Section title="Başvurular" subtitle="Sporcuların sponsorluk talepleri">
        {data.applications.length === 0 ? (
          <EmptyState icon={<Handshake className="size-8" />} title="Başvuru yok" />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.applications.map((a) => {
                const s = APP_STATUS[a.status] ?? APP_STATUS.APPLIED;
                return (
                  <li key={a.id} className="flex flex-col gap-2 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Avatar src={a.user.avatarUrl} name={a.user.name} size="sm" href={`/dovuscular/${a.user.slug}`} />
                      <Link href={`/dovuscular/${a.user.slug}`} className="font-bold hover:underline">
                        {a.user.name}
                      </Link>
                      <VerifiedMark level={a.user.verification} />
                      <span className="text-xs text-muted">{compact(a.user.followerCount)} takipçi</span>
                      <Badge tone={s.tone}>{s.label}</Badge>
                      <span className="ml-auto text-xs text-muted">{timeAgo(a.createdAt)}</span>
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
      <Section title="Teklifler">
        {data.offers.length === 0 ? (
          <EmptyState title="Teklif yok" description="Aşağıdan ilk sponsorluk teklifini yayınla." />
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
                      {o.minFollowers > 0 && ` · min ${compact(o.minFollowers)} takipçi`}
                      {o.deadline && ` · son ${formatDate(o.deadline)}`}
                      {o.disciplines.length > 0 &&
                        ` · ${o.disciplines.map((d) => DISCIPLINE_LABEL[d]).join(", ")}`}
                    </p>
                  </div>
                  <Badge>{o._count.applications} başvuru</Badge>
                  <Badge tone={o.status === "OPEN" ? "green" : "neutral"}>
                    {o.status === "OPEN" ? "Açık" : "Kapalı"}
                  </Badge>
                  <OfferStatusToggle id={o.id} status={o.status} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Yeni Teklif">
          <Card>
            <CardBody>
              <SponsorOfferForm sponsors={data.sponsors} />
            </CardBody>
          </Card>
        </Section>

        <Section title="Yeni Sponsor Markası">
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
