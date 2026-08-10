"use client";

import { createSparringListing } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Select, Field, Checkbox } from "@/components/ui";
import { DISCIPLINES, SKILL_LEVELS, SPARRING_INTENSITY, AVAILABILITY_SLOTS, TARGET_CITIES } from "@/lib/constants";

export function SparringListingForm({
  gyms,
  defaultCity,
}: {
  gyms: { id: string; name: string }[];
  defaultCity: string;
}) {
  return (
    <FormShell action={createSparringListing} submitLabel="İlanı Yayınla">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Disiplin" error={state.fields?.discipline} required>
              <Select name="discipline" required defaultValue="">
                <option value="" disabled>
                  Seç
                </option>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.emoji} {d.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Seviyen" error={state.fields?.level} required>
              <Select name="level" required defaultValue="">
                <option value="" disabled>
                  Seç
                </option>
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kilon (kg)" error={state.fields?.weightKg}>
              <Input type="number" step="0.5" name="weightKg" min={30} max={200} placeholder="77" />
            </Field>
            <Field label="Kilo toleransı (±kg)" hint="Bu aralıktaki partnerler eşleşir">
              <Input type="number" name="weightTolerance" defaultValue={5} min={1} max={20} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Şehir" error={state.fields?.city} required>
              <Input name="city" required defaultValue={defaultCity} list="sp-cities" maxLength={60} />
              <datalist id="sp-cities">
                {TARGET_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Posta kodu">
              <Input name="postalCode" maxLength={10} />
            </Field>
            <Field label="Yarıçap (km)">
              <Input type="number" name="radiusKm" defaultValue={25} min={1} max={200} />
            </Field>
          </div>

          {gyms.length > 0 && (
            <Field label="Salon" hint="Sparring'i hangi salonda yapmak istiyorsun?">
              <Select name="gymId" defaultValue="">
                <option value="">Fark etmez</option>
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="Yoğunluk" hint="Beklentini net belirt — güvenlik için önemli">
            <Select name="intensity" defaultValue="MEDIUM">
              {SPARRING_INTENSITY.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Müsaitlik">
            <div className="grid gap-2 sm:grid-cols-2">
              {AVAILABILITY_SLOTS.map((s) => (
                <Checkbox key={s.value} name="availability[]" value={s.value} label={s.label} />
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Partner tercihi">
              <Select name="genderPref" defaultValue="ANY">
                <option value="ANY">Fark etmez</option>
                <option value="MALE">Erkek</option>
                <option value="FEMALE">Kadın</option>
              </Select>
            </Field>
            <Field label="Min. yaş">
              <Input type="number" name="minAge" min={14} max={80} />
            </Field>
            <Field label="Maks. yaş">
              <Input type="number" name="maxAge" min={14} max={80} />
            </Field>
          </div>

          <Field label="Notun">
            <Textarea
              name="note"
              rows={3}
              maxLength={500}
              placeholder="Ne arıyorsun? Hangi teknikleri çalışmak istiyorsun?"
            />
          </Field>
        </>
      )}
    </FormShell>
  );
}
