import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lock, Sparkles, Check } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark, FounderMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, ButtonLink, EmptyState } from "@/components/ui";
import { SubscribeButton } from "@/components/subscribe-button";
import { formatMoney, formatDate, compact, cn } from "@/lib/utils";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { creatorCopy } from "@/lib/i18n/pages/creator";

type Params = Promise<{ username: string }>;

export const revalidate = 120;

async function loadCreator(username: string) {
  return safe(
    () =>
      prisma.user.findUnique({
        where: { username },
        select: {
          id: true, name: true, username: true, slug: true, avatarUrl: true, coverUrl: true,
          bio: true, verification: true, isFounder: true, followerCount: true, city: true,
          creatorTiers: {
            where: { isActive: true },
            orderBy: { price: "asc" },
            select: { id: true, tier: true, name: true, price: true, description: true, perks: true },
          },
          creatorPosts: {
            orderBy: { createdAt: "desc" },
            take: 12,
            select: { id: true, title: true, body: true, type: true, minTier: true, thumbUrl: true, createdAt: true },
          },
          _count: { select: { subscribers: true } },
        },
      }),
    null,
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  const [c, locale] = await Promise.all([loadCreator(username), getLocale()]);
  const copy = creatorCopy[locale].detail;
  const alternates = await metadataAlternates(`/creator/${username}`);
  if (!c) return { title: copy.notFound, alternates };
  return {
    title: `${c.name} — Creator`,
    description: c.bio?.slice(0, 155) ?? copy.metaDescription.replace("{name}", c.name),
    alternates,
  };
}

export default async function CreatorPage({ params }: { params: Params }) {
  const { username } = await params;
  const [c, session, locale] = await Promise.all([loadCreator(username), getSession(), getLocale()]);
  if (!c || c.creatorTiers.length === 0) notFound();

  const copy = creatorCopy[locale].detail;

  const subscription = session
    ? await safe(
        () =>
          prisma.creatorSubscription.findUnique({
            where: { creatorId_subscriberId: { creatorId: c.id, subscriberId: session.sub } },
            select: { status: true, tier: { select: { tier: true } } },
          }),
        null,
      )
    : null;

  const activeTier = subscription?.status === "ACTIVE" ? subscription.tier.tier : null;
  const TIER_ORDER = { BRONZE: 1, SILVER: 2, GOLD: 3 } as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-16 sm:px-6 sm:py-12">
      {/* Başlık */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar src={c.avatarUrl} name={c.name} size="3xl" priority ring />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h1 className="font-display text-3xl font-black">{c.name}</h1>
          <VerifiedMark level={c.verification} />
          {c.isFounder && <FounderMark />}
        </div>
        <p className="text-sm text-muted">
          @{c.username}
          {c.city && ` · ${c.city}`} · {compact(c.followerCount)} {copy.followers} · {c._count.subscribers} {copy.subscribers}
        </p>
        {c.bio && <p className="max-w-xl text-muted">{c.bio}</p>}
        <ButtonLink href={`/dovuscular/${c.slug}`} variant="outline" size="sm">
          {copy.viewAthleteProfile}
        </ButtonLink>
      </div>

      {/* Kademeler */}
      <Section title={copy.tiersTitle} className="mt-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {c.creatorTiers.map((t) => {
            const isCurrent = activeTier === t.tier;
            return (
              <Card key={t.id} className={cn(t.tier === "GOLD" && "border-gold-500/50", isCurrent && "border-emerald-500")}>
                <CardBody className="flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Badge tone={t.tier === "GOLD" ? "gold" : t.tier === "SILVER" ? "neutral" : "amber"}>
                      {t.tier}
                    </Badge>
                    {isCurrent && <Badge tone="green">{copy.currentSubscription}</Badge>}
                  </div>

                  <div>
                    <h3 className="font-bold">{t.name}</h3>
                    <p className="mt-1 font-display text-3xl font-black">
                      {formatMoney(t.price, "EUR", LOCALE_TAG[locale])}
                      <span className="text-sm font-semibold text-muted">{copy.perMonth}</span>
                    </p>
                  </div>

                  {t.description && <p className="text-sm text-muted">{t.description}</p>}

                  {t.perks.length > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {t.perks.map((p) => (
                        <li key={p} className="flex items-start gap-1.5 text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto pt-2">
                    <SubscribeButton
                      creatorId={c.id}
                      tierId={t.id}
                      price={t.price}
                      authed={!!session}
                      isCurrent={isCurrent}
                      creatorName={c.name}
                    />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
        <p className="text-xs text-muted">
          {copy.feeNote
            .replace("{fee}", String(PLATFORM_FEE_RATE * 100))
            .replace("{rest}", String(Math.round((1 - PLATFORM_FEE_RATE) * 100)))
            .replace("{name}", c.name)}
        </p>
      </Section>

      {/* Özel içerik */}
      <Section title={copy.exclusiveTitle} className="mt-10">
        {c.creatorPosts.length === 0 ? (
          <EmptyState icon={<Sparkles className="size-10" />} title={copy.emptyContent} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.creatorPosts.map((p) => {
              const unlocked = activeTier ? TIER_ORDER[activeTier] >= TIER_ORDER[p.minTier] : false;
              return (
                <Card key={p.id} className={cn(!unlocked && "opacity-90")}>
                  <CardBody className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-bold">{p.title}</h3>
                      <Badge tone={p.minTier === "GOLD" ? "gold" : "neutral"}>{p.minTier}+</Badge>
                    </div>
                    <p className="text-xs text-muted">{formatDate(p.createdAt, LOCALE_TAG[locale])}</p>

                    {unlocked ? (
                      p.body && <p className="line-clamp-2-safe text-sm">{p.body}</p>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-subtle)] p-3 text-sm text-muted">
                        <Lock className="size-4 shrink-0" />
                        {copy.lockedBody.replace("{tier}", p.minTier)}
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
