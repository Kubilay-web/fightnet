import prisma from "@/lib/prisma";
import { guard, isResponse, ok, fail } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "follow", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;
  const { id } = await params;

  if (id === session.sub) return fail("Kendini takip edemezsin", 400);

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, slug: true } });
  if (!target) return fail("Kullanıcı bulunamadı", 404);

  try {
    await prisma.follow.create({ data: { followerId: session.sub, followingId: id } });
  } catch {
    return ok({ ok: true, already: true }); // zaten takip ediliyor
  }

  // Sayaçlar denormalize — okuma tarafında JOIN maliyeti sıfır
  await Promise.all([
    prisma.user.update({ where: { id }, data: { followerCount: { increment: 1 } } }),
    prisma.user.update({ where: { id: session.sub }, data: { followingCount: { increment: 1 } } }),
  ]);

  notify({
    userId: id,
    actorId: session.sub,
    type: "FOLLOW",
    title: `${session.name} seni takip etmeye başladı`,
    url: `/dovuscular/${session.username}`,
  });

  return ok({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "follow", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;
  const { id } = await params;

  const deleted = await prisma.follow
    .delete({ where: { followerId_followingId: { followerId: session.sub, followingId: id } } })
    .catch(() => null);

  if (deleted) {
    await Promise.all([
      prisma.user.update({ where: { id }, data: { followerCount: { decrement: 1 } } }),
      prisma.user.update({ where: { id: session.sub }, data: { followingCount: { decrement: 1 } } }),
    ]);
  }

  return ok({ ok: true });
}
