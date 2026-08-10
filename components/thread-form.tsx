"use client";

import { createThread } from "@/app/(site)/forum/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Select, Field } from "@/components/ui";

export function ThreadForm({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <FormShell action={createThread} submitLabel="Konuyu Aç">
      {(state) => (
        <>
          <Field label="Kategori" error={state.fields?.categoryId} required>
            <Select name="categoryId" required defaultValue="">
              <option value="" disabled>
                Seç
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Başlık" error={state.fields?.title} required>
            <Input name="title" required minLength={5} maxLength={140} placeholder="Kısa ve net bir başlık" />
          </Field>

          <Field label="İçerik" error={state.fields?.body} required>
            <Textarea name="body" required rows={8} minLength={10} maxLength={8000} />
          </Field>

          <Field label="Etiketler" hint="Virgülle ayır: teknik, ekipman">
            <Input name="tags" maxLength={200} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
