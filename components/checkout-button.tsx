"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/i18n/provider";
import { panelBillingCopy } from "@/lib/i18n/pages/panel-billing";

type Purpose = "PREMIUM" | "COACH_TOOLS" | "PPV_TICKET" | "COACHING_SESSION" | "MARKETPLACE_ORDER" | "GYM_PLAN";

/**
 * Ödeme başlatan tek düğme. Tutar istemciden gönderilmez — sunucu neyin
 * satın alındığına bakarak fiyatı kendisi belirler (§4.4/§4.7).
 */
export function CheckoutButton({
  purpose,
  payload,
  children,
  authed = true,
  variant,
  size,
  full,
  disabled,
}: {
  purpose: Purpose;
  payload?: Record<string, string>;
  children: ReactNode;
  authed?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  disabled?: boolean;
}) {
  const t = panelBillingCopy[useLocale()].checkoutButton;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!authed) {
      router.push(`/giris?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose, ...payload }),
    });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

    if (res.ok && json.url) {
      window.location.assign(json.url);
      return;
    }
    setError(json.error ?? t.error);
    setLoading(false);
  }

  return (
    <div className={full ? "flex w-full flex-col gap-1.5" : "flex flex-col gap-1.5"}>
      <Button onClick={start} disabled={loading || disabled} variant={variant} size={size} full={full}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : children}
      </Button>
      {error && <p className="text-xs font-medium text-blood-500">{error}</p>}
    </div>
  );
}
