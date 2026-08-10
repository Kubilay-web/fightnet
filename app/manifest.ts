import type { MetadataRoute } from "next";

/**
 * §3.1 / §3.2 — Web uygulaması masaüstü, tablet ve mobilde kurulabilir olmalı.
 * Native uygulamalar (App Store / Play Store) gelene kadar PWA, iOS ve
 * Android'de ana ekrana eklenebilen tam ekran deneyimi sağlar.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FIGHTNET — DACH'ın bağımsız dövüş sporu platformu",
    short_name: "FIGHTNET",
    description:
      "Doğrulanmış dövüşçü profilleri, salon bulucu, sparring arama, antrenman günlüğü ve canlı skor.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07080a",
    theme_color: "#07080a",
    lang: "tr",
    dir: "ltr",
    categories: ["sports", "social", "health", "fitness"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Antrenman kaydet", short_name: "Antrenman", url: "/panel/antrenman/yeni" },
      { name: "Sparring ara", short_name: "Sparring", url: "/sparring" },
      { name: "Canlı etkinlikler", short_name: "Canlı", url: "/etkinlikler" },
    ],
  };
}
