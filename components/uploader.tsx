"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, Video } from "lucide-react";
import { cld } from "@/lib/image";
import { cn } from "@/lib/utils";
import { useDict } from "@/components/i18n/provider";

export interface UploadedAsset {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  duration?: number;
  resourceType: string;
}

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 200;

/**
 * Cloudinary'ye doğrudan imzalı yükleme.
 * Dosya sunucuya hiç uğramaz — yükleme en kısa yoldan tamamlanır ve
 * ilerleme yüzdesi XHR üzerinden anlık raporlanır.
 */
export function useCloudinaryUpload(folder: string) {
  const t = useDict().ui;
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadedAsset | null> => {
      setError(null);
      const isVideo = file.type.startsWith("video/");
      const maxMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (file.size > maxMb * 1024 * 1024) {
        setError(`Dosya çok büyük (maks. ${maxMb} MB)`);
        return null;
      }

      setUploading(true);
      setProgress(0);

      try {
        const signRes = await fetch("/api/upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder, resourceType: isVideo ? "video" : "image" }),
        });
        if (!signRes.ok) {
          const j = await signRes.json().catch(() => ({}));
          throw new Error(j.error ?? t.uploadSignFailed);
        }
        const sig = await signRes.json();

        const form = new FormData();
        form.append("file", file);
        form.append("api_key", sig.apiKey);
        form.append("timestamp", String(sig.timestamp));
        form.append("signature", sig.signature);
        form.append("folder", sig.folder);
        if (sig.eager) form.append("eager", sig.eager);

        const result = await new Promise<UploadedAsset>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", sig.uploadUrl);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const r = JSON.parse(xhr.responseText);
              resolve({
                url: r.secure_url,
                publicId: r.public_id,
                width: r.width,
                height: r.height,
                duration: r.duration ? Math.round(r.duration) : undefined,
                resourceType: r.resource_type,
              });
            } else {
              reject(new Error(t.uploadFailed));
            }
          };
          xhr.onerror = () => reject(new Error(t.uploadNetworkError));
          xhr.send(form);
        });

        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : t.uploadFailed);
        return null;
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [folder, t.uploadFailed, t.uploadNetworkError, t.uploadSignFailed],
  );

  return { upload, uploading, progress, error };
}

export function ImageUploader({
  folder,
  value,
  onChange,
  label,
  aspect = "aspect-video",
  accept = "image/*",
  className,
}: {
  folder: string;
  value?: string | null;
  onChange: (asset: UploadedAsset | null) => void;
  label?: string;
  aspect?: string;
  accept?: string;
  className?: string;
}) {
  const t = useDict().ui;
  const { upload, uploading, progress, error } = useCloudinaryUpload(folder);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const asset = await upload(file);
    if (asset) onChange(asset);
    e.target.value = "";
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-subtle)] transition-colors hover:border-blood-500",
          aspect,
        )}
      >
        {value ? (
          <>
            <Image src={cld(value, { w: 800 })} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 400px" />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label={t.uploadRemove}
              className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur transition-colors hover:bg-blood-600"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex size-full flex-col items-center justify-center gap-2 p-6 text-muted"
          >
            {uploading ? (
              <>
                <Loader2 className="size-6 animate-spin text-blood-500" />
                <span className="text-sm font-semibold">%{progress}</span>
              </>
            ) : (
              <>
                {accept.includes("video") ? <Video className="size-7" /> : <ImageIcon className="size-7" />}
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs">{t.uploadHint}</span>
              </>
            )}
          </button>
        )}

        {uploading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-ink-200 dark:bg-ink-800">
            <div className="h-full bg-blood-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept={accept} onChange={onFile} className="sr-only" />

      {value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-muted hover:text-blood-500"
        >
          <Upload className="size-3.5" /> Değiştir
        </button>
      )}
      {error && <p className="text-xs font-medium text-blood-500">{error}</p>}
    </div>
  );
}
