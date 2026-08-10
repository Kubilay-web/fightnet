"use client";

import { createForumCategory } from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Select, Field } from "@/components/ui";
import { DISCIPLINES } from "@/lib/constants";

export function ForumCategoryForm() {
  return (
    <FormShell action={createForumCategory} submitLabel="Kategori Oluştur">
      {() => (
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Kategori adı" required className="sm:col-span-2">
            <Input name="name" required maxLength={60} placeholder="MMA Genel" />
          </Field>
          <Field label="Disiplin">
            <Select name="discipline" defaultValue="">
              <option value="">Genel</option>
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sıra">
            <Input type="number" name="order" defaultValue={0} min={0} max={99} />
          </Field>
          <Field label="Açıklama" className="sm:col-span-4">
            <Input name="description" maxLength={200} />
          </Field>
        </div>
      )}
    </FormShell>
  );
}
