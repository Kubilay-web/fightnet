import "server-only";
import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { headers } from "next/headers";
import { rateLimit } from "./rate-limit";
import { getSession } from "./auth";
import type { SessionPayload } from "./session";
import type { Role } from "@prisma/client";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function noStore<T>(data: T) {
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}

/** Sık değişmeyen public veri için CDN önbelleği */
export function cached<T>(data: T, sMaxAge = 60, swr = 300) {
  return NextResponse.json(data, {
    headers: { "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}` },
  });
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function guard(opts: {
  bucket: string;
  limit?: number;
  window?: number;
  auth?: boolean;
  roles?: Role[];
}): Promise<{ session: SessionPayload | null } | NextResponse> {
  const ip = await clientIp();
  const session = await getSession();
  const key = `${opts.bucket}:${session?.sub ?? ip}`;
  const rl = rateLimit(key, opts.limit ?? 30, opts.window ?? 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen biraz bekleyin." },
      { status: 429, headers: { "Retry-After": String(rl.resetInSec) } },
    );
  }
  if (opts.auth && !session) return fail("Giriş yapmalısınız", 401);
  if (opts.roles?.length && (!session || !opts.roles.includes(session.role))) {
    return fail("Bu işlem için yetkiniz yok", 403);
  }
  return { session };
}

export function isResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}

export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: fail("Geçersiz JSON gövdesi") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "_";
      if (!fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { error: fail("Doğrulama hatası", 422, { fields: fieldErrors }) };
  }
  return { data: parsed.data };
}

/** Sayfalama parametreleri */
export function pagination(url: URL, defaultSize = 20, maxSize = 60) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const size = Math.min(maxSize, Math.max(1, Number(url.searchParams.get("size") ?? defaultSize) || defaultSize));
  return { page, size, skip: (page - 1) * size, take: size };
}
