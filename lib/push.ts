import "server-only";
import webpush from "web-push";
import prisma from "./prisma";

/**
 * §4.1 — Push bildirimleri (takipçi aktivitesi, sparring istekleri,
 * livescore güncellemeleri) ve §5.3 — "Push Bildirimleri: iOS, Android, Web".
 *
 * Web Push (VAPID) tarayıcı tarafında satıcıya bağımlılık gerektirmez ve
 * Chrome/Edge/Firefox ile iOS 16.4+ (ana ekrana eklenmiş PWA) üzerinde çalışır.
 * Native uygulamalar geldiğinde FCM aynı `sendPush` arayüzünün arkasına eklenir.
 */

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:datenschutz@fightnet.app";

export const pushConfigured = Boolean(PUBLIC_KEY && PRIVATE_KEY);

if (pushConfigured) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY!, PRIVATE_KEY!);
}

export interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
  /** Livescore akışı gibi yüksek frekanslı bildirimler sessiz gelir */
  silent?: boolean;
}

/**
 * Kullanıcının tüm cihazlarına bildirim gönderir.
 * Kritik yolun dışındadır: hata isteği bloklamaz, ölü abonelikler temizlenir.
 */
export async function sendPush(userId: string, payload: PushPayload): Promise<void> {
  if (!pushConfigured) return;

  const [user, subs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { pushEnabled: true } }),
    prisma.pushSubscription.findMany({
      where: { userId },
      select: { id: true, endpoint: true, p256dh: true, auth: true },
      take: 10,
    }),
  ]);

  if (!user?.pushEnabled || !subs.length) return;

  const body = JSON.stringify(payload);
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
          { TTL: 60 * 60 * 24 },
        );
      } catch (err) {
        // 404/410: abonelik tarayıcıda iptal edilmiş — kaydı sil
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) dead.push(s.id);
      }
    }),
  );

  if (dead.length) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } }).catch(() => {});
  }
}

/**
 * Birden çok alıcı — livescore/etkinlik yayınları için.
 *
 * Alıcı başına sorgu atmaz: tüm abonelikler ve push tercihleri iki sorguda
 * okunur. Bin takipçili bir dövüşçünün sonucu yayınlandığında fark buradadır.
 */
export async function sendPushMany(userIds: string[], payload: PushPayload): Promise<void> {
  if (!pushConfigured || !userIds.length) return;

  const targets = userIds.slice(0, 2000);
  const [enabled, subs] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: targets }, pushEnabled: true },
      select: { id: true },
    }),
    prisma.pushSubscription.findMany({
      where: { userId: { in: targets } },
      select: { id: true, endpoint: true, p256dh: true, auth: true, userId: true },
    }),
  ]);

  const allowed = new Set(enabled.map((u) => u.id));
  const deliverable = subs.filter((s) => allowed.has(s.userId));
  if (!deliverable.length) return;

  const body = JSON.stringify(payload);
  const dead: string[] = [];

  await Promise.all(
    deliverable.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
          { TTL: 60 * 60 * 24 },
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) dead.push(s.id);
      }
    }),
  );

  if (dead.length) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } }).catch(() => {});
  }
}
