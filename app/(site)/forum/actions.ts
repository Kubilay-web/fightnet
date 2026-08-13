"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/queries";
import { notify } from "@/lib/notify";
import { uniqueSlug } from "@/lib/utils";
import { threadSchema, commentSchema } from "@/lib/validators";
import { moderate, attachResult } from "@/lib/moderation";
import type { ActionState } from "@/app/panel/actions";

export async function createThread(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris?next=/forum/yeni");

  const tags = String(fd.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 6);

  const parsed = threadSchema.safeParse({
    categoryId: fd.get("categoryId"),
    title: fd.get("title"),
    body: fd.get("body"),
    tags,
    linkedUserId: fd.get("linkedUserId") ?? "",
    linkedEventId: fd.get("linkedEventId") ?? "",
  });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[i.path.map(String).join(".")] ??= i.message;
    return { error: "Lütfen alanları kontrol edin", fields };
  }
  const d = parsed.data;

  // §11.3 — Konu başlığı ve gövdesi ön filtreden geçer
  const decision = await moderate({
    targetType: "THREAD",
    userId: session.sub,
    kind: "TEXT",
    text: `${d.title} ${d.body}`,
  });
  if (decision.state === "REMOVED") return { error: decision.message ?? "Konu açılamadı" };

  const thread = await prisma.forumThread.create({
    data: {
      slug: uniqueSlug(d.title),
      categoryId: d.categoryId,
      userId: session.sub,
      title: d.title,
      body: d.body,
      tags: d.tags as string[],
      linkedUserId: d.linkedUserId || null,
      linkedEventId: d.linkedEventId || null,
    },
    select: { id: true, slug: true },
  });

  await attachResult({ targetType: "THREAD", targetId: thread.id, decision });

  await prisma.forumCategory.update({
    where: { id: d.categoryId },
    data: { threadCount: { increment: 1 } },
  });

  updateTag(CACHE_TAGS.forum);
  revalidatePath("/forum");
  redirect(`/forum/${thread.slug}`);
}

export async function replyThread(threadId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/giris");

  const parsed = commentSchema.safeParse({ body: fd.get("body"), parentId: fd.get("parentId") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz yanıt" };

  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    select: { id: true, slug: true, userId: true, isLocked: true, title: true },
  });
  if (!thread) return { error: "Konu bulunamadı" };
  if (thread.isLocked) return { error: "Bu konu kilitli" };

  const decision = await moderate({
    targetType: "FORUM_POST",
    userId: session.sub,
    kind: "TEXT",
    text: parsed.data.body,
  });
  if (decision.state === "REMOVED") return { error: decision.message ?? "Yanıt gönderilemedi" };

  const reply = await prisma.forumPost.create({
    data: {
      threadId: thread.id,
      userId: session.sub,
      body: parsed.data.body,
      parentId: parsed.data.parentId || null,
    },
    select: { id: true },
  });

  await attachResult({ targetType: "FORUM_POST", targetId: reply.id, decision });

  await prisma.forumThread.update({
    where: { id: thread.id },
    data: { replyCount: { increment: 1 }, lastPostAt: new Date() },
  });

  notify({
    userId: thread.userId,
    actorId: session.sub,
    type: "COMMENT",
    title: `${session.name} konuna yanıt verdi`,
    body: thread.title,
    url: `/forum/${thread.slug}`,
  });

  updateTag(CACHE_TAGS.forum);
  revalidatePath(`/forum/${thread.slug}`);
  return { ok: true, message: "Yanıtın eklendi" };
}
