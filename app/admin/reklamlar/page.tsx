import type { Metadata } from "next";
import Image from "next/image";
import { Megaphone, Trash2, Eye, MousePointerClick } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { toggleAd, deleteAd } from "@/app/admin/actions";
import { Badge, Card, CardBody, Section, EmptyState, Button, Alert } from "@/components/ui";
import { AdForm } from "@/components/ad-form";
import { cld } from "@/lib/image";
import { formatDate, compact } from "@/lib/utils";
import { AD_PLACEMENTS } from "@/lib/constants";

export const metadata: Metadata = { title: "Reklamlar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  await requireAdmin();

  const ads = await safe(
    () => prisma.ad.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    [],
  );

  return (
    <div className="flex flex-col gap-8">
      <Section title="Banner Reklamları" subtitle="Dövüş sporu markaları için reklam alanları">
        <Alert tone="red" title="Politika">
          <b>Spor bahis reklamı yayınlanmaz.</b> Alkol, doping ürünü ve aşırı kilo düşürme
          ürünlerinin reklamı da kabul edilmez.
        </Alert>
      </Section>

      <Section title="Yeni Reklam">
        <Card>
          <CardBody>
            <AdForm />
          </CardBody>
        </Card>
      </Section>

      <Section title="Yayındaki Reklamlar">
        {ads.length === 0 ? (
          <EmptyState icon={<Megaphone className="size-10" />} title="Reklam yok" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {ads.map((a) => {
              const ctr = a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(2) : "0.00";
              return (
                <Card key={a.id}>
                  <div className="relative aspect-[16/5] overflow-hidden rounded-t-2xl bg-ink-200 dark:bg-ink-800">
                    <Image src={cld(a.imageUrl, { w: 640, h: 200 })} alt={a.name} fill sizes="320px" className="object-cover" />
                  </div>
                  <CardBody className="flex flex-col gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <h3 className="min-w-0 max-w-full truncate font-bold">{a.name}</h3>
                      <Badge tone={a.isActive ? "green" : "neutral"}>{a.isActive ? "Aktif" : "Pasif"}</Badge>
                      <Badge>{AD_PLACEMENTS.find((p) => p.value === a.placement)?.label ?? a.placement}</Badge>
                    </div>
                    <p className="text-xs text-muted">
                      {a.advertiser} · {formatDate(a.startsAt)} – {formatDate(a.endsAt)}
                    </p>
                    <p className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" /> {compact(a.impressions)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="size-3" /> {compact(a.clicks)}
                      </span>
                      <span>CTR %{ctr}</span>
                    </p>

                    <div className="flex gap-2 border-t border-[var(--border)] pt-3">
                      <form action={toggleAd.bind(null, a.id, !a.isActive)}>
                        <Button type="submit" size="sm" variant="outline">
                          {a.isActive ? "Duraklat" : "Yayınla"}
                        </Button>
                      </form>
                      <form action={deleteAd.bind(null, a.id)}>
                        <Button type="submit" size="sm" variant="danger">
                          <Trash2 className="size-4" /> Sil
                        </Button>
                      </form>
                    </div>
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
