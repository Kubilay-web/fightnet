"use client";

import { updateUserAdmin } from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { useLocale } from "@/components/i18n/provider";
import { Input, Select, Field, Switch } from "@/components/ui";
import { ROLE_LABEL } from "@/lib/constants";
import { adminUserFormCopy } from "@/lib/i18n/pages/admin-forms";
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
  const t = adminUserFormCopy[useLocale()];

  return (
    <FormShell action={updateUserAdmin.bind(null, userId)} submitLabel={t.submit}>
      {() => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.role}>
              <Select name="role" defaultValue={initial.role}>
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {Object.entries(ROLE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t.verification}>
              <Select name="verification" defaultValue={initial.verification}>
                <option value="LEVEL_0">{t.level0}</option>
                <option value="LEVEL_1">{t.level1}</option>
                <option value="LEVEL_2">{t.level2}</option>
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4">
            <Switch name="isActive" defaultChecked={initial.isActive} label={t.accountActive} />
            <Switch name="isFounder" defaultChecked={initial.isFounder} label={t.founderBadge} />
            <Switch name="isBanned" defaultChecked={initial.isBanned} label={t.ban} />
          </div>

          <Field label={t.banReason} hint={t.banReasonHint}>
            <Input name="banReason" defaultValue={initial.banReason} maxLength={300} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
