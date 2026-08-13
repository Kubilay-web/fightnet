"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Radio, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui";
import { formatMoney } from "@/lib/utils";
import { useDict } from "@/components/i18n/provider";

/**
 * §4.4 — Canlı yayın oynatıcısı ve PPV paywall.
 *
 * Oynatma adresi hiçbir zaman sayfa HTML'ine gömülmez: istemci `/stream`
 * ucundan ister, sunucu satın almayı doğrulayıp kısa ömürlü imzalı adresi
 * döndürür. Böylece "kaynağı görüntüle" ile bedava izlemek mümkün değildir.
 *
 * HLS: Safari ve iOS yerel olarak çalar. Diğer tarayıcılarda MediaSource
 * gerekir; hls.js gibi bir kütüphane bundle'a eklenmediği için o tarayıcılarda
 * kullanıcı yeni sekmede açma seçeneği görür — hiçbir koşulda sessiz siyah
 * ekran bırakılmaz.
 */

type State =
  | { kind: "loading" }
  | { kind: "ready"; url: string; status: string }
  | { kind: "locked"; price: number | null }
  | { kind: "login" }
  | { kind: "none"; reason: string };

export function LiveStream({
  eventId,
  eventTitle,
  isPPV,
  ppvPrice,
}: {
  eventId: string;
  eventTitle: string;
  isPPV: boolean;
  /** Yalnızca kilit ekranındaki fiyat metni için; erişim kararını sunucu verir. */
  ppvPrice: number | null;
}) {
  const router = useRouter();
  const dict = useDict();
  const t = dict.stream;
  const [state, setState] = useState<State>({ kind: "loading" });
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nativeHls, setNativeHls] = useState(true);

  // Yükleme doğrudan efektin içinde: durum yalnızca yanıt geldikten sonra,
  // bileşen hâlâ takılıyken yazılır.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch(`/api/events/${eventId}/stream`, { cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as {
        available?: boolean;
        playbackUrl?: string;
        status?: string;
        reason?: string;
        code?: string;
        price?: number;
      };
      if (cancelled) return;

      if (res.status === 401) return setState({ kind: "login" });
      if (res.status === 402) return setState({ kind: "locked", price: json.price ?? ppvPrice });
      if (!res.ok || !json.available || !json.playbackUrl) {
        return setState({ kind: "none", reason: json.reason ?? "unavailable" });
      }
      setState({ kind: "ready", url: json.playbackUrl, status: json.status ?? "IDLE" });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [eventId, ppvPrice]);

  useEffect(() => {
    if (state.kind !== "ready") return;
    const el = videoRef.current;
    if (!el) return;
    const supported =
      el.canPlayType("application/vnd.apple.mpegurl") !== "" ||
      el.canPlayType("application/x-mpegURL") !== "";
    setNativeHls(supported || !state.url.includes(".m3u8"));
  }, [state]);

  async function buy() {
    setBuying(true);
    setError(null);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "PPV_TICKET", eventId }),
    });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && json.url) {
      window.location.assign(json.url);
      return;
    }
    setError(json.error ?? t.purchaseFailed);
    setBuying(false);
  }

  if (state.kind === "none") return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
        {state.kind === "loading" && (
          <div className="flex size-full items-center justify-center">
            <Loader2 className="size-6 animate-spin text-white/70" />
          </div>
        )}

        {state.kind === "login" && (
          <Lockscreen
            title={t.paidTitle}
            description={t.paidBody}
            action={
              <Button
                onClick={() => router.push(`/giris?next=${encodeURIComponent(window.location.pathname)}`)}
              >
                {dict.auth.login}
              </Button>
            }
          />
        )}

        {state.kind === "locked" && (
          <Lockscreen
            title={eventTitle}
            description={
              state.price
                ? t.accessPriced.replace("{price}", formatMoney(state.price))
                : t.accessGeneric
            }
            action={
              <Button onClick={buy} disabled={buying}>
                {buying ? <Loader2 className="size-4 animate-spin" /> : t.buyTicket}
              </Button>
            }
          />
        )}

        {state.kind === "ready" &&
          (nativeHls ? (
            <video
              ref={videoRef}
              src={state.url}
              controls
              playsInline
              autoPlay
              muted
              className="size-full"
            />
          ) : (
            <Lockscreen
              title={t.readyTitle}
              description={t.readyBody}
              action={
                <a
                  href={state.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blood-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blood-500"
                >
                  <Tv className="size-4" /> {t.openStream}
                </a>
              }
            />
          ))}

        {state.kind === "ready" && state.status === "LIVE" && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-blood-600 px-2.5 py-1 text-xs font-black text-white">
            <Radio className="size-3" /> {dict.common.live}
          </span>
        )}
      </div>

      {error && <Alert tone="red">{error}</Alert>}

      {isPPV && state.kind === "ready" && (
        <p className="text-xs text-muted">
          {t.tokenNote}
        </p>
      )}
    </div>
  );
}

function Lockscreen({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 px-6 text-center">
      <Lock className="size-8 text-white/60" />
      <h3 className="font-display text-lg font-black text-white">{title}</h3>
      <p className="max-w-sm text-sm text-white/70">{description}</p>
      {action}
    </div>
  );
}
