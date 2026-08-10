import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { themeScript } from "@/components/layout/theme-toggle";
import { PwaRegister } from "@/components/pwa-register";
import { CookieConsent } from "@/components/cookie-consent";

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const display = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "FIGHTNET — DACH'ın bağımsız dövüş sporu platformu",
    template: "%s · FIGHTNET",
  },
  description:
    "Almanya, Avusturya ve İsviçre'de dövüş sporları için bağımsız platform. Doğrulanmış dövüşçü profilleri, salon bulucu, sparring arama, canlı skor ve topluluk.",
  keywords: [
    "dövüş sporu", "MMA", "boks", "BJJ", "Muay Thai", "sparring partneri",
    "dövüş salonu", "Kampfsport", "Fightnet", "livescore",
  ],
  applicationName: "FIGHTNET",
  authors: [{ name: "FIGHTNET" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["de_DE", "en_US"],
    siteName: "FIGHTNET",
    title: "FIGHTNET — DACH'ın bağımsız dövüş sporu platformu",
    description:
      "Hessen'deki bir amatör şampiyonun tıpkı bir UFC dövüşçüsü gibi görünür olduğu ilk platform.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
  // §3.1 — kurulabilir web uygulaması
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "FIGHTNET", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07080a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${sans.variable} ${display.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-blood-600 focus:px-4 focus:py-2 focus:font-bold focus:text-white"
        >
          İçeriğe atla
        </a>
        {children}
        <PwaRegister />
        <CookieConsent />
      </body>
    </html>
  );
}
