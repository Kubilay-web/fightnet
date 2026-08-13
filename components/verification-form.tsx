"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { submitVerification } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Textarea, Select, Field, Alert } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { verificationFormCopy } from "@/lib/i18n/pages/panel-trust";

export function VerificationForm({ targetLevel }: { targetLevel: "LEVEL_1" | "LEVEL_2" }) {
  const [idDoc, setIdDoc] = useState<UploadedAsset | null>(null);
  const [selfie, setSelfie] = useState<UploadedAsset | null>(null);
  const [proofs, setProofs] = useState<UploadedAsset[]>([]);
  const t = verificationFormCopy[useLocale()];

  return (
    <FormShell action={submitVerification} submitLabel={t.submit}>
      {(state) => (
        <>
          <input type="hidden" name="targetLevel" value={targetLevel} />

          <Alert tone="blue" title={t.privacy.title}>
            <span className="flex items-start gap-2">
              <Lock className="mt-0.5 size-4 shrink-0" />
              {t.privacy.body}
            </span>
          </Alert>

          {targetLevel === "LEVEL_1" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.idDoc.label} hint={t.idDoc.hint} required>
                <ImageUploader
                  folder="kyc"
                  value={idDoc?.url}
                  onChange={setIdDoc}
                  label={t.idDoc.upload}
                  aspect="aspect-[3/2]"
                />
                <input type="hidden" name="idDocUrl" value={idDoc?.url ?? ""} />
                <input type="hidden" name="idDocId" value={idDoc?.publicId ?? ""} />
              </Field>

              <Field label={t.selfie.label} hint={t.selfie.hint} required>
                <ImageUploader
                  folder="kyc"
                  value={selfie?.url}
                  onChange={setSelfie}
                  label={t.selfie.upload}
                  aspect="aspect-[3/2]"
                />
                <input type="hidden" name="selfieUrl" value={selfie?.url ?? ""} />
                <input type="hidden" name="selfieId" value={selfie?.publicId ?? ""} />
              </Field>
            </div>
          ) : (
            <>
              <Field label={t.role.label} required>
                <Select name="claimedRole" required defaultValue="">
                  <option value="" disabled>
                    {t.role.select}
                  </option>
                  <option value="ATHLETE">{t.role.ATHLETE}</option>
                  <option value="COACH">{t.role.COACH}</option>
                  <option value="GYM_OWNER">{t.role.GYM_OWNER}</option>
                  <option value="ORGANIZER">{t.role.ORGANIZER}</option>
                </Select>
              </Field>

              <Field label={t.proofs.label} hint={t.proofs.hint} required>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i}>
                      <ImageUploader
                        folder="passport"
                        value={proofs[i]?.url}
                        onChange={(a) =>
                          setProofs((prev) => {
                            const next = [...prev];
                            if (a) next[i] = a;
                            else next.splice(i, 1);
                            return next.filter(Boolean);
                          })
                        }
                        label={t.proofs.doc.replace("{n}", String(i + 1))}
                        aspect="aspect-[3/2]"
                      />
                      {proofs[i] && (
                        <>
                          <input type="hidden" name="proofUrls[]" value={proofs[i].url} />
                          <input type="hidden" name="proofIds[]" value={proofs[i].publicId} />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </Field>
            </>
          )}

          <Field label={t.note.label} error={state.fields?.note}>
            <Textarea
              name="note"
              rows={3}
              maxLength={1000}
              placeholder={t.note.placeholder}
            />
          </Field>
        </>
      )}
    </FormShell>
  );
}
