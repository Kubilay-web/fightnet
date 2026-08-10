"use client";

import { useEffect } from "react";
import { flushTrainingQueue } from "@/lib/offline";

/**
 * Service worker'ı kaydeder (§3.1 kurulabilir web uygulaması) ve bekleyen
 * çevrimdışı antrenman kayıtlarını uygulama her açıldığında / bağlantı geri
 * geldiğinde gönderir (§5.2).
 *
 * Geliştirmede kaydedilmez: sw.js `/_next/static/` isteklerini önbellek
 * öncelikli servis eder (üretimde dosya adları içerik hash'li olduğu için
 * güvenli), ama dev sunucusunda chunk adları tekrar kullanıldığından aynı
 * URL'nin eski içeriği kalıcı olarak servis edilir ve kod değişiklikleri
 * tarayıcıya hiç ulaşmaz. Daha önce kurulmuş bir SW varsa temizlenir.
 *
 * Görsel çıktısı yoktur; kök düzende bir kez render edilir.
 */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const unregisterInDev = async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((k) => k.startsWith("fightnet-")).map((k) => caches.delete(k)));
        }
      } catch {
        // Temizlik başarısız olursa geliştirici sert yenileme ile ilerleyebilir
      }
    };

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        // Arka plan senkronu destekleniyorsa kuyruk sekme kapalıyken de boşalır
        if ("sync" in reg) {
          try {
            await (reg as ServiceWorkerRegistration & { sync: { register(t: string): Promise<void> } }).sync.register(
              "fightnet-training-sync",
            );
          } catch {}
        }
      } catch {
        // Kayıt başarısız olursa uygulama çevrimiçi modda normal çalışmaya devam eder
      }
    };

    const flush = () => void flushTrainingQueue();
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "FLUSH_TRAINING_QUEUE") flush();
    };

    if (process.env.NODE_ENV === "production") void register();
    else void unregisterInDev();
    flush();

    window.addEventListener("online", flush);
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("online", flush);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  return null;
}
