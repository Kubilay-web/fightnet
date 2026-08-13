"use client";

import { useState } from "react";
import { createGym, updateGym, createGymClass } from "@/app/salon-yonetimi/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Textarea, Select, Field, Checkbox, Switch } from "@/components/ui";
import { DISCIPLINES, SKILL_LEVELS, WEEKDAYS, TARGET_CITIES } from "@/lib/constants";
import { useLocale } from "@/components/i18n/provider";
import { gymAdminCopy } from "@/lib/i18n/pages/gym-admin";
import type { Discipline } from "@prisma/client";

/**
 * Olanak DEĞERLERİ veritabanında bu biçimde saklanır; çevrilmezler.
 * Ekranda gösterilen karşılıkları `gymAdminCopy[locale].gymForm.amenityLabels`
 * içinden gelir.
 */
const AMENITIES = [
  "Duş", "Soyunma odası", "Otopark", "Kadınlara özel saat", "Çocuk grubu",
  "Sauna", "Ağırlık salonu", "Kafe", "Engelli erişimi", "Klima",
];

export interface GymInitial {
  id?: string;
  name: string;
  description: string | null;
  disciplines: Discipline[];
  street: string | null;
  city: string;
  postalCode: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  amenities: string[];
  trialEnabled: boolean;
  dropInPrice: number | null;
  logoUrl: string | null;
  logoId: string | null;
  coverUrl: string | null;
  coverId: string | null;
}

export function GymForm({ initial }: { initial?: GymInitial }) {
  const t = gymAdminCopy[useLocale()].gymForm;
  const [logo, setLogo] = useState<{ url: string; id: string } | null>(
    initial?.logoUrl ? { url: initial.logoUrl, id: initial.logoId ?? "" } : null,
  );
  const [cover, setCover] = useState<{ url: string; id: string } | null>(
    initial?.coverUrl ? { url: initial.coverUrl, id: initial.coverId ?? "" } : null,
  );

  const action = initial?.id ? updateGym.bind(null, initial.id) : createGym;

  const onAsset = (set: (v: { url: string; id: string } | null) => void) => (a: UploadedAsset | null) =>
    set(a ? { url: a.url, id: a.publicId } : null);

  return (
    <FormShell action={action} submitLabel={initial?.id ? t.submitUpdate : t.submitCreate}>
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <Field label={t.logo}>
              <ImageUploader folder="gym" value={logo?.url} onChange={onAsset(setLogo)} aspect="aspect-square" />
              <input type="hidden" name="logoUrl" value={logo?.url ?? ""} />
              <input type="hidden" name="logoId" value={logo?.id ?? ""} />
            </Field>
            <Field label={t.cover}>
              <ImageUploader folder="gym" value={cover?.url} onChange={onAsset(setCover)} aspect="aspect-[16/7]" />
              <input type="hidden" name="coverUrl" value={cover?.url ?? ""} />
              <input type="hidden" name="coverId" value={cover?.id ?? ""} />
            </Field>
          </div>

          <Field label={t.name} error={state.fields?.name} required>
            <Input name="name" required defaultValue={initial?.name} maxLength={80} />
          </Field>

          <Field label={t.description}>
            <Textarea
              name="description"
              rows={4}
              maxLength={2000}
              defaultValue={initial?.description ?? ""}
              placeholder={t.descriptionPlaceholder}
            />
          </Field>

          <Field label={t.disciplines} error={state.fields?.disciplines} required>
            <div className="grid gap-2 sm:grid-cols-3">
              {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
              {DISCIPLINES.map((d) => (
                <Checkbox
                  key={d.value}
                  name="disciplines[]"
                  value={d.value}
                  defaultChecked={initial?.disciplines.includes(d.value)}
                  label={`${d.emoji} ${d.label}`}
                />
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.street}>
              <Input name="street" defaultValue={initial?.street ?? ""} maxLength={120} />
            </Field>
            <Field label={t.city} error={state.fields?.city} required>
              <Input name="city" required defaultValue={initial?.city} list="gym-cities" maxLength={60} />
              <datalist id="gym-cities">
                {TARGET_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label={t.postalCode}>
              <Input name="postalCode" defaultValue={initial?.postalCode ?? ""} maxLength={10} />
            </Field>
            <Field label={t.country}>
              <Select name="country" defaultValue={initial?.country ?? "DE"}>
                <option value="DE">{t.countryOptions.DE}</option>
                <option value="AT">{t.countryOptions.AT}</option>
                <option value="CH">{t.countryOptions.CH}</option>
              </Select>
            </Field>
            <Field label={t.lat} hint={t.latHint}>
              <Input type="number" step="any" name="lat" defaultValue={initial?.lat ?? ""} />
            </Field>
            <Field label={t.lng}>
              <Input type="number" step="any" name="lng" defaultValue={initial?.lng ?? ""} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.phone}>
              <Input name="phone" type="tel" defaultValue={initial?.phone ?? ""} maxLength={30} />
            </Field>
            <Field label={t.email}>
              <Input name="email" type="email" defaultValue={initial?.email ?? ""} />
            </Field>
            <Field label={t.website}>
              <Input name="website" type="url" defaultValue={initial?.website ?? ""} placeholder="https://" />
            </Field>
          </div>

          <Field label={t.amenities}>
            <div className="grid gap-2 sm:grid-cols-3">
              {AMENITIES.map((a) => (
                <Checkbox
                  key={a}
                  name="amenities[]"
                  value={a}
                  defaultChecked={initial?.amenities.includes(a)}
                  label={t.amenityLabels[a] ?? a}
                />
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] p-4">
              <Switch
                name="trialEnabled"
                defaultChecked={initial?.trialEnabled ?? true}
                label={t.trialEnabled}
              />
            </div>
            <Field label={t.dropInPrice}>
              <Input type="number" step="0.5" name="dropInPrice" defaultValue={initial?.dropInPrice ?? ""} min={0} />
            </Field>
          </div>
        </>
      )}
    </FormShell>
  );
}

export function GymClassForm({ gymId }: { gymId: string }) {
  const t = gymAdminCopy[useLocale()].classForm;

  return (
    <FormShell action={createGymClass.bind(null, gymId)} submitLabel={t.submit}>
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.name} error={state.fields?.name} required>
              <Input name="name" required maxLength={60} placeholder={t.namePlaceholder} />
            </Field>
            <Field label={t.discipline} required>
              <Select name="discipline" required defaultValue="">
                <option value="" disabled>
                  {t.select}
                </option>
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.level}>
              <Select name="level" defaultValue="BEGINNER">
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label={t.weekday} required>
              <Select name="weekday" required defaultValue="0">
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {WEEKDAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.startTime} error={state.fields?.startTime} required>
              <Input type="time" name="startTime" required defaultValue="18:00" />
            </Field>
            <Field label={t.endTime} error={state.fields?.endTime} required>
              <Input type="time" name="endTime" required defaultValue="19:30" />
            </Field>
            <Field label={t.capacity}>
              <Input type="number" name="capacity" defaultValue={20} min={1} max={200} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.coachName}>
              <Input name="coachName" maxLength={60} />
            </Field>
            <Field label={t.price}>
              <Input type="number" step="0.5" name="price" defaultValue={0} min={0} />
            </Field>
            <Field label={t.trial}>
              <div className="pt-2">
                <Checkbox name="isTrialOk" defaultChecked label={t.trialLabel} />
              </div>
            </Field>
          </div>

          <Field label={t.description}>
            <Textarea name="description" rows={2} maxLength={500} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
