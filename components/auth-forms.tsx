"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button, Input, Select, Field, Checkbox, Alert } from "@/components/ui";
import { slugify } from "@/lib/utils";

type Errors = Record<string, string>;

function useAuthSubmit(endpoint: string) {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [general, setGeneral] = useState<string | null>(null);

  async function send(payload: Record<string, unknown>) {
    setLoading(true);
    setErrors({});
    setGeneral(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const next = params.get("next") ?? "/panel";
      router.push(next);
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (data.fields) setErrors(data.fields);
    setGeneral(data.error ?? "Bir hata oluştu");
    setLoading(false);
  }

  return { send, loading, errors, general };
}

export function LoginForm() {
  const { send, loading, errors, general } = useAuthSubmit("/api/auth/login");
  const [show, setShow] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        send({ email: fd.get("email"), password: fd.get("password") });
      }}
      className="flex flex-col gap-4"
    >
      {general && <Alert tone="red">{general}</Alert>}

      <Field label="E-posta" error={errors.email} required>
        <Input name="email" type="email" required autoComplete="email" placeholder="ornek@eposta.com" />
      </Field>

      <Field label="Şifre" error={errors.password} required>
        <div className="relative">
          <Input
            name="password"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" full disabled={loading}>
        {loading ? <Loader2 className="size-5 animate-spin" /> : "Giriş Yap"}
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const { send, loading, errors, general } = useAuthSubmit("/api/auth/register");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [accept, setAccept] = useState(false);

  const isMinor =
    !!birthDate &&
    (Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 3600 * 1000) < 18;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        send({
          name: fd.get("name"),
          username: (fd.get("username") as string)?.toLowerCase(),
          email: fd.get("email"),
          password: fd.get("password"),
          birthDate: fd.get("birthDate") || undefined,
          city: fd.get("city") || undefined,
          role: fd.get("role") || "USER",
          betaCode: (fd.get("betaCode") as string)?.toUpperCase() || "",
          guardianEmail: fd.get("guardianEmail") || "",
          acceptTerms: accept,
        });
      }}
      className="flex flex-col gap-4"
    >
      {general && <Alert tone="red">{general}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ad Soyad" error={errors.name} required>
          <Input
            name="name"
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!username) return;
            }}
            onBlur={() => {
              if (!username && name) setUsername(slugify(name).replace(/-/g, "").slice(0, 20));
            }}
          />
        </Field>

        <Field label="Kullanıcı adı" error={errors.username} hint="fightnet.app/@kullaniciadi" required>
          <Input
            name="username"
            required
            minLength={3}
            maxLength={24}
            pattern="[a-zA-Z0-9_.]+"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
          />
        </Field>
      </div>

      <Field label="E-posta" error={errors.email} required>
        <Input name="email" type="email" required autoComplete="email" />
      </Field>

      <Field label="Şifre" error={errors.password} hint="En az 8 karakter, bir harf ve bir rakam" required>
        <div className="relative">
          <Input
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Doğum tarihi" error={errors.birthDate} hint="Yaş doğrulaması için">
          <Input
            name="birthDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </Field>

        <Field label="Şehir">
          <Input name="city" maxLength={60} autoComplete="address-level2" placeholder="Frankfurt" />
        </Field>
      </div>

      {/* §11.1 — Çocuk koruması: ebeveyn onayı */}
      {isMinor && (
        <>
          <Alert tone="amber" title="18 yaş altı üyelik">
            Güvenliğin için ebeveyn onayı gerekiyor. Ebeveynine onay e-postası göndereceğiz.
            Doğrulanmamış yetişkinler sana mesaj gönderemez.
          </Alert>
          <Field label="Ebeveyn e-postası" error={errors.guardianEmail} required>
            <Input name="guardianEmail" type="email" required />
          </Field>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sen kimsin?">
          <Select name="role" defaultValue="ATHLETE">
            <option value="ATHLETE">Sporcu</option>
            <option value="COACH">Antrenör</option>
            <option value="GYM_OWNER">Salon İşletmecisi</option>
            <option value="ORGANIZER">Organizatör</option>
            <option value="USER">Hayran</option>
          </Select>
        </Field>

        <Field label="Beta erişim kodu" error={errors.betaCode} hint="Varsa — Kurucu ayrıcalıkları açar">
          <Input name="betaCode" maxLength={24} placeholder="FN-XXXX" className="uppercase" />
        </Field>
      </div>

      <Checkbox
        checked={accept}
        onChange={(e) => setAccept(e.target.checked)}
        label={
          <>
            <Link href="/sartlar" target="_blank" className="font-bold underline">Kullanım şartlarını</Link>,{" "}
            <Link href="/gizlilik" target="_blank" className="font-bold underline">gizlilik politikasını</Link> ve{" "}
            <Link href="/topluluk-kurallari" target="_blank" className="font-bold underline">topluluk kurallarını</Link>{" "}
            okudum, kabul ediyorum.
          </>
        }
      />

      <Button type="submit" size="lg" full disabled={loading || !accept}>
        {loading ? <Loader2 className="size-5 animate-spin" /> : "Hesap Oluştur"}
      </Button>
    </form>
  );
}
