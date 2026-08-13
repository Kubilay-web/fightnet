import type { Metadata } from "next";
import { Badge, Card, CardBody } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { betaCopy } from "@/lib/i18n/pages/beta";

export async function generateMetadata(): Promise<Metadata> {
  const copy = betaCopy[await getLocale()];
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: await metadataAlternates("/beta"),
  };
}

export default async function BetaPage() {
  const copy = betaCopy[await getLocale()];

  return (
    <>
      <Badge tone="red" className="w-fit">{copy.badge}</Badge>
      <h1 className="font-display text-3xl font-black sm:text-5xl">{copy.title}</h1>

      <p>{copy.intro}</p>

      <h2>{copy.timeline.heading}</h2>
      <div className="flex flex-col gap-3">
        {copy.timeline.items.map((t, i) => (
          <Card key={t.phase}>
            <CardBody className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600/10 font-display text-lg font-black text-blood-500">
                {i + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{t.phase}</h3>
                  <Badge>{t.months}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{t.what}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2>{copy.perks.heading}</h2>
      <ul>
        {copy.perks.items.map((p) => (
          <li key={p.text}>
            {p.text}
            {p.strong && <b>{p.strong}</b>}
          </li>
        ))}
      </ul>

      <h2>{copy.invite.heading}</h2>
      <ul>
        {copy.invite.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <Card>
        <CardBody>
          <WaitlistForm source="beta-page" />
        </CardBody>
      </Card>
    </>
  );
}
