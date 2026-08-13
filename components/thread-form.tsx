"use client";

import { createThread } from "@/app/(site)/forum/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Select, Field } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { communityFormsCopy } from "@/lib/i18n/pages/community-forms";

export function ThreadForm({ categories }: { categories: { id: string; name: string }[] }) {
  const t = communityFormsCopy[useLocale()].threadForm;

  return (
    <FormShell action={createThread} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field label={t.category} error={state.fields?.categoryId} required>
            <Select name="categoryId" required defaultValue="">
              <option value="" disabled>
                {t.select}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.title} error={state.fields?.title} required>
            <Input name="title" required minLength={5} maxLength={140} placeholder={t.titlePlaceholder} />
          </Field>

          <Field label={t.body} error={state.fields?.body} required>
            <Textarea name="body" required rows={8} minLength={10} maxLength={8000} />
          </Field>

          <Field label={t.tags} hint={t.tagsHint}>
            <Input name="tags" maxLength={200} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
