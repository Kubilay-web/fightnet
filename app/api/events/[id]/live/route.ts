import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok, fail, noStore } from "@/lib/api";
import { liveCommentSchema } from "@/lib/validators";
import { LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const commentSelect = {
  id: true, body: true, kind: true, round: true, isOfficial: true, createdAt: true,
  user: { select: { name: true, slug: true, avatarUrl: true, verification: true } },
} as const;

/** Artımlı çekim: `after` imlecinden yeni yorumlar */
export async function GET(req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "live-read", ...LIMITS.search });
  if (isResponse(g)) return g;

  const { id } = await params;
  const url = new URL(req.url);
  const after = url.searchParams.get("after");
  const fightId = url.searchParams.get("fightId");

  const comments = await prisma.liveComment.findMany({
    where: {
      eventId: id,
      moderation: "APPROVED",
      ...(fightId ? { fightId } : {}),
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    select: commentSelect,
    orderBy: { createdAt: "desc" },
    take: after ? 50 : 60,
  });

  return noStore({ comments });
}

export async function POST(req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "live-write", auth: true, ...LIMITS.comment });
  if (isResponse(g)) return g;
  const session = g.session!;
  const { id } = await params;

  // §4.5 — Seviye 0 kullanıcılar kısıtlı; canlı yorum için doğrulama gerekli
  if (session.verification === "LEVEL_0") {
    return fail("Canlı yorum için en az Seviye 1 doğrulama gerekir", 403);
  }

  const parsed = await parseBody(req, liveCommentSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, organizerId: true, status: true },
  });
  if (!event) return fail("Etkinlik bulunamadı", 404);

  const isOfficial =
    session.sub === event.organizerId || session.role === "ADMIN" || session.role === "MODERATOR";

  // Resmi olmayan kullanıcılar yalnızca normal yorum girebilir
  const kind = isOfficial ? d.kind : "COMMENT";

  const comment = await prisma.liveComment.create({
    data: {
      eventId: event.id,
      fightId: d.fightId || null,
      userId: session.sub,
      body: d.body,
      kind,
      round: d.round ?? null,
      isOfficial,
    },
    select: commentSelect,
  });

  return ok({ comment }, { status: 201 });
}
