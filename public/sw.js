/* FIGHTNET Service Worker
 *
 * Üç görev:
 *   1. §5.2 — Çevrimdışı destek: uygulama kabuğu ve son görülen sayfalar
 *      önbellekten servis edilir, bağlantı yokken çevrimdışı sayfa gösterilir.
 *   2. §5.2 — Antrenman günlüğü kuyruğu: bağlantı geri geldiğinde bekleyen
 *      kayıtlar arka planda senkronize edilir (Background Sync + fallback).
 *   3. §4.1 — Push bildirimleri: takipçi aktivitesi, sparring istekleri,
 *      livescore güncellemeleri.
 */

const VERSION = "v2";
const SHELL_CACHE = `fightnet-shell-${VERSION}`;
const PAGE_CACHE = `fightnet-pages-${VERSION}`;
const ASSET_CACHE = `fightnet-assets-${VERSION}`;
const OFFLINE_URL = "/cevrimdisi";

const SHELL = [OFFLINE_URL, "/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("fightnet-") && !k.endsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ---------------------------------------------------------------------------
// Getirme stratejileri
// ---------------------------------------------------------------------------

function isAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon-") ||
    /\.(png|jpg|jpeg|svg|webp|avif|woff2?|ico)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Kimlik/oturum ve API yanıtları asla önbelleğe alınmaz — bayat yetki riski
  if (url.pathname.startsWith("/api/")) return;

  // Statik varlıklar: önbellekten anında servis edilir, arka planda tazelenir
  // (stale-while-revalidate). Saf önbellek önceliği, aynı URL'nin içeriği
  // değiştiğinde (dev sunucusunda chunk adları tekrar kullanılır) eski dosyayı
  // kalıcı olarak servis eder ve güncellemeler tarayıcıya hiç ulaşmaz.
  if (isAsset(url)) {
    event.respondWith(
      caches.match(req).then((hit) => {
        const network = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSET_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => hit ?? Response.error());
        return hit ?? network;
      }),
    );
    return;
  }

  // Sayfalar: ağ öncelikli, çevrimdışında son görülen sürüm
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) ?? (await caches.match(OFFLINE_URL)) ?? Response.error()),
    );
  }
});

// ---------------------------------------------------------------------------
// §5.2 — Antrenman kuyruğunun arka planda senkronu
// ---------------------------------------------------------------------------

self.addEventListener("sync", (event) => {
  if (event.tag === "fightnet-training-sync") {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  // Kuyruk localStorage'da tutulur; senkronu sayfa bağlamı yürütür.
  // Açık sekme yoksa kuyruk bir sonraki ziyarette boşaltılır.
  for (const client of clients) client.postMessage({ type: "FLUSH_TRAINING_QUEUE" });
}

// ---------------------------------------------------------------------------
// §4.1 — Push bildirimleri
// ---------------------------------------------------------------------------

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "FIGHTNET", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "FIGHTNET";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: payload.tag || "fightnet",
      renotify: Boolean(payload.tag),
      data: { url: payload.url || "/panel/bildirimler" },
      // Livescore güncellemeleri sessiz gelir, sparring istekleri titreşir
      silent: payload.silent === true,
      vibrate: payload.silent ? undefined : [40, 30, 40],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(target) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(target);
    }),
  );
});
