"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/i18n/provider";
import { panelBillingCopy } from "@/lib/i18n/pages/panel-billing";

/** Stripe müşteri portalı — kart değişimi, abonelik iptali, fatura geçmişi. */
export function BillingPortalButton() {
  const t = panelBillingCopy[useLocale()].billingButtons;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && json.url) {
      window.location.assign(json.url);
      return;
    }
    setError(json.error ?? t.portalError);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={open} disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : t.portalCta}
      </Button>
      {error && <p className="text-xs font-medium text-blood-500">{error}</p>}
    </div>
  );
}

/** §4.7 — Connect Express onboarding / hesap panosu. */
export function ConnectOnboardButton({ hasAccount }: { hasAccount: boolean }) {
  const t = panelBillingCopy[useLocale()].billingButtons;
  const router = useRouter();
  const [loading, setLoading] = useState<null | "onboard" | "dashboard" | "refresh">(null);
  const [error, setError] = useState<string | null>(null);

  async function call(action: "onboard" | "dashboard" | "refresh") {
    setLoading(action);
    setError(null);
    const res = await fetch("/api/billing/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, returnPath: "/panel/abonelik" }),
    });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

    if (res.ok && json.url) {
      window.location.assign(json.url);
      return;
    }
    if (res.ok) {
      router.refresh();
      setLoading(null);
      return;
    }
    setError(json.error ?? t.connectError);
    setLoading(null);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {hasAccount && (
          <>
            <Button variant="ghost" size="sm" onClick={() => call("refresh")} disabled={loading !== null}>
              {loading === "refresh" ? <Loader2 className="size-4 animate-spin" /> : t.refreshStatus}
            </Button>
            <Button variant="outline" size="sm" onClick={() => call("dashboard")} disabled={loading !== null}>
              {loading === "dashboard" ? <Loader2 className="size-4 animate-spin" /> : t.stripeDashboard}
            </Button>
          </>
        )}
        <Button size="sm" onClick={() => call("onboard")} disabled={loading !== null}>
          {loading === "onboard" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : hasAccount ? (
            t.finishSetup
          ) : (
            t.enablePayouts
          )}
        </Button>
      </div>
      {error && <p className="text-xs font-medium text-blood-500">{error}</p>}
    </div>
  );
}
