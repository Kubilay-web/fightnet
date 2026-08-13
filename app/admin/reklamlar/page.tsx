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
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { adminAdsCopy } from "@/lib/i18n/pages/admin-ops";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminAdsCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  await requireAdmin();
  const locale = await getLocale();
  const t = adminAdsCopy[locale];

  const ads = await safe(
    () => prisma.ad.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    [],
  );

  return (
    <div className="flex flex-col gap-8">
      <Section title={t.title} subtitle={t.subtitle}>
        <Alert tone="red" title={t.policy.title}>
          <b>{t.policy.bold}</b> {t.policy.rest}
        </Alert>
      </Section>

      <Section title={t.newAd}>
        <Card>
          <CardBody>
            <AdForm />
          </CardBody>
        </Card>
      </Section>

      <Section title={t.liveAds}>
        {ads.length === 0 ? (
          <EmptyState icon={<Megaphone className="size-10" />} title={t.empty} />
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
                      <Badge tone={a.isActive ? "green" : "neutral"}>{a.isActive ? t.active : t.inactive}</Badge>
                      {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                      <Badge>{AD_PLACEMENTS.find((p) => p.value === a.placement)?.label ?? a.placement}</Badge>
                    </div>
                    <p className="text-xs text-muted">
                      {a.advertiser} · {formatDate(a.startsAt, LOCALE_TAG[locale])} – {formatDate(a.endsAt, LOCALE_TAG[locale])}
                    </p>
                    <p className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" /> {compact(a.impressions)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="size-3" /> {compact(a.clicks)}
                      </span>
                      <span>{t.ctr(ctr)}</span>
                    </p>

                    <div className="flex gap-2 border-t border-[var(--border)] pt-3">
                      <form action={toggleAd.bind(null, a.id, !a.isActive)}>
                        <Button type="submit" size="sm" variant="outline">
                          {a.isActive ? t.pause : t.publish}
                        </Button>
                      </form>
                      <form action={deleteAd.bind(null, a.id)}>
                        <Button type="submit" size="sm" variant="danger">
                          <Trash2 className="size-4" /> {t.delete}
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
