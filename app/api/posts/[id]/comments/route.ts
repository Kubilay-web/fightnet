import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok, fail, noStore } from "@/lib/api";
import { commentSchema } from "@/lib/validators";
import { LIMITS } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";
import { moderate, attachResult } from "@/lib/moderation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const select = {
  id: true, body: true, createdAt: true, likeCount: true,
  user: { select: { name: true, slug: true, avatarUrl: true, verification: true } },
} as const;

export async function GET(req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "comments-read", ...LIMITS.search });
  if (isResponse(g)) return g;
  const { id } = await params;
  const url = new URL(req.url);
  const skip = Math.max(0, Number(url.searchParams.get("skip") ?? 0) || 0);

  const comments = await prisma.postComment.findMany({
    where: { postId: id, moderation: "APPROVED" },
    select,
    orderBy: { createdAt: "desc" },
    skip,
    take: 50,
  });
  return noStore({ comments });
}

export async function POST(req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "comment", auth: true, ...LIMITS.comment });
  if (isResponse(g)) return g;
  const session = g.session!;
  const { id } = await params;

  const parsed = await parseBody(req, commentSchema);
  if ("error" in parsed) return parsed.error;

  const post = await prisma.post.findUnique({ where: { id }, select: { id: true, userId: true } });
  if (!post) return fail("Gönderi bulunamadı", 404);

  // §11.3 — Yorum da ön filtreden geçer; otomatik ret durumunda hiç yazılmaz.
  const decision = await moderate({
    targetType: "COMMENT",
    userId: session.sub,
    kind: "TEXT",
    text: parsed.data.body,
  });
  if (decision.state === "REMOVED") return fail(decision.message ?? "Yorum yayınlanamadı", 422);

  const comment = await prisma.postComment.create({
    data: {
      postId: id,
      userId: session.sub,
      body: parsed.data.body,
      parentId: parsed.data.parentId || null,
      moderation: decision.state,
    },
    select,
  });

  await attachResult({ targetType: "COMMENT", targetId: comment.id, decision });

  // Beklemedeki yorum sayaca girmez — akışta da görünmez.
  if (decision.state === "APPROVED") {
    await prisma.post.update({ where: { id }, data: { commentCount: { increment: 1 } } });
  }

  if (decision.state === "APPROVED") {
    notify({
      userId: post.userId,
      actorId: session.sub,
      type: "COMMENT",
      title: `${session.name} gönderine yorum yaptı`,
      body: parsed.data.body.slice(0, 100),
      url: `/akis/${id}`,
    });
    return ok({ comment }, { status: 201 });
  }

  // İncelemeye düşen yorum akışta gösterilmez; kullanıcıya durumu bildirilir.
  return ok(
    { comment: null, pending: true, message: "Yorumun incelemeye alındı, onaylanınca görünecek." },
    { status: 202 },
  );
}
