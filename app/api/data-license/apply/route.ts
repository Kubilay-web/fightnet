import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok, fail, clientIp } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { audit } from "@/lib/notify";
import { dataLicenseSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * §4.4 — B2B veri lisansı başvurusu.
 *
 * Başvuru yalnızca kayıt oluşturur; anahtar admin onayında üretilir.
 * Giriş şartı yok — federasyon ve medya kuruluşlarının platformda hesabı olmaz.
 */
export async function POST(req: Request) {
  const g = await guard({ bucket: "data-license-apply", ...LIMITS.report });
  if (isResponse(g)) return g;

  const parsed = await parseBody(req, dataLicenseSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  // Aynı kurum tekrar tekrar başvurup kuyruğu şişirmesin
  const open = await prisma.dataLicense.findFirst({
    where: {
      contactEmail: d.contactEmail,
      status: { in: ["REQUESTED", "TRIAL", "ACTIVE"] },
    },
    select: { id: true, status: true },
  });
  if (open) {
    return fail(
      open.status === "REQUESTED"
        ? "Bu e-posta ile değerlendirme bekleyen bir başvurunuz var."
        : "Bu e-posta ile zaten aktif bir lisansınız var.",
      409,
    );
  }

  let license;
  try {
    license = await prisma.dataLicense.create({
      data: {
        organization: d.organization,
        contactName: d.contactName,
        contactEmail: d.contactEmail,
        vatId: d.vatId || null,
        country: d.country.toUpperCase(),
        scopes: d.scopes,
        useCase: d.useCase,
      },
      select: { id: true },
    });
  } catch {
    return fail("Başvuru kaydedilemedi, lütfen tekrar deneyin", 500);
  }

  audit({
    action: "DATA_LICENSE_APPLY",
    targetType: "DATA_LICENSE",
    targetId: license.id,
    meta: { organization: d.organization, scopes: d.scopes },
    ip: await clientIp(),
  });

  return ok({ ok: true }, { status: 201 });
}
