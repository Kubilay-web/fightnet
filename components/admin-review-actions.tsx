"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button, Input } from "@/components/ui";

/** Onay/red aksiyonları — not alanı ile birlikte */
export function ReviewActions({
  onApprove,
  onReject,
  approveLabel = "Onayla",
  rejectLabel = "Reddet",
}: {
  onApprove: (note?: string) => Promise<void>;
  onReject: (note?: string) => Promise<void>;
  approveLabel?: string;
  rejectLabel?: string;
}) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="İnceleme notu (kullanıcıya iletilir)"
        maxLength={300}
        className="min-w-48 flex-1"
      />
      <Button
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => void onApprove(note || undefined))}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        {approveLabel}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => startTransition(() => void onReject(note || undefined))}
      >
        <X className="size-4" />
        {rejectLabel}
      </Button>
    </div>
  );
}
