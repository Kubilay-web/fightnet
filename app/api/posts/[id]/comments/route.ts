import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok, fail, noStore } from "@/lib/api";
import { commentSchema } from "@/lib/validators";
import { LIMITS } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";

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

  const comment = await prisma.postComment.create({
    data: {
      postId: id,
      userId: session.sub,
      body: parsed.data.body,
      parentId: parsed.data.parentId || null,
    },
    select,
  });

  await prisma.post.update({ where: { id }, data: { commentCount: { increment: 1 } } });

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
