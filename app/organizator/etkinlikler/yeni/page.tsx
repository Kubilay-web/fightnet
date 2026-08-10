import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section } from "@/components/ui";
import { EventForm } from "@/components/event-forms";

export const metadata: Metadata = { title: "Etkinlik Ekle", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireUser();

  return (
    <Section title="Etkinlik Ekle" subtitle="Etkinliği oluştur, sonra dövüş kartını hazırla">
      <Card>
        <CardBody>
          <EventForm />
        </CardBody>
      </Card>
    </Section>
  );
}
