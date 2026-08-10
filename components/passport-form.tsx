"use client";

import { useState } from "react";
import { addPassportDoc } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Select, Field } from "@/components/ui";
import { PASSPORT_DOC_KINDS } from "@/lib/constants";

export function PassportDocForm() {
  const [file, setFile] = useState<UploadedAsset | null>(null);

  return (
    <FormShell action={addPassportDoc} submitLabel="Belgeyi Yükle">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Belge türü" required>
              <Select name="kind" required defaultValue="">
                <option value="" disabled>
                  Seç
                </option>
                {PASSPORT_DOC_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Başlık" error={state.fields?.title} required>
              <Input name="title" required maxLength={120} placeholder="BJJ Mavi Kemer Sertifikası" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Veren kurum">
              <Input name="issuer" maxLength={120} placeholder="Alman MMA Federasyonu" />
            </Field>
            <Field label="Veriliş tarihi">
              <Input type="date" name="issuedAt" />
            </Field>
            <Field label="Geçerlilik sonu">
              <Input type="date" name="expiresAt" />
            </Field>
          </div>

          <Field label="Belge görseli" error={state.fields?.fileUrl} required>
            <ImageUploader
              folder="passport"
              value={file?.url}
              onChange={setFile}
              label="Belgeyi yükle"
              aspect="aspect-[3/2]"
            />
            <input type="hidden" name="fileUrl" value={file?.url ?? ""} />
            <input type="hidden" name="fileId" value={file?.publicId ?? ""} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
