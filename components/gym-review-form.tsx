"use client";

import { useState } from "react";
import { Link } from "@/components/i18n/link";
import { Star } from "lucide-react";
import { submitGymReview } from "@/app/(site)/salonlar/actions";
import { FormShell } from "@/components/form-shell";
import { Textarea, Field, ButtonLink } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/provider";
import { gymAdminCopy } from "@/lib/i18n/pages/gym-admin";

/** Salon değerlendirme formu — yalnızca giriş yapmış üyeler için */
export function GymReviewForm({
  gymId,
  authed,
  initial,
}: {
  gymId: string;
  authed: boolean;
  initial?: { rating: number; comment: string | null } | null;
}) {
  const t = gymAdminCopy[useLocale()].reviewForm;
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const bound = submitGymReview.bind(null, gymId);

  if (!authed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted">{t.guestBody}</p>
        <ButtonLink href="/giris" size="sm" variant="outline">
          {t.login}
        </ButtonLink>
      </div>
    );
  }

  return (
    <FormShell action={bound} submitLabel={initial ? t.submitUpdate : t.submitCreate}>
      {(state) => (
        <>
          <Field label={t.rating} error={state.fields?.rating} required>
            <div className="flex gap-1" role="radiogroup" aria-label={t.ratingGroup}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={t.star(n)}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="rounded-lg p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "size-7",
                      n <= (hover || rating)
                        ? "fill-gold-500 text-gold-500"
                        : "text-ink-300 dark:text-ink-700",
                    )}
                  />
                </button>
              ))}
            </div>
            <input type="hidden" name="rating" value={rating} />
          </Field>

          <Field label={t.experience} hint={t.experienceHint}>
            <Textarea name="comment" rows={4} maxLength={1000} defaultValue={initial?.comment ?? ""} />
          </Field>

          <p className="text-xs text-muted">
            <Link href="/topluluk-kurallari" className="font-semibold text-blood-500 hover:underline">
              {t.guidelines}
            </Link>
            {t.guidelinesSuffix}
          </p>
        </>
      )}
    </FormShell>
  );
}
