import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section } from "@/components/ui";
import { EventForm } from "@/components/event-forms";
import { getLocale } from "@/lib/i18n/server";
import { organizerCopy } from "@/lib/i18n/pages/organizer";

export async function generateMetadata(): Promise<Metadata> {
  const copy = organizerCopy[await getLocale()].create;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireUser();
  const t = organizerCopy[await getLocale()].create;

  return (
    <Section title={t.title} subtitle={t.subtitle}>
      <Card>
        <CardBody>
          <EventForm />
        </CardBody>
      </Card>
    </Section>
  );
}
