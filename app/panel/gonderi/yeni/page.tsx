import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { PostForm } from "@/components/post-form";

export const metadata: Metadata = { title: "Yeni Gönderi", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requireUser();

  return (
    <Section title="Yeni Gönderi" subtitle="Antrenman videon, teknik anlatımın veya müsabaka anın">
      <Alert tone="amber" title="İçerik politikası">
        Cinsel içerik, doping teşviki ve aşırı kilo düşürme talimatı yasaktır.
        Videolar otomatik ön filtreden geçer ve moderasyon onayı sonrası yayınlanır.
      </Alert>
      <Card>
        <CardBody>
          <PostForm />
        </CardBody>
      </Card>
    </Section>
  );
}
