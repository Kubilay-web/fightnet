import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Swords, MapPin, Weight, ShieldAlert, Clock } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, EmptyState, Pagination, Skeleton, Section, ButtonLink, Alert } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { SparringRequestButton } from "@/components/sparring-request";
import { DISCIPLINES, SKILL_LEVELS, SPARRING_INTENSITY, AVAILABILITY_SLOTS, PAGE_SIZE } from "@/lib/constants";
import { DISCIPLINE_LABEL, SKILL_LABEL } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sparring Partneri Ara",
  description:
    "Bölgende disiplin, seviye ve kiloya göre sparring partneri bul. Her seans sonrası güvenlik değerlendirmesi ile güvenli eşleşme.",
};

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function SparringPage({ searchParams }: { searchParams: SP }) {
  const [sp, session] = await Promise.all([searchParams, getSession()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title="Sparring Partneri Ara"
        subtitle="Seviyene ve kilona uygun partner bul — güvenli, doğrulanmış, bölgesel"
        action={
          <ButtonLink href="/panel/sparring/yeni" size="sm">
            <Swords className="size-4" /> İlan Ver
          </ButtonLink>
        }
      >
        {/* §11.2 — Sparring güvenliği kapısı */}
        <Alert tone="amber" title="Sparring güvenliği">
          Sparring ilanı veren ve talep eden herkes sorumluluk feragatnamesini onaylar.
          Her seans sonrası güvenlik değerlendirmesi yapılır; 3 güvensizlik raporu otomatik
          askıya alma ile sonuçlanır.{" "}
          <Link href="/sparring-sozlesmesi" className="font-bold underline">
            Sparring Sözleşmesi
          </Link>
        </Alert>

        <FilterBar
          basePath="/sparring"
          current={sp}
          filters={[
            { key: "discipline", label: "Disiplin", options: DISCIPLINES.map((d) => ({ value: d.value, label: d.label })) },
            { key: "level", label: "Seviye", options: SKILL_LEVELS.map((l) => ({ value: l.value, label: l.label })) },
            { key: "intensity", label: "Yoğunluk", options: SPARRING_INTENSITY.map((i) => ({ value: i.value, label: i.label })) },
            {
              key: "weight",
              label: "Kilo",
              options: [
                { value: "0-65", label: "-65 kg" },
                { value: "65-80", label: "65-80 kg" },
                { value: "80-95", label: "80-95 kg" },
                { value: "95-200", label: "95+ kg" },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder="Şehir veya posta kodu…"
        />

        <Suspense key={JSON.stringify(sp)} fallback={<ListSkeleton />}>
          <SparringResults sp={sp} viewerId={session?.sub} authed={!!session} verified={session?.verification} />
        </Suspense>
      </Section>
    </div>
  );
}

async function SparringResults({
  sp,
  viewerId,
  authed,
  verified,
}: {
  sp: Record<string, string | undefined>;
  viewerId?: string;
  authed: boolean;
  verified?: string;
}) {
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const q = sp.q?.trim();

  const where: Prisma.SparringListingWhereInput = { status: "OPEN" };
  if (sp.discipline) where.discipline = sp.discipline as never;
  if (sp.level) where.level = sp.level as never;
  if (sp.intensity) where.intensity = sp.intensity;
  if (q) {
    where.OR = [
      { city: { contains: q, mode: "insensitive" } },
      { postalCode: { startsWith: q } },
    ];
  }
  if (sp.weight) {
    const [min, max] = sp.weight.split("-").map(Number);
    where.weightKg = { gte: min, lte: max };
  }

  const [listings, total] = await Promise.all([
    safe(
      () =>
        prisma.sparringListing.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true, discipline: true, level: true, weightKg: true, weightTolerance: true,
            city: true, postalCode: true, radiusKm: true, availability: true,
            intensity: true, note: true, createdAt: true,
            user: {
              select: {
                id: true, name: true, slug: true, avatarUrl: true, verification: true,
                city: true, isFounder: true,
                sportProfiles: {
                  select: { discipline: true, level: true, wins: true, losses: true, draws: true },
                  take: 2,
                },
              },
            },
            requests: viewerId ? { where: { senderId: viewerId }, select: { id: true, status: true } } : false,
          },
        }),
      [],
    ),
    safe(() => prisma.sparringListing.count({ where }), 0),
  ]);

  if (!listings.length) {
    return (
      <EmptyState
        icon={<Swords className="size-10" />}
        title="İlan bulunamadı"
        description="Bu filtrelerle açık sparring ilanı yok. İlk ilanı sen ver."
        action={
          <ButtonLink href="/panel/sparring/yeni" size="sm" className="mt-2">
            İlan Ver
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <p className="text-sm text-muted">{total} açık ilan</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {listings.map((l) => {
          const existing = Array.isArray(l.requests) ? l.requests[0] : undefined;
          const isOwn = l.user.id === viewerId;
          const intensity = SPARRING_INTENSITY.find((i) => i.value === l.intensity);
          return (
            <Card key={l.id} hover>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Avatar src={l.user.avatarUrl} name={l.user.name} size="lg" href={`/dovuscular/${l.user.slug}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <Link href={`/dovuscular/${l.user.slug}`} className="truncate font-bold hover:text-blood-500">
                        {l.user.name}
                      </Link>
                      <VerifiedMark level={l.user.verification} />
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <MapPin className="size-3.5" />
                      {l.city}
                      {l.postalCode && ` ${l.postalCode}`} · {l.radiusKm} km çevre
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted">{timeAgo(l.createdAt)}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="red">{DISCIPLINE_LABEL[l.discipline]}</Badge>
                  <Badge>{SKILL_LABEL[l.level]}</Badge>
                  {intensity && (
                    <Badge tone={intensity.value === "HARD" ? "red" : intensity.value === "LIGHT" ? "green" : "amber"}>
                      {intensity.label}
                    </Badge>
                  )}
                  {l.weightKg && (
                    <Badge tone="blue">
                      <Weight className="size-3" /> {l.weightKg} ±{l.weightTolerance} kg
                    </Badge>
                  )}
                </div>

                {l.availability.length > 0 && (
                  <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <Clock className="size-3.5 shrink-0" />
                    {l.availability
                      .map((a) => AVAILABILITY_SLOTS.find((s) => s.value === a)?.label ?? a)
                      .join(" · ")}
                  </p>
                )}

                {l.note && <p className="text-sm text-muted">{l.note}</p>}

                <div className="flex items-center gap-2 border-t border-[var(--border)] pt-3">
                  {isOwn ? (
                    <span className="text-xs text-muted">Kendi ilanın</span>
                  ) : existing ? (
                    <Badge tone={existing.status === "ACCEPTED" ? "green" : "neutral"}>
                      {existing.status === "PENDING" ? "Talep gönderildi" : existing.status === "ACCEPTED" ? "Kabul edildi" : "Reddedildi"}
                    </Badge>
                  ) : (
                    <SparringRequestButton
                      listingId={l.id}
                      authed={authed}
                      canRequest={verified !== "LEVEL_0"}
                      partnerName={l.user.name}
                    />
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
      <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/sparring" params={sp} />
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-56" />
      ))}
    </div>
  );
}
