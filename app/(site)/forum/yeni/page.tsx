import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getForumCategories } from "@/lib/queries";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { ThreadForm } from "@/components/thread-form";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { forumCopy } from "@/lib/i18n/pages/forum";

export async function generateMetadata(): Promise<Metadata> {
  const c = forumCopy[await getLocale()].create;
  return {
    title: c.meta.title,
    robots: { index: false },
    alternates: await metadataAlternates("/forum/yeni"),
  };
}

export const dynamic = "force-dynamic";

export default async function NewThreadPage() {
  const session = await getSession();
  if (!session) redirect("/giris?next=/forum/yeni");

  const [categories, locale] = await Promise.all([getForumCategories(), getLocale()]);
  const c = forumCopy[locale].create;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Section title={c.title} subtitle={c.subtitle}>
        <Alert tone="neutral" title={c.rulesTitle}>
          {c.rulesBody}
        </Alert>
        <Card>
          <CardBody>
            <ThreadForm categories={categories.map((k) => ({ id: k.id, name: k.name }))} />
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
