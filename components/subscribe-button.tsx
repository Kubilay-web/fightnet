"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export function SubscribeButton({
  creatorId,
  tierId,
  price,
  authed,
  isCurrent,
  creatorName,
}: {
  creatorId: string;
  tierId: string;
  price: number;
  authed: boolean;
  isCurrent: boolean;
  creatorName: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    if (!authed) {
      router.push(`/giris?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setState("loading");
    setError(null);
    const res = await fetch("/api/creator/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId, tierId }),
    });
    if (res.ok) {
      setState("done");
      router.refresh();
      return;
    }
    const j = await res.json().catch(() => ({}));
    setError(j.error ?? "Abonelik başlatılamadı");
    setState("idle");
  }

  async function cancel() {
    setState("loading");
    const res = await fetch("/api/creator/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId }),
    });
    if (res.ok) router.refresh();
    setState("idle");
  }

  if (isCurrent) {
    return (
      <div className="flex flex-col gap-2">
        <span className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 py-2.5 text-sm font-bold text-emerald-500">
          <CheckCircle2 className="size-4" /> Aktif abonelik
        </span>
        <Button variant="ghost" size="sm" full onClick={cancel} disabled={state === "loading"}>
          Aboneliği iptal et
        </Button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <span className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 py-2.5 text-sm font-bold text-emerald-500">
        <CheckCircle2 className="size-4" /> Abone oldun!
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button full onClick={subscribe} disabled={state === "loading"}>
        {state === "loading" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <Heart className="size-4" /> {formatMoney(price)}/ay destekle
          </>
        )}
      </Button>
      {error && <p className="text-xs font-medium text-blood-500">{error}</p>}
    </div>
  );
}
