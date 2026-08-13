"use client";

import { createBetaCode } from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { useLocale } from "@/components/i18n/provider";
import { Input, Select, Field, Switch } from "@/components/ui";
import { betaCodeFormCopy } from "@/lib/i18n/pages/admin-forms";

export function BetaCodeForm() {
  const t = betaCodeFormCopy[useLocale()];

  return (
    <FormShell action={createBetaCode} submitLabel={t.submit}>
      {() => (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.code} hint={t.codeHint}>
              <Input name="code" maxLength={24} placeholder={t.codePlaceholder} className="uppercase font-mono" />
            </Field>
            <Field label={t.label}>
              <Input name="label" maxLength={80} placeholder={t.labelPlaceholder} />
            </Field>
            <Field label={t.maxUses}>
              <Input type="number" name="maxUses" defaultValue={1} min={1} max={10000} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.grantsRole} hint={t.grantsRoleHint}>
              <Select name="grantsRole" defaultValue="">
                <option value="">{t.roleNone}</option>
                <option value="ATHLETE">{t.roleAthlete}</option>
                <option value="COACH">{t.roleCoach}</option>
                <option value="GYM_OWNER">{t.roleGymOwner}</option>
                <option value="ORGANIZER">{t.roleOrganizer}</option>
              </Select>
            </Field>
            <Field label={t.expiresAt}>
              <Input type="date" name="expiresAt" />
            </Field>
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4">
            <Switch name="isFounder" label={t.founder} />
          </div>
        </>
      )}
    </FormShell>
  );
}
