import { SignJWT, jwtVerify } from "jose";
import type { Role, VerificationLevel } from "@prisma/client";

/**
 * Edge-uyumlu oturum katmanı.
 * Middleware içinde DB'ye gitmeden yetki kontrolü yapabilmek için
 * rol ve doğrulama seviyesi token payload'ında taşınır.
 */

export const SESSION_COOKIE = "fn_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 gün

export interface SessionPayload {
  sub: string; // userId
  email: string;
  username: string;
  name: string;
  role: Role;
  verification: VerificationLevel;
  avatarUrl?: string | null;
  isFounder?: boolean;
}

let cachedKey: Uint8Array | null = null;

function secretKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET tanımlı değil veya 32 karakterden kısa. .env dosyanızı kontrol edin.",
    );
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("fightnet")
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: "fightnet" });
    if (!payload.sub) return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

const ADMIN_ROLES: Role[] = ["ADMIN", "MODERATOR"];

export function isAdminRole(role: Role | undefined | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export function isStaffRole(role: Role | undefined | null): boolean {
  return role === "ADMIN";
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
