import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/**
 * Edge proxy (eski adıyla middleware) — DB'ye gitmeden JWT'den yetki çözer.
 * Korunan rotalar tek geçişte filtrelenir; matcher ile statik varlıklar
 * hiç proxy'ye uğramaz (en düşük gecikme).
 */

const PROTECTED = ["/panel", "/salon-yonetimi", "/organizator"];
const ADMIN_ONLY = ["/admin"];
const AUTH_PAGES = ["/giris", "/kayit"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN_ONLY.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!needsAuth && !needsAdmin && !isAuthPage) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/panel", req.url));
  }

  if ((needsAuth || needsAdmin) && !session) {
    const url = new URL("/giris", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && session && session.role !== "ADMIN" && session.role !== "MODERATOR") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/admin/:path*",
    "/salon-yonetimi/:path*",
    "/organizator/:path*",
    "/giris",
    "/kayit",
  ],
};
