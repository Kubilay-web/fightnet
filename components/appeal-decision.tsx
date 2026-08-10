"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { resolveAppeal } from "@/app/admin/actions";
import { Button, Textarea, Alert } from "@/components/ui";

/** §11.5 — İtiraz kararı. Gerekçe kullanıcıya aynen iletilir. */
export function AppealDecision({ id }: { id: string }) {
  const [decision, setDecision] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(status: "UPHELD" | "OVERTURNED" | "DISMISSED") {
    setError(null);
    if (decision.trim().length < 10) {
      setError("Karar gerekçesi en az 10 karakter olmalı — kullanıcı bu metni okuyacak.");
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
        placeholder="Kararın gerekçesi — kullanıcıya bildirim olarak gider"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => submit("OVERTURNED")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Kararı geri al"}
        </Button>
        <Button size="sm" variant="danger" disabled={pending} onClick={() => submit("UPHELD")}>
          Kararı koru
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => submit("DISMISSED")}>
          İşleme alma
        </Button>
      </div>
    </div>
  );
}
