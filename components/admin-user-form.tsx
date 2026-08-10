"use client";

import { updateUserAdmin } from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Select, Field, Switch } from "@/components/ui";
import { ROLE_LABEL } from "@/lib/constants";
import type { Role, VerificationLevel } from "@prisma/client";

export function AdminUserForm({
  userId,
  initial,
}: {
  userId: string;
  initial: {
    role: Role;
    verification: VerificationLevel;
    isActive: boolean;
    isBanned: boolean;
    isFounder: boolean;
    banReason: string;
  };
}) {
  return (
    <FormShell action={updateUserAdmin.bind(null, userId)} submitLabel="Kullanıcıyı Güncelle">
      {() => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rol">
              <Select name="role" defaultValue={initial.role}>
                {Object.entries(ROLE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Doğrulama seviyesi">
              <Select name="verification" defaultValue={initial.verification}>
                <option value="LEVEL_0">Seviye 0 — E-posta</option>
                <option value="LEVEL_1">Seviye 1 — Kimlik</option>
                <option value="LEVEL_2">Seviye 2 — Durum</option>
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4">
            <Switch name="isActive" defaultChecked={initial.isActive} label="Hesap aktif" />
            <Switch name="isFounder" defaultChecked={initial.isFounder} label="Kurucu Üye rozeti" />
            <Switch name="isBanned" defaultChecked={initial.isBanned} label="Askıya al" />
          </div>

          <Field label="Askıya alma sebebi" hint="Kullanıcıya gösterilir">
            <Input name="banReason" defaultValue={initial.banReason} maxLength={300} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
