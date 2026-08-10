import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok, fail } from "@/lib/api";
import { waitlistSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard({ bucket: "waitlist", limit: 5, window: 300_000 });
  if (isResponse(g)) return g;

  const parsed = await parseBody(req, waitlistSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  try {
    await prisma.waitlistEntry.upsert({
      where: { email: d.email },
      update: {
        name: d.name || undefined,
        city: d.city || undefined,
        role: d.role,
        gymName: d.gymName || undefined,
        discipline: (d.discipline || undefined) as never,
        message: d.message || undefined,
      },
      create: {
        email: d.email,
        name: d.name || null,
        city: d.city || null,
        role: d.role,
        gymName: d.gymName || null,
        discipline: (d.discipline || null) as never,
        message: d.message || null,
        source: d.source || null,
      },
    });
  } catch {
    return fail("Kayıt oluşturulamadı, lütfen tekrar deneyin", 500);
  }

  return ok({ ok: true }, { status: 201 });
}
