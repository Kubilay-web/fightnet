"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button, Input, Select, Textarea, Field } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { panelBookingsCopy } from "@/lib/i18n/pages/panel-bookings";

/**
 * §4.2 — Deneme antrenmanı akışı.
 * Normal drop-in'den ayrı: deneyim ve hedef soruları salona öğrenciyi
 * önceden tanıtır, ilk temas kalitesini yükseltir.
 */
export function TrialBookingForm({
  gymId,
  classes,
  authed,
  dropInPrice,
}: {
  gymId: string;
  classes: { id: string; label: string }[];
  authed: boolean;
  dropInPrice?: number | null;
}) {
  const t = panelBookingsCopy[useLocale()].form;
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("TRIAL");

  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!authed) {
      router.push(`/giris?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setState("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gymId,
        classId: fd.get("classId") || "",
        type: fd.get("type"),
        date: fd.get("date"),
        experience: fd.get("experience") || "",
        goals: fd.get("goals") || "",
        contactPhone: fd.get("contactPhone") || "",
      }),
    });
    if (res.ok) {
      setState("done");
      router.refresh();
      return;
    }
    const j = await res.json().catch(() => ({}));
    setError(j.error ?? t.error);
    setState("idle");
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-6 text-center">
        <CheckCircle2 className="size-7 text-emerald-500" />
        <p className="font-bold">{t.doneTitle}</p>
        <p className="text-sm text-muted">{t.doneBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field label={t.type}>
        <Select name="type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="TRIAL">{t.trial}</option>
          <option value="DROP_IN">
            {t.dropIn}
            {dropInPrice ? ` · ${dropInPrice} €` : ""}
          </option>
          <option value="PRIVATE">{t.private}</option>
        </Select>
      </Field>

      {classes.length > 0 && (
        <Field label={t.class}>
          <Select name="classId" defaultValue="">
            <option value="">{t.any}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label={t.date} required>
        <Input type="date" name="date" required min={today} />
      </Field>

      {type === "TRIAL" && (
        <>
          <Field label={t.experience} hint={t.experienceHint}>
            <Textarea name="experience" rows={2} maxLength={300} placeholder={t.experiencePlaceholder} />
          </Field>
          <Field label={t.goals}>
            <Textarea name="goals" rows={2} maxLength={300} placeholder={t.goalsPlaceholder} />
          </Field>
        </>
      )}

      <Field label={t.phone} hint={t.phoneHint}>
        <Input name="contactPhone" type="tel" maxLength={30} autoComplete="tel" />
      </Field>

      {error && <p className="text-xs font-medium text-blood-500">{error}</p>}

      <Button type="submit" full disabled={state === "loading"}>
        {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : authed ? t.submit : t.submitGuest}
      </Button>
    </form>
  );
}
