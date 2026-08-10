"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { upsertCreatorTier, createCreatorPost } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Textarea, Select, Field } from "@/components/ui";
import { videoPoster } from "@/lib/image";

export function CreatorTierForm() {
  const [perks, setPerks] = useState<string[]>([]);
  const [perk, setPerk] = useState("");

  function addPerk() {
    const p = perk.trim();
    if (!p || perks.includes(p) || perks.length >= 10) return;
    setPerks((prev) => [...prev, p]);
    setPerk("");
  }

  return (
    <FormShell action={upsertCreatorTier} submitLabel="Kademeyi Kaydet">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Kademe" required>
              <Select name="tier" required defaultValue="BRONZE">
                <option value="BRONZE">Bronz</option>
                <option value="SILVER">Gümüş</option>
                <option value="GOLD">Altın</option>
              </Select>
            </Field>

            <Field label="Kademe adı" error={state.fields?.name} required>
              <Input name="name" required maxLength={40} placeholder="Destekçi" />
            </Field>

            <Field label="Aylık fiyat (€)" error={state.fields?.price} required>
              <Input type="number" step="0.5" name="price" required min={1} max={500} defaultValue={5} />
            </Field>
          </div>

          <Field label="Açıklama">
            <Textarea name="description" rows={2} maxLength={500} placeholder="Bu kademede neler var?" />
          </Field>

          <Field label="Ayrıcalıklar" hint="Enter ile ekle">
            <div className="flex gap-2">
              <Input
                value={perk}
                onChange={(e) => setPerk(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPerk();
                  }
                }}
                placeholder="Haftalık antrenman videosu"
                maxLength={120}
              />
              <button
                type="button"
                onClick={addPerk}
                aria-label="Ayrıcalık ekle"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] hover:border-blood-500 hover:text-blood-500"
              >
                <Plus className="size-4" />
              </button>
            </div>
            {perks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {perks.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold dark:bg-ink-800"
                  >
                    {p}
                    <input type="hidden" name="perks[]" value={p} />
                    <button
                      type="button"
                      onClick={() => setPerks((prev) => prev.filter((x) => x !== p))}
                      aria-label={`${p} kaldır`}
                      className="text-muted hover:text-blood-500"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>
        </>
      )}
    </FormShell>
  );
}

export function CreatorPostForm() {
  const [media, setMedia] = useState<UploadedAsset | null>(null);
  const [type, setType] = useState<"VIDEO" | "IMAGE" | "TEXT">("VIDEO");

  return (
    <FormShell action={createCreatorPost} submitLabel="İçeriği Yayınla">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Başlık" error={state.fields?.title} required>
              <Input name="title" required maxLength={140} />
            </Field>

            <Field label="Tür">
              <Select name="type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                <option value="VIDEO">Video</option>
                <option value="IMAGE">Görsel</option>
                <option value="TEXT">Metin</option>
              </Select>
            </Field>

            <Field label="Minimum kademe">
              <Select name="minTier" defaultValue="BRONZE">
                <option value="BRONZE">Bronz+</option>
                <option value="SILVER">Gümüş+</option>
                <option value="GOLD">Altın</option>
              </Select>
            </Field>
          </div>

          {type !== "TEXT" && (
            <Field label="Medya">
              <ImageUploader
                folder="creator"
                value={media?.url}
                onChange={setMedia}
                accept={type === "VIDEO" ? "video/*" : "image/*"}
                aspect={type === "VIDEO" ? "aspect-video" : "aspect-square"}
              />
              <input type="hidden" name="mediaUrl" value={media?.url ?? ""} />
              <input type="hidden" name="mediaId" value={media?.publicId ?? ""} />
              <input
                type="hidden"
                name="thumbUrl"
                value={type === "VIDEO" && media?.url ? videoPoster(media.url) : (media?.url ?? "")}
              />
            </Field>
          )}

          <Field label="İçerik">
            <Textarea name="body" rows={4} maxLength={5000} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
