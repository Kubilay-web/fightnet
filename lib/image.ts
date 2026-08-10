/**
 * Cloudinary URL dönüşümleri — istemci tarafında da kullanılabilir.
 * f_auto + q_auto ile AVIF/WebP otomatik seçilir, dpr_auto retina ekranlarda
 * doğru çözünürlüğü verir. Bu, en hızlı görsel teslimatını sağlar.
 */

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function cld(
  url: string | null | undefined,
  opts: { w?: number; h?: number; crop?: string; blur?: boolean; quality?: string } = {},
): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;

  const { w, h, crop = "fill", blur, quality = "auto" } = opts;
  const parts: string[] = ["f_auto", `q_${quality}`, "dpr_auto"];
  if (w) parts.push(`w_${w}`);
  if (h) parts.push(`h_${h}`);
  if (w || h) parts.push(`c_${crop}`, "g_auto");
  if (blur) parts.push("e_blur:800");

  return url.replace("/upload/", `/upload/${parts.join(",")}/`);
}

/** Düşük kaliteli yer tutucu (LQIP) — anında görünen bulanık ön izleme */
export function blurPlaceholder(url: string | null | undefined): string | undefined {
  if (!url || !url.includes("res.cloudinary.com")) return undefined;
  return url.replace("/upload/", "/upload/w_24,q_10,e_blur:400,f_auto/");
}

/** Video için otomatik poster karesi */
export function videoPoster(url: string | null | undefined, w = 720): string {
  if (!url) return "";
  return url.replace("/upload/", `/upload/so_auto,w_${w},f_auto,q_auto/`).replace(/\.(mp4|mov|webm|m4v)$/i, ".jpg");
}

/** Uyarlanabilir HLS akışı — §5.2 video oynatma gereksinimi */
export function hlsUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace("/upload/", "/upload/sp_auto/").replace(/\.(mp4|mov|webm|m4v)$/i, ".m3u8");
}

export function avatarUrl(url: string | null | undefined, size = 96): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,g_face,r_max,f_auto,q_auto,dpr_auto/`);
}

export function isCloudinary(url: string | null | undefined): boolean {
  return !!url && (url.includes("res.cloudinary.com") || (!!CLOUD && url.includes(CLOUD)));
}
