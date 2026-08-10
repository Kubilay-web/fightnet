import type { Metadata } from "next";
import Link from "next/link";
import { Swords, Check, X, Star, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { closeSparringListing, respondSparringRequest } from "@/app/panel/actions";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, ButtonLink, Section, EmptyState, Button } from "@/components/ui";
import { SparringReviewForm } from "@/components/sparring-review-form";
import { formatDate, timeAgo } from "@/lib/utils";
import { DISCIPLINE_LABEL, SKILL_LABEL, SPARRING_INTENSITY } from "@/lib/constants";

export const metadata: Metadata = { title: "Sparring", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelSparringPage() {
  const user = await requireUser();

  const data = await safe(
    async () => {
      const [listings, incoming, outgoing, reviewable] = await Promise.all([
        prisma.sparringListing.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true, discipline: true, level: true, city: true, status: true,
            intensity: true, weightKg: true, createdAt: true,
            _count: { select: { requests: true } },
          },
        }),
        prisma.sparringRequest.findMany({
          where: { receiverId: user.id },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true, message: true, status: true, proposedDate: true, createdAt: true,
            sender: { select: { name: true, slug: true, avatarUrl: true, verification: true, city: true } },
            listing: { select: { discipline: true, level: true } },
          },
        }),
        prisma.sparringRequest.findMany({
          where: { senderId: user.id },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true, status: true, proposedDate: true, createdAt: true,
            listing: {
              select: {
                discipline: true, city: true,
                user: { select: { name: true, slug: true, avatarUrl: true, verification: true } },
              },
            },
          },
        }),
        prisma.sparringRequest.findMany({
          where: {
            status: "ACCEPTED",
            OR: [{ senderId: user.id }, { receiverId: user.id }],
            reviews: { none: { authorId: user.id } },
          },
          take: 10,
          select: {
            id: true,
            sender: { select: { id: true, name: true } },
            receiverId: true,
            listing: { select: { user: { select: { id: true, name: true } } } },
          },
        }),
      ]);
      return { listings, incoming, outgoing, reviewable };
    },
    { listings: [], incoming: [], outgoing: [], reviewable: [] },
  );

  const pendingIncoming = data.incoming.filter((r) => r.status === "PENDING");

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Sparring"
        subtitle="İlanların, gelen talepler ve değerlendirmeler"
        action={
          <ButtonLink href="/panel/sparring/yeni" size="sm">
            <Swords className="size-4" /> İlan Ver
          </ButtonLink>
        }
      />

      {/* §11.2 — Bekleyen değerlendirmeler */}
      {data.reviewable.length > 0 && (
        <Section title="Değerlendirme Bekleyenler" subtitle="Güvenli topluluk için her seans sonrası değerlendir">
          <div className="flex flex-col gap-3">
            {data.reviewable.map((r) => {
              const partner = r.sender.id === user.id ? r.listing.user : r.sender;
              return (
                <Card key={r.id}>
                  <CardBody>
                    <p className="mb-3 font-bold">{partner.name} ile sparring</p>
                    <SparringReviewForm requestId={r.id} partnerName={partner.name} />
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </Section>
      )}

      {/* Gelen talepler */}
      <Section title="Gelen Talepler" subtitle={`${pendingIncoming.length} bekleyen`}>
        {data.incoming.length === 0 ? (
          <EmptyState icon={<Swords className="size-8" />} title="Talep yok" description="İlan verdiğinde talepler burada görünür." />
        ) : (
          <div className="flex flex-col gap-3">
            {data.incoming.map((r) => (
              <Card key={r.id}>
                <CardBody className="flex flex-wrap items-center gap-3">
                  <Avatar src={r.sender.avatarUrl} name={r.sender.name} size="md" href={`/dovuscular/${r.sender.slug}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <Link href={`/dovuscular/${r.sender.slug}`} className="truncate font-bold hover:text-blood-500">
                        {r.sender.name}
                      </Link>
                      <VerifiedMark level={r.sender.verification} />
                    </div>
                    <p className="text-xs text-muted">
                      {DISCIPLINE_LABEL[r.listing.discipline]} · {SKILL_LABEL[r.listing.level]}
                      {r.sender.city && ` · ${r.sender.city}`} · {timeAgo(r.createdAt)}
                    </p>
                    {r.message && <p className="mt-1 text-sm">{r.message}</p>}
                    {r.proposedDate && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <Clock className="size-3" /> Önerilen: {formatDate(r.proposedDate)}
                      </p>
                    )}
                  </div>

                  {r.status === "PENDING" ? (
                    <div className="flex gap-2">
                      <form action={respondSparringRequest.bind(null, r.id, "ACCEPT")}>
                        <Button type="submit" size="sm">
                          <Check className="size-4" /> Kabul
                        </Button>
                      </form>
                      <form action={respondSparringRequest.bind(null, r.id, "DECLINE")}>
                        <Button type="submit" size="sm" variant="outline">
                          <X className="size-4" /> Reddet
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <Badge tone={r.status === "ACCEPTED" ? "green" : "neutral"}>
                      {r.status === "ACCEPTED" ? "Kabul edildi" : r.status === "DECLINED" ? "Reddedildi" : "İptal"}
                    </Badge>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Gönderilen talepler */}
      {data.outgoing.length > 0 && (
        <Section title="Gönderdiğim Talepler">
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.outgoing.map((r) => (
                <li key={r.id} className="flex items-center gap-3 p-3">
                  <Avatar src={r.listing.user.avatarUrl} name={r.listing.user.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{r.listing.user.name}</p>
                    <p className="text-xs text-muted">
                      {DISCIPLINE_LABEL[r.listing.discipline]} · {r.listing.city} · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                  <Badge tone={r.status === "ACCEPTED" ? "green" : r.status === "DECLINED" ? "red" : "amber"}>
                    {r.status === "PENDING" ? "Bekliyor" : r.status === "ACCEPTED" ? "Kabul" : r.status === "DECLINED" ? "Red" : "İptal"}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      {/* İlanlarım */}
      <Section title="İlanlarım">
        {data.listings.length === 0 ? (
          <EmptyState
            icon={<Swords className="size-8" />}
            title="İlanın yok"
            description="Sparring ilanı ver, bölgendeki sporcular sana ulaşsın."
            action={
              <ButtonLink href="/panel/sparring/yeni" size="sm" className="mt-2">
                İlan Ver
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.listings.map((l) => {
              const intensity = SPARRING_INTENSITY.find((i) => i.value === l.intensity);
              return (
                <Card key={l.id}>
                  <CardBody className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold">{DISCIPLINE_LABEL[l.discipline]}</p>
                        <p className="text-xs text-muted">
                          {SKILL_LABEL[l.level]} · {l.city}
                          {l.weightKg && ` · ${l.weightKg} kg`}
                        </p>
                      </div>
                      <Badge tone={l.status === "OPEN" ? "green" : l.status === "MATCHED" ? "blue" : "neutral"}>
                        {l.status === "OPEN" ? "Açık" : l.status === "MATCHED" ? "Eşleşti" : "Kapalı"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      {intensity && <Badge>{intensity.label}</Badge>}
                      <span>{l._count.requests} talep</span>
                      <span>{timeAgo(l.createdAt)}</span>
                    </div>
                    {l.status === "OPEN" && (
                      <form action={closeSparringListing.bind(null, l.id)} className="mt-1">
                        <Button type="submit" size="sm" variant="outline">
                          İlanı Kapat
                        </Button>
                      </form>
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
