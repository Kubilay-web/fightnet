"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  createSponsor,
  createSponsorOffer,
  setOfferStatus,
  reviewSponsorApplication,
} from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { useLocale } from "@/components/i18n/provider";
import { ImageUploader } from "@/components/uploader";
import { Button, Input, Textarea, Select, Field, Checkbox } from "@/components/ui";
import { DISCIPLINES, SKILL_LEVELS } from "@/lib/constants";
import { sponsorAdminCopy } from "@/lib/i18n/pages/admin-forms";

/** §4.3 — Sponsor markası ekleme */
export function SponsorForm() {
  const t = sponsorAdminCopy[useLocale()].sponsor;
  const [logo, setLogo] = useState<{ url: string; publicId: string } | null>(null);

  return (
    <FormShell action={createSponsor} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field label={t.name} error={state.fields?.name} required>
            <Input name="name" required minLength={2} maxLength={80} placeholder={t.namePlaceholder} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.website}>
              <Input type="url" name="website" placeholder="https://…" />
            </Field>
            <Field label={t.budget}>
              <div className="flex items-center gap-2">
                <Input type="number" name="budgetMin" min={0} placeholder={t.budgetMin} />
                <span className="text-muted">–</span>
                <Input type="number" name="budgetMax" min={0} placeholder={t.budgetMax} />
              </div>
            </Field>
          </div>

          <Field label={t.about}>
            <Textarea name="about" rows={3} maxLength={1000} />
          </Field>

          <Field label={t.disciplines}>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
              {DISCIPLINES.map((d) => (
                <Checkbox key={d.value} name="disciplines[]" value={d.value} label={d.label} />
              ))}
            </div>
          </Field>

          <Field label={t.logo}>
            <ImageUploader
              folder="ad"
              value={logo?.url}
              aspect="aspect-video"
              label={t.logoUpload}
              onChange={(a) => setLogo(a ? { url: a.url, publicId: a.publicId } : null)}
            />
            <input type="hidden" name="logoUrl" value={logo?.url ?? ""} />
            <input type="hidden" name="logoId" value={logo?.publicId ?? ""} />
          </Field>
        </>
      )}
    </FormShell>
  );
}

/** §4.3 — Sponsorluk teklifi yayınlama */
export function SponsorOfferForm({ sponsors }: { sponsors: { id: string; name: string }[] }) {
  const t = sponsorAdminCopy[useLocale()].offer;

  if (sponsors.length === 0) {
    return <p className="text-sm text-muted">{t.empty}</p>;
  }

  return (
    <FormShell action={createSponsorOffer} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field label={t.sponsor} error={state.fields?.sponsorId} required>
            <Select name="sponsorId" required defaultValue="">
              <option value="" disabled>
                {t.select}
              </option>
              {sponsors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.title} error={state.fields?.title} required>
            <Input name="title" required minLength={3} maxLength={120} placeholder={t.titlePlaceholder} />
          </Field>

          <Field label={t.description} error={state.fields?.description} required>
            <Textarea name="description" required minLength={10} maxLength={3000} rows={4} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.minFollowers}>
              <Input type="number" name="minFollowers" min={0} defaultValue={0} />
            </Field>
            <Field label={t.minLevel}>
              <Select name="minLevel" defaultValue="BEGINNER">
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.region}>
              <Input name="region" maxLength={60} placeholder={t.regionPlaceholder} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.value} hint={t.valueHint}>
              <Input name="value" maxLength={120} placeholder={t.valuePlaceholder} />
            </Field>
            <Field label={t.deadline}>
              <Input type="date" name="deadline" />
            </Field>
          </div>

          <Field label={t.disciplines}>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
              {DISCIPLINES.map((d) => (
                <Checkbox key={d.value} name="disciplines[]" value={d.value} label={d.label} />
              ))}
            </div>
          </Field>
        </>
      )}
    </FormShell>
  );
}

export function OfferStatusToggle({ id, status }: { id: string; status: string }) {
  const t = sponsorAdminCopy[useLocale()].status;
  const [pending, start] = useTransition();
  const open = status === "OPEN";

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => start(() => setOfferStatus(id, open ? "CLOSED" : "OPEN"))}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : open ? t.close : t.reopen}
    </Button>
  );
}

export function ApplicationActions({ id, status }: { id: string; status: string }) {
  const t = sponsorAdminCopy[useLocale()].application;
  const [pending, start] = useTransition();
  if (status === "ACCEPTED" || status === "REJECTED") return null;

  return (
    <div className="flex gap-1.5">
      <Button size="sm" disabled={pending} onClick={() => start(() => reviewSponsorApplication(id, "ACCEPTED"))}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : t.accept}
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(() => reviewSponsorApplication(id, "REJECTED"))}>
        {t.reject}
      </Button>
    </div>
  );
}
