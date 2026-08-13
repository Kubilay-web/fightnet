"use client";

import { setSpotlight } from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { useLocale } from "@/components/i18n/provider";
import { Input, Textarea, Field } from "@/components/ui";
import { spotlightFormCopy } from "@/lib/i18n/pages/admin-forms";

export function SpotlightForm() {
  const t = spotlightFormCopy[useLocale()];
  const today = new Date().toISOString().slice(0, 10);
  return (
    <FormShell action={setSpotlight} submitLabel={t.submit}>
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.athlete} error={state.fields?.userId} hint={t.athleteHint} required>
              <Input name="userId" required maxLength={40} placeholder={t.athletePlaceholder} />
            </Field>
            <Field label={t.date} required>
              <Input type="date" name="date" required defaultValue={today} />
            </Field>
          </div>

          <Field label={t.headline}>
            <Input name="headline" maxLength={120} placeholder={t.headlinePlaceholder} />
          </Field>

          <Field label={t.blurb}>
            <Textarea name="blurb" rows={3} maxLength={500} placeholder={t.blurbPlaceholder} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
