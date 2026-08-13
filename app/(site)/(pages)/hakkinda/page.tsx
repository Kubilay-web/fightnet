import type { Metadata } from "next";
import { Badge, Card, CardBody, ButtonLink } from "@/components/ui";
import { KPI_GATES } from "@/lib/constants";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { aboutCopy } from "@/lib/i18n/pages/about";

export async function generateMetadata(): Promise<Metadata> {
  const copy = aboutCopy[await getLocale()];
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: await metadataAlternates("/hakkinda"),
  };
}

export default async function AboutPage() {
  const copy = aboutCopy[await getLocale()];

  return (
    <>
      <Badge tone="red" className="w-fit">{copy.badge}</Badge>
      <h1 className="font-display text-3xl font-black sm:text-5xl">{copy.title}</h1>

      <p>{copy.intro}</p>

      <h2>{copy.why.heading}</h2>
      <p>{copy.why.body}</p>

      <h2>{copy.differentiators.heading}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {copy.differentiators.items.map((x) => (
          <Card key={x.t}>
            <CardBody>
              <h3 className="font-bold">{x.t}</h3>
              <p className="mt-1 text-sm text-muted">{x.b}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2>{copy.principles.heading}</h2>
      <ul>
        {copy.principles.items.map((p) => (
          <li key={p.term}>
            <b>{p.term}</b> — {p.body}
          </li>
        ))}
      </ul>

      <h2>{copy.roadmap.heading}</h2>
      <ul>
        {copy.roadmap.items.map((r) => (
          <li key={r.phase}>
            <b>{r.phase}</b> — {r.body}
          </li>
        ))}
      </ul>

      <h2>{copy.gates.heading}</h2>
      <p>{copy.gates.body}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase text-muted">
              <th className="py-2 pr-3">{copy.gates.columns.month}</th>
              <th className="py-2 pr-3">{copy.gates.columns.green}</th>
              <th className="py-2">{copy.gates.columns.red}</th>
            </tr>
          </thead>
          <tbody>
            {KPI_GATES.map((g) => {
              const row = copy.gates.rows[g.month] ?? { green: g.green, red: g.red };
              return (
                <tr key={g.month} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3 font-black">
                    {copy.gates.monthPrefix} {g.month}
                  </td>
                  <td className="py-2 pr-3 text-emerald-500">{row.green}</td>
                  <td className="py-2 text-blood-500">{row.red}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2>{copy.privacy.heading}</h2>
      <p>{copy.privacy.body}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/kayit">{copy.cta.join}</ButtonLink>
        <ButtonLink href="/salonlar-icin" variant="outline">
          {copy.cta.forGyms}
        </ButtonLink>
      </div>
    </>
  );
}
