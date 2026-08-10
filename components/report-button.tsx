"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2, CheckCircle2 } from "lucide-react";
import { Button, Select, Textarea, Field } from "@/components/ui";
import { REPORT_REASON_LABEL } from "@/lib/constants";

/** §11.3 — Tüm içerikler için rapor butonu (Notice-and-Action) */
export function ReportButton({
  targetType,
  targetId,
  reportedUserId,
  authed,
  compact,
}: {
  targetType: string;
  targetId: string;
  reportedUserId?: string;
  authed: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType,
        targetId,
        reportedUserId: reportedUserId ?? "",
        reason: fd.get("reason"),
        description: fd.get("description") ?? "",
      }),
    });
    setState(res.ok ? "done" : "error");
    if (res.ok) setTimeout(() => setOpen(false), 1800);
  }

  function onClick() {
    if (!authed) {
      router.push("/giris");
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={onClick}
        aria-label="Bildir"
        className={
          compact
            ? "inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink-100 hover:text-blood-500 dark:hover:bg-ink-800"
            : "inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-muted transition-colors hover:border-blood-500 hover:text-blood-500"
        }
      >
        <Flag className="size-4" />
        {!compact && "Bildir"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="safe-bottom relative w-full max-w-md rounded-t-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:rounded-3xl">
            {state === "done" ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="size-8 text-emerald-500" />
                <p className="font-bold">Raporun alındı</p>
                <p className="text-sm text-muted">24 saat içinde inceleyeceğiz.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <h2 className="text-lg font-black">İçeriği Bildir</h2>
                <Field label="Sebep" required>
                  <Select name="reason" required defaultValue="">
                    <option value="" disabled>
                      Bir sebep seç
                    </option>
                    {Object.entries(REPORT_REASON_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Açıklama" hint="Ne gördüğünü kısaca anlat (opsiyonel)">
                  <Textarea name="description" rows={3} maxLength={1000} />
                </Field>
                {state === "error" && (
                  <p className="text-sm font-medium text-blood-500">Gönderilemedi, tekrar dene.</p>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" full onClick={() => setOpen(false)}>
                    Vazgeç
                  </Button>
                  <Button type="submit" full disabled={state === "loading"}>
                    {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : "Gönder"}
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
