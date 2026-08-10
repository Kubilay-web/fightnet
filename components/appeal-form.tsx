"use client";

import { createAppeal } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Select, Field } from "@/components/ui";

const TARGETS = [
  { value: "POST", label: "Gönderim kaldırıldı" },
  { value: "COMMENT", label: "Yorumum kaldırıldı" },
  { value: "THREAD", label: "Forum konum kaldırıldı" },
  { value: "FORUM_POST", label: "Forum yanıtım kaldırıldı" },
  { value: "MESSAGE", label: "Mesajım kaldırıldı" },
  { value: "USER", label: "Hesabım kısıtlandı / askıya alındı" },
];

/** §11.5 — DSA şikayet mekanizması */
export function AppealForm() {
  return (
    <FormShell action={createAppeal} submitLabel="İtirazı Gönder">
      {(state) => (
        <>
          <Field label="Neye itiraz ediyorsun?" error={state.fields?.targetType} required>
            <Select name="targetType" required defaultValue="">
              <option value="" disabled>
                Seç
              </option>
              {TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="İçeriğin bağlantısı veya kimliği"
            hint="Kaldırılan içeriğin adresini yapıştır. Hesap kısıtlaması için kullanıcı adını yaz."
            error={state.fields?.targetId}
            required
          >
            <Input name="targetId" required maxLength={200} placeholder="https://… veya @kullaniciadi" />
          </Field>

          <Field
            label="Gerekçen"
            hint="Kararın neden hatalı olduğunu açıkla. En az 20 karakter."
            error={state.fields?.body}
            required
          >
            <Textarea name="body" required minLength={20} maxLength={2000} rows={5} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
