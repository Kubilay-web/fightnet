"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CalendarClock, Star } from "lucide-react";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Textarea, Select, Field, Checkbox, Switch, Alert } from "@/components/ui";
import { Button } from "@/components/ui/button";
// TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir
import { DISCIPLINES, SKILL_LEVELS, COACHING_FORMATS, COACHING_FEE_RATE } from "@/lib/constants";
import { useLocale } from "@/components/i18n/provider";
import { panelCoachingCopy } from "@/lib/i18n/pages/panel-coaching";
import {
  createCoachingOffer,
  requestCoaching,
  scheduleCoaching,
  completeCoaching,
  reviewCoaching,
} from "@/app/panel/kocluk/actions";

/** §4.3 — Antrenörün koçluk ilanı oluşturma formu. */
export function CoachingOfferForm() {
  const t = panelCoachingCopy[useLocale()].offerForm;
  const [cover, setCover] = useState<UploadedAsset | null>(null);

  return (
    <FormShell action={createCoachingOffer} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field label={t.title} error={state.fields?.title} required>
            <Input name="title" required maxLength={120} placeholder={t.titlePlaceholder} />
          </Field>

          <Field label={t.description} error={state.fields?.description} required
            hint={t.descriptionHint}>
            <Textarea name="description" required minLength={30} maxLength={3000} rows={6} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.format} error={state.fields?.format} required>
              <Select name="format" required defaultValue="VIDEO_CALL">
                {COACHING_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label} — {f.hint}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t.level} hint={t.levelHint}>
              <Select name="level" defaultValue="">
                <option value="">{t.allLevels}</option>
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label={t.disciplines} error={state.fields?.disciplines} required>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DISCIPLINES.map((d) => (
                <Checkbox key={d.value} name="disciplines[]" value={d.value} label={`${d.emoji} ${d.label}`} />
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.price} error={state.fields?.price} required
              hint={t.priceHint.replace("{rate}", String(COACHING_FEE_RATE * 100))}>
              <Input type="number" name="price" required min={5} max={1000} step="0.5" placeholder="45" />
            </Field>
            <Field label={t.duration} error={state.fields?.durationMin}>
              <Input type="number" name="durationMin" defaultValue={60} min={15} max={240} step={5} />
            </Field>
            <Field label={t.capacity} hint={t.capacityHint}>
              <Input type="number" name="capacity" defaultValue={10} min={1} max={200} />
            </Field>
          </div>

          <Field label={t.cover}>
            <ImageUploader folder="coaching" value={cover?.url} onChange={setCover} />
            <input type="hidden" name="coverUrl" value={cover?.url ?? ""} />
            <input type="hidden" name="coverId" value={cover?.publicId ?? ""} />
          </Field>

          <Alert tone="amber" title={t.minorsTitle}>
            {t.minorsBody}
          </Alert>
          <Switch name="minorsAllowed" label={t.minorsSwitch} />
          <Switch name="isActive" defaultChecked label={t.activeSwitch} />
        </>
      )}
    </FormShell>
  );
}

/**
 * Sporcunun talep formu. Talep oluştuğunda Stripe Checkout'a yönlendirilir —
 * antrenöre iletilmesi ödemeye bağlıdır.
 */
export function CoachingRequestForm({
  offerId,
  format,
  authed,
}: {
  offerId: string;
  format: string;
  authed: boolean;
}) {
  const t = panelCoachingCopy[useLocale()].requestForm;
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay(sessionId: string) {
    setPaying(true);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "COACHING_SESSION", sessionId }),
    });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && json.url) {
      window.location.assign(json.url);
      return;
    }
    setError(json.error ?? t.payError);
    setPaying(false);
  }

  if (!authed) {
    return (
      <Button onClick={() => router.push(`/giris?next=${encodeURIComponent(`/kocluk`)}`)} full>
        {t.loginCta}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <FormShell action={requestCoaching} submitLabel={t.submit}>
        {(state) => {
          const sessionId = state.ok ? state.fields?.sessionId : undefined;
          return (
            <>
              <input type="hidden" name="offerId" value={offerId} />

              {format === "VIDEO_CALL" && (
                <Field label={t.preferredAt} hint={t.preferredAtHint}>
                  <Input type="datetime-local" name="preferredAt" />
                </Field>
              )}

              <Field label={t.note} hint={t.noteHint}>
                <Textarea name="note" maxLength={1000} rows={4} />
              </Field>

              {sessionId && (
                <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] p-3">
                  <p className="text-sm text-muted">
                    {t.ready}
                  </p>
                  <Button type="button" onClick={() => pay(sessionId)} disabled={paying}>
                    {paying ? <Loader2 className="size-4 animate-spin" /> : t.goToPayment}
                  </Button>
                </div>
              )}
            </>
          );
        }}
      </FormShell>
      {error && <p className="text-xs font-medium text-blood-500">{error}</p>}
    </div>
  );
}

export function CoachingScheduleForm({ sessionId }: { sessionId: string }) {
  const t = panelCoachingCopy[useLocale()].scheduleForm;

  return (
    <FormShell action={scheduleCoaching} submitLabel={t.submit} className="flex flex-col gap-3">
      {(state) => (
        <>
          <input type="hidden" name="sessionId" value={sessionId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t.when} error={state.fields?.scheduledAt} required>
              <Input type="datetime-local" name="scheduledAt" required />
            </Field>
            <Field label={t.meetingUrl} error={state.fields?.meetingUrl} required
              hint={t.meetingUrlHint}>
              <Input type="url" name="meetingUrl" required placeholder="https://meet.example.com/…" />
            </Field>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <CalendarClock className="size-3.5" /> {t.note}
          </p>
        </>
      )}
    </FormShell>
  );
}

export function CoachingCompleteForm({ sessionId }: { sessionId: string }) {
  const t = panelCoachingCopy[useLocale()].completeForm;

  return (
    <FormShell action={completeCoaching} submitLabel={t.submit} className="flex flex-col gap-3">
      {() => (
        <>
          <input type="hidden" name="sessionId" value={sessionId} />
          <Field label={t.note} hint={t.noteHint}>
            <Textarea name="coachNote" maxLength={3000} rows={3} />
          </Field>
        </>
      )}
    </FormShell>
  );
}

export function CoachingReviewForm({ sessionId }: { sessionId: string }) {
  const t = panelCoachingCopy[useLocale()].reviewForm;

  return (
    <FormShell action={reviewCoaching} submitLabel={t.submit} className="flex flex-col gap-3">
      {(state) => (
        <>
          <input type="hidden" name="sessionId" value={sessionId} />
          <Field label={t.rating} error={state.fields?.rating} required>
            <Select name="rating" required defaultValue="5">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)} ({n})
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.review}>
            <Textarea name="review" maxLength={1000} rows={3} />
          </Field>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Star className="size-3.5" /> {t.note}
          </p>
        </>
      )}
    </FormShell>
  );
}
