"use client";

import { useState } from "react";
import { Video, ImageIcon, Type } from "lucide-react";
import { createPost } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Textarea, Select, Field } from "@/components/ui";
import { videoPoster } from "@/lib/image";
import { DISCIPLINES, VISIBILITY_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TYPES = [
  { value: "VIDEO", label: "Video", icon: Video, accept: "video/*" },
  { value: "IMAGE", label: "Görsel", icon: ImageIcon, accept: "image/*" },
  { value: "TEXT", label: "Metin", icon: Type, accept: "" },
] as const;

export function PostForm() {
  const [type, setType] = useState<"VIDEO" | "IMAGE" | "TEXT">("VIDEO");
  const [media, setMedia] = useState<UploadedAsset | null>(null);

  const active = TYPES.find((t) => t.value === type)!;

  return (
    <FormShell action={createPost} submitLabel="Paylaş">
      {(state) => (
        <>
          <Field label="Gönderi türü">
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setType(t.value);
                      setMedia(null);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-sm font-bold transition-colors",
                      type === t.value
                        ? "border-blood-500 bg-blood-500/10 text-blood-500"
                        : "border-[var(--border)] text-muted hover:border-blood-500/50",
                    )}
                  >
                    <Icon className="size-5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="type" value={type} />
          </Field>

          {type !== "TEXT" && (
            <Field label={type === "VIDEO" ? "Video" : "Görsel"} required>
              <ImageUploader
                folder="post"
                value={media?.url}
                onChange={setMedia}
                accept={active.accept}
                label={type === "VIDEO" ? "Video yükle (maks. 200 MB)" : "Görsel yükle (maks. 10 MB)"}
                aspect={type === "VIDEO" ? "aspect-video" : "aspect-square"}
              />
              <input type="hidden" name="mediaUrl" value={media?.url ?? ""} />
              <input type="hidden" name="mediaId" value={media?.publicId ?? ""} />
              <input
                type="hidden"
                name="thumbUrl"
                value={type === "VIDEO" && media?.url ? videoPoster(media.url) : (media?.url ?? "")}
              />
              <input type="hidden" name="durationSec" value={media?.duration ?? ""} />
            </Field>
          )}

          <Field label={type === "TEXT" ? "Metnin" : "Açıklama"} error={state.fields?.body} required={type === "TEXT"}>
            <Textarea
              name="body"
              rows={4}
              maxLength={2000}
              required={type === "TEXT"}
              placeholder="Ne anlatmak istiyorsun?"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Disiplin">
              <Select name="discipline" defaultValue="">
                <option value="">Seç</option>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.emoji} {d.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Etiketler" hint="Virgülle ayır: teknik, armbar, kondisyon">
              <Input name="tags" maxLength={200} placeholder="teknik, armbar" />
            </Field>
          </div>

          <Field label="Görünürlük">
            <Select name="visibility" defaultValue="PUBLIC">
              {Object.entries(VISIBILITY_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </>
      )}
    </FormShell>
  );
}
