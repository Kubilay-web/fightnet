import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok } from "@/lib/api";
import { reportSchema } from "@/lib/validators";
import { LIMITS } from "@/lib/rate-limit";
import { AUTO_BAN_SAFETY_REPORTS } from "@/lib/constants";
import { audit } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** §11.2/§11.3 — Notice-and-Action; güvenlik raporlarında otomatik yasak */
export async function POST(req: Request) {
  const g = await guard({ bucket: "report", auth: true, ...LIMITS.report });
  if (isResponse(g)) return g;
  const session = g.session!;

  const parsed = await parseBody(req, reportSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  const HIGH_PRIORITY = ["MINOR_SAFETY", "UNSAFE_SPARRING", "VIOLENCE", "SEXUAL_CONTENT"];
  const priority = HIGH_PRIORITY.includes(d.reason) ? 2 : 1;

  const report = await prisma.report.create({
    data: {
      reporterId: session.sub,
      targetType: d.targetType,
      targetId: d.targetId,
      reportedUserId: d.reportedUserId || null,
      reason: d.reason,
      description: d.description || null,
      priority,
    },
    select: { id: true },
  });

  // 3 güvensiz sparring raporundan sonra otomatik askıya alma
  if (d.reason === "UNSAFE_SPARRING" && d.reportedUserId) {
    const count = await prisma.report.count({
      where: { reportedUserId: d.reportedUserId, reason: "UNSAFE_SPARRING", status: { in: ["OPEN", "IN_REVIEW"] } },
    });
    if (count >= AUTO_BAN_SAFETY_REPORTS) {
      await prisma.user.update({
        where: { id: d.reportedUserId },
        data: {
          isBanned: true,
          banReason: "Otomatik: 3+ güvensiz sparring raporu — inceleme bekliyor",
          bannedUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        },
      });
      audit({ action: "AUTO_BAN", targetType: "USER", targetId: d.reportedUserId, meta: { reports: count } });
    }
  }

  return ok({ ok: true, id: report.id }, { status: 201 });
}
