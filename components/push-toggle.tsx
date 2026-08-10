"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button, Alert } from "@/components/ui";

/**
 * §4.1 — Push bildirimleri: takipçi aktivitesi, sparring istekleri,
 * livescore güncellemeleri.
 *
 * iOS'ta yalnızca ana ekrana eklenmiş PWA içinde çalışır — kullanıcıya
 * tahmin ettirmek yerine bunu açıkça söylüyoruz.
 */

type State = "loading" | "unsupported" | "denied" | "off" | "on" | "working";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function PushToggle({ vapidPublicKey }: { vapidPublicKey: string | null }) {
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      if (!vapidPublicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (!cancelled) setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setState("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setState(sub ? "on" : "off");
      } catch {
        if (!cancelled) setState("unsupported");
      }
    };

    void detect();
    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  async function enable() {
    setError(null);
    setState("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!) as BufferSource,
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Kayıt başarısız");

      setState("on");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bildirimler açılamadı");
      setState("off");
    }
  }

  async function disable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, { method: "DELETE" });
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("on");
    }
  }

  if (state === "loading") {
    return <p className="text-sm text-muted">Kontrol ediliyor…</p>;
  }

  if (state === "unsupported") {
    return (
      <Alert tone="neutral">
        Bu tarayıcı push bildirimlerini desteklemiyor. iPhone&apos;da FIGHTNET&apos;i ana ekrana
        eklersen bildirimler çalışır.
      </Alert>
    );
  }

  if (state === "denied") {
    return (
      <Alert tone="amber" title="Bildirimler tarayıcıda engellenmiş">
        Adres çubuğundaki site ayarlarından bildirim iznini tekrar açman gerekiyor.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert tone="red">{error}</Alert>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {state === "on" ? (
            <Bell className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          ) : (
            <BellOff className="mt-0.5 size-5 shrink-0 text-muted" />
          )}
          <div>
            <p className="text-sm font-bold">
              {state === "on" ? "Bu cihazda açık" : "Bu cihazda kapalı"}
            </p>
            <p className="text-xs text-muted">
              Sparring istekleri, takip edilen sporcuların maçları ve canlı skor güncellemeleri.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={state === "on" ? "outline" : "primary"}
          onClick={state === "on" ? disable : enable}
          disabled={state === "working"}
        >
          {state === "working" ? <Loader2 className="size-4 animate-spin" /> : state === "on" ? "Kapat" : "Bildirimleri aç"}
        </Button>
      </div>
    </div>
  );
}
