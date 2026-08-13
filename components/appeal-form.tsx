"use client";

import { createAppeal } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Select, Field } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { appealFormCopy } from "@/lib/i18n/pages/panel-trust";

const TARGET_VALUES = ["POST", "COMMENT", "THREAD", "FORUM_POST", "MESSAGE", "USER"] as const;

/** §11.5 — DSA şikayet mekanizması */
export function AppealForm() {
  const t = appealFormCopy[useLocale()];

  return (
    <FormShell action={createAppeal} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field label={t.targetType.label} error={state.fields?.targetType} required>
            <Select name="targetType" required defaultValue="">
              <option value="" disabled>
                {t.targetType.select}
              </option>
              {TARGET_VALUES.map((v) => (
                <option key={v} value={v}>
                  {t.targets[v]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={t.targetId.label}
            hint={t.targetId.hint}
            error={state.fields?.targetId}
            required
          >
            <Input name="targetId" required maxLength={200} placeholder={t.targetId.placeholder} />
          </Field>

          <Field
            label={t.body.label}
            hint={t.body.hint}
            error={state.fields?.body}
            required
          >
            <Textarea name="body" required minLength={20} maxLength={2000} rows={5} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
