"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";
import { messageBlockReason } from "@/lib/guardian";
import { truncate } from "@/lib/utils";
import type { ActionState } from "@/app/panel/actions";

const MAX_LEN = 2000;

/** Mesajlaşma yetkisini iki tarafın durumuna göre çözer (§11.1) */
async function assertCanMessage(senderId: string, recipientId: string) {
  const [sender, recipient] = await Promise.all([
    prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, isMinor: true, guardianConsent: true, verification: true, role: true, name: true },
    }),
    prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, isMinor: true, guardianConsent: true, isActive: true, isBanned: true, name: true },
    }),
  ]);

  if (!sender || !recipient) return { error: "Kullanıcı bulunamadı" };
  if (!recipient.isActive || recipient.isBanned) return { error: "Bu kullanıcıya şu anda mesaj gönderilemez" };

  const blocked = messageBlockReason(sender, recipient);
  if (blocked) return { error: blocked };

  return { sender, recipient };
}

/** İki kişi arasındaki sohbeti bulur, yoksa açar */
async function findOrCreateConversation(a: string, b: string): Promise<string> {
  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [{ members: { some: { userId: a } } }, { members: { some: { userId: b } } }],
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.conversation.create({
    data: { isGroup: false, members: { create: [{ userId: a }, { userId: b }] } },
    select: { id: true },
  });
  return created.id;
}

/**
 * Profil sayfasındaki "Mesaj gönder" düğmesi — sohbeti açar ve yönlendirir.
 * Mesaj kutusu boşsa yalnızca sohbet açılır.
 */
export async function startConversation(recipientId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const check = await assertCanMessage(user.id, recipientId);
  if ("error" in check) return { error: check.error };

  const conversationId = await findOrCreateConversation(user.id, recipientId);

  const body = String(fd.get("body") ?? "").trim();
  if (body) {
    const sent = await deliver(user.id, user.name, conversationId, recipientId, body);
    if (sent.error) return { error: sent.error };
  }

  redirect(`/panel/mesajlar/${conversationId}`);
}

export async function sendMessage(conversationId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const body = String(fd.get("body") ?? "").trim();
  if (!body) return { error: "Mesaj boş olamaz", fields: { body: "Mesaj boş olamaz" } };
  if (body.length > MAX_LEN) return { error: `Mesaj en fazla ${MAX_LEN} karakter olabilir` };

  const membership = await prisma.conversationMember.findFirst({
    where: { conversationId, userId: user.id },
    select: { id: true },
  });
  if (!membership) return { error: "Bu sohbete erişimin yok" };

  const other = await prisma.conversationMember.findFirst({
    where: { conversationId, userId: { not: user.id } },
    select: { userId: true },
  });
  if (!other) return { error: "Alıcı bulunamadı" };

  const check = await assertCanMessage(user.id, other.userId);
  if ("error" in check) return { error: check.error };

  const sent = await deliver(user.id, user.name, conversationId, other.userId, body);
  if (sent.error) return { error: sent.error };

  revalidatePath(`/panel/mesajlar/${conversationId}`);
  return { ok: true };
}

/** Yazma, sayaç güncelleme ve bildirim — tek yerde */
async function deliver(
  senderId: string,
  senderName: string,
  conversationId: string,
  recipientId: string,
  body: string,
): Promise<{ error?: string }> {
  const rl = rateLimit(`dm:${senderId}`, 30, 60_000);
  if (!rl.success) return { error: `Çok hızlı mesaj gönderiyorsun. ${rl.resetInSec} sn sonra tekrar dene.` };

  await prisma.message.create({
    data: { conversationId, senderId, body: body.slice(0, MAX_LEN) },
  });

  await Promise.all([
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), lastMessage: truncate(body, 120) },
    }),
    prisma.conversationMember.updateMany({
      where: { conversationId, userId: recipientId },
      data: { unreadCount: { increment: 1 } },
    }),
  ]);

  notify({
    userId: recipientId,
    actorId: senderId,
    type: "MESSAGE",
    title: `${senderName} sana mesaj gönderdi`,
    body: truncate(body, 100),
    url: `/panel/mesajlar/${conversationId}`,
  });

  return {};
}

/**
 * Sohbeti okundu işaretler. Sohbet sayfası sayacı render sırasında zaten
 * sıfırlar; bu eylem liste sayfasından toplu işaretleme için kullanılır.
 */
export async function markConversationRead(conversationId: string) {
  const user = await requireUser();
  await prisma.conversationMember.updateMany({
    where: { conversationId, userId: user.id, unreadCount: { gt: 0 } },
    data: { unreadCount: 0, lastReadAt: new Date() },
  });
  revalidatePath("/panel/mesajlar");
}
