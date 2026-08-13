import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { GymForm } from "@/components/gym-forms";
import { getLocale } from "@/lib/i18n/server";
import { gymAdminCopy } from "@/lib/i18n/pages/gym-admin";

export async function generateMetadata(): Promise<Metadata> {
  const copy = gymAdminCopy[await getLocale()].create;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function NewGymPage() {
  await requireUser();
  const t = gymAdminCopy[await getLocale()].create;

  return (
    <Section title={t.title} subtitle={t.subtitle}>
      <Alert tone="blue">{t.notice}</Alert>
      <Card>
        <CardBody>
          <GymForm />
        </CardBody>
      </Card>
    </Section>
  );
}
