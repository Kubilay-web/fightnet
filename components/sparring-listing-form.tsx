"use client";

import { createSparringListing } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Select, Field, Checkbox } from "@/components/ui";
import { DISCIPLINES, SKILL_LEVELS, SPARRING_INTENSITY, AVAILABILITY_SLOTS, TARGET_CITIES } from "@/lib/constants";
import { useLocale } from "@/components/i18n/provider";
import { panelSparringCopy } from "@/lib/i18n/pages/panel-sparring";

export function SparringListingForm({
  gyms,
  defaultCity,
}: {
  gyms: { id: string; name: string }[];
  defaultCity: string;
}) {
  const t = panelSparringCopy[useLocale()].form;

  return (
    <FormShell action={createSparringListing} submitLabel={t.submit}>
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.discipline} error={state.fields?.discipline} required>
              <Select name="discipline" required defaultValue="">
                <option value="" disabled>
                  {t.select}
                </option>
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.emoji} {d.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t.level} error={state.fields?.level} required>
              <Select name="level" required defaultValue="">
                <option value="" disabled>
                  {t.select}
                </option>
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.weight} error={state.fields?.weightKg}>
              <Input type="number" step="0.5" name="weightKg" min={30} max={200} placeholder="77" />
            </Field>
            <Field label={t.weightTolerance} hint={t.weightToleranceHint}>
              <Input type="number" name="weightTolerance" defaultValue={5} min={1} max={20} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.city} error={state.fields?.city} required>
              <Input name="city" required defaultValue={defaultCity} list="sp-cities" maxLength={60} />
              <datalist id="sp-cities">
                {TARGET_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label={t.postalCode}>
              <Input name="postalCode" maxLength={10} />
            </Field>
            <Field label={t.radius}>
              <Input type="number" name="radiusKm" defaultValue={25} min={1} max={200} />
            </Field>
          </div>

          {gyms.length > 0 && (
            <Field label={t.gym} hint={t.gymHint}>
              <Select name="gymId" defaultValue="">
                <option value="">{t.any}</option>
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label={t.intensity} hint={t.intensityHint}>
            {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
            <Select name="intensity" defaultValue="MEDIUM">
              {SPARRING_INTENSITY.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.availability}>
            {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
            <div className="grid gap-2 sm:grid-cols-2">
              {AVAILABILITY_SLOTS.map((s) => (
                <Checkbox key={s.value} name="availability[]" value={s.value} label={s.label} />
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.genderPref}>
              <Select name="genderPref" defaultValue="ANY">
                <option value="ANY">{t.any}</option>
                <option value="MALE">{t.male}</option>
                <option value="FEMALE">{t.female}</option>
              </Select>
            </Field>
            <Field label={t.minAge}>
              <Input type="number" name="minAge" min={14} max={80} />
            </Field>
            <Field label={t.maxAge}>
              <Input type="number" name="maxAge" min={14} max={80} />
            </Field>
          </div>

          <Field label={t.note}>
            <Textarea
              name="note"
              rows={3}
              maxLength={500}
              placeholder={t.notePlaceholder}
            />
          </Field>
        </>
      )}
    </FormShell>
  );
}
