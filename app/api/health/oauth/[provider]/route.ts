import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { fail } from "@/lib/api";
import { absoluteUrl } from "@/lib/utils";
import { HEALTH_PROVIDERS, authorizeUrl, pkcePair, providerConfigured } from "@/lib/services/health";
import { HEALTH_OAUTH_COOKIE, createOAuthState, oauthCookieOptions } from "@/lib/health-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ provider: string }> };

/**
 * §4.4 — Bulut sağlayıcı (Garmin / Polar) yetkilendirmesinin başlangıcı.
 *
 * Kullanıcı açık rızayı panelde verdikten sonra buraya yönlendirilir; PKCE
 * doğrulayıcısı ve CSRF nonce'u imzalı çerezde taşınır, DB'ye yazılmaz.
 */
export async function GET(_req: Request, { params }: Ctx) {
  const { provider: raw } = await params;
  const meta = HEALTH_PROVIDERS.find((p) => p.value === raw && p.kind === "cloud");
  if (!meta) return fail("Bu sağlayıcı için OAuth akışı tanımlı değil", 404);

  const session = await getSession();
  if (!session) return fail("Giriş yapmalısınız", 401);

  if (!providerConfigured(meta.value)) {
    return fail(
      `${meta.label} entegrasyonu bu kurulumda yapılandırılmadı: sağlayıcı istemci anahtarı tanımlı değil.`,
      503,
    );
  }

  // §5.7 — açık rıza panelden alınmadan yetkilendirme başlatılmaz.
  const consent = await prisma.deviceConnection.findUnique({
    where: { userId_provider: { userId: session.sub, provider: meta.value } },
    select: { id: true, revokedAt: true },
  });
  if (!consent || consent.revokedAt) {
    return fail("Önce Panel → Cihazlar üzerinden sağlık verisi iznini vermelisin", 409);
  }

  const { verifier, challenge } = pkcePair();
  const { cookie, state } = createOAuthState({
    provider: meta.value,
    userId: session.sub,
    verifier,
  });

  const url = authorizeUrl({
    provider: meta.value,
    redirectUri: absoluteUrl(`/api/health/oauth/${meta.value}/callback`),
    state,
    challenge,
  });
  if (!url) return fail("Yetkilendirme adresi üretilemedi", 503);

  const res = NextResponse.redirect(url);
  res.cookies.set(HEALTH_OAUTH_COOKIE, cookie, oauthCookieOptions);
  return res;
}
