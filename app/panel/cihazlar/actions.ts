"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/notify";
import { deviceConnectSchema } from "@/lib/validators";
import { HEALTH_PROVIDERS, createDeviceToken, providerConfigured } from "@/lib/services/health";
import type { ActionState } from "@/app/panel/actions";

/**
 * §4.4 — Donanım bağlantılarının kullanıcı tarafı.
 *
 * §5.7: Sağlık verisi KVKK Madde 9 özel kategorisidir. Bu yüzden bağlantı
 * oturum açmış olmaktan bağımsız, ayrı ve açık bir izinle kurulur; izin geri
 * alındığında toplanan örnekler silinir.
 */

function zodFail(issues: readonly { path: readonly PropertyKey[]; message: string }[]): ActionState {
  const fields: Record<string, string> = {};
  for (const i of issues) fields[i.path.map(String).join(".") || "_"] ??= i.message;
  return { error: "Lütfen alanları kontrol edin", fields };
}

export async function connectDevice(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = deviceConnectSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return zodFail(parsed.error.issues);

  const { provider, deviceName } = parsed.data;
  const meta = HEALTH_PROVIDERS.find((p) => p.value === provider);
  if (!meta) return { error: "Bilinmeyen sağlayıcı." };
  if (!providerConfigured(provider)) {
    return { error: `${meta.label} entegrasyonu bu kurulumda yapılandırılmadı.` };
  }

  const name = deviceName || meta.label;
  const consentAt = new Date();

  if (meta.kind === "cloud") {
    // Bulut sağlayıcıda önce izin kaydı açılır; erişim jetonu OAuth dönüşünde
    // yazılacağı için bağlantı yetki alınana kadar pasif kalır.
    await prisma.deviceConnection.upsert({
      where: { userId_provider: { userId: user.id, provider } },
      create: { userId: user.id, provider, consentAt, deviceName: name, isActive: false },
      update: { consentAt, revokedAt: null, isActive: false, deviceName: name },
    });
    audit({
      userId: user.id,
      action: "HEALTH_CONSENT",
      targetType: "DEVICE_CONNECTION",
      meta: { provider, kind: "cloud" },
    });
    redirect(`/api/health/oauth/${provider}`);
  }

  // Cihaz üstü: jeton üretilir, veritabanında yalnızca SHA-256 özeti tutulur.
  // Yeniden bağlanmak eski jetonu geçersiz kılar (özet üzerine yazılır).
  const token = createDeviceToken();
  const connection = await prisma.deviceConnection.upsert({
    where: { userId_provider: { userId: user.id, provider } },
    create: {
      userId: user.id,
      provider,
      tokenHash: token.hash,
      consentAt,
      deviceName: name,
      isActive: true,
    },
    update: {
      tokenHash: token.hash,
      consentAt,
      revokedAt: null,
      isActive: true,
      deviceName: name,
    },
    select: { id: true },
  });

  audit({
    userId: user.id,
    action: "HEALTH_CONSENT",
    targetType: "DEVICE_CONNECTION",
    targetId: connection.id,
    meta: { provider, kind: "device" },
  });

  revalidatePath("/panel/cihazlar");
  // Düz jeton hiçbir yerde saklanmaz; yalnızca bu yanıtta bir kez görünür.
  return { ok: true, message: token.plain };
}

export async function revokeDevice(connectionId: string) {
  const user = await requireUser();

  const connection = await prisma.deviceConnection.findFirst({
    where: { id: connectionId, userId: user.id },
    select: { id: true, provider: true },
  });
  if (!connection) return;

  // §5.7 — izin geri alınınca sağlık örnekleri silinir. Bunlardan türetilmiş
  // antrenman kayıtları kullanıcının kendi günlüğüdür ve korunur; silmek
  // isterse Antrenman sayfasından tek tek kaldırabilir.
  await prisma.$transaction([
    prisma.healthSample.deleteMany({ where: { connectionId: connection.id } }),
    prisma.deviceConnection.update({
      where: { id: connection.id },
      data: {
        isActive: false,
        revokedAt: new Date(),
        tokenHash: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        sampleCount: 0,
        lastSyncAt: null,
      },
    }),
  ]);

  audit({
    userId: user.id,
    action: "HEALTH_REVOKE",
    targetType: "DEVICE_CONNECTION",
    targetId: connection.id,
    meta: { provider: connection.provider },
  });

  revalidatePath("/panel/cihazlar");
}
