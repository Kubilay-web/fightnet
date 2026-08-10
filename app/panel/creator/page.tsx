import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Users, Euro, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, Stat, Alert, EmptyState } from "@/components/ui";
import { CreatorTierForm, CreatorPostForm } from "@/components/creator-forms";
import { formatMoney, formatDate } from "@/lib/utils";
import { PLATFORM_FEE_RATE } from "@/lib/constants";

export const metadata: Metadata = { title: "Creator", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CreatorPage() {
  const user = await requireUser();

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
      <Section title="Creator" subtitle="Kendi abonelik sayfanı aç, hayranların seni desteklesin">
        <Alert tone="amber" title="Doğrulama gerekli">
          Creator sayfası açmak için en az Seviye 1 doğrulaması gerekir.{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">
            Doğrulamayı başlat
          </Link>
        </Alert>
      </Section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Creator"
        subtitle={`Hayranların seni aylık abonelikle destekler. Sen %${(1 - PLATFORM_FEE_RATE) * 100} alırsın.`}
        action={
          <Link href={`/creator/${user.username}`} className="text-sm font-bold text-blood-500 hover:underline">
            Sayfamı gör →
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Aktif abone" value={data.subs} />
        <Stat label="Brüt aylık" value={formatMoney(gross)} />
        <Stat label="Platform payı" value={formatMoney(fee)} hint={`%${PLATFORM_FEE_RATE * 100}`} />
        <Stat label="Net kazanç" value={formatMoney(gross - fee)} tone="green" />
      </div>

      <Section title="Abonelik Kademeleri" subtitle="Bronz, Gümüş, Altın — her biri farklı ayrıcalıklar">
        {data.tiers.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {data.tiers.map((t) => (
              <Card key={t.id}>
                <CardBody className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge tone={t.tier === "GOLD" ? "gold" : t.tier === "SILVER" ? "neutral" : "amber"}>
                      {t.tier}
                    </Badge>
                    <span className="text-lg font-black">{formatMoney(t.price)}</span>
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

      <Section title="Özel İçerik" subtitle="Sadece abonelerinin göreceği içerikler">
        {data.posts.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="size-8" />}
            title="Henüz içerik yok"
            description="Antrenman videoları, kulis anları, dövüş öncesi vlog'lar paylaş."
          />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.posts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.title}</p>
                    <p className="text-xs text-muted">{formatDate(p.createdAt)}</p>
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

      <Alert tone="neutral" title="İçerik politikası">
        Cinsel içerik, doping ihlali ve aşırı kilo düşürme talimatı içeren içerikler yasaktır.
        İhlal durumunda Creator sayfası kapatılır.
      </Alert>
    </div>
  );
}
