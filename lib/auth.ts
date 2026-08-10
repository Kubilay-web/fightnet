import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import prisma from "./prisma";
import {
  SESSION_COOKIE,
  cookieOptions,
  signSession,
  verifySession,
  type SessionPayload,
} from "./session";

/**
 * İstek başına tek kez çözülen oturum.
 * React `cache` sayesinde aynı render ağacındaki onlarca çağrı tek
 * JWT doğrulamasına indirgenir — DB'ye hiç gidilmez.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
});

/** Tam kullanıcı kaydı gerektiğinde (profil sayfaları vb.) */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      slug: true,
      role: true,
      verification: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      city: true,
      country: true,
      locale: true,
      theme: true,
      isFounder: true,
      isActive: true,
      isBanned: true,
      // §11.1 — çocuk koruması kısıtlamaları her sayfada bilinmeli
      isMinor: true,
      guardianEmail: true,
      guardianConsent: true,
      trainingStreak: true,
      followerCount: true,
      followingCount: true,
      profileScore: true,
      createdAt: true,
    },
  });
  if (!user || !user.isActive || user.isBanned) return null;
  return user;
});

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/giris");
  return session;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  return user;
}

export async function requireRole(...roles: Role[]) {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (!roles.includes(session.role)) redirect("/403");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.role !== "ADMIN" && session.role !== "MODERATOR") redirect("/403");
  return session;
}

// --------------------------------------------------------------------------
// Şifre
// --------------------------------------------------------------------------

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 11);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// --------------------------------------------------------------------------
// Oturum yazma
// --------------------------------------------------------------------------

export async function createSession(user: {
  id: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  verification: SessionPayload["verification"];
  avatarUrl?: string | null;
  isFounder?: boolean;
}) {
  const token = await signSession({
    sub: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    verification: user.verification,
    avatarUrl: user.avatarUrl,
    isFounder: user.isFounder,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions);

  const h = await headers();
  // Oturum kaydı — kritik yol dışında, hata isteği bloklamaz
  prisma.user
    .update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastActiveAt: new Date() },
    })
    .catch(() => {});
  prisma.auditLog
    .create({
      data: {
        userId: user.id,
        action: "LOGIN",
        ip: h.get("x-forwarded-for")?.split(",")[0] ?? null,
        meta: { ua: h.get("user-agent") ?? null },
      },
    })
    .catch(() => {});

  return token;
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Rol/doğrulama değiştiğinde token'ı tazeler */
export async function refreshSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      verification: true,
      avatarUrl: true,
      isFounder: true,
    },
  });
  if (!user) return;
  await createSession(user);
}
