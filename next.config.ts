import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Cloudinary görselleri — modern formatlar ve uzun CDN önbelleği
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [24, 32, 48, 64, 96, 128, 160, 224, 320],
  },

  experimental: {
    // Barrel dosyalarından ağaç sallama — bundle boyutunu ciddi düşürür
    optimizePackageImports: ["lucide-react", "@/components/ui"],
    scrollRestoration: true,
  },

  // Prisma'yı sunucu bundle'ına dahil etme (native engine)
  serverExternalPackages: ["@prisma/client", "bcryptjs", "cloudinary"],

  async headers() {
    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self), interest-cohort=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ];
    // Statik varlıkların immutable önbelleklemesini Next.js zaten yapar
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
