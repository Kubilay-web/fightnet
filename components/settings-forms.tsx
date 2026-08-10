"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { updateSettings, changePassword, deleteAccount, exportMyData } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Select, Field, Switch, Button } from "@/components/ui";
import { VISIBILITY_LABEL } from "@/lib/constants";

export function SettingsForm({
  initial,
}: {
  initial: { locale: string; theme: string; visibility: string; pushEnabled: boolean; emailEnabled: boolean };
}) {
  return (
    <FormShell action={updateSettings} submitLabel="Ayarları Kaydet">
      {() => (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Dil" hint="§5.2 — Almanca, İngilizce, Türkçe">
              <Select name="locale" defaultValue={initial.locale}>
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
              </Select>
            </Field>

            <Field label="Tema">
              <Select name="theme" defaultValue={initial.theme}>
                <option value="dark">Karanlık</option>
                <option value="light">Açık</option>
                <option value="system">Sistem</option>
              </Select>
            </Field>

            <Field label="Varsayılan görünürlük">
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
            <Switch name="pushEnabled" defaultChecked={initial.pushEnabled} label="Push bildirimleri" />
            <Switch name="emailEnabled" defaultChecked={initial.emailEnabled} label="E-posta bildirimleri" />
          </div>
        </>
      )}
    </FormShell>
  );
}

export function PasswordForm() {
  return (
    <FormShell action={changePassword} submitLabel="Şifreyi Değiştir">
      {(state) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mevcut şifre" error={state.fields?.current} required>
            <Input type="password" name="current" required autoComplete="current-password" />
          </Field>
          <Field label="Yeni şifre" error={state.fields?.next} hint="En az 8 karakter, bir rakam" required>
            <Input type="password" name="next" required minLength={8} autoComplete="new-password" />
          </Field>
        </div>
      )}
    </FormShell>
  );
}

export function DataExportPanel() {
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
        <p className="font-bold">Verilerimi indir</p>
        <p className="text-sm text-muted">
          Profilin, antrenman kayıtların, gönderilerin ve rezervasyonların JSON formatında.
        </p>
      </div>
      <Button variant="outline" onClick={download} disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        JSON İndir
      </Button>
    </div>
  );
}

export function DeleteAccountForm({ username }: { username: string }) {
  return (
    <FormShell action={deleteAccount} submitLabel="Hesabımı Kalıcı Olarak Sil">
      {(state) => (
        <Field
          label={`Onaylamak için kullanıcı adını yaz: ${username}`}
          error={state.fields?.confirm}
          required
        >
          <Input name="confirm" required placeholder={username} autoComplete="off" />
        </Field>
      )}
    </FormShell>
  );
}
