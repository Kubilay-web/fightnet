import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Section, Alert } from "@/components/ui";
import { ButtonLink } from "@/components/ui/button";
import { CoachingOfferForm } from "@/components/coaching-forms";
import { COACHING_FEE_RATE } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { panelCoachingCopy } from "@/lib/i18n/pages/panel-coaching";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelCoachingCopy[await getLocale()];
  return { title: copy.newOffer.meta.title, robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function NewCoachingOfferPage() {
  const user = await requireUser();
  if (user.role !== "COACH" && user.role !== "ADMIN") redirect("/panel/kocluk");

  const t = panelCoachingCopy[await getLocale()].newOffer;

  // §4.5 — Ücretli hizmet satan herkesin durumu doğrulanmış olmalı
  if (user.verification !== "LEVEL_2") {
    return (
      <div className="flex flex-col gap-6">
        <Section title={t.title} />
        <Alert tone="amber" title={t.verifyTitle}>
          {t.verifyBody}
        </Alert>
        <ButtonLink href="/panel/dogrulama" className="self-start">
          {t.verifyCta}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Section
        title={t.title}
        subtitle={t.subtitle.replace("{rate}", String(COACHING_FEE_RATE * 100))}
      />
      <Alert tone="neutral" title={t.policyTitle}>
        {t.policyBody}
      </Alert>
      <CoachingOfferForm />
    </div>
  );
}
