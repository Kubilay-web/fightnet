import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section } from "@/components/ui";
import { TrainingForm } from "@/components/training-form";
import { getLocale } from "@/lib/i18n/server";
import { panelTrainingCopy } from "@/lib/i18n/pages/panel-training";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelTrainingCopy[await getLocale()];
  return { title: copy.meta.create, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function NewTrainingPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const t = panelTrainingCopy[locale].create;

  const gyms = await safe(
    () =>
      prisma.gymMembership.findMany({
        where: { userId: user.id, isActive: true },
        select: { gym: { select: { id: true, name: true } } },
      }),
    [],
  );

  return (
    <Section title={t.title} subtitle={t.subtitle}>
      <Card>
        <CardBody>
          <TrainingForm gyms={gyms.map((g) => g.gym)} />
        </CardBody>
      </Card>
    </Section>
  );
}
