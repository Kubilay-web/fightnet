import type { Metadata } from "next";
import { Database } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireRole } from "@/lib/auth";
import { Badge, Card, CardBody, Section, EmptyState, Stat, Alert } from "@/components/ui";
import { ButtonLink } from "@/components/ui/button";
import { DataLicenseReviewForm } from "@/components/data-license-admin-forms";
import { formatDate, timeAgo, formatMoney, compact } from "@/lib/utils";
import { DATA_LICENSE_FEES } from "@/lib/constants";
import type { DataLicenseStatus } from "@prisma/client";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { adminDataLicenseCopy } from "@/lib/i18n/pages/admin-ops";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminDataLicenseCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<DataLicenseStatus, "amber" | "green" | "red" | "neutral" | "blue"> = {
  REQUESTED: "amber",
  TRIAL: "blue",
  ACTIVE: "green",
  SUSPENDED: "red",
  EXPIRED: "neutral",
  REJECTED: "red",
};

export default async function AdminDataLicensePage() {
  await requireRole("ADMIN");
  const locale = await getLocale();
  const t = adminDataLicenseCopy[locale];

  const licenses = await safe(
    () =>
      prisma.dataLicense.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 100,
        select: {
          id: true, organization: true, contactName: true, contactEmail: true, vatId: true,
          country: true, status: true, scopes: true, useCase: true, annualFee: true,
          rateLimit: true, keyPrefix: true, startsAt: true, expiresAt: true, lastUsedAt: true,
          requestCount: true, reviewNote: true, createdAt: true,
        },
      }),
    [],
  );

  const pending = licenses.filter((l) => l.status === "REQUESTED");
  const active = licenses.filter((l) => l.status === "ACTIVE" || l.status === "TRIAL");
  const annualRevenue = active.reduce((sum, l) => sum + l.annualFee, 0);

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={t.title}
        subtitle={t.subtitle}
        action={
          <ButtonLink href="/veri-lisansi" variant="outline" size="sm" target="_blank">
            {t.publicPage}
          </ButtonLink>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t.stats.pending} value={pending.length} tone={pending.length ? "amber" : undefined} />
        <Stat label={t.stats.active} value={active.length} tone="green" />
        <Stat
          label={t.stats.revenue}
          value={formatMoney(annualRevenue, "EUR", LOCALE_TAG[locale])}
          hint={t.stats.revenueHint(DATA_LICENSE_FEES.min, DATA_LICENSE_FEES.max)}
        />
      </div>

      <Alert tone="amber" title={t.alert.title}>
        {t.alert.body}
      </Alert>

      {licenses.length === 0 ? (
        <EmptyState
          icon={<Database className="size-8" />}
          title={t.empty.title}
          description={t.empty.description}
        />
      ) : (
        <Section title={t.applications.heading} subtitle={t.applications.subtitle(licenses.length)}>
          <div className="flex flex-col gap-4">
            {licenses.map((l) => {
              const expired = l.expiresAt ? l.expiresAt < new Date() : false;
              return (
                <Card key={l.id}>
                  <CardBody className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{l.organization}</p>
                      <Badge tone={STATUS_TONE[l.status]}>{t.status[l.status]}</Badge>
                      {expired && l.status === "ACTIVE" && <Badge tone="red">{t.expiredBadge}</Badge>}
                      <span className="ml-auto text-xs text-muted">{timeAgo(l.createdAt, locale)}</span>
                    </div>

                    <p className="text-xs text-muted">
                      {l.contactName} · {l.contactEmail} · {l.country}
                      {l.vatId && ` · ${t.vat} ${l.vatId}`}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {l.scopes.map((scope) => (
                        <Badge key={scope} tone="blue">{scope}</Badge>
                      ))}
                    </div>

                    <p className="whitespace-pre-line text-sm">{l.useCase}</p>

                    {l.keyPrefix && (
                      <p className="text-xs text-muted">
                        {t.key} <code className="font-mono font-bold">{l.keyPrefix}.…</code> ·{" "}
                        {formatMoney(l.annualFee, "EUR", LOCALE_TAG[locale])}{t.perYear} · {l.rateLimit} {t.rateLimit} ·{" "}
                        {compact(l.requestCount)} {t.requests}
                        {l.startsAt && ` · ${formatDate(l.startsAt, LOCALE_TAG[locale])}`}
                        {l.expiresAt && ` → ${formatDate(l.expiresAt, LOCALE_TAG[locale])}`}
                        {l.lastUsedAt && ` · ${t.lastUsed(timeAgo(l.lastUsedAt, locale))}`}
                      </p>
                    )}

                    {l.reviewNote && (
                      <p className="text-xs text-muted">
                        <b>{t.note}</b> {l.reviewNote}
                      </p>
                    )}

                    {l.status !== "REJECTED" && (
                      <div className="border-t border-[var(--border)] pt-3">
                        <DataLicenseReviewForm
                          licenseId={l.id}
                          annualFee={l.annualFee || DATA_LICENSE_FEES.default}
                          rateLimit={l.rateLimit}
                          reviewNote={l.reviewNote}
                        />
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}
