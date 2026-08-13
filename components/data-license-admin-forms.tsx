"use client";

import { reviewDataLicense } from "@/app/admin/veri-lisansi/actions";
import { FormShell } from "@/components/form-shell";
import { useLocale } from "@/components/i18n/provider";
import { Input, Textarea, Select, Field } from "@/components/ui";
import { dataLicenseAdminCopy } from "@/lib/i18n/pages/admin-forms";

/**
 * §4.4 — Lisans değerlendirme formu.
 * Onayda üretilen düz anahtar yalnızca bu formun başarı mesajında görünür,
 * sayfa yenilendiğinde bir daha erişilemez.
 */
export function DataLicenseReviewForm({
  licenseId,
  annualFee,
  rateLimit,
  reviewNote,
}: {
  licenseId: string;
  annualFee: number;
  rateLimit: number;
  reviewNote: string | null;
}) {
  const t = dataLicenseAdminCopy[useLocale()];

  return (
    <FormShell action={reviewDataLicense} submitLabel={t.submit} className="flex flex-col gap-3">
      {(state) => (
        <>
          <input type="hidden" name="licenseId" value={licenseId} />

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t.decision} error={state.fields?.decision} required>
              <Select name="decision" defaultValue="APPROVE">
                <option value="APPROVE">{t.approve}</option>
                <option value="REJECT">{t.reject}</option>
                <option value="SUSPEND">{t.suspend}</option>
              </Select>
            </Field>

            <Field label={t.annualFee} hint={t.annualFeeHint} error={state.fields?.annualFee}>
              <Input type="number" name="annualFee" min={0} max={100000} step={50} defaultValue={annualFee} />
            </Field>

            <Field label={t.rateLimit} hint={t.rateLimitHint} error={state.fields?.rateLimit}>
              <Input type="number" name="rateLimit" min={10} max={6000} defaultValue={rateLimit} />
            </Field>
          </div>

          <Field label={t.reviewNote} error={state.fields?.reviewNote}>
            <Textarea name="reviewNote" rows={2} maxLength={1000} defaultValue={reviewNote ?? ""} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
