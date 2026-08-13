import "server-only";
import { createHash, randomBytes } from "node:crypto";
import prisma from "./prisma";

/**
 * §4.4 / §9.3 — B2B veri lisansı.
 *
 * Yalnızca §8.3'e göre HERKESE AÇIK işaretli veriler lisanslanır. Sporcunun
 * gizlilik seviyesi PUBLIC değilse hiçbir lisans onu göremez; sağlık verisi,
 * antrenman günlüğü ve mesajlar hiçbir kapsamda yer almaz.
 */

export const DATASETS = {
  events: "Etkinlik takvimi — tarih, yer, disiplin, durum",
  fights: "Dövüş kartları ve sonuçlar — isim, kilo sınıfı, yöntem",
  gyms: "Salon dizini — ad, şehir, disiplinler, doğrulama durumu",
  athletes_public: "Herkese açık sporcu profilleri — ad, disiplin, bilanço",
} as const;

export type Dataset = keyof typeof DATASETS;

export interface IssuedKey {
  /** Yalnızca bir kez gösterilir */
  plain: string;
  hash: string;
  prefix: string;
}

export function issueApiKey(): IssuedKey {
  const secret = randomBytes(24).toString("base64url");
  const prefix = `fnk_${randomBytes(4).toString("hex")}`;
  const plain = `${prefix}.${secret}`;
  return { plain, hash: hashApiKey(plain), prefix };
}

export function hashApiKey(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export interface LicenseContext {
  id: string;
  organization: string;
  scopes: string[];
  rateLimit: number;
}

/**
 * `Authorization: Bearer fnk_….…` başlığını doğrular.
 * @returns null → anahtar geçersiz, süresi dolmuş veya lisans aktif değil.
 */
export async function authenticateLicense(header: string | null): Promise<LicenseContext | null> {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token.startsWith("fnk_")) return null;

  const license = await prisma.dataLicense.findUnique({
    where: { keyHash: hashApiKey(token) },
    select: {
      id: true, organization: true, scopes: true, rateLimit: true,
      status: true, expiresAt: true,
    },
  });
  if (!license) return null;
  if (license.status !== "ACTIVE" && license.status !== "TRIAL") return null;
  if (license.expiresAt && license.expiresAt < new Date()) return null;

  // Kullanım sayacı kritik yolu bloklamaz
  prisma.dataLicense
    .update({
      where: { id: license.id },
      data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
    })
    .catch(() => {});

  return {
    id: license.id,
    organization: license.organization,
    scopes: license.scopes,
    rateLimit: license.rateLimit,
  };
}

export function hasScope(ctx: LicenseContext, dataset: Dataset): boolean {
  return ctx.scopes.includes(dataset);
}
