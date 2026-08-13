"use client";

import { FormShell } from "@/components/form-shell";
import { Field, Input, Checkbox, Alert } from "@/components/ui";
import { connectDevice } from "@/app/panel/cihazlar/actions";
import type { HealthProvider } from "@/lib/services/health";
import { useLocale } from "@/components/i18n/provider";
import { deviceFormCopy } from "@/lib/i18n/pages/panel-devices";

/**
 * §4.4 — Sağlayıcı bağlama formu.
 *
 * Cihaz üstü sağlayıcılarda sunucu bir cihaz jetonu üretir ve bunu yalnızca
 * bu yanıtta gösterir; bulut sağlayıcılarda eylem OAuth akışına yönlendirir.
 */
export function DeviceConnectForm({
  provider,
  label,
  kind,
}: {
  provider: HealthProvider;
  label: string;
  kind: "device" | "cloud";
}) {
  const t = deviceFormCopy[useLocale()];

  return (
    <FormShell
      action={connectDevice}
      submitLabel={
        kind === "cloud" ? t.authorizeWith.replace("{provider}", label) : t.generateToken
      }
      className="flex flex-col gap-3"
    >
      {(state) => (
        <>
          <input type="hidden" name="provider" value={provider} />

          <Field label={t.deviceName.label} hint={t.deviceName.hint} error={state.fields?.deviceName}>
            <Input name="deviceName" maxLength={80} placeholder={label} />
          </Field>

          <Checkbox
            name="consent"
            value="on"
            required
            label={
              <>
                <span className="font-bold text-[var(--fg)]">{t.consentBold}</span>{" "}
                {t.consentBody.replace("{provider}", label)}
              </>
            }
          />
          {state.fields?.consent && (
            <p className="text-xs font-medium text-blood-500">{state.fields.consent}</p>
          )}

          {state.ok && state.message && (
            <Alert tone="amber" title={t.token.title}>
              {t.token.body}
            </Alert>
          )}
        </>
      )}
    </FormShell>
  );
}
