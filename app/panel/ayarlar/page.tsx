import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { SettingsForm, PasswordForm, DataExportPanel, DeleteAccountForm } from "@/components/settings-forms";
import { PushToggle } from "@/components/push-toggle";

export const metadata: Metadata = { title: "Ayarlar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  const prefs = await safe(
    () =>
      prisma.user.findUnique({
        where: { id: user.id },
        select: { locale: true, theme: true, visibility: true, pushEnabled: true, emailEnabled: true },
      }),
    null,
  );

  return (
    <div className="flex flex-col gap-8">
      <Section title="Ayarlar" subtitle="Dil, bildirim ve gizlilik tercihlerin" />

      <Section title="Tercihler">
        <Card>
          <CardBody>
            <SettingsForm
              initial={
                prefs ?? { locale: "de", theme: "dark", visibility: "PUBLIC", pushEnabled: true, emailEnabled: true }
              }
            />
          </CardBody>
        </Card>
      </Section>

      {/* §4.1 — Push bildirimleri */}
      <Section title="Push Bildirimleri" subtitle="Cihaz başına ayrı ayarlanır">
        <Card>
          <CardBody>
            <PushToggle vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} />
          </CardBody>
        </Card>
      </Section>

      <Section title="Şifre">
        <Card>
          <CardBody>
            <PasswordForm />
          </CardBody>
        </Card>
      </Section>

      {/* §5.7 — Veri taşınabilirliği */}
      <Section title="Verilerim" subtitle="KVKK/GDPR — verilerini indir veya hesabını sil">
        <Card>
          <CardBody className="flex flex-col gap-4">
            <DataExportPanel />
          </CardBody>
        </Card>
      </Section>

      <Section title="Tehlikeli Bölge">
        <Card className="border-blood-500/40">
          <CardBody className="flex flex-col gap-3">
            <Alert tone="red" title="Hesabı kalıcı olarak sil">
              Tüm profilin, antrenman kayıtların, gönderilerin ve rezervasyonların kalıcı olarak silinir.
              Bu işlem geri alınamaz.
            </Alert>
            <DeleteAccountForm username={user.username} />
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
