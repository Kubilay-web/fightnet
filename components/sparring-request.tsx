"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/components/i18n/link";
import { Swords, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button, Input, Textarea, Field, Checkbox, Alert } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { panelSparringCopy } from "@/lib/i18n/pages/panel-sparring";

/** §11.2 — Talep akışında sorumluluk feragatnamesi zorunlu onayı */
export function SparringRequestButton({
  listingId,
  authed,
  canRequest,
  partnerName,
}: {
  listingId: string;
  authed: boolean;
  canRequest: boolean;
  partnerName: string;
}) {
  const t = panelSparringCopy[useLocale()].request;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [waiver, setWaiver] = useState(false);

  function onClick() {
    if (!authed) {
      router.push(`/giris?next=${encodeURIComponent("/sparring")}`);
      return;
    }
    setOpen(true);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/sparring/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        message: fd.get("message") ?? "",
        proposedDate: fd.get("proposedDate") ?? "",
        waiverAccepted: waiver,
      }),
    });
    if (res.ok) {
      setState("done");
      router.refresh();
      setTimeout(() => setOpen(false), 1600);
      return;
    }
    const j = await res.json().catch(() => ({}));
    setError(j.error ?? t.error);
    setState("idle");
  }

  return (
    <>
      <Button size="sm" onClick={onClick}>
        <Swords className="size-4" /> {t.button}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="safe-bottom relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:rounded-3xl">
            {state === "done" ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="size-8 text-emerald-500" />
                <p className="font-bold">{t.doneTitle}</p>
                <p className="text-sm text-muted">{t.doneBody(partnerName)}</p>
              </div>
            ) : !canRequest ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <ShieldAlert className="size-8 text-amber-500" />
                <p className="font-bold">{t.verifyTitle}</p>
                <p className="text-sm text-muted">{t.verifyBody}</p>
                <Link href="/panel/dogrulama" className="font-bold text-blood-500 hover:underline">
                  {t.verifyCta}
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <h2 className="text-lg font-black">{t.heading(partnerName)}</h2>

                <Field label={t.message}>
                  <Textarea
                    name="message"
                    rows={3}
                    maxLength={500}
                    placeholder={t.messagePlaceholder}
                  />
                </Field>

                <Field label={t.proposedDate}>
                  <Input type="date" name="proposedDate" min={new Date().toISOString().slice(0, 10)} />
                </Field>

                <Alert tone="amber">{t.waiverAlert}</Alert>

                <Checkbox
                  checked={waiver}
                  onChange={(e) => setWaiver(e.target.checked)}
                  label={
                    <>
                      {t.waiverBefore}
                      <Link href="/sparring-sozlesmesi" target="_blank" className="font-bold underline">
                        {t.waiverLink}
                      </Link>
                      {t.waiverAfter}
                    </>
                  }
                />

                {error && <p className="text-sm font-medium text-blood-500">{error}</p>}

                <div className="flex gap-2">
                  <Button type="button" variant="ghost" full onClick={() => setOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button type="submit" full disabled={!waiver || state === "loading"}>
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
