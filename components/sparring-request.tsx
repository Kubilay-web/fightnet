"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swords, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button, Input, Textarea, Field, Checkbox, Alert } from "@/components/ui";

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
    setError(j.error ?? "Talep gönderilemedi");
    setState("idle");
  }

  return (
    <>
      <Button size="sm" onClick={onClick}>
        <Swords className="size-4" /> Sparring Talebi
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="safe-bottom relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:rounded-3xl">
            {state === "done" ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="size-8 text-emerald-500" />
                <p className="font-bold">Talebin gönderildi</p>
                <p className="text-sm text-muted">{partnerName} yanıtladığında bildirim alacaksın.</p>
              </div>
            ) : !canRequest ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <ShieldAlert className="size-8 text-amber-500" />
                <p className="font-bold">Doğrulama gerekli</p>
                <p className="text-sm text-muted">
                  Sparring araması Seviye 1 (kimlik doğrulanmış) üyelere açıktır.
                  Bu, herkesin güvenliği için zorunludur.
                </p>
                <Link href="/panel/dogrulama" className="font-bold text-blood-500 hover:underline">
                  Doğrulamayı başlat
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <h2 className="text-lg font-black">{partnerName} ile sparring</h2>

                <Field label="Mesajın">
                  <Textarea
                    name="message"
                    rows={3}
                    maxLength={500}
                    placeholder="Merhaba! Seviyem uygun, hafta içi akşamları müsaitim…"
                  />
                </Field>

                <Field label="Önerilen tarih">
                  <Input type="date" name="proposedDate" min={new Date().toISOString().slice(0, 10)} />
                </Field>

                <Alert tone="amber">
                  Sparring kontrollü bir antrenmandır, müsabaka değildir. Yaralanma riskini
                  kabul eder, partnerinin güvenliğinden sorumlu olduğunu onaylarsın.
                </Alert>

                <Checkbox
                  checked={waiver}
                  onChange={(e) => setWaiver(e.target.checked)}
                  label={
                    <>
                      <Link href="/sparring-sozlesmesi" target="_blank" className="font-bold underline">
                        Sparring Sözleşmesi
                      </Link>{" "}
                      ve sorumluluk feragatnamesini okudum, kabul ediyorum.
                    </>
                  }
                />

                {error && <p className="text-sm font-medium text-blood-500">{error}</p>}

                <div className="flex gap-2">
                  <Button type="button" variant="ghost" full onClick={() => setOpen(false)}>
                    Vazgeç
                  </Button>
                  <Button type="submit" full disabled={!waiver || state === "loading"}>
                    {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : "Talep Gönder"}
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
