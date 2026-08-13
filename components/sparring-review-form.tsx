"use client";

import { useState } from "react";
import { Star, ShieldAlert } from "lucide-react";
import { submitSparringReview } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Textarea, Field, Checkbox } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/provider";
import { panelSparringCopy } from "@/lib/i18n/pages/panel-sparring";

/** §11.2 — Sparring sonrası güvenlik ve itibar değerlendirmesi */
export function SparringReviewForm({ requestId, partnerName }: { requestId: string; partnerName: string }) {
  const t = panelSparringCopy[useLocale()].review;

  return (
    <FormShell action={submitSparringReview} submitLabel={t.submit}>
      {() => (
        <>
          <input type="hidden" name="requestId" value={requestId} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Rating
              name="safety"
              label={t.safety}
              hint={t.safetyHint}
              starAria={t.starAria}
            />
            <Rating name="technique" label={t.technique} hint={t.techniqueHint} starAria={t.starAria} />
            <Rating name="punctuality" label={t.punctuality} hint={t.punctualityHint} starAria={t.starAria} />
          </div>

          <Checkbox name="wouldRepeat" defaultChecked label={t.wouldRepeat(partnerName)} />

          <Field label={t.comment}>
            <Textarea name="comment" rows={2} maxLength={500} placeholder={t.commentPlaceholder} />
          </Field>

          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
            <Checkbox
              name="flagUnsafe"
              label={
                <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="size-4" />
                  {t.flagUnsafe}
                </span>
              }
            />
          </div>
        </>
      )}
    </FormShell>
  );
}

function Rating({
  name,
  label,
  hint,
  starAria,
}: {
  name: string;
  label: string;
  hint?: string;
  starAria: (label: string, n: number) => string;
}) {
  const [value, setValue] = useState(4);
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            aria-label={starAria(label, n)}
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
