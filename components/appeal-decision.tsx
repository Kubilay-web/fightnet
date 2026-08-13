"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { resolveAppeal } from "@/app/admin/actions";
import { useLocale } from "@/components/i18n/provider";
import { Button, Textarea, Alert } from "@/components/ui";
import { appealDecisionCopy } from "@/lib/i18n/pages/admin-forms";

/** §11.5 — İtiraz kararı. Gerekçe kullanıcıya aynen iletilir. */
export function AppealDecision({ id }: { id: string }) {
  const t = appealDecisionCopy[useLocale()];
  const [decision, setDecision] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(status: "UPHELD" | "OVERTURNED" | "DISMISSED") {
    setError(null);
    if (decision.trim().length < 10) {
      setError(t.tooShort);
      return;
    }
    start(async () => {
      const res = await resolveAppeal(id, status, decision);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Alert tone="red">{error}</Alert>}
      <Textarea
        value={decision}
        onChange={(e) => setDecision(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder={t.placeholder}
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => submit("OVERTURNED")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : t.overturn}
        </Button>
        <Button size="sm" variant="danger" disabled={pending} onClick={() => submit("UPHELD")}>
          {t.uphold}
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => submit("DISMISSED")}>
          {t.dismiss}
        </Button>
      </div>
    </div>
  );
}
