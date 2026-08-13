import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  canonicalizePath,
  isLocale,
  localizePath,
  negotiateLocale,
  splitLocale,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Edge proxy (eski adıyla middleware).
 *
 * İki iş yapar:
 *
 * 1. §5.2 Dil yönlendirmesi — her URL bir dil önekiyle başlar (`/de`, `/en`,
 *    `/tr`) ve yol segmentleri o dile çevrilidir. Önek yoksa kullanıcının
 *    tercihine göre yönlendirilir; varsa URL kanonik (Türkçe) rotaya yeniden
 *    yazılır, böylece dosya sisteminde tek bir sayfa ağacı yeter.
 *
 * 2. Yetki — JWT'den rol çözülür, DB'ye gidilmez. Kontroller kanonik yol
 *    üzerinden yapılır, yani dil ne olursa olsun aynı kural işler.
 */

/**
 * Dil önekiyle sunulamayacak, ama içeriği yine de dile göre üretilen yollar.
 * Yönlendirilmezler; yalnızca dil başlığı eklenip olduğu gibi geçirilirler.
 * (Manifest kök yolda kalmalı, aksi halde kurulu PWA'nın kimliği değişir.)
 */
const LOCALE_AWARE_ROOT_FILES = ["/manifest.webmanifest"];

const PROTECTED = ["/panel", "/salon-yonetimi", "/organizator"];
const ADMIN_ONLY = ["/admin"];
const AUTH_PAGES = ["/giris", "/kayit"];

export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Dil öneki ayrıştır
  const { locale: urlLocale, rest } = splitLocale(pathname);

  if (LOCALE_AWARE_ROOT_FILES.includes(pathname)) {
    const locale = preferredLocale(req);
    return NextResponse.next({ request: { headers: withLocaleHeader(req, locale) } });
  }

  // Önek yoksa kullanıcının diline yönlendir. Kalıcı değil (307): kullanıcı
  // dilini değiştirdiğinde eski hedef tarayıcı önbelleğinde kalmasın.
  if (!urlLocale) {
    const preferred = preferredLocale(req);
    const target = req.nextUrl.clone();
    target.pathname = localizePath(pathname, preferred);
    target.search = search;
    return NextResponse.redirect(target, 307);
  }

  const locale = urlLocale;
  const canonical = canonicalizePath(rest, locale) || "/";

  const needsAuth = PROTECTED.some((p) => canonical === p || canonical.startsWith(`${p}/`));
  const needsAdmin = ADMIN_ONLY.some((p) => canonical === p || canonical.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => canonical === p || canonical.startsWith(`${p}/`));

  if (needsAuth || needsAdmin || isAuthPage) {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

    if (isAuthPage && session) {
      return redirectTo(req, "/panel", locale);
    }
    if ((needsAuth || needsAdmin) && !session) {
      const target = req.nextUrl.clone();
      target.pathname = localizePath("/giris", locale);
      target.search = "";
      // `next` kanonik tutulur; giriş sonrası yönlendirme dili yeniden uygular
      target.searchParams.set("next", canonical);
      return NextResponse.redirect(target);
    }
    if (needsAdmin && session && session.role !== "ADMIN" && session.role !== "MODERATOR") {
      return redirectTo(req, "/403", locale);
    }
  }

  // Kanonik rotaya yeniden yaz — kullanıcının adres çubuğu değişmez
  const target = req.nextUrl.clone();
  target.pathname = canonical;

  const res = NextResponse.rewrite(target, {
    request: { headers: withLocaleHeader(req, locale) },
  });
  res.headers.set(LOCALE_HEADER, locale);

  // Tercihi hatırla — bir sonraki öneksiz ziyaret doğru dile gitsin
  if (req.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    res.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return res;
}

function preferredLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  return negotiateLocale(req.headers.get("accept-language")) ?? DEFAULT_LOCALE;
}

function redirectTo(req: NextRequest, canonicalPath: string, locale: Locale) {
  const target = req.nextUrl.clone();
  target.pathname = localizePath(canonicalPath, locale);
  target.search = "";
  return NextResponse.redirect(target);
}

/** Sunucu bileşenlerinin `headers()` ile dili okuyabilmesi için. */
function withLocaleHeader(req: NextRequest, locale: Locale): Headers {
  const headers = new Headers(req.headers);
  headers.set(LOCALE_HEADER, locale);
  return headers;
}

export const config = {
  /**
   * API ve statik varlıklar dil yönlendirmesinin tamamen dışında kalır.
   * `sw.js`, `robots.txt`, `sitemap.xml` ve `.well-known` kök yolda kalmalıdır
   * — dil önekiyle sunulursa tarayıcı ve arama motorları bulamaz.
   *
   * `manifest.webmanifest` bilinçli olarak DIŞLANMADI: proxy'ye uğrayıp
   * `LOCALE_AWARE_ROOT_FILES` üzerinden yalnızca dil başlığını alır,
   * yönlendirilmez. Böylece kurulum sırasında uygulama adı ve kısayollar
   * kullanıcının dilinde üretilir.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon-|apple-touch-icon|sw\\.js|robots\\.txt|sitemap\\.xml|\\.well-known|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|txt|xml|json|woff2?)$).*)",
  ],
};
