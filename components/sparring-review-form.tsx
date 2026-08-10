"use client";

import { useState } from "react";
import { Star, ShieldAlert } from "lucide-react";
import { submitSparringReview } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Textarea, Field, Checkbox } from "@/components/ui";
import { cn } from "@/lib/utils";

/** §11.2 — Sparring sonrası güvenlik ve itibar değerlendirmesi */
export function SparringReviewForm({ requestId, partnerName }: { requestId: string; partnerName: string }) {
  return (
    <FormShell action={submitSparringReview} submitLabel="Değerlendirmeyi Gönder">
      {() => (
        <>
          <input type="hidden" name="requestId" value={requestId} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Rating
              name="safety"
              label="Güvenlik"
              hint="Kontrollü müydü?"
            />
            <Rating name="technique" label="Teknik" hint="Teknik seviye" />
            <Rating name="punctuality" label="Dakiklik" hint="Zamanında geldi mi?" />
          </div>

          <Checkbox name="wouldRepeat" defaultChecked label={`${partnerName} ile tekrar sparring yaparım`} />

          <Field label="Yorum">
            <Textarea name="comment" rows={2} maxLength={500} placeholder="Kısa geri bildirim (opsiyonel)" />
          </Field>

          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
            <Checkbox
              name="flagUnsafe"
              label={
                <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="size-4" />
                  Güvensiz davranış bildir (moderasyona iletilir)
                </span>
              }
            />
          </div>
        </>
      )}
    </FormShell>
  );
}

function Rating({ name, label, hint }: { name: string; label: string; hint?: string }) {
  const [value, setValue] = useState(4);
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            aria-label={`${label} ${n} yıldız`}
            aria-pressed={value === n}
            className="p-0.5"
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                n <= value ? "fill-gold-500 text-gold-500" : "text-ink-300 dark:text-ink-700",
              )}
            />
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
    </Field>
  );
}
