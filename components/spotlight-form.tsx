"use client";

import { setSpotlight } from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Field } from "@/components/ui";

export function SpotlightForm() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <FormShell action={setSpotlight} submitLabel="Spotlight'a Al">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sporcu" error={state.fields?.userId} hint="Kullanıcı adı veya ID" required>
              <Input name="userId" required maxLength={40} placeholder="ahmetyilmaz" />
            </Field>
            <Field label="Tarih" required>
              <Input type="date" name="date" required defaultValue={today} />
            </Field>
          </div>

          <Field label="Manşet">
            <Input name="headline" maxLength={120} placeholder="Hessen'in yükselen BJJ yıldızı" />
          </Field>

          <Field label="Kısa metin">
            <Textarea name="blurb" rows={3} maxLength={500} placeholder="Neden bu sporcu öne çıkıyor?" />
          </Field>
        </>
      )}
    </FormShell>
  );
}
