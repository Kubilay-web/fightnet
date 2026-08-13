"use client";

import { ShieldAlert } from "lucide-react";
import { resendGuardianConsent } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Card, CardBody, Input, Field } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { panelSettingsCopy } from "@/lib/i18n/pages/panel-settings";

/**
 * §11.1 Kapı 1 — Veli onayı beklerken üyeye durumu ve kısıtlamaları açıkça
 * gösterir. Kısıtlama gizli değil: neyin kapalı olduğunu ve nasıl açılacağını
 * söylemek "Trust by Design" ilkesinin (§8.4) gereği.
 */
export function GuardianNotice({ guardianEmail }: { guardianEmail: string | null }) {
  const t = panelSettingsCopy[useLocale()].guardian;

  return (
    <Card className="border-amber-500/40">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-bold">{t.title}</p>
            <p className="mt-0.5 text-sm text-muted">{t.body}</p>
          </div>
        </div>

        <FormShell action={resendGuardianConsent} submitLabel={t.submit}>
          {(state) => (
            <Field
              label={t.emailLabel}
              hint={guardianEmail ? t.savedHint(guardianEmail) : t.defaultHint}
              error={state.fields?.guardianEmail}
            >
              <Input
                type="email"
                name="guardianEmail"
                defaultValue={guardianEmail ?? ""}
                placeholder={t.placeholder}
                required={!guardianEmail}
              />
            </Field>
          )}
        </FormShell>
      </CardBody>
    </Card>
  );
}
