"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2, CheckCircle2 } from "lucide-react";
import { Button, Select, Textarea, Field } from "@/components/ui";
import { REPORT_REASON_LABEL } from "@/lib/constants";
import { useLocale } from "@/components/i18n/provider";
import { localizePath } from "@/lib/i18n/config";
import { reportCopy } from "@/lib/i18n/pages/panel-trust";

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
  const locale = useLocale();
  const t = reportCopy[locale];

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
      router.push(localizePath("/giris", locale));
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={onClick}
        aria-label={t.report}
        className={
          compact
            ? "inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink-100 hover:text-blood-500 dark:hover:bg-ink-800"
            : "inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-muted transition-colors hover:border-blood-500 hover:text-blood-500"
        }
      >
        <Flag className="size-4" />
        {!compact && t.report}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="safe-bottom relative w-full max-w-md rounded-t-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:rounded-3xl">
            {state === "done" ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="size-8 text-emerald-500" />
                <p className="font-bold">{t.done.title}</p>
                <p className="text-sm text-muted">{t.done.body}</p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <h2 className="text-lg font-black">{t.modalTitle}</h2>
                <Field label={t.reason.label} required>
                  <Select name="reason" required defaultValue="">
                    <option value="" disabled>
                      {t.reason.select}
                    </option>
                    {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                    {Object.entries(REPORT_REASON_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={t.description.label} hint={t.description.hint}>
                  <Textarea name="description" rows={3} maxLength={1000} />
                </Field>
                {state === "error" && (
                  <p className="text-sm font-medium text-blood-500">{t.error}</p>
                )}
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
