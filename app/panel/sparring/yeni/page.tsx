import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { SparringListingForm } from "@/components/sparring-listing-form";
import { getLocale } from "@/lib/i18n/server";
import { panelSparringCopy } from "@/lib/i18n/pages/panel-sparring";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelSparringCopy[await getLocale()];
  return { title: copy.meta.create, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function NewSparringPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const t = panelSparringCopy[locale].create;

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
      {user.verification === "LEVEL_0" && (
        <Alert tone="amber" title={t.verifyTitle}>
          {t.verifyBody}{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">
            {t.verifyCta}
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
