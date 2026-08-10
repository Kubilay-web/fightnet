import { headers } from "next/headers";
import { snapshotKpi } from "@/lib/kpi";
import { ok, fail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * §7 — Günlük KPI anlık görüntüsü.
 *
 * Zamanlanmış görevden çağrılır (Vercel Cron, GitHub Actions veya sunucu cron):
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://…/api/cron/kpi
 *
 * `CRON_SECRET` tanımlı değilse uç nokta kapalıdır — yanlışlıkla herkese
 * açık bir metrik yüzeyi bırakmamak için.
 */
export async function GET() {
  const secret = process.env.CRON_SECRET;
  if (!secret) return fail("Zamanlanmış görev yapılandırılmamış", 503);

  const h = await headers();
  const auth = h.get("authorization");
  if (auth !== `Bearer ${secret}`) return fail("Yetkisiz", 401);

  const snapshot = await snapshotKpi();
  return ok({ ok: true, snapshot });
}
