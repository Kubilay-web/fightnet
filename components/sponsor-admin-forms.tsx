"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  createSponsor,
  createSponsorOffer,
  setOfferStatus,
  reviewSponsorApplication,
} from "@/app/admin/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader } from "@/components/uploader";
import { Button, Input, Textarea, Select, Field, Checkbox } from "@/components/ui";
import { DISCIPLINES, SKILL_LEVELS } from "@/lib/constants";

/** §4.3 — Sponsor markası ekleme */
export function SponsorForm() {
  const [logo, setLogo] = useState<{ url: string; publicId: string } | null>(null);

  return (
    <FormShell action={createSponsor} submitLabel="Sponsoru Ekle">
      {(state) => (
        <>
          <Field label="Marka adı" error={state.fields?.name} required>
            <Input name="name" required minLength={2} maxLength={80} placeholder="Fairtex Deutschland" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Web sitesi">
              <Input type="url" name="website" placeholder="https://…" />
            </Field>
            <Field label="Bütçe aralığı (€/yıl)">
              <div className="flex items-center gap-2">
                <Input type="number" name="budgetMin" min={0} placeholder="Min" />
                <span className="text-muted">–</span>
                <Input type="number" name="budgetMax" min={0} placeholder="Maks" />
              </div>
            </Field>
          </div>

          <Field label="Hakkında">
            <Textarea name="about" rows={3} maxLength={1000} />
          </Field>

          <Field label="İlgilendiği disiplinler">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {DISCIPLINES.map((d) => (
                <Checkbox key={d.value} name="disciplines[]" value={d.value} label={d.label} />
              ))}
            </div>
          </Field>

          <Field label="Logo">
            <ImageUploader
              folder="ad"
              value={logo?.url}
              aspect="aspect-video"
              label="Logo yükle"
              onChange={(a) => setLogo(a ? { url: a.url, publicId: a.publicId } : null)}
            />
            <input type="hidden" name="logoUrl" value={logo?.url ?? ""} />
            <input type="hidden" name="logoId" value={logo?.publicId ?? ""} />
          </Field>
        </>
      )}
    </FormShell>
  );
}

/** §4.3 — Sponsorluk teklifi yayınlama */
export function SponsorOfferForm({ sponsors }: { sponsors: { id: string; name: string }[] }) {
  if (sponsors.length === 0) {
    return <p className="text-sm text-muted">Önce en az bir sponsor markası ekle.</p>;
  }

  return (
    <FormShell action={createSponsorOffer} submitLabel="Teklifi Yayınla">
      {(state) => (
        <>
          <Field label="Sponsor" error={state.fields?.sponsorId} required>
            <Select name="sponsorId" required defaultValue="">
              <option value="" disabled>
                Seç
              </option>
              {sponsors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Başlık" error={state.fields?.title} required>
            <Input name="title" required minLength={3} maxLength={120} placeholder="Amatör MMA sporcusu aranıyor" />
          </Field>

          <Field label="Açıklama" error={state.fields?.description} required>
            <Textarea name="description" required minLength={10} maxLength={3000} rows={4} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Min. takipçi">
              <Input type="number" name="minFollowers" min={0} defaultValue={0} />
            </Field>
            <Field label="Min. seviye">
              <Select name="minLevel" defaultValue="BEGINNER">
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Bölge">
              <Input name="region" maxLength={60} placeholder="Rhein-Main" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teklifin değeri" hint="Ürün desteği, nakit, ekipman…">
              <Input name="value" maxLength={120} placeholder="Yıllık ekipman paketi + 1.200 €" />
            </Field>
            <Field label="Son başvuru">
              <Input type="date" name="deadline" />
            </Field>
          </div>

          <Field label="Disiplinler">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {DISCIPLINES.map((d) => (
                <Checkbox key={d.value} name="disciplines[]" value={d.value} label={d.label} />
              ))}
            </div>
          </Field>
        </>
      )}
    </FormShell>
  );
}

export function OfferStatusToggle({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const open = status === "OPEN";

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => start(() => setOfferStatus(id, open ? "CLOSED" : "OPEN"))}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : open ? "Kapat" : "Yeniden aç"}
    </Button>
  );
}

export function ApplicationActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  if (status === "ACCEPTED" || status === "REJECTED") return null;

  return (
    <div className="flex gap-1.5">
      <Button size="sm" disabled={pending} onClick={() => start(() => reviewSponsorApplication(id, "ACCEPTED"))}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Kabul"}
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(() => reviewSponsorApplication(id, "REJECTED"))}>
        Ret
      </Button>
    </div>
  );
}
