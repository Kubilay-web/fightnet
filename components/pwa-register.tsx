"use client";

import { useEffect } from "react";
import { flushTrainingQueue } from "@/lib/offline";

/**
 * Service worker'ı kaydeder (§3.1 kurulabilir web uygulaması) ve bekleyen
 * çevrimdışı antrenman kayıtlarını uygulama her açıldığında / bağlantı geri
 * geldiğinde gönderir (§5.2).
 *
 * Görsel çıktısı yoktur; kök düzende bir kez render edilir.
 */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

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

    void register();
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
