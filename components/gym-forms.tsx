"use client";

import { useState } from "react";
import { createGym, updateGym, createGymClass } from "@/app/salon-yonetimi/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Textarea, Select, Field, Checkbox, Switch } from "@/components/ui";
import { DISCIPLINES, SKILL_LEVELS, WEEKDAYS, TARGET_CITIES } from "@/lib/constants";
import type { Discipline } from "@prisma/client";

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
    <FormShell action={action} submitLabel={initial?.id ? "Salonu Güncelle" : "Salonu Oluştur"}>
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <Field label="Logo">
              <ImageUploader folder="gym" value={logo?.url} onChange={onAsset(setLogo)} aspect="aspect-square" />
              <input type="hidden" name="logoUrl" value={logo?.url ?? ""} />
              <input type="hidden" name="logoId" value={logo?.id ?? ""} />
            </Field>
            <Field label="Kapak görseli">
              <ImageUploader folder="gym" value={cover?.url} onChange={onAsset(setCover)} aspect="aspect-[16/7]" />
              <input type="hidden" name="coverUrl" value={cover?.url ?? ""} />
              <input type="hidden" name="coverId" value={cover?.id ?? ""} />
            </Field>
          </div>

          <Field label="Salon adı" error={state.fields?.name} required>
            <Input name="name" required defaultValue={initial?.name} maxLength={80} />
          </Field>

          <Field label="Açıklama">
            <Textarea
              name="description"
              rows={4}
              maxLength={2000}
              defaultValue={initial?.description ?? ""}
              placeholder="Salonun hikayesi, felsefesi, kimler için uygun…"
            />
          </Field>

          <Field label="Disiplinler" error={state.fields?.disciplines} required>
            <div className="grid gap-2 sm:grid-cols-3">
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
            <Field label="Sokak / No">
              <Input name="street" defaultValue={initial?.street ?? ""} maxLength={120} />
            </Field>
            <Field label="Şehir" error={state.fields?.city} required>
              <Input name="city" required defaultValue={initial?.city} list="gym-cities" maxLength={60} />
              <datalist id="gym-cities">
                {TARGET_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Posta kodu">
              <Input name="postalCode" defaultValue={initial?.postalCode ?? ""} maxLength={10} />
            </Field>
            <Field label="Ülke">
              <Select name="country" defaultValue={initial?.country ?? "DE"}>
                <option value="DE">Almanya</option>
                <option value="AT">Avusturya</option>
                <option value="CH">İsviçre</option>
              </Select>
            </Field>
            <Field label="Enlem (lat)" hint="Haritada görünmesi için">
              <Input type="number" step="any" name="lat" defaultValue={initial?.lat ?? ""} />
            </Field>
            <Field label="Boylam (lng)">
              <Input type="number" step="any" name="lng" defaultValue={initial?.lng ?? ""} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Telefon">
              <Input name="phone" type="tel" defaultValue={initial?.phone ?? ""} maxLength={30} />
            </Field>
            <Field label="E-posta">
              <Input name="email" type="email" defaultValue={initial?.email ?? ""} />
            </Field>
            <Field label="Web sitesi">
              <Input name="website" type="url" defaultValue={initial?.website ?? ""} placeholder="https://" />
            </Field>
          </div>

          <Field label="Olanaklar">
            <div className="grid gap-2 sm:grid-cols-3">
              {AMENITIES.map((a) => (
                <Checkbox
                  key={a}
                  name="amenities[]"
                  value={a}
                  defaultChecked={initial?.amenities.includes(a)}
                  label={a}
                />
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] p-4">
              <Switch
                name="trialEnabled"
                defaultChecked={initial?.trialEnabled ?? true}
                label="Ücretsiz deneme antrenmanı sun"
              />
            </div>
            <Field label="Drop-in fiyatı (€)">
              <Input type="number" step="0.5" name="dropInPrice" defaultValue={initial?.dropInPrice ?? ""} min={0} />
            </Field>
          </div>
        </>
      )}
    </FormShell>
  );
}

export function GymClassForm({ gymId }: { gymId: string }) {
  return (
    <FormShell action={createGymClass.bind(null, gymId)} submitLabel="Dersi Ekle">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ders adı" error={state.fields?.name} required>
              <Input name="name" required maxLength={60} placeholder="MMA Başlangıç" />
            </Field>
            <Field label="Disiplin" required>
              <Select name="discipline" required defaultValue="">
                <option value="" disabled>
                  Seç
                </option>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Seviye">
              <Select name="level" defaultValue="BEGINNER">
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Gün" required>
              <Select name="weekday" required defaultValue="0">
                {WEEKDAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Başlangıç" error={state.fields?.startTime} required>
              <Input type="time" name="startTime" required defaultValue="18:00" />
            </Field>
            <Field label="Bitiş" error={state.fields?.endTime} required>
              <Input type="time" name="endTime" required defaultValue="19:30" />
            </Field>
            <Field label="Kapasite">
              <Input type="number" name="capacity" defaultValue={20} min={1} max={200} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Antrenör">
              <Input name="coachName" maxLength={60} />
            </Field>
            <Field label="Fiyat (€)">
              <Input type="number" step="0.5" name="price" defaultValue={0} min={0} />
            </Field>
            <Field label="Deneme">
              <div className="pt-2">
                <Checkbox name="isTrialOk" defaultChecked label="Deneme antrenmanına uygun" />
              </div>
            </Field>
          </div>

          <Field label="Açıklama">
            <Textarea name="description" rows={2} maxLength={500} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
