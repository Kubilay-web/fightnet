"use client";

import { useState } from "react";
import { Video, ImageIcon, Type } from "lucide-react";
import { createPost } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Textarea, Select, Field } from "@/components/ui";
import { videoPoster } from "@/lib/image";
// TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir
import { DISCIPLINES, VISIBILITY_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/provider";
import { panelPostsCopy } from "@/lib/i18n/pages/panel-posts";

const TYPES = [
  { value: "VIDEO", key: "video", icon: Video, accept: "video/*" },
  { value: "IMAGE", key: "image", icon: ImageIcon, accept: "image/*" },
  { value: "TEXT", key: "text", icon: Type, accept: "" },
] as const;

export function PostForm() {
  const t = panelPostsCopy[useLocale()].form;
  const [type, setType] = useState<"VIDEO" | "IMAGE" | "TEXT">("VIDEO");
  const [media, setMedia] = useState<UploadedAsset | null>(null);

  const active = TYPES.find((t) => t.value === type)!;

  return (
    <FormShell action={createPost} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field label={t.typeLabel}>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setType(opt.value);
                      setMedia(null);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-sm font-bold transition-colors",
                      type === opt.value
                        ? "border-blood-500 bg-blood-500/10 text-blood-500"
                        : "border-[var(--border)] text-muted hover:border-blood-500/50",
                    )}
                  >
                    <Icon className="size-5" />
                    {t.types[opt.key]}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="type" value={type} />
          </Field>

          {type !== "TEXT" && (
            <Field label={type === "VIDEO" ? t.mediaVideo : t.mediaImage} required>
              <ImageUploader
                folder="post"
                value={media?.url}
                onChange={setMedia}
                accept={active.accept}
                label={type === "VIDEO" ? t.uploadVideo : t.uploadImage}
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

          <Field label={type === "TEXT" ? t.bodyText : t.bodyDescription} error={state.fields?.body} required={type === "TEXT"}>
            <Textarea
              name="body"
              rows={4}
              maxLength={2000}
              required={type === "TEXT"}
              placeholder={t.bodyPlaceholder}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.discipline}>
              <Select name="discipline" defaultValue="">
                <option value="">{t.disciplineEmpty}</option>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.emoji} {d.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t.tags} hint={t.tagsHint}>
              <Input name="tags" maxLength={200} placeholder={t.tagsPlaceholder} />
            </Field>
          </div>

          <Field label={t.visibility}>
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
