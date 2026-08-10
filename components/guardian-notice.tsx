"use client";

import { ShieldAlert } from "lucide-react";
import { resendGuardianConsent } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Card, CardBody, Input, Field } from "@/components/ui";

/**
 * §11.1 Kapı 1 — Veli onayı beklerken üyeye durumu ve kısıtlamaları açıkça
 * gösterir. Kısıtlama gizli değil: neyin kapalı olduğunu ve nasıl açılacağını
 * söylemek "Trust by Design" ilkesinin (§8.4) gereği.
 */
export function GuardianNotice({ guardianEmail }: { guardianEmail: string | null }) {
  return (
    <Card className="border-amber-500/40">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-bold">Veli onayı bekleniyor</p>
            <p className="mt-0.5 text-sm text-muted">
              18 yaşın altındasın. Velin onaylayana kadar sparring eşleşmesi, müsabaka kaydı ve
              yetişkinlerden gelen mesajlar kapalı. Profilin, antrenman günlüğün ve akış her zaman açık.
            </p>
          </div>
        </div>

        <FormShell action={resendGuardianConsent} submitLabel="Onay bağlantısını gönder">
          {(state) => (
            <Field
              label="Veli e-postası"
              hint={guardianEmail ? `Kayıtlı: ${guardianEmail}` : "Onay bağlantısı bu adrese gider"}
              error={state.fields?.guardianEmail}
            >
              <Input
                type="email"
                name="guardianEmail"
                defaultValue={guardianEmail ?? ""}
                placeholder="veli@ornek.de"
                required={!guardianEmail}
              />
            </Field>
          )}
        </FormShell>
      </CardBody>
    </Card>
  );
}
