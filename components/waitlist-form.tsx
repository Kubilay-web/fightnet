"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "@/components/i18n/link";
import { Button, Input, Select, Field } from "@/components/ui";
import { TARGET_CITIES } from "@/lib/constants";
import { useDict } from "@/components/i18n/provider";

export function WaitlistForm({ source = "landing", compact }: { source?: string; compact?: boolean }) {
  // Form dört ayrı sayfada gömülü olduğu için metinler prop yerine sözlükten
  // okunur; her çağıran sayfanın aynı metin bloğunu geçirmesi gerekmez.
  const t = useDict().waitlist;
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        name: fd.get("name") || "",
        city: fd.get("city") || "",
        role: fd.get("role") || "ATHLETE",
        gymName: fd.get("gymName") || "",
        source,
      }),
    });
    if (res.ok) {
      setState("done");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? t.error);
    setState("idle");
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8 text-center">
        <CheckCircle2 className="size-8 text-emerald-500" />
        <p className="font-bold">{t.doneTitle}</p>
        <p className="max-w-sm text-sm text-muted">{t.doneBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className={compact ? "flex flex-col gap-3 sm:flex-row" : "grid gap-3 sm:grid-cols-2"}>
        <Field label={compact ? undefined : t.email} className="flex-1">
          <Input
            name="email"
            type="email"
            required
            placeholder={t.emailPlaceholder}
            autoComplete="email"
          />
        </Field>

        {!compact && (
          <>
            <Field label={t.name}>
              <Input name="name" placeholder={t.namePlaceholder} autoComplete="name" />
            </Field>

            <Field label={t.city}>
              <Input name="city" list="fn-cities" placeholder="Frankfurt" autoComplete="address-level2" />
              <datalist id="fn-cities">
                {TARGET_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>

            <Field label={t.role}>
              <Select name="role" defaultValue="ATHLETE">
                <option value="ATHLETE">{t.roleAthlete}</option>
                <option value="COACH">{t.roleCoach}</option>
                <option value="GYM_OWNER">{t.roleGymOwner}</option>
                <option value="ORGANIZER">{t.roleOrganizer}</option>
                <option value="FAN">{t.roleFan}</option>
              </Select>
            </Field>

            <Field label={t.gymName} className="sm:col-span-2">
              <Input name="gymName" placeholder="MMA Spirit Frankfurt" />
            </Field>
          </>
        )}

        {compact && (
          <Button type="submit" disabled={state === "loading"} className="sm:w-auto">
            {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : t.submitCompact}
          </Button>
        )}
      </div>

      {!compact && (
        <Button type="submit" size="lg" full disabled={state === "loading"}>
          {state === "loading" ? <Loader2 className="size-5 animate-spin" /> : t.submit}
        </Button>
      )}

      {error && <p className="text-sm font-medium text-blood-500">{error}</p>}
      <p className="text-xs text-muted">
        {t.legalLead}{" "}
        <Link href="/gizlilik" className="underline">
          {t.legalLink}
        </Link>
        {t.legalTail}
      </p>
    </form>
  );
}
