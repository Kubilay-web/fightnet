import type { MetadataRoute } from "next";
import { LOCALES, localizePath } from "@/lib/i18n/config";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Oturum arkasındaki alanlar — her dil önekinde ayrı ayrı kapatılmalı. */
const PRIVATE_PATHS = [
  "/panel", "/admin", "/salon-yonetimi", "/organizator",
  "/giris", "/kayit", "/403", "/ebeveyn-onayi",
];

export default function robots(): MetadataRoute.Robots {
  // §5.2 — URL'ler dile göre değiştiği için `/panel/` yasaklamak yetmez;
  // `/de/dashboard/`, `/en/dashboard/` ve `/tr/panel/` de kapatılmalı.
  const disallow = [
    "/api/",
    ...LOCALES.flatMap((locale) =>
      PRIVATE_PATHS.map((p) => {
        const path = localizePath(p, locale);
        return p === "/403" ? path : `${path}/`;
      }),
    ),
  ];

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
