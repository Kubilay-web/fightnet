"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button, Input, Textarea, Select, Field, Checkbox } from "@/components/ui";
import type { DataLicenseFormCopy } from "@/lib/i18n/pages/data-license";

/**
 * §4.4 — Veri lisansı başvuru formu (kamuya açık, giriş gerektirmez).
 *
 * Veri kümesi listesi ve metinler sunucudan prop olarak gelir: `lib/data-license`
 * server-only, çeviriler ise sayfaya ait olduğu için genel sözlüğe konmadı.
 */
export function DataLicenseForm({
  datasets,
  copy,
}: {
  datasets: [string, string][];
  copy: DataLicenseFormCopy;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/data-license/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization: fd.get("organization"),
        contactName: fd.get("contactName"),
        contactEmail: fd.get("contactEmail"),
        vatId: fd.get("vatId") || "",
        country: fd.get("country") || "DE",
        scopes: fd.getAll("scopes[]"),
        useCase: fd.get("useCase"),
      }),
    });

    if (res.ok) {
      setState("done");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? copy.errorFallback);
    setState("idle");
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8 text-center">
        <CheckCircle2 className="size-8 text-emerald-500" />
        <p className="font-bold">{copy.doneTitle}</p>
        <p className="max-w-sm text-sm text-muted">{copy.doneBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.organization.label} required>
          <Input
            name="organization"
            required
            minLength={2}
            maxLength={120}
            placeholder={copy.organization.placeholder}
          />
        </Field>

        <Field label={copy.contactName.label} required>
          <Input
            name="contactName"
            required
            minLength={2}
            maxLength={80}
            placeholder={copy.contactName.placeholder}
            autoComplete="name"
          />
        </Field>

        <Field label={copy.contactEmail.label} required>
          <Input
            name="contactEmail"
            type="email"
            required
            placeholder={copy.contactEmail.placeholder}
            autoComplete="email"
          />
        </Field>

        <Field label={copy.vatId.label} hint={copy.vatId.hint}>
          <Input name="vatId" maxLength={40} placeholder={copy.vatId.placeholder} />
        </Field>

        <Field label={copy.country.label}>
          <Select name="country" defaultValue="DE">
            <option value="DE">{copy.country.options.DE}</option>
            <option value="AT">{copy.country.options.AT}</option>
            <option value="CH">{copy.country.options.CH}</option>
            <option value="TR">{copy.country.options.TR}</option>
            <option value="NL">{copy.country.options.NL}</option>
            <option value="FR">{copy.country.options.FR}</option>
          </Select>
        </Field>
      </div>

      <Field label={copy.scopes.label} required>
        <div className="flex flex-col gap-2">
          {datasets.map(([key, description]) => (
            <Checkbox
              key={key}
              name="scopes[]"
              value={key}
              label={
                <span>
                  <code className="font-mono text-xs font-bold text-[var(--fg)]">{key}</code> — {description}
                </span>
              }
            />
          ))}
        </div>
      </Field>

      <Field label={copy.useCase.label} hint={copy.useCase.hint} required>
        <Textarea
          name="useCase"
          required
          minLength={30}
          maxLength={2000}
          rows={5}
          placeholder={copy.useCase.placeholder}
        />
      </Field>

      <Button type="submit" size="lg" full disabled={state === "loading"}>
        {state === "loading" ? <Loader2 className="size-5 animate-spin" /> : copy.submit}
      </Button>

      {error && <p className="text-sm font-medium text-blood-500">{error}</p>}
      <p className="text-xs text-muted">{copy.legal}</p>
    </form>
  );
}
