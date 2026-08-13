import type { MetadataRoute } from "next";
import { localizePath } from "@/lib/i18n/config";
import { getDict, getLocale } from "@/lib/i18n/server";

/**
 * §3.1 / §3.2 — Web uygulaması masaüstü, tablet ve mobilde kurulabilir olmalı.
 * Native uygulamalar (App Store / Play Store) gelene kadar PWA, iOS ve
 * Android'de ana ekrana eklenebilen tam ekran deneyimi sağlar.
 *
 * §5.2 — Manifest kullanıcının dilinde üretilir: uygulama adı, açıklama ve
 * kısayol adresleri kurulum anındaki dile göre yazılır. `start_url` mutlaka
 * dil önekli olmalı, aksi halde kurulu uygulama her açılışta yönlendirme
 * yapardı.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [locale, dict] = await Promise.all([getLocale(), getDict()]);

  return {
    name: `FIGHTNET — ${dict.meta.tagline}`,
    short_name: "FIGHTNET",
    description: dict.meta.description,
    start_url: localizePath("/", locale),
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07080a",
    theme_color: "#07080a",
    lang: locale,
    dir: "ltr",
    categories: ["sports", "social", "health", "fitness"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: dict.manifest.logTraining,
        short_name: dict.manifest.training,
        url: localizePath("/panel/antrenman/yeni", locale),
      },
      {
        name: dict.manifest.findSparring,
        short_name: dict.nav.sparring,
        url: localizePath("/sparring", locale),
      },
      {
        name: dict.manifest.liveEvents,
        short_name: dict.common.live,
        url: localizePath("/etkinlikler", locale),
      },
    ],
  };
}
