"use client";

import { vouchAthlete } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Field } from "@/components/ui";

export function VouchForm() {
  return (
    <FormShell action={vouchAthlete} submitLabel="Kefil Ol">
      {(state) => (
        <>
          <Field
            label="Sporcunun kullanıcı adı"
            error={state.fields?.username}
            hint="Sporcu FIGHTNET'e kayıtlı olmalı"
            required
          >
            <Input name="username" required maxLength={24} placeholder="ahmetyilmaz" className="lowercase" />
          </Field>

          <Field label="Not" hint="Sporcuyu ne kadar süredir tanıyorsun?">
            <Textarea name="note" rows={2} maxLength={300} placeholder="2 yıldır salonumda antrenman yapıyor" />
          </Field>
        </>
      )}
    </FormShell>
  );
}
