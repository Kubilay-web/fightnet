import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { Avatar, VerifiedMark, FounderMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState, ButtonLink } from "@/components/ui";
import { formatMoney, compact } from "@/lib/utils";
import { DISCIPLINE_LABEL, PLATFORM_FEE_RATE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Creator'lar",
  description: "Dövüşçüleri ve antrenörleri aylık abonelikle destekle. Kazancın %85'i sporcuda kalır.",
};

export const revalidate = 300;

export default async function CreatorsPage() {
  const creators = await safe(
    () =>
      prisma.user.findMany({
        where: { creatorTiers: { some: { isActive: true } }, isActive: true, isBanned: false },
        orderBy: { followerCount: "desc" },
        take: 24,
        select: {
          id: true, name: true, username: true, slug: true, avatarUrl: true, bio: true,
          verification: true, isFounder: true, followerCount: true, city: true,
          sportProfiles: { select: { discipline: true }, take: 2, orderBy: { isPrimary: "desc" } },
          creatorTiers: {
            where: { isActive: true },
            select: { tier: true, name: true, price: true },
            orderBy: { price: "asc" },
          },
          _count: { select: { subscribers: true } },
        },
      }),
    [],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title="Creator'lar"
        subtitle={`Sporcuları doğrudan destekle — komisyon sadece %${PLATFORM_FEE_RATE * 100}, gerisi sporcunun`}
        action={
          <ButtonLink href="/panel/creator" variant="outline" size="sm">
            Creator Ol
          </ButtonLink>
        }
      >
        {creators.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="size-10" />}
            title="Henüz creator yok"
            description="İlk creator sen ol — kendi abonelik sayfanı aç."
            action={
              <ButtonLink href="/panel/creator" size="sm" className="mt-2">
                Creator Sayfamı Aç
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((c) => (
              <Card key={c.id} hover>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={c.avatarUrl} name={c.name} size="lg" href={`/creator/${c.username}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <Link href={`/creator/${c.username}`} className="truncate font-bold hover:text-blood-500">
                          {c.name}
                        </Link>
                        <VerifiedMark level={c.verification} />
                      </div>
                      <p className="truncate text-xs text-muted">
                        {c.sportProfiles[0] ? DISCIPLINE_LABEL[c.sportProfiles[0].discipline] : "Sporcu"}
                        {c.city && ` · ${c.city}`}
                      </p>
                    </div>
                  </div>

                  {c.bio && <p className="line-clamp-2-safe text-sm text-muted">{c.bio}</p>}

                  <div className="flex flex-wrap gap-1.5">
                    {c.creatorTiers.map((t) => (
                      <Badge key={t.tier} tone={t.tier === "GOLD" ? "gold" : "neutral"}>
                        {t.name} · {formatMoney(t.price)}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" /> {compact(c.followerCount)} takipçi
                    </span>
                    <span>{c._count.subscribers} abone</span>
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
