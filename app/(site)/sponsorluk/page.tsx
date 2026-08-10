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
import { DISCIPLINE_LABEL, SKILL_LABEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sponsorluk",
  description: "Dövüş sporu markalarıyla sporcuları buluşturan sponsor portalı.",
};

export const revalidate = 300;

export default async function SponsorshipPage() {
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
        title="Sponsorluk Portalı"
        subtitle="Markalar ve sporcular arasında doğrudan eşleştirme"
        action={
          <ButtonLink href="/iletisim" variant="outline" size="sm">
            Sponsor Ol
          </ButtonLink>
        }
      >
        {data.length === 0 ? (
          <EmptyState
            icon={<Handshake className="size-10" />}
            title="Aktif sponsorluk yok"
            description="Yakında markalar tekliflerini burada yayınlayacak."
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
                        {DISCIPLINE_LABEL[d]}
                      </Badge>
                    ))}
                    <Badge>{SKILL_LABEL[o.minLevel]}+</Badge>
                    {o.minFollowers > 0 && (
                      <Badge tone="blue">
                        <Users className="size-3" /> {compact(o.minFollowers)}+ takipçi
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
                        <Calendar className="size-3" /> Son başvuru: {formatDate(o.deadline)}
                      </span>
                    )}
                    <span>{o._count.applications} başvuru</span>
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
