import prisma from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { guard, isResponse, parseBody, fail, ok } from "@/lib/api";
import { registerSchema } from "@/lib/validators";
import { LIMITS } from "@/lib/rate-limit";
import { slugify } from "@/lib/utils";
import { audit } from "@/lib/notify";
import { requestGuardianConsent } from "@/lib/guardian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard({ bucket: "register", ...LIMITS.auth });
  if (isResponse(g)) return g;

  const parsed = await parseBody(req, registerSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  const [emailTaken, usernameTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email: d.email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username: d.username }, select: { id: true } }),
  ]);
  if (emailTaken) return fail("Bu e-posta zaten kayıtlı", 409, { fields: { email: "Bu e-posta zaten kayıtlı" } });
  if (usernameTaken) return fail("Bu kullanıcı adı alınmış", 409, { fields: { username: "Bu kullanıcı adı alınmış" } });

  // §6 — Beta erişim kodu doğrulama
  let founder = false;
  let grantedRole: typeof d.role | null = null;
  if (d.betaCode) {
    const code = await prisma.betaCode.findUnique({ where: { code: d.betaCode } });
    if (!code || !code.isActive || code.useCount >= code.maxUses || (code.expiresAt && code.expiresAt < new Date())) {
      return fail("Beta kodu geçersiz veya kullanılmış", 400, { fields: { betaCode: "Geçersiz kod" } });
    }
    founder = code.isFounder;
    grantedRole = (code.grantsRole as typeof d.role | null) ?? null;
    await prisma.betaCode.update({ where: { id: code.id }, data: { useCount: { increment: 1 } } });
  }

  const birthDate = d.birthDate ? new Date(d.birthDate) : null;
  const years = birthDate ? (Date.now() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000) : 99;
  const isMinor = years < 18;

  // Slug benzersizliği — kullanıcı adı zaten benzersiz olduğu için türetilebilir
  const slug = slugify(`${d.name}-${d.username}`) || d.username;

  const user = await prisma.user.create({
    data: {
      email: d.email,
      username: d.username,
      name: d.name,
      slug,
      password: await hashPassword(d.password),
      role: grantedRole ?? d.role,
      city: d.city || null,
      birthDate,
      isMinor,
      guardianEmail: isMinor ? d.guardianEmail || null : null,
      isFounder: founder,
      founderSince: founder ? new Date() : null,
      betaCodeUsed: d.betaCode || null,
      lastActiveAt: new Date(),
    },
    select: {
      id: true, email: true, username: true, name: true,
      role: true, verification: true, avatarUrl: true, isFounder: true,
    },
  });

  await createSession(user);
  audit({ userId: user.id, action: "REGISTER", meta: { founder, betaCode: d.betaCode || null, isMinor } });

  // §11.1 Kapı 1 — reşit olmayan üyede veli onayı e-postası hemen yola çıkar.
  // Kayıt akışını bloklamaz; onay gelene kadar hesap kısıtlı çalışır.
  if (isMinor && d.guardianEmail) {
    requestGuardianConsent(user.id).catch(() => {});
  }

  return ok({ ok: true, user: { id: user.id, username: user.username, name: user.name } }, { status: 201 });
}
