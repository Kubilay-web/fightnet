import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { themeScript } from "@/components/layout/theme-toggle";
import { PwaRegister } from "@/components/pwa-register";
import { CookieConsent } from "@/components/cookie-consent";
import { LocaleProvider } from "@/components/i18n/provider";
import { getDict, getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG, OG_LOCALE, LOCALES } from "@/lib/i18n/config";

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

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDict()]);

  return {
  metadataBase: new URL(APP_URL),
  title: {
    default: `FIGHTNET — ${dict.meta.tagline}`,
    template: "%s · FIGHTNET",
  },
  description: dict.meta.description,
  keywords: [
    "dövüş sporu", "MMA", "boks", "BJJ", "Muay Thai", "sparring partneri",
    "dövüş salonu", "Kampfsport", "Fightnet", "livescore",
  ],
  applicationName: "FIGHTNET",
  authors: [{ name: "FIGHTNET" }],
  openGraph: {
    type: "website",
    locale: OG_LOCALE[locale],
    alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    siteName: "FIGHTNET",
    title: `FIGHTNET — ${dict.meta.tagline}`,
    description: dict.home.heroBody,
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
}

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, dict] = await Promise.all([getLocale(), getDict()]);

  return (
    <html
      lang={LOCALE_TAG[locale]}
      className={`${sans.variable} ${display.variable} dark`}
      suppressHydrationWarning
    >
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
          {dict.common.skipToContent}
        </a>
        <LocaleProvider locale={locale} dict={dict}>
          {children}
          <CookieConsent />
        </LocaleProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
