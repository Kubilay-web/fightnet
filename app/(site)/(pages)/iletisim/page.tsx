import type { Metadata } from "next";
import { Mail, Building2, Handshake, ShieldAlert, Megaphone } from "lucide-react";
import { Card, CardBody } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { contactCopy } from "@/lib/i18n/pages/contact";

export async function generateMetadata(): Promise<Metadata> {
  const copy = contactCopy[await getLocale()];
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: await metadataAlternates("/iletisim"),
  };
}

/** İkon ve e-posta adresi dilden bağımsız; başlık/açıklama sözlükten gelir. */
const CHANNELS = [
  { key: "gyms", icon: Building2, mail: "gyms@fightnet.app" },
  { key: "sponsorship", icon: Handshake, mail: "partners@fightnet.app" },
  { key: "press", icon: Megaphone, mail: "press@fightnet.app" },
  { key: "safety", icon: ShieldAlert, mail: "privacy@fightnet.app" },
] as const;

export default async function ContactPage() {
  const copy = contactCopy[await getLocale()];

  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">{copy.title}</h1>
      <p>{copy.intro}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {CHANNELS.map(({ key, icon: Icon, mail }) => (
          <Card key={key}>
            <CardBody className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold">{copy.channels[key].t}</h3>
                <p className="text-sm text-muted">{copy.channels[key].b}</p>
                <a href={`mailto:${mail}`} className="mt-1 inline-block truncate text-sm font-bold text-blood-500 hover:underline">
                  {mail}
                </a>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2>{copy.waitlist.heading}</h2>
      <p>{copy.waitlist.body}</p>
      <Card>
        <CardBody>
          <WaitlistForm source="contact" />
        </CardBody>
      </Card>
    </>
  );
}
