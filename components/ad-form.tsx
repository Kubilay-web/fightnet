"use client";

import { useState } from "react";
import { createAd } from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Select, Field, Checkbox, Switch } from "@/components/ui";
import { AD_PLACEMENTS, DISCIPLINES } from "@/lib/constants";

export function AdForm() {
  const [image, setImage] = useState<UploadedAsset | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const inMonth = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

  return (
    <FormShell action={createAd} submitLabel="Reklamı Oluştur">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kampanya adı" required>
              <Input name="name" required maxLength={80} placeholder="Venum Bahar Kampanyası" />
            </Field>
            <Field label="Reklamveren" required>
              <Input name="advertiser" required maxLength={80} placeholder="Venum" />
            </Field>
          </div>

          <Field label="Banner görseli" hint="Önerilen: 1280×200 px" required>
            <ImageUploader folder="ad" value={image?.url} onChange={setImage} aspect="aspect-[16/5]" />
            <input type="hidden" name="imageUrl" value={image?.url ?? ""} />
            <input type="hidden" name="imageId" value={image?.publicId ?? ""} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hedef bağlantı" required>
              <Input name="linkUrl" type="url" required placeholder="https://" />
            </Field>
            <Field label="Yerleşim" required>
              <Select name="placement" required defaultValue="HOME_TOP">
                {AD_PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Başlangıç" required>
              <Input type="date" name="startsAt" required defaultValue={today} />
            </Field>
            <Field label="Bitiş" required>
              <Input type="date" name="endsAt" required defaultValue={inMonth} />
            </Field>
          </div>

          <Field label="Hedef disiplinler" hint="Boş bırakılırsa tümüne gösterilir">
            <div className="grid gap-2 sm:grid-cols-3">
              {DISCIPLINES.map((d) => (
                <Checkbox key={d.value} name="disciplines[]" value={d.value} label={d.label} />
              ))}
            </div>
          </Field>

          <Field label="Hedef şehirler" hint="Virgülle ayır — boş bırakılırsa tümü">
            <Input name="cities" maxLength={300} placeholder="Frankfurt, Mainz, Wiesbaden" />
          </Field>

          <div className="rounded-xl border border-[var(--border)] p-4">
            <Switch name="isActive" defaultChecked label="Hemen yayına al" />
          </div>
        </>
      )}
    </FormShell>
  );
}
