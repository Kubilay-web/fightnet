"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button, Input, Select, Field } from "@/components/ui";
import { TARGET_CITIES } from "@/lib/constants";

export function WaitlistForm({ source = "landing", compact }: { source?: string; compact?: boolean }) {
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
    setError(data.error ?? "Bir hata oluştu, lütfen tekrar deneyin.");
    setState("idle");
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8 text-center">
        <CheckCircle2 className="size-8 text-emerald-500" />
        <p className="font-bold">Bekleme listesindesin!</p>
        <p className="max-w-sm text-sm text-muted">
          Beta erişim kodun hazır olduğunda e-posta ile haber vereceğiz.
          Kurucu Üye ayrıcalıklarını ilk davetliler kapar.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className={compact ? "flex flex-col gap-3 sm:flex-row" : "grid gap-3 sm:grid-cols-2"}>
        <Field label={compact ? undefined : "E-posta"} className="flex-1">
          <Input name="email" type="email" required placeholder="ornek@eposta.com" autoComplete="email" />
        </Field>

        {!compact && (
          <>
            <Field label="Ad Soyad">
              <Input name="name" placeholder="Adın" autoComplete="name" />
            </Field>

            <Field label="Şehir">
              <Input name="city" list="fn-cities" placeholder="Frankfurt" autoComplete="address-level2" />
              <datalist id="fn-cities">
                {TARGET_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>

            <Field label="Sen kimsin?">
              <Select name="role" defaultValue="ATHLETE">
                <option value="ATHLETE">Sporcu</option>
                <option value="COACH">Antrenör</option>
                <option value="GYM_OWNER">Salon İşletmecisi</option>
                <option value="ORGANIZER">Organizatör</option>
                <option value="FAN">Hayran</option>
              </Select>
            </Field>

            <Field label="Salon adı (varsa)" className="sm:col-span-2">
              <Input name="gymName" placeholder="MMA Spirit Frankfurt" />
            </Field>
          </>
        )}

        {compact && (
          <Button type="submit" disabled={state === "loading"} className="sm:w-auto">
            {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : "Listeye Katıl"}
          </Button>
        )}
      </div>

      {!compact && (
        <Button type="submit" size="lg" full disabled={state === "loading"}>
          {state === "loading" ? <Loader2 className="size-5 animate-spin" /> : "Bekleme Listesine Katıl"}
        </Button>
      )}

      {error && <p className="text-sm font-medium text-blood-500">{error}</p>}
      <p className="text-xs text-muted">
        Kaydolarak <a href="/gizlilik" className="underline">gizlilik politikasını</a> kabul edersin.
        Verilerin AB'de saklanır, istediğin zaman silinebilir.
      </p>
    </form>
  );
}
