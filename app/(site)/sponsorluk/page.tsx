import type { Metadata } from "next";
import Image from "next/image";
import { Handshake, Calendar, MapPin, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Badge, Card, CardBody, Section, EmptyState, ButtonLink } from "@/components/ui";
import { SponsorApplyButton } from "@/components/sponsor-apply";
import { cld } from "@/lib/image";
import { formatDate, compact } from "@/lib/utils";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { labelsFor } from "@/lib/i18n/labels";
import { sponsorshipCopy } from "@/lib/i18n/pages/sponsorship";

export async function generateMetadata(): Promise<Metadata> {
  const c = sponsorshipCopy[await getLocale()];
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: await metadataAlternates("/sponsorluk"),
  };
}

export const revalidate = 300;

export default async function SponsorshipPage() {
  const locale = await getLocale();
  const c = sponsorshipCopy[locale];
  const L = labelsFor(locale);
  const [data, session] = await Promise.all([
    safe(
      () =>
        prisma.sponsorOffer.findMany({
          where: { status: "OPEN" },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true, title: true, description: true, disciplines: true,
            minFollowers: true, minLevel: true, region: true, value: true,
            deadline: true, createdAt: true,
            sponsor: { select: { name: true, slug: true, logoUrl: true, website: true } },
            _count: { select: { applications: true } },
          },
        }),
      [],
    ),
    getSession(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title={c.title}
        subtitle={c.subtitle}
        action={
          <ButtonLink href="/iletisim" variant="outline" size="sm">
            {c.becomeSponsor}
          </ButtonLink>
        }
      >
        {data.length === 0 ? (
          <EmptyState
            icon={<Handshake className="size-10" />}
            title={c.emptyTitle}
            description={c.emptyBody}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.map((o) => (
              <Card key={o.id} hover>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    {o.sponsor.logoUrl ? (
                      <Image
                        src={cld(o.sponsor.logoUrl, { w: 96, h: 96 })}
                        alt={o.sponsor.name}
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ink-200 dark:bg-ink-800">
                        <Handshake className="size-5 text-muted" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">{o.title}</h3>
                      <p className="text-xs text-muted">{o.sponsor.name}</p>
                    </div>
                    {o.value && <Badge tone="gold">{o.value}</Badge>}
                  </div>

                  <p className="line-clamp-2-safe text-sm text-muted">{o.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {o.disciplines.map((d) => (
                      <Badge key={d} tone="red">
                        {L.discipline[d]}
                      </Badge>
                    ))}
                    <Badge>{L.skill[o.minLevel]}+</Badge>
                    {o.minFollowers > 0 && (
                      <Badge tone="blue">
                        <Users className="size-3" /> {c.minFollowers.replace("{count}", compact(o.minFollowers))}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    {o.region && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {o.region}
                      </span>
                    )}
                    {o.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> {c.deadline}: {formatDate(o.deadline, LOCALE_TAG[locale])}
                      </span>
                    )}
                    <span>{c.applications.replace("{count}", String(o._count.applications))}</span>
                  </div>

                  <div className="border-t border-[var(--border)] pt-3">
                    <SponsorApplyButton
                      offerId={o.id}
                      authed={!!session}
                      canApply={session?.verification !== "LEVEL_0"}
                      sponsorName={o.sponsor.name}
                    />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
