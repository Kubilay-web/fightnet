import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Badge, Card, CardBody, ButtonLink } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { forGymsCopy } from "@/lib/i18n/pages/for-gyms";

export async function generateMetadata(): Promise<Metadata> {
  const copy = forGymsCopy[await getLocale()];
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: await metadataAlternates("/salonlar-icin"),
  };
}

export default async function ForGymsPage() {
  const copy = forGymsCopy[await getLocale()];

  return (
    <>
      <Badge tone="gold" className="w-fit">{copy.badge}</Badge>
      <h1 className="font-display text-3xl font-black sm:text-5xl">{copy.title}</h1>

      <p>{copy.intro}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-gold-500/50">
          <CardBody className="flex flex-col gap-3">
            <Badge tone="gold" className="w-fit">{copy.founder.badge}</Badge>
            <p className="font-display text-4xl font-black">
              {copy.founder.price}
              <span className="text-lg font-semibold text-muted">{copy.founder.perMonth}</span>
            </p>
            <p className="text-sm text-muted">
              {copy.founder.note.text}
              <b className="text-[var(--fg)]">{copy.founder.note.strong}</b>
            </p>
            <ul className="flex flex-col gap-1.5">
              {copy.founder.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-3">
            <Badge className="w-fit">{copy.standard.badge}</Badge>
            <p className="font-display text-4xl font-black">
              {copy.standard.price}
              <span className="text-lg font-semibold text-muted">{copy.standard.perMonth}</span>
            </p>
            <p className="text-sm text-muted">{copy.standard.note}</p>
            <p className="text-sm text-muted">{copy.standard.limited}</p>
          </CardBody>
        </Card>
      </div>

      <h2>{copy.start.heading}</h2>
      <ul>
        {copy.start.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{copy.existing.heading}</h2>
      <p>{copy.existing.body}</p>

      <h2>{copy.waitlist.heading}</h2>
      <Card>
        <CardBody>
          <WaitlistForm source="for-gyms" />
        </CardBody>
      </Card>

      <div className="mt-4">
        <ButtonLink href="/iletisim" variant="outline">
          {copy.cta}
        </ButtonLink>
      </div>
    </>
  );
}
