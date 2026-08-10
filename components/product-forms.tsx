"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2, Trash2, EyeOff, Eye } from "lucide-react";
import Image from "next/image";
import { createProduct, deleteProduct, setProductActive, placeOrder } from "@/app/panel/pazar/actions";
import { FormShell } from "@/components/form-shell";
import { useCloudinaryUpload, type UploadedAsset } from "@/components/uploader";
import { Button, Input, Textarea, Select, Field, Checkbox, Alert } from "@/components/ui";
import { cld } from "@/lib/image";
import { DISCIPLINES, MARKETPLACE_FEE_RATE } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";

export const PRODUCT_CATEGORIES = [
  "Eldiven", "Kimono / Gi", "Koruyucu", "Şort / Rashguard",
  "Kum torbası", "Ayakkabı", "Bandaj", "Diğer",
];

/** §4.4 — İlan verme formu. Görseller doğrudan Cloudinary'ye yüklenir. */
export function ProductForm() {
  const [images, setImages] = useState<UploadedAsset[]>([]);
  const [price, setPrice] = useState(0);
  const { upload, uploading, progress, error } = useCloudinaryUpload("product");

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 8 - images.length);
    for (const file of files) {
      const asset = await upload(file);
      if (asset) setImages((prev) => [...prev, asset]);
    }
    e.target.value = "";
  }

  const fee = Math.round(price * MARKETPLACE_FEE_RATE * 100) / 100;

  return (
    <FormShell action={createProduct} submitLabel="İlanı Yayınla">
      {(state) => (
        <>
          <Field label="Başlık" error={state.fields?.title} required>
            <Input name="title" required minLength={3} maxLength={120} placeholder="Fairtex BGV1 boks eldiveni 16 oz" />
          </Field>

          <Field label="Açıklama" error={state.fields?.description} required hint="Durum, kullanım süresi, kusurlar — dürüst ol">
            <Textarea name="description" required minLength={10} maxLength={3000} rows={5} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Kategori" error={state.fields?.category} required>
              <Select name="category" required defaultValue="">
                <option value="" disabled>Seç</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>

            <Field label="Disiplin" hint="Opsiyonel">
              <Select name="discipline" defaultValue="">
                <option value="">Fark etmez</option>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </Select>
            </Field>

            <Field label="Durum" required>
              <Select name="condition" defaultValue="NEW">
                <option value="NEW">Sıfır</option>
                <option value="LIKE_NEW">Sıfır gibi</option>
                <option value="USED">Kullanılmış</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Fiyat (€)" error={state.fields?.price} required>
              <Input
                type="number"
                name="price"
                step="0.5"
                min={0}
                max={100000}
                required
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Adet" required>
              <Input type="number" name="stock" min={1} max={9999} defaultValue={1} required />
            </Field>
            <Field label="Şehir" hint="Elden teslim için">
              <Input name="city" maxLength={60} placeholder="Frankfurt" />
            </Field>
          </div>

          {price > 0 && (
            <Alert tone="neutral">
              Satış gerçekleşirse platform komisyonu %{MARKETPLACE_FEE_RATE * 100} ={" "}
              <strong>{formatMoney(fee)}</strong>. Sana kalan: <strong>{formatMoney(price - fee)}</strong>.
            </Alert>
          )}

          <Checkbox name="shipping" defaultChecked label="Kargo gönderimi yapıyorum" />

          <Field label="Görseller" hint="En fazla 8 · ilk görsel kapak olur">
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <span key={img.publicId} className="relative size-24 overflow-hidden rounded-xl bg-ink-200 dark:bg-ink-800">
                  <Image src={cld(img.url, { w: 200, h: 200 })} alt="" fill className="object-cover" sizes="96px" />
                  <input type="hidden" name="imageUrls[]" value={img.url} />
                  <input type="hidden" name="imageIds[]" value={img.publicId} />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="Görseli kaldır"
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-blood-600"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}

              {images.length < 8 && (
                <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--border)] text-muted transition-colors hover:border-blood-500">
                  {uploading ? (
                    <>
                      <Loader2 className="size-5 animate-spin text-blood-500" />
                      <span className="text-xs font-semibold">%{progress}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-5" />
                      <span className="text-xs font-semibold">Ekle</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple onChange={onFiles} className="sr-only" />
                </label>
              )}
            </div>
            {error && <p className="mt-1 text-xs font-medium text-blood-500">{error}</p>}
          </Field>
        </>
      )}
    </FormShell>
  );
}

/** İlan kartındaki satıcı işlemleri */
export function ProductActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => start(() => setProductActive(id, !isActive))}
      >
        {isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {isActive ? "Yayından kaldır" : "Yayına al"}
      </Button>

      {confirming ? (
        <>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => start(() => deleteProduct(id))}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Kalıcı olarak sil"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
            Vazgeç
          </Button>
        </>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirming(true)} aria-label="İlanı sil">
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}

/** Ürün detayındaki sipariş formu */
export function OrderForm({
  productId,
  price,
  stock,
  shipping,
}: {
  productId: string;
  price: number;
  stock: number;
  shipping: boolean;
}) {
  const bound = placeOrder.bind(null, productId);

  return (
    <FormShell action={bound} submitLabel="Siparişi Gönder">
      {(state) => (
        <>
          <Alert tone="blue">
            Sipariş bir <strong>rezervasyondur</strong>. Ödeme şu an alıcı ve satıcı arasında yapılır;
            FIGHTNET tarafı tahsil etmez. Anlaşmazlıkta ilanı bildirebilirsin.
          </Alert>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Adet" required>
              <Input type="number" name="quantity" min={1} max={Math.min(10, stock)} defaultValue={1} required />
            </Field>
            <Field label="Birim fiyat" hint="Toplam, adet ile çarpılarak hesaplanır">
              <Input value={formatMoney(price)} readOnly disabled />
            </Field>
          </div>

          {shipping && (
            <>
              <Field label="Ad Soyad" error={state.fields?.name} required>
                <Input name="name" required maxLength={80} autoComplete="name" />
              </Field>
              <Field label="Adres" error={state.fields?.street} required>
                <Input name="street" required maxLength={120} autoComplete="street-address" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Posta kodu" required>
                  <Input name="postalCode" required maxLength={10} autoComplete="postal-code" />
                </Field>
                <Field label="Şehir" required>
                  <Input name="city" required maxLength={60} autoComplete="address-level2" />
                </Field>
                <Field label="Ülke" required>
                  <Select name="country" defaultValue="DE">
                    <option value="DE">Almanya</option>
                    <option value="AT">Avusturya</option>
                    <option value="CH">İsviçre</option>
                  </Select>
                </Field>
              </div>
            </>
          )}

          <Field label="Satıcıya not">
            <Textarea name="note" rows={2} maxLength={300} placeholder="Elden teslim tercih ederim…" />
          </Field>
        </>
      )}
    </FormShell>
  );
}
