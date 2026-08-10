import "server-only";
import type { NotificationType } from "@prisma/client";
import prisma from "./prisma";
import { sendPush, sendPushMany } from "./push";

/** §4.1 — Yüksek frekanslı türler cihazda sessiz gösterilir */
const SILENT_TYPES: NotificationType[] = ["LIKE", "LIVESCORE"];

/**
 * Bildirim yazımı kritik yolun dışında tutulur — kullanıcı isteği
 * bildirim yazılmasını beklemez. Aynı içerik push olarak da gönderilir
 * (kullanıcı push'u kapattıysa `sendPush` kendisi atlar).
 */
export function notify(input: {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  url?: string;
  meta?: Record<string, unknown>;
}) {
  if (input.actorId && input.actorId === input.userId) return;
  prisma.notification
    .create({
      data: {
        userId: input.userId,
        actorId: input.actorId ?? null,
        type: input.type,
        title: input.title,
        body: input.body,
        url: input.url,
        meta: input.meta as never,
      },
    })
    .catch(() => {});

  sendPush(input.userId, {
    title: input.title,
    body: input.body,
    url: input.url ?? "/panel/bildirimler",
    tag: input.type,
    silent: SILENT_TYPES.includes(input.type),
  }).catch(() => {});
}

export function notifyMany(
  userIds: string[],
  input: Omit<Parameters<typeof notify>[0], "userId">,
) {
  const targets = userIds.filter((id) => id !== input.actorId);
  if (!targets.length) return;
  prisma.notification
    .createMany({
      data: targets.map((userId) => ({
        userId,
        actorId: input.actorId ?? null,
        type: input.type,
        title: input.title,
        body: input.body,
        url: input.url,
        meta: input.meta as never,
      })),
    })
    .catch(() => {});

  sendPushMany(targets, {
    title: input.title,
    body: input.body,
    url: input.url ?? "/panel/bildirimler",
    tag: input.type,
    silent: SILENT_TYPES.includes(input.type),
  }).catch(() => {});
}

export function audit(input: {
  userId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  ip?: string | null;
}) {
  prisma.auditLog
    .create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        meta: input.meta as never,
        ip: input.ip ?? null,
      },
    })
    .catch(() => {});
}
