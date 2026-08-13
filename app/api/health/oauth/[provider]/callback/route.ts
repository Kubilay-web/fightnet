import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fail } from "@/lib/api";
import { audit } from "@/lib/notify";
import { absoluteUrl } from "@/lib/utils";
import { HEALTH_PROVIDERS, exchangeCode, providerConfigured } from "@/lib/services/health";
import { HEALTH_OAUTH_COOKIE, readOAuthState } from "@/lib/health-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ provider: string }> };

/** Kullanıcıya hata kodunu panelde göstermek için tek çıkış noktası. */
function backToPanel(query: string) {
  const res = NextResponse.redirect(absoluteUrl(`/panel/cihazlar${query}`));
  res.cookies.delete(HEALTH_OAUTH_COOKIE);
  return res;
}

/**
 * §4.4 — Garmin / Polar yetkilendirme dönüşü.
 *
 * Sağlayıcıdan gelen `state`, imzalı çerezdeki nonce ile eşleşmek zorundadır;
 * eşleşmezse istek başka bir sekmeden enjekte edilmiş sayılır ve reddedilir.
 */
export async function GET(req: Request, { params }: Ctx) {
  const { provider: raw } = await params;
  const meta = HEALTH_PROVIDERS.find((p) => p.value === raw && p.kind === "cloud");
  if (!meta) return fail("Bu sağlayıcı için OAuth akışı tanımlı değil", 404);
  if (!providerConfigured(meta.value)) {
    return fail(`${meta.label} entegrasyonu bu kurulumda yapılandırılmadı.`, 503);
  }

  const url = new URL(req.url);
  if (url.searchParams.get("error")) return backToPanel("?hata=izin-verilmedi");

  const code = url.searchParams.get("code");
  const store = await cookies();
  const state = readOAuthState(store.get(HEALTH_OAUTH_COOKIE)?.value, url.searchParams.get("state"));

  if (!code || !state || state.provider !== meta.value) return backToPanel("?hata=oturum-dogrulanamadi");

  const tokens = await exchangeCode({
    provider: meta.value,
    code,
    redirectUri: absoluteUrl(`/api/health/oauth/${meta.value}/callback`),
    verifier: state.verifier,
  });
  if (!tokens) return backToPanel("?hata=jeton-alinamadi");

  // Bağlantı izin adımında açılmıştı; burada yalnızca aktifleştirilir.
  const updated = await prisma.deviceConnection.updateMany({
    where: { userId: state.userId, provider: meta.value, revokedAt: null },
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      externalUserId: tokens.externalUserId,
      isActive: true,
    },
  });
  if (!updated.count) return backToPanel("?hata=izin-bulunamadi");

  audit({
    userId: state.userId,
    action: "HEALTH_OAUTH_CONNECT",
    targetType: "DEVICE_CONNECTION",
    meta: { provider: meta.value },
  });

  return backToPanel(`?baglandi=${meta.value}`);
}
