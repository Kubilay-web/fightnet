import type { Metadata } from "next";
import { Watch, ShieldAlert } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, CardHeader, CardTitle, Section, Alert, Stat } from "@/components/ui";
import { DeviceConnectForm } from "@/components/device-forms";
import { HEALTH_PROVIDERS, providerConfigured } from "@/lib/services/health";
import { formatDateTime, absoluteUrl } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { devicesCopy } from "@/lib/i18n/pages/panel-devices";
import { revokeDevice } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const copy = devicesCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = devicesCopy[locale];

  const connections = await safe(
    () =>
      prisma.deviceConnection.findMany({
        where: { userId: user.id, revokedAt: null },
        select: {
          id: true,
          provider: true,
          deviceName: true,
          isActive: true,
          consentAt: true,
          lastSyncAt: true,
          sampleCount: true,
          externalUserId: true,
        },
      }),
    [],
  );

  const byProvider = new Map(connections.map((c) => [c.provider, c]));
  const active = connections.filter((c) => c.isActive);
  const totalSamples = active.reduce((sum, c) => sum + c.sampleCount, 0);

  return (
    <div className="flex flex-col gap-8">
      <Section title={copy.title} subtitle={copy.subtitle} />

      {/* §5.7 — özel nitelikli veri işlemenin şartları bağlantı kurulmadan önce anlatılır */}
      <Alert tone="amber" title={copy.consent.title}>
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
          {copy.consent.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </Alert>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label={copy.stats.connected} value={active.length} />
        <Stat label={copy.stats.samples} value={totalSamples} hint={copy.stats.samplesHint} />
        <Stat label={copy.stats.providers} value={HEALTH_PROVIDERS.length} hint={copy.stats.providersHint} />
      </div>

      <Section title={copy.providersTitle}>
        <div className="grid gap-4 lg:grid-cols-2">
          {HEALTH_PROVIDERS.map((p) => {
            const conn = byProvider.get(p.value);
            const configured = providerConfigured(p.value);
            const linked = Boolean(conn?.isActive);
            const pending = Boolean(conn && !conn.isActive);

            return (
              <Card key={p.value}>
                <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Watch className="size-4 text-muted" />
                    {p.label}
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <Badge tone="neutral">{p.kind === "device" ? copy.kind.device : copy.kind.cloud}</Badge>
                    {linked && <Badge tone="green">{copy.badge.linked}</Badge>}
                    {pending && <Badge tone="amber">{copy.badge.pending}</Badge>}
                  </div>
                </CardHeader>

                <CardBody className="flex flex-col gap-3">
                  <p className="text-sm text-muted">
                    {p.kind === "device" ? copy.desc.device : copy.desc.cloud}
                  </p>

                  {!configured && (
                    <Alert tone="neutral">
                      {copy.notConfigured.replace("{provider}", p.label)}
                    </Alert>
                  )}

                  {conn && (
                    <dl className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--surface-2)] p-3 text-sm">
                      <div>
                        <dt className="text-xs text-muted">{copy.details.deviceName}</dt>
                        <dd className="font-semibold">{conn.deviceName ?? p.label}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">{copy.details.consentAt}</dt>
                        <dd className="font-semibold">{formatDateTime(conn.consentAt, LOCALE_TAG[locale])}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">{copy.details.lastSync}</dt>
                        <dd className="font-semibold">
                          {conn.lastSyncAt
                            ? formatDateTime(conn.lastSyncAt, LOCALE_TAG[locale])
                            : copy.details.noSync}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">{copy.details.sampleCount}</dt>
                        <dd className="font-semibold tabular-nums">{conn.sampleCount}</dd>
                      </div>
                    </dl>
                  )}

                  {linked ? (
                    <form action={revokeDevice.bind(null, conn!.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blood-500 hover:underline"
                      >
                        <ShieldAlert className="size-3.5" />
                        {copy.revoke}
                      </button>
                    </form>
                  ) : (
                    configured && <DeviceConnectForm provider={p.value} label={p.label} kind={p.kind} />
                  )}

                  {pending && p.kind === "cloud" && (
                    <p className="text-xs text-muted">{copy.pendingHint}</p>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Native istemcinin nereye yazacağı panelde görünmezse jeton işe yaramaz */}
      <Section title={copy.mobile.title} subtitle={copy.mobile.subtitle}>
        <Card>
          <CardBody className="flex flex-col gap-2">
            <code className="block overflow-x-auto rounded-lg bg-[var(--surface-2)] p-3 text-xs">
              POST {absoluteUrl("/api/health/ingest")}
              {"\n"}Authorization: Bearer fnh_…
              {"\n"}
              {'{"samples":[{"externalId":"…","startedAt":"2026-01-01T18:00:00Z","durationMin":75,"activityType":"boxing","avgHeartRate":148}]}'}
            </code>
            <p className="text-xs text-muted">
              {copy.mobile.note1}
              <span className="font-mono">externalId</span>
              {copy.mobile.note2}
            </p>
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
