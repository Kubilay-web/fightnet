import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { SettingsForm, PasswordForm, DataExportPanel, DeleteAccountForm } from "@/components/settings-forms";
import { PushToggle } from "@/components/push-toggle";
import { getLocale } from "@/lib/i18n/server";
import { panelSettingsCopy } from "@/lib/i18n/pages/panel-settings";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelSettingsCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const t = panelSettingsCopy[await getLocale()];

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
      <Section title={t.header.title} subtitle={t.header.subtitle} />

      <Section title={t.prefs}>
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
      <Section title={t.pushSection.title} subtitle={t.pushSection.subtitle}>
        <Card>
          <CardBody>
            <PushToggle vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} />
          </CardBody>
        </Card>
      </Section>

      <Section title={t.passwordSection}>
        <Card>
          <CardBody>
            <PasswordForm />
          </CardBody>
        </Card>
      </Section>

      {/* §5.7 — Veri taşınabilirliği */}
      <Section title={t.data.title} subtitle={t.data.subtitle}>
        <Card>
          <CardBody className="flex flex-col gap-4">
            <DataExportPanel />
            {/* §5.7 — özel nitelikli sağlık verisi ayrı yönetilir */}
            <p className="text-xs text-muted">{t.data.healthNote}</p>
          </CardBody>
        </Card>
      </Section>

      <Section title={t.danger.title}>
        <Card className="border-blood-500/40">
          <CardBody className="flex flex-col gap-3">
            <Alert tone="red" title={t.danger.alertTitle}>
              {t.danger.alertBody}
            </Alert>
            <DeleteAccountForm username={user.username} />
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
