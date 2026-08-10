import prisma from "@/lib/prisma";
import { guard, isResponse, ok, fail } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "like", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;
  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id }, select: { id: true, userId: true } });
  if (!post) return fail("Gönderi bulunamadı", 404);

  try {
    await prisma.postLike.create({ data: { postId: id, userId: session.sub } });
  } catch {
    return ok({ ok: true, already: true });
  }

  await prisma.post.update({ where: { id }, data: { likeCount: { increment: 1 } } });

  notify({
    userId: post.userId,
    actorId: session.sub,
    type: "LIKE",
    title: `${session.name} gönderini beğendi`,
    url: `/akis/${id}`,
  });

  return ok({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "like", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;
  const { id } = await params;

  const deleted = await prisma.postLike
    .delete({ where: { postId_userId: { postId: id, userId: session.sub } } })
    .catch(() => null);

  if (deleted) await prisma.post.update({ where: { id }, data: { likeCount: { decrement: 1 } } });

  return ok({ ok: true });
}
