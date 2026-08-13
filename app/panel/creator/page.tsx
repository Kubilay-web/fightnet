import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Sparkles, Users, Euro, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, Stat, Alert, EmptyState } from "@/components/ui";
import { CreatorTierForm, CreatorPostForm } from "@/components/creator-forms";
import { formatMoney, formatDate } from "@/lib/utils";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { panelCreatorCopy } from "@/lib/i18n/pages/panel-creator";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelCreatorCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function CreatorPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = panelCreatorCopy[locale];
  const tag = LOCALE_TAG[locale];

  const data = await safe(
    async () => {
      const [tiers, subs, posts, revenue] = await Promise.all([
        prisma.creatorTier.findMany({ where: { creatorId: user.id }, orderBy: { price: "asc" } }),
        prisma.creatorSubscription.count({ where: { creatorId: user.id, status: "ACTIVE" } }),
        prisma.creatorPost.findMany({
          where: { creatorId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, title: true, type: true, minTier: true, createdAt: true },
        }),
        prisma.creatorSubscription.aggregate({
          where: { creatorId: user.id, status: "ACTIVE" },
          _sum: { price: true, platformFee: true },
        }),
      ]);
      return { tiers, subs, posts, revenue };
    },
    { tiers: [], subs: 0, posts: [], revenue: { _sum: { price: 0, platformFee: 0 } } },
  );

  const gross = data.revenue._sum.price ?? 0;
  const fee = data.revenue._sum.platformFee ?? 0;

  if (user.verification === "LEVEL_0") {
    return (
      <Section title={copy.title} subtitle={copy.gateSubtitle}>
        <Alert tone="amber" title={copy.gate.title}>
          {copy.gate.body}{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">
            {copy.gate.link}
          </Link>
        </Alert>
      </Section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={copy.title}
        subtitle={copy.subtitle((1 - PLATFORM_FEE_RATE) * 100)}
        action={
          <Link href={`/creator/${user.username}`} className="text-sm font-bold text-blood-500 hover:underline">
            {copy.myPage}
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={copy.stats.subs} value={data.subs} />
        <Stat label={copy.stats.gross} value={formatMoney(gross, "EUR", tag)} />
        <Stat label={copy.stats.platformShare} value={formatMoney(fee, "EUR", tag)} hint={`%${PLATFORM_FEE_RATE * 100}`} />
        <Stat label={copy.stats.net} value={formatMoney(gross - fee, "EUR", tag)} tone="green" />
      </div>

      <Section title={copy.tiers.title} subtitle={copy.tiers.subtitle}>
        {data.tiers.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {data.tiers.map((t) => (
              <Card key={t.id}>
                <CardBody className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge tone={t.tier === "GOLD" ? "gold" : t.tier === "SILVER" ? "neutral" : "amber"}>
                      {t.tier}
                    </Badge>
                    <span className="text-lg font-black">{formatMoney(t.price, "EUR", tag)}</span>
                  </div>
                  <h3 className="font-bold">{t.name}</h3>
                  {t.description && <p className="text-sm text-muted">{t.description}</p>}
                  {t.perks.length > 0 && (
                    <ul className="flex flex-col gap-1 text-xs text-muted">
                      {t.perks.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardBody>
            <CreatorTierForm />
          </CardBody>
        </Card>
      </Section>

      <Section title={copy.content.title} subtitle={copy.content.subtitle}>
        {data.posts.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="size-8" />}
            title={copy.content.empty.title}
            description={copy.content.empty.description}
          />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.posts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.title}</p>
                    <p className="text-xs text-muted">{formatDate(p.createdAt, tag)}</p>
                  </div>
                  <Badge tone={p.minTier === "GOLD" ? "gold" : "neutral"}>{p.minTier}+</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card>
          <CardBody>
            <CreatorPostForm />
          </CardBody>
        </Card>
      </Section>

      <Alert tone="neutral" title={copy.policy.title}>
        {copy.policy.body}
      </Alert>
    </div>
  );
}
