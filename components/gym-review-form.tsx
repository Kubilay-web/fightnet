"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { submitGymReview } from "@/app/(site)/salonlar/actions";
import { FormShell } from "@/components/form-shell";
import { Textarea, Field, ButtonLink } from "@/components/ui";
import { cn } from "@/lib/utils";

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
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const bound = submitGymReview.bind(null, gymId);

  if (!authed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted">
          Bu salonda antrenman yaptıysan deneyimini paylaşabilirsin. Değerlendirme yazmak için giriş yap.
        </p>
        <ButtonLink href="/giris" size="sm" variant="outline">
          Giriş yap
        </ButtonLink>
      </div>
    );
  }

  return (
    <FormShell action={bound} submitLabel={initial ? "Değerlendirmemi Güncelle" : "Değerlendirmeyi Gönder"}>
      {(state) => (
        <>
          <Field label="Puanın" error={state.fields?.rating} required>
            <div className="flex gap-1" role="radiogroup" aria-label="Puan">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} yıldız`}
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

          <Field
            label="Deneyimin"
            hint="Antrenman kalitesi, atmosfer, temizlik, yeni gelenlere yaklaşım. Kişisel saldırı içeren yorumlar kaldırılır."
          >
            <Textarea name="comment" rows={4} maxLength={1000} defaultValue={initial?.comment ?? ""} />
          </Field>

          <p className="text-xs text-muted">
            <Link href="/topluluk-kurallari" className="font-semibold text-blood-500 hover:underline">
              Topluluk kuralları
            </Link>{" "}
            değerlendirmeler için de geçerlidir.
          </p>
        </>
      )}
    </FormShell>
  );
}
