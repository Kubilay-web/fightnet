"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2, Trash2, EyeOff, Eye } from "lucide-react";
import Image from "next/image";
import { createProduct, deleteProduct, setProductActive, placeOrder } from "@/app/panel/pazar/actions";
import { FormShell } from "@/components/form-shell";
import { useCloudinaryUpload, type UploadedAsset } from "@/components/uploader";
import { Button, Input, Textarea, Select, Field, Checkbox, Alert } from "@/components/ui";
import { cld } from "@/lib/image";
// TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir
import { DISCIPLINES, MARKETPLACE_FEE_RATE } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { useLocale } from "@/components/i18n/provider";
import { panelMarketCopy, PRODUCT_CATEGORY_VALUES } from "@/lib/i18n/pages/panel-market";

/**
 * Kategori değerleri kanonik (Türkçe) kalır — veritabanına yazılan metin dile
 * göre değişmemeli. Görünen etiket `panelMarketCopy.categories` üzerinden gelir.
 */
export const PRODUCT_CATEGORIES = PRODUCT_CATEGORY_VALUES;

/** §4.4 — İlan verme formu. Görseller doğrudan Cloudinary'ye yüklenir. */
export function ProductForm() {
  const locale = useLocale();
  const copy = panelMarketCopy[locale];
  const t = copy.form;
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
    <FormShell action={createProduct} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field label={t.title} error={state.fields?.title} required>
            <Input name="title" required minLength={3} maxLength={120} placeholder={t.titlePlaceholder} />
          </Field>

          <Field label={t.description} error={state.fields?.description} required hint={t.descriptionHint}>
            <Textarea name="description" required minLength={10} maxLength={3000} rows={5} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.category} error={state.fields?.category} required>
              <Select name="category" required defaultValue="">
                <option value="" disabled>{t.categoryEmpty}</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{copy.categories[c]}</option>
                ))}
              </Select>
            </Field>

            <Field label={t.discipline} hint={t.disciplineHint}>
              <Select name="discipline" defaultValue="">
                <option value="">{t.disciplineAny}</option>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </Select>
            </Field>

            <Field label={t.condition} required>
              <Select name="condition" defaultValue="NEW">
                <option value="NEW">{t.conditionNew}</option>
                <option value="LIKE_NEW">{t.conditionLikeNew}</option>
                <option value="USED">{t.conditionUsed}</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.price} error={state.fields?.price} required>
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
            <Field label={t.stock} required>
              <Input type="number" name="stock" min={1} max={9999} defaultValue={1} required />
            </Field>
            <Field label={t.city} hint={t.cityHint}>
              <Input name="city" maxLength={60} placeholder={t.cityPlaceholder} />
            </Field>
          </div>

          {price > 0 && (
            <Alert tone="neutral">
              {t.feePrefix(MARKETPLACE_FEE_RATE * 100)}{" "}
              <strong>{formatMoney(fee, "EUR", LOCALE_TAG[locale])}</strong>. {t.feeRemainder}{" "}
              <strong>{formatMoney(price - fee, "EUR", LOCALE_TAG[locale])}</strong>.
            </Alert>
          )}

          <Checkbox name="shipping" defaultChecked label={t.shipping} />

          <Field label={t.images} hint={t.imagesHint}>
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <span key={img.publicId} className="relative size-24 overflow-hidden rounded-xl bg-ink-200 dark:bg-ink-800">
                  <Image src={cld(img.url, { w: 200, h: 200 })} alt="" fill className="object-cover" sizes="96px" />
                  <input type="hidden" name="imageUrls[]" value={img.url} />
                  <input type="hidden" name="imageIds[]" value={img.publicId} />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={t.removeImageAria}
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
                      <span className="text-xs font-semibold">{t.addImage}</span>
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
  const t = panelMarketCopy[useLocale()].actions;
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
        {isActive ? t.unpublish : t.publish}
      </Button>

      {confirming ? (
        <>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => start(() => deleteProduct(id))}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : t.deletePermanently}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
            {t.cancel}
          </Button>
        </>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirming(true)} aria-label={t.deleteAria}>
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
  const locale = useLocale();
  const t = panelMarketCopy[locale].order;
  const bound = placeOrder.bind(null, productId);

  return (
    <FormShell action={bound} submitLabel={t.submit}>
      {(state) => (
        <>
          <Alert tone="blue">
            {t.noticeBefore}<strong>{t.noticeStrong}</strong>{t.noticeAfter}
          </Alert>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.quantity} required>
              <Input type="number" name="quantity" min={1} max={Math.min(10, stock)} defaultValue={1} required />
            </Field>
            <Field label={t.unitPrice} hint={t.unitPriceHint}>
              <Input value={formatMoney(price, "EUR", LOCALE_TAG[locale])} readOnly disabled />
            </Field>
          </div>

          {shipping && (
            <>
              <Field label={t.name} error={state.fields?.name} required>
                <Input name="name" required maxLength={80} autoComplete="name" />
              </Field>
              <Field label={t.street} error={state.fields?.street} required>
                <Input name="street" required maxLength={120} autoComplete="street-address" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={t.postalCode} required>
                  <Input name="postalCode" required maxLength={10} autoComplete="postal-code" />
                </Field>
                <Field label={t.city} required>
                  <Input name="city" required maxLength={60} autoComplete="address-level2" />
                </Field>
                <Field label={t.country} required>
                  <Select name="country" defaultValue="DE">
                    <option value="DE">{t.countries.DE}</option>
                    <option value="AT">{t.countries.AT}</option>
                    <option value="CH">{t.countries.CH}</option>
                  </Select>
                </Field>
              </div>
            </>
          )}

          <Field label={t.note}>
            <Textarea name="note" rows={2} maxLength={300} placeholder={t.notePlaceholder} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
