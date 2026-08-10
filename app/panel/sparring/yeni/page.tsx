import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { SparringListingForm } from "@/components/sparring-listing-form";

export const metadata: Metadata = { title: "Sparring İlanı Ver", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewSparringPage() {
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
    <Section title="Sparring İlanı Ver" subtitle="Bölgendeki uygun partnerler seni bulsun">
      {user.verification === "LEVEL_0" && (
        <Alert tone="amber" title="Doğrulama gerekli">
          Sparring ilanı vermek için Seviye 1 (kimlik doğrulanmış) olmalısın. Bu, herkesin güvenliği için zorunludur.{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">
            Doğrulamayı başlat
          </Link>
        </Alert>
      )}

      <Card>
        <CardBody>
          <SparringListingForm gyms={gyms.map((g) => g.gym)} defaultCity={user.city ?? ""} />
        </CardBody>
      </Card>
    </Section>
  );
}
