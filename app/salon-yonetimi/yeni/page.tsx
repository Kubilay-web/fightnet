import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { GymForm } from "@/components/gym-forms";

export const metadata: Metadata = { title: "Salon Ekle", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewGymPage() {
  await requireUser();

  return (
    <Section title="Salon Ekle" subtitle="Salonunu FIGHTNET'e kaydet — onay sonrası yayına alınır">
      <Alert tone="blue">
        Salonun admin onayından sonra yayına alınır. Onay genelde 24-48 saat sürer.
      </Alert>
      <Card>
        <CardBody>
          <GymForm />
        </CardBody>
      </Card>
    </Section>
  );
}
