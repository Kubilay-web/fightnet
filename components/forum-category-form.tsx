"use client";

import { createForumCategory } from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { useLocale } from "@/components/i18n/provider";
import { Input, Select, Field } from "@/components/ui";
import { DISCIPLINES } from "@/lib/constants";
import { forumCategoryFormCopy } from "@/lib/i18n/pages/admin-forms";

export function ForumCategoryForm() {
  const t = forumCategoryFormCopy[useLocale()];

  return (
    <FormShell action={createForumCategory} submitLabel={t.submit}>
      {() => (
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label={t.name} required className="sm:col-span-2">
            <Input name="name" required maxLength={60} placeholder={t.namePlaceholder} />
          </Field>
          <Field label={t.discipline}>
            <Select name="discipline" defaultValue="">
              <option value="">{t.general}</option>
              {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.order}>
            <Input type="number" name="order" defaultValue={0} min={0} max={99} />
          </Field>
          <Field label={t.description} className="sm:col-span-4">
            <Input name="description" maxLength={200} />
          </Field>
        </div>
      )}
    </FormShell>
  );
}
