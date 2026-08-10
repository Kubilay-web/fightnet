"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button, Input, Select, Textarea, Field } from "@/components/ui";

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
    setError(j.error ?? "Rezervasyon oluşturulamadı");
    setState("idle");
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-6 text-center">
        <CheckCircle2 className="size-7 text-emerald-500" />
        <p className="font-bold">Talebin gönderildi</p>
        <p className="text-sm text-muted">Salon onayladığında bildirim alacaksın.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field label="Rezervasyon türü">
        <Select name="type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="TRIAL">Deneme Antrenmanı (ücretsiz)</option>
          <option value="DROP_IN">Drop-in{dropInPrice ? ` · ${dropInPrice} €` : ""}</option>
          <option value="PRIVATE">Özel Ders</option>
        </Select>
      </Field>

      {classes.length > 0 && (
        <Field label="Ders">
          <Select name="classId" defaultValue="">
            <option value="">Fark etmez</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Tarih" required>
        <Input type="date" name="date" required min={today} />
      </Field>

      {type === "TRIAL" && (
        <>
          <Field label="Deneyimin" hint="Daha önce dövüş sporu yaptın mı?">
            <Textarea name="experience" rows={2} maxLength={300} placeholder="2 yıl boks, BJJ'e yeni başlıyorum…" />
          </Field>
          <Field label="Hedefin">
            <Textarea name="goals" rows={2} maxLength={300} placeholder="Kondisyon, müsabakaya hazırlık…" />
          </Field>
        </>
      )}

      <Field label="Telefon" hint="Salon seni arayabilsin (opsiyonel)">
        <Input name="contactPhone" type="tel" maxLength={30} autoComplete="tel" />
      </Field>

      {error && <p className="text-xs font-medium text-blood-500">{error}</p>}

      <Button type="submit" full disabled={state === "loading"}>
        {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : authed ? "Rezervasyon Yap" : "Giriş yap ve rezerve et"}
      </Button>
    </form>
  );
}
