"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { updateSettings, changePassword, deleteAccount, exportMyData } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Select, Field, Switch, Button } from "@/components/ui";
// TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir
import { VISIBILITY_LABEL } from "@/lib/constants";
import { useLocale } from "@/components/i18n/provider";
import { panelSettingsCopy } from "@/lib/i18n/pages/panel-settings";

export function SettingsForm({
  initial,
}: {
  initial: { locale: string; theme: string; visibility: string; pushEnabled: boolean; emailEnabled: boolean };
}) {
  const t = panelSettingsCopy[useLocale()].settingsForm;

  return (
    <FormShell action={updateSettings} submitLabel={t.submit}>
      {() => (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.language} hint={t.languageHint}>
              <Select name="locale" defaultValue={initial.locale}>
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
              </Select>
            </Field>

            <Field label={t.theme}>
              <Select name="theme" defaultValue={initial.theme}>
                <option value="dark">{t.themes.dark}</option>
                <option value="light">{t.themes.light}</option>
                <option value="system">{t.themes.system}</option>
              </Select>
            </Field>

            <Field label={t.defaultVisibility}>
              <Select name="visibility" defaultValue={initial.visibility}>
                {Object.entries(VISIBILITY_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4">
            <Switch name="pushEnabled" defaultChecked={initial.pushEnabled} label={t.pushSwitch} />
            <Switch name="emailEnabled" defaultChecked={initial.emailEnabled} label={t.emailSwitch} />
          </div>
        </>
      )}
    </FormShell>
  );
}

export function PasswordForm() {
  const t = panelSettingsCopy[useLocale()].passwordForm;

  return (
    <FormShell action={changePassword} submitLabel={t.submit}>
      {(state) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.current} error={state.fields?.current} required>
            <Input type="password" name="current" required autoComplete="current-password" />
          </Field>
          <Field label={t.next} error={state.fields?.next} hint={t.nextHint} required>
            <Input type="password" name="next" required minLength={8} autoComplete="new-password" />
          </Field>
        </div>
      )}
    </FormShell>
  );
}

export function DataExportPanel() {
  const t = panelSettingsCopy[useLocale()].export;
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const json = await exportMyData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fightnet-verilerim-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-bold">{t.title}</p>
        <p className="text-sm text-muted">{t.body}</p>
      </div>
      <Button variant="outline" onClick={download} disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        {t.button}
      </Button>
    </div>
  );
}

export function DeleteAccountForm({ username }: { username: string }) {
  const t = panelSettingsCopy[useLocale()].deleteForm;

  return (
    <FormShell action={deleteAccount} submitLabel={t.submit}>
      {(state) => (
        <Field
          label={t.confirmLabel(username)}
          error={state.fields?.confirm}
          required
        >
          <Input name="confirm" required placeholder={username} autoComplete="off" />
        </Field>
      )}
    </FormShell>
  );
}
