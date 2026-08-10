import { guard, isResponse, ok, fail } from "@/lib/api";
import { signUpload, UPLOAD_FOLDERS, type UploadFolder } from "@/lib/cloudinary";
import { LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * İmzalı yükleme parametreleri.
 * Dosya tarayıcıdan doğrudan Cloudinary'ye gider — sunucu üzerinden geçmez.
 */
export async function POST(req: Request) {
  const g = await guard({ bucket: "upload", auth: true, ...LIMITS.upload });
  if (isResponse(g)) return g;

  const { folder, resourceType } = (await req.json().catch(() => ({}))) as {
    folder?: string;
    resourceType?: "image" | "video";
  };

  if (!folder || !(folder in UPLOAD_FOLDERS)) {
    return fail(`Geçersiz klasör. Geçerli: ${Object.keys(UPLOAD_FOLDERS).join(", ")}`, 400);
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    return fail("Cloudinary yapılandırılmamış. .env dosyasını kontrol edin.", 500);
  }

  const isVideo = resourceType === "video";
  const signed = signUpload(folder as UploadFolder, {
    resourceType: isVideo ? "video" : "image",
    // Video için otomatik uyarlanabilir dönüşüm — HLS oynatma (§5.2)
    eager: isVideo ? "sp_auto" : undefined,
  });

  return ok(signed);
}
