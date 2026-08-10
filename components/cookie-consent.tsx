"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie, SlidersHorizontal } from "lucide-react";
import { Button, Switch } from "@/components/ui";

/**
 * §5.7 / §11.4 — "Granüler izin ile çerez banner'ı".
 *
 * Zorunlu çerezler (oturum, güvenlik) dışındaki her kategori varsayılan
 * olarak KAPALIDIR; hiçbir izin verilmeden hiçbir ölçüm veya reklam çerezi
 * yazılmaz. Karar cihazda saklanır, oturum açıksa hesaba da işlenir
 * (§5.7 ispat yükümlülüğü).
 */

export const CONSENT_KEY = "fn-consent";
export const CONSENT_VERSION = 1;

export interface ConsentState {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  /** §5.7 — sağlık verileri (kilo, nabız, donanım senkronu) için ayrı izin */
  health: boolean;
  at: string;
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function persist(state: ConsentState) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {}
  // Sunucunun ilk render'da izni bilmesi için — 12 ay
  document.cookie = `${CONSENT_KEY}=${state.analytics ? 1 : 0}${state.marketing ? 1 : 0}${
    state.health ? 1 : 0
  }; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("fn-consent-change", { detail: state }));

  // Oturum açıksa hesaba işlenir; başarısız olursa cihazdaki karar geçerli kalır
  void fetch("/api/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  }).catch(() => {});
}

/** Kaydedilmiş izin, harici bir depo gibi okunur — sunucuda daima "yok" */
function subscribeConsent(onChange: () => void) {
  window.addEventListener("fn-consent-change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("fn-consent-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function hasValidConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentState).version === CONSENT_VERSION : false;
  } catch {
    return false;
  }
}

export function CookieConsent() {
  // Sunucu anlık görüntüsü "karar verilmiş" der: banner HTML'e gömülmez,
  // hidrasyondan hemen sonra gerçek durum okunur. İzin vermiş kullanıcı
  // hiçbir an banner görmez, yeni ziyaretçide bir kare gecikmeyle açılır.
  const decided = useSyncExternalStore(subscribeConsent, hasValidConsent, () => true);

  const [reopened, setReopened] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [health, setHealth] = useState(false);

  useEffect(() => {
    // Altbilgideki "Çerez tercihleri" bağlantısı paneli yeniden açar
    const reopen = () => {
      const c = readConsent();
      setAnalytics(c?.analytics ?? false);
      setMarketing(c?.marketing ?? false);
      setHealth(c?.health ?? false);
      setDetails(true);
      setReopened(true);
    };
    window.addEventListener("fn-consent-open", reopen);
    return () => window.removeEventListener("fn-consent-open", reopen);
  }, []);

  if (decided && !reopened) return null;

  function save(next: { analytics: boolean; marketing: boolean; health: boolean }) {
    persist({ version: CONSENT_VERSION, necessary: true, at: new Date().toISOString(), ...next });
    setReopened(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--bg)]/98 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
        <div className="flex items-start gap-3">
          <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600/10 text-blood-500 sm:flex">
            <Cookie className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="consent-title" className="font-display text-lg font-black tracking-tight">
              Gizliliğin senin kontrolünde
            </h2>
            <p className="mt-1 text-sm text-muted">
              Oturum ve güvenlik için gereken çerezler olmadan platform çalışmaz. Diğer her şey
              tamamen sana bağlı — hiçbirini açmadan da FIGHTNET&apos;i tam olarak kullanabilirsin.{" "}
              <Link href="/gizlilik" className="font-semibold text-blood-500 hover:underline">
                Gizlilik açıklaması
              </Link>
            </p>

            {details && (
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--border)] p-3">
                <div className="flex items-center justify-between gap-3 opacity-70">
                  <div>
                    <p className="text-sm font-bold">Zorunlu</p>
                    <p className="text-xs text-muted">Oturum, güvenlik, hız sınırlama. Devre dışı bırakılamaz.</p>
                  </div>
                  <span className="text-xs font-bold uppercase text-emerald-500">Her zaman açık</span>
                </div>

                <Switch
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  label={
                    <span>
                      <span className="block text-sm font-bold">Ölçüm</span>
                      <span className="block text-xs text-muted">
                        Hangi özelliklerin işe yaradığını anlamak için anonim kullanım istatistiği.
                      </span>
                    </span>
                  }
                />

                <Switch
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  label={
                    <span>
                      <span className="block text-sm font-bold">Reklam</span>
                      <span className="block text-xs text-muted">
                        Dövüş sporu markalarının banner&apos;ları kişiselleştirilir. Spor bahis reklamı asla gösterilmez.
                      </span>
                    </span>
                  }
                />

                <Switch
                  checked={health}
                  onChange={(e) => setHealth(e.target.checked)}
                  label={
                    <span>
                      <span className="block text-sm font-bold">Sağlık verileri</span>
                      <span className="block text-xs text-muted">
                        Kilo takibi ve akıllı saat senkronu. KVKK md. 9 kapsamında ayrı izin gerektirir.
                      </span>
                    </span>
                  }
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => save({ analytics: true, marketing: true, health: true })}>
                Tümünü kabul et
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => (details ? save({ analytics, marketing, health }) : save({ analytics: false, marketing: false, health: false }))}
              >
                {details ? "Seçimimi kaydet" : "Yalnızca zorunlu"}
              </Button>
              {!details && (
                <Button size="sm" variant="ghost" onClick={() => setDetails(true)}>
                  <SlidersHorizontal className="size-4" />
                  Ayarla
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Altbilgiden izin tercihlerini yeniden açmak için */
export function ConsentSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("fn-consent-open"))}
      className={className}
    >
      Çerez tercihleri
    </button>
  );
}
