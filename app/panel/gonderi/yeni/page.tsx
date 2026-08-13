import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { PostForm } from "@/components/post-form";
import { getLocale } from "@/lib/i18n/server";
import { panelPostsCopy } from "@/lib/i18n/pages/panel-posts";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelPostsCopy[await getLocale()];
  return { title: copy.new.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requireUser();
  const copy = panelPostsCopy[await getLocale()].new;

  return (
    <Section title={copy.title} subtitle={copy.subtitle}>
      <Alert tone="amber" title={copy.policy.title}>
        {copy.policy.body}
      </Alert>
      <Card>
        <CardBody>
          <PostForm />
        </CardBody>
      </Card>
    </Section>
  );
}
