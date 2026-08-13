import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { Badge, Card, CardBody, Alert, ButtonLink } from "@/components/ui";
import { DataLicenseForm } from "@/components/data-license-form";
import { DATASETS } from "@/lib/data-license";
import { DATA_LICENSE_FEES } from "@/lib/constants";
import { dataLicenseCopy, type DatasetKey } from "@/lib/i18n/pages/data-license";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const copy = dataLicenseCopy[await getLocale()];
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: await metadataAlternates("/veri-lisansi"),
  };
}

/** curl örneği, uç nokta adları ve parametre adları dilden bağımsızdır. */
const CURL_EXAMPLE = `# Yayınlanmış etkinlikler — sayfa 2, sayfa başına 50 kayıt
curl -H "Authorization: Bearer fnk_a1b2c3d4.SENIN_ANAHTARIN" \\
  "https://fightnet.de/api/v1/events?page=2&size=50"

# Yalnızca son değişiklikler (artımlı senkronizasyon)
curl -H "Authorization: Bearer fnk_a1b2c3d4.SENIN_ANAHTARIN" \\
  "https://fightnet.de/api/v1/fights?since=2026-01-01"`;

export default async function DataLicensePage() {
  const copy = dataLicenseCopy[await getLocale()];

  // Veri kümesi anahtarları tek kaynaktan (lib/data-license); açıklamalar sözlükten.
  const datasets = (Object.keys(DATASETS) as DatasetKey[]).map(
    (key) => [key, copy.api.datasets[key]] as [string, string],
  );

  return (
    <>
      <Badge tone="blue" className="w-fit">{copy.badge}</Badge>
      <h1 className="font-display text-3xl font-black sm:text-5xl">{copy.title}</h1>

      <p>
        {copy.intro.lead}
        <b className="text-[var(--fg)]">{copy.intro.strong}</b>
        {copy.intro.tail}
      </p>

      <Alert tone="amber" title={copy.principle.title}>
        {copy.principle.body}
      </Alert>

      <h2>{copy.licensed.heading}</h2>
      <ul className="list-none! pl-0!">
        {copy.licensed.items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            {item}
          </li>
        ))}
      </ul>

      <h2>{copy.never.heading}</h2>
      <ul className="list-none! pl-0!">
        {copy.never.items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <X className="mt-0.5 size-4 shrink-0 text-blood-500" />
            {item}
          </li>
        ))}
      </ul>
      <p>{copy.never.note}</p>

      <h2>{copy.pricing.heading}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-blood-500/40">
          <CardBody className="flex flex-col gap-2">
            <Badge tone="red" className="w-fit">{copy.pricing.federation.badge}</Badge>
            <p className="font-display text-4xl font-black">
              {copy.pricing.federation.price
                .replace("{min}", String(DATA_LICENSE_FEES.min))
                .replace("{max}", String(DATA_LICENSE_FEES.max))}
              <span className="text-lg font-semibold text-muted">
                {copy.pricing.federation.perYear}
              </span>
            </p>
            <p className="text-sm text-muted">{copy.pricing.federation.body}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-2">
            <Badge className="w-fit">{copy.pricing.media.badge}</Badge>
            <p className="font-display text-4xl font-black">{copy.pricing.media.price}</p>
            <p className="text-sm text-muted">{copy.pricing.media.body}</p>
          </CardBody>
        </Card>
      </div>
      <p>{copy.pricing.terms}</p>

      <h2>{copy.api.heading}</h2>
      <p>
        {copy.api.keyBefore}
        <code className="font-mono text-xs">fnk_…</code>
        {copy.api.keyAfter}
        <code className="font-mono text-xs"> Authorization</code>
        {copy.api.authAfter}
      </p>

      <pre className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 text-xs leading-relaxed">
        <code className="font-mono">{CURL_EXAMPLE}</code>
      </pre>

      <h3>{copy.api.endpointsHeading}</h3>
      <ul>
        {datasets.map(([key, description]) => (
          <li key={key}>
            <code className="font-mono text-xs font-bold text-[var(--fg)]">/api/v1/{key}</code> — {description}
          </li>
        ))}
      </ul>

      <h3>{copy.api.paramsHeading}</h3>
      <ul>
        <li><code className="font-mono text-xs">page</code> {copy.api.page}</li>
        <li><code className="font-mono text-xs">size</code> {copy.api.size}</li>
        <li><code className="font-mono text-xs">since</code> {copy.api.since}</li>
        <li>
          {copy.api.rateLead}{" "}
          <code className="font-mono text-xs">X-RateLimit-Limit</code> /{" "}
          <code className="font-mono text-xs">X-RateLimit-Remaining</code> {copy.api.rateMid}{" "}
          <code className="font-mono text-xs">429</code>{copy.api.rateTail}
        </li>
        <li>
          {copy.api.scopeLead} <code className="font-mono text-xs">403</code>
          {copy.api.scopeMid} <code className="font-mono text-xs">401</code>
          {copy.api.scopeTail}
        </li>
      </ul>

      <h2>{copy.apply.heading}</h2>
      <p>{copy.apply.body}</p>
      <Card>
        <CardBody>
          <DataLicenseForm datasets={datasets} copy={copy.form} />
        </CardBody>
      </Card>

      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonLink href="/gizlilik" variant="outline">
          {copy.cta.privacy}
        </ButtonLink>
        <ButtonLink href="/iletisim" variant="ghost">
          {copy.cta.contact}
        </ButtonLink>
      </div>
    </>
  );
}
