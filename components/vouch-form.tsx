"use client";

import { vouchAthlete } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Field } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { vouchFormCopy } from "@/lib/i18n/pages/panel-trust";

export function VouchForm() {
  const t = vouchFormCopy[useLocale()];

  return (
    <FormShell action={vouchAthlete} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field
            label={t.username.label}
            error={state.fields?.username}
            hint={t.username.hint}
            required
          >
            <Input
              name="username"
              required
              maxLength={24}
              placeholder={t.username.placeholder}
              className="lowercase"
            />
          </Field>

          <Field label={t.note.label} hint={t.note.hint}>
            <Textarea name="note" rows={2} maxLength={300} placeholder={t.note.placeholder} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
