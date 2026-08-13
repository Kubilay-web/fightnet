"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/components/i18n/link";
import { Handshake, Loader2, CheckCircle2 } from "lucide-react";
import { Button, Textarea, Field } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { communityFormsCopy } from "@/lib/i18n/pages/community-forms";

export function SponsorApplyButton({
  offerId,
  authed,
  canApply,
  sponsorName,
}: {
  offerId: string;
  authed: boolean;
  canApply: boolean;
  sponsorName: string;
}) {
  const t = communityFormsCopy[useLocale()].sponsorApply;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/sponsors/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, pitch: fd.get("pitch") }),
    });
    if (res.ok) {
      setState("done");
      router.refresh();
      setTimeout(() => setOpen(false), 1800);
      return;
    }
    const j = await res.json().catch(() => ({}));
    setError(j.error ?? t.submitFailed);
    setState("idle");
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          if (!authed) {
            router.push("/giris?next=/sponsorluk");
            return;
          }
          setOpen(true);
        }}
      >
        <Handshake className="size-4" /> {t.apply}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="safe-bottom relative w-full max-w-md rounded-t-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:rounded-3xl">
            {state === "done" ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="size-8 text-emerald-500" />
                <p className="font-bold">{t.sentTitle}</p>
                <p className="text-sm text-muted">{t.sentBody(sponsorName)}</p>
              </div>
            ) : !canApply ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="font-bold">{t.verificationTitle}</p>
                <p className="text-sm text-muted">{t.verificationBody}</p>
                <Link href="/panel/dogrulama" className="font-bold text-blood-500 hover:underline">
                  {t.verificationCta}
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <h2 className="text-lg font-black">{t.formTitle(sponsorName)}</h2>
                <Field label={t.pitch} hint={t.pitchHint} required>
                  <Textarea name="pitch" required rows={5} maxLength={2000} />
                </Field>
                {error && <p className="text-sm font-medium text-blood-500">{error}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" full onClick={() => setOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button type="submit" full disabled={state === "loading"}>
                    {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : t.submit}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
