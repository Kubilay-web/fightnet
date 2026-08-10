"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { submitVerification } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Textarea, Select, Field, Alert } from "@/components/ui";

export function VerificationForm({ targetLevel }: { targetLevel: "LEVEL_1" | "LEVEL_2" }) {
  const [idDoc, setIdDoc] = useState<UploadedAsset | null>(null);
  const [selfie, setSelfie] = useState<UploadedAsset | null>(null);
  const [proofs, setProofs] = useState<UploadedAsset[]>([]);

  return (
    <FormShell action={submitVerification} submitLabel="Talebi Gönder">
      {(state) => (
        <>
          <input type="hidden" name="targetLevel" value={targetLevel} />

          <Alert tone="blue" title="Verilerin nasıl korunuyor">
            <span className="flex items-start gap-2">
              <Lock className="mt-0.5 size-4 shrink-0" />
              Kimlik belgelerin yalnızca doğrulama için kullanılır, AB sunucularında şifreli saklanır
              ve onay sonrası 30 gün içinde silinir. Belge görselleri profilinde asla görünmez.
            </span>
          </Alert>

          {targetLevel === "LEVEL_1" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kimlik belgesi" hint="Kimlik kartı, pasaport veya ehliyet" required>
                <ImageUploader
                  folder="kyc"
                  value={idDoc?.url}
                  onChange={setIdDoc}
                  label="Belgeyi yükle"
                  aspect="aspect-[3/2]"
                />
                <input type="hidden" name="idDocUrl" value={idDoc?.url ?? ""} />
                <input type="hidden" name="idDocId" value={idDoc?.publicId ?? ""} />
              </Field>

              <Field label="Selfie" hint="Belgeni elinde tutarken çekilmiş fotoğraf" required>
                <ImageUploader
                  folder="kyc"
                  value={selfie?.url}
                  onChange={setSelfie}
                  label="Selfie yükle"
                  aspect="aspect-[3/2]"
                />
                <input type="hidden" name="selfieUrl" value={selfie?.url ?? ""} />
                <input type="hidden" name="selfieId" value={selfie?.publicId ?? ""} />
              </Field>
            </div>
          ) : (
            <>
              <Field label="Hangi durumu doğruluyorsun?" required>
                <Select name="claimedRole" required defaultValue="">
                  <option value="" disabled>
                    Seç
                  </option>
                  <option value="ATHLETE">Sporcu (federasyon lisansı / müsabaka belgesi)</option>
                  <option value="COACH">Antrenör (antrenör lisansı)</option>
                  <option value="GYM_OWNER">Salon İşletmecisi (işletme belgesi)</option>
                  <option value="ORGANIZER">Organizatör (etkinlik kaydı)</option>
                </Select>
              </Field>

              <Field label="Kanıt belgeleri" hint="En fazla 3 belge yükleyebilirsin" required>
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
                        label={`Belge ${i + 1}`}
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

          <Field label="Ek açıklama" error={state.fields?.note}>
            <Textarea
              name="note"
              rows={3}
              maxLength={1000}
              placeholder="Doğrulama ekibinin bilmesi gereken bir şey var mı?"
            />
          </Field>
        </>
      )}
    </FormShell>
  );
}
