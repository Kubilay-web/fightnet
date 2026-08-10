import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME;

/**
 * Kök klasör. Aynı Cloudinary hesabında geliştirme ve üretim medyasını
 * ayrı tutmak için ortam başına değiştirilebilir (örn. "fightnet-dev").
 */
const ROOT = process.env.CLOUDINARY_FOLDER ?? "fightnet";

export const UPLOAD_FOLDERS = {
  avatar: `${ROOT}/avatars`,
  cover: `${ROOT}/covers`,
  post: `${ROOT}/posts`,
  gym: `${ROOT}/gyms`,
  event: `${ROOT}/events`,
  kyc: `${ROOT}/kyc`,
  passport: `${ROOT}/passport`,
  product: `${ROOT}/products`,
  ad: `${ROOT}/ads`,
  creator: `${ROOT}/creator`,
} as const;

export type UploadFolder = keyof typeof UPLOAD_FOLDERS;

export interface SignedUpload {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
  eager?: string;
}

/**
 * İmzalı doğrudan yükleme parametreleri.
 * Dosya tarayıcıdan doğrudan Cloudinary'ye gider — sunucu bant genişliği
 * harcanmaz, yükleme en hızlı yoldan tamamlanır.
 */
export function signUpload(folder: UploadFolder, opts?: { eager?: string; resourceType?: "image" | "video" }): SignedUpload {
  const timestamp = Math.round(Date.now() / 1000);
  const dir = UPLOAD_FOLDERS[folder];
  const resourceType = opts?.resourceType ?? "image";

  const params: Record<string, string | number> = {
    folder: dir,
    timestamp,
  };
  if (opts?.eager) params.eager = opts.eager;

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    cloudName: CLOUD_NAME as string,
    folder: dir,
    eager: opts?.eager,
    uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
  };
}

export async function destroyAsset(publicId: string | null | undefined, resourceType: "image" | "video" = "image") {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  } catch {
    // Silme hatası akışı bozmaz
  }
}

export default cloudinary;
