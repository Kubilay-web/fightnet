"use client";

import { createBetaCode } from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Select, Field, Switch } from "@/components/ui";

export function BetaCodeForm() {
  return (
    <FormShell action={createBetaCode} submitLabel="Kod Oluştur">
      {() => (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Kod" hint="Boş bırakılırsa otomatik üretilir">
              <Input name="code" maxLength={24} placeholder="FN-XXXXXX" className="uppercase font-mono" />
            </Field>
            <Field label="Etiket">
              <Input name="label" maxLength={80} placeholder="MMA Spirit Frankfurt" />
            </Field>
            <Field label="Maks. kullanım">
              <Input type="number" name="maxUses" defaultValue={1} min={1} max={10000} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rol ver" hint="Kod kullanıldığında atanacak rol">
              <Select name="grantsRole" defaultValue="">
                <option value="">Yok</option>
                <option value="ATHLETE">Sporcu</option>
                <option value="COACH">Antrenör</option>
                <option value="GYM_OWNER">Salon İşletmecisi</option>
                <option value="ORGANIZER">Organizatör</option>
              </Select>
            </Field>
            <Field label="Son geçerlilik">
              <Input type="date" name="expiresAt" />
            </Field>
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4">
            <Switch name="isFounder" label="Kurucu Üye ayrıcalığı ver (ömür boyu 50 €/ay + rozet)" />
          </div>
        </>
      )}
    </FormShell>
  );
}
