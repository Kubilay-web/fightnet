import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getForumCategories } from "@/lib/queries";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { ThreadForm } from "@/components/thread-form";

export const metadata: Metadata = { title: "Konu Aç", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewThreadPage() {
  const session = await getSession();
  if (!session) redirect("/giris?next=/forum/yeni");

  const categories = await getForumCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Section title="Yeni Konu" subtitle="Topluluğa sorunu sor veya deneyimini paylaş">
        <Alert tone="neutral" title="Topluluk kuralları">
          Saygılı ol, doping ve aşırı kilo düşürme tavsiyesi verme, kişisel veri paylaşma.
        </Alert>
        <Card>
          <CardBody>
            <ThreadForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
