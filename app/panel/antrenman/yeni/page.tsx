import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section } from "@/components/ui";
import { TrainingForm } from "@/components/training-form";

export const metadata: Metadata = { title: "Antrenman Ekle", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewTrainingPage() {
  const user = await requireUser();

  const gyms = await safe(
    () =>
      prisma.gymMembership.findMany({
        where: { userId: user.id, isActive: true },
        select: { gym: { select: { id: true, name: true } } },
      }),
    [],
  );

  return (
    <Section title="Antrenman Ekle" subtitle="Seansını kaydet — streak sayacın devam etsin">
      <Card>
        <CardBody>
          <TrainingForm gyms={gyms.map((g) => g.gym)} />
        </CardBody>
      </Card>
    </Section>
  );
}
