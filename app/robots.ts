import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel/", "/admin/", "/api/", "/salon-yonetimi/", "/organizator/", "/giris", "/kayit", "/403"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
