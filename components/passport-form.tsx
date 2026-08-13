"use client";

import { useState } from "react";
import { addPassportDoc } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Select, Field } from "@/components/ui";
import { PASSPORT_DOC_KINDS } from "@/lib/constants";
import { useLocale } from "@/components/i18n/provider";
import { passportFormCopy } from "@/lib/i18n/pages/panel-trust";

export function PassportDocForm() {
  const [file, setFile] = useState<UploadedAsset | null>(null);
  const t = passportFormCopy[useLocale()];

  return (
    <FormShell action={addPassportDoc} submitLabel={t.submit}>
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.kind.label} required>
              <Select name="kind" required defaultValue="">
                <option value="" disabled>
                  {t.kind.select}
                </option>
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {PASSPORT_DOC_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t.title.label} error={state.fields?.title} required>
              <Input name="title" required maxLength={120} placeholder={t.title.placeholder} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.issuer.label}>
              <Input name="issuer" maxLength={120} placeholder={t.issuer.placeholder} />
            </Field>
            <Field label={t.issuedAt}>
              <Input type="date" name="issuedAt" />
            </Field>
            <Field label={t.expiresAt}>
              <Input type="date" name="expiresAt" />
            </Field>
          </div>

          <Field label={t.file.label} error={state.fields?.fileUrl} required>
            <ImageUploader
              folder="passport"
              value={file?.url}
              onChange={setFile}
              label={t.file.upload}
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
