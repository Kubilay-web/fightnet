"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/components/i18n/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button, Input, Select, Field, Checkbox, Alert } from "@/components/ui";
import { slugify } from "@/lib/utils";
import type { LoginFormCopy, RegisterFormCopy } from "@/lib/i18n/pages/auth";

/**
 * Metinler sözlük yerine sunucudan prop olarak gelir (`lib/i18n/pages/auth.ts`):
 * yalnızca iki sayfada kullanılan alan etiketleri her sayfanın sözlüğüne
 * girmez ve yalnızca aktif dilin metni istemciye serialize edilir.
 */

type Errors = Record<string, string>;

/** 18 yaş altı kontrolü; render sırasında değil, tarih değiştiğinde hesaplanır. */
function isUnder18(birthDate: string): boolean {
  if (!birthDate) return false;
  return (Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 3600 * 1000) < 18;
}

function useAuthSubmit(endpoint: string, genericError: string) {
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
    setGeneral(data.error ?? genericError);
    setLoading(false);
  }

  return { send, loading, errors, general };
}

export function LoginForm({ copy }: { copy: LoginFormCopy }) {
  const { send, loading, errors, general } = useAuthSubmit("/api/auth/login", copy.genericError);
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

      <Field label={copy.email} error={errors.email} required>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={copy.emailPlaceholder}
        />
      </Field>

      <Field label={copy.password} error={errors.password} required>
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
            aria-label={show ? copy.hidePassword : copy.showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" full disabled={loading}>
        {loading ? <Loader2 className="size-5 animate-spin" /> : copy.submit}
      </Button>
    </form>
  );
}

export function RegisterForm({ copy }: { copy: RegisterFormCopy }) {
  const { send, loading, errors, general } = useAuthSubmit("/api/auth/register", copy.genericError);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [accept, setAccept] = useState(false);

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
        <Field label={copy.name} error={errors.name} required>
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

        <Field label={copy.username} error={errors.username} hint={copy.usernameHint} required>
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

      <Field label={copy.email} error={errors.email} required>
        <Input name="email" type="email" required autoComplete="email" />
      </Field>

      <Field label={copy.password} error={errors.password} hint={copy.passwordHint} required>
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
            aria-label={show ? copy.hidePassword : copy.showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.birthDate} error={errors.birthDate} hint={copy.birthDateHint}>
          <Input
            name="birthDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              setIsMinor(isUnder18(e.target.value));
            }}
          />
        </Field>

        <Field label={copy.city}>
          <Input name="city" maxLength={60} autoComplete="address-level2" placeholder="Frankfurt" />
        </Field>
      </div>

      {/* §11.1 — Çocuk koruması: ebeveyn onayı */}
      {isMinor && (
        <>
          <Alert tone="amber" title={copy.minorTitle}>
            {copy.minorBody}
          </Alert>
          <Field label={copy.guardianEmail} error={errors.guardianEmail} required>
            <Input name="guardianEmail" type="email" required />
          </Field>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.role}>
          <Select name="role" defaultValue="ATHLETE">
            <option value="ATHLETE">{copy.roleAthlete}</option>
            <option value="COACH">{copy.roleCoach}</option>
            <option value="GYM_OWNER">{copy.roleGymOwner}</option>
            <option value="ORGANIZER">{copy.roleOrganizer}</option>
            <option value="USER">{copy.roleFan}</option>
          </Select>
        </Field>

        <Field label={copy.betaCode} error={errors.betaCode} hint={copy.betaCodeHint}>
          <Input name="betaCode" maxLength={24} placeholder="FN-XXXX" className="uppercase" />
        </Field>
      </div>

      <Checkbox
        checked={accept}
        onChange={(e) => setAccept(e.target.checked)}
        label={
          <>
            {copy.accept.lead}
            <Link href="/sartlar" target="_blank" className="font-bold underline">
              {copy.accept.terms}
            </Link>
            {copy.accept.mid1}
            <Link href="/gizlilik" target="_blank" className="font-bold underline">
              {copy.accept.privacy}
            </Link>
            {copy.accept.mid2}
            <Link href="/topluluk-kurallari" target="_blank" className="font-bold underline">
              {copy.accept.rules}
            </Link>
            {copy.accept.tail}
          </>
        }
      />

      <Button type="submit" size="lg" full disabled={loading || !accept}>
        {loading ? <Loader2 className="size-5 animate-spin" /> : copy.submit}
      </Button>
    </form>
  );
}
