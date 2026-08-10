import prisma from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { guard, isResponse, parseBody, fail, ok } from "@/lib/api";
import { loginSchema } from "@/lib/validators";
import { LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard({ bucket: "login", ...LIMITS.auth });
  if (isResponse(g)) return g;

  const parsed = await parseBody(req, loginSchema);
  if ("error" in parsed) return parsed.error;
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true, email: true, username: true, name: true, password: true,
      role: true, verification: true, avatarUrl: true, isFounder: true,
      isActive: true, isBanned: true, banReason: true, bannedUntil: true,
    },
  });

  // Zamanlama saldırılarına karşı sabit mesaj
  if (!user?.password || !(await verifyPassword(password, user.password))) {
    return fail("E-posta veya şifre hatalı", 401);
  }
  if (user.isBanned && (!user.bannedUntil || user.bannedUntil > new Date())) {
    return fail(`Hesabın askıya alındı. ${user.banReason ?? ""}`.trim(), 403);
  }
  if (!user.isActive) return fail("Hesabın devre dışı", 403);

  await createSession(user);
  return ok({ ok: true });
}
