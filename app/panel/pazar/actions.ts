"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { destroyAsset } from "@/lib/cloudinary";
import { notify, audit } from "@/lib/notify";
import { uniqueSlug, truncate } from "@/lib/utils";
import { MARKETPLACE_FEE_RATE } from "@/lib/constants";
import { productSchema } from "@/lib/validators";
import { moderate, attachResult } from "@/lib/moderation";
import type { ActionState } from "@/app/panel/actions";

/**
 * §4.4 — Ekipman pazarı.
 *
 * Ödeme akışı bilinçli olarak sağlayıcıdan bağımsız tutuldu: sipariş bir
 * rezervasyondur, alıcı ile satıcı ödemeyi kendi aralarında yapar ve platform
 * komisyonu (%${MARKETPLACE_FEE_RATE * 100}) sipariş üzerinde hesaplanıp saklanır.
 * Stripe Connect devreye girdiğinde (§4.6) yalnızca tahsilat adımı eklenir,
 * veri modeli değişmez.
 */

interface ProductImage {
  url: string;
  publicId?: string;
}

function formToObject(fd: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of fd.entries()) {
    if (key.endsWith("[]")) continue;
    obj[key] = value;
  }
  return obj;
}

function parseImages(fd: FormData): ProductImage[] {
  const urls = fd.getAll("imageUrls[]").filter((v): v is string => typeof v === "string" && !!v);
  const ids = fd.getAll("imageIds[]").filter((v): v is string => typeof v === "string");
  return urls.slice(0, 8).map((url, i) => ({ url, publicId: ids[i] || undefined }));
}

export async function createProduct(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  // §4.5 — Pazar Seviye 1'de açılır: kimliği doğrulanmamış satıcı ilan veremez
  if (user.verification === "LEVEL_0") {
    return { error: "İlan vermek için Seviye 1 (kimlik) doğrulaması gerekir." };
  }

  const raw = formToObject(fd);
  raw.images = parseImages(fd);
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[i.path.map(String).join(".") || "_"] ??= i.message;
    return { error: "Lütfen alanları kontrol edin", fields };
  }
  const d = parsed.data;

  const open = await prisma.product.count({ where: { sellerId: user.id, isActive: true } });
  if (open >= 50) return { error: "Aynı anda en fazla 50 aktif ilanın olabilir." };

  // §11.3 — İlan metni ve görseli ön filtreden geçer
  const decision = await moderate({
    targetType: "PRODUCT",
    userId: user.id,
    kind: "IMAGE",
    text: `${d.title} ${d.description}`,
    imageUrl: (d.images as { url?: string }[])[0]?.url ?? null,
  });
  if (decision.state === "REMOVED") return { error: decision.message ?? "İlan yayınlanamadı" };

  const product = await prisma.product.create({
    data: {
      slug: uniqueSlug(d.title),
      sellerId: user.id,
      title: d.title,
      description: d.description,
      category: d.category,
      discipline: d.discipline || null,
      condition: d.condition,
      price: d.price,
      stock: d.stock,
      city: d.city || null,
      shipping: d.shipping,
      images: d.images as never,
      // İncelemeye düşen ilan listede görünmez
      isActive: decision.state === "APPROVED",
    },
    select: { id: true },
  });

  await attachResult({ targetType: "PRODUCT", targetId: product.id, decision });

  audit({ userId: user.id, action: "PRODUCT_CREATE", targetType: "PRODUCT", targetId: product.id });
  revalidatePath("/panel/pazar");
  revalidatePath("/pazar");
  redirect("/panel/pazar");
}

export async function setProductActive(id: string, isActive: boolean) {
  const user = await requireUser();
  await prisma.product.updateMany({ where: { id, sellerId: user.id }, data: { isActive } });
  revalidatePath("/panel/pazar");
  revalidatePath("/pazar");
}

export async function deleteProduct(id: string) {
  const user = await requireUser();
  const product = await prisma.product.findFirst({
    where: { id, sellerId: user.id },
    select: { id: true, images: true },
  });
  if (!product) return;

  await prisma.product.delete({ where: { id: product.id } });

  // Cloudinary'de yetim dosya bırakma
  for (const img of (product.images ?? []) as unknown as ProductImage[]) {
    if (img.publicId) destroyAsset(img.publicId).catch(() => {});
  }

  revalidatePath("/panel/pazar");
  revalidatePath("/pazar");
}

/** Alıcı siparişi oluşturur — stok düşer, satıcıya bildirim gider */
export async function placeOrder(productId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();

  const quantity = Math.max(1, Math.min(10, Number(fd.get("quantity") ?? 1) || 1));
  const address = {
    name: String(fd.get("name") ?? "").trim(),
    street: String(fd.get("street") ?? "").trim(),
    postalCode: String(fd.get("postalCode") ?? "").trim(),
    city: String(fd.get("city") ?? "").trim(),
    country: String(fd.get("country") ?? "DE").trim().toUpperCase(),
    note: String(fd.get("note") ?? "").trim() || undefined,
  };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, title: true, price: true, stock: true, isActive: true, sellerId: true, shipping: true },
  });
  if (!product || !product.isActive) return { error: "Bu ilan artık yayında değil." };
  if (product.sellerId === user.id) return { error: "Kendi ilanını satın alamazsın." };
  if (product.stock < quantity) return { error: `Stokta yalnızca ${product.stock} adet var.` };

  if (product.shipping && (!address.name || !address.street || !address.city)) {
    return { error: "Kargo için ad, adres ve şehir zorunlu", fields: { street: "Adres gerekli" } };
  }

  const total = product.price * quantity;
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total,
      platformFee: Math.round(total * MARKETPLACE_FEE_RATE * 100) / 100,
      address: address as never,
      items: {
        create: [{ productId: product.id, quantity, price: product.price, sellerId: product.sellerId }],
      },
    },
    select: { id: true },
  });

  await prisma.product.update({
    where: { id: product.id },
    data: { stock: { decrement: quantity }, isActive: product.stock - quantity > 0 },
  });

  notify({
    userId: product.sellerId,
    actorId: user.id,
    type: "SYSTEM",
    title: "Yeni sipariş",
    body: `${user.name} · ${truncate(product.title, 60)} (${quantity} adet)`,
    url: "/panel/pazar",
  });

  audit({ userId: user.id, action: "ORDER_CREATE", targetType: "ORDER", targetId: order.id });
  revalidatePath(`/pazar/${product.slug}`);
  revalidatePath("/panel/pazar");
  return { ok: true, message: "Siparişin satıcıya iletildi. Satıcı seninle iletişime geçecek." };
}

/** Satıcı sipariş durumunu ilerletir */
export async function setOrderStatus(
  orderId: string,
  status: "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED",
) {
  const user = await requireUser();

  // Yetki: siparişte satıcının en az bir kalemi olmalı
  const owns = await prisma.orderItem.findFirst({
    where: { orderId, sellerId: user.id },
    select: { id: true, quantity: true, productId: true },
  });
  if (!owns) return;

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, status: true } });
  if (!order || order.status === "CANCELLED" || order.status === "REFUNDED") return;

  await prisma.order.update({ where: { id: orderId }, data: { status } });

  // İptalde stok geri verilir
  if (status === "CANCELLED") {
    await prisma.product.update({
      where: { id: owns.productId },
      data: { stock: { increment: owns.quantity }, isActive: true },
    });
  }

  const label = { PAID: "ödendi olarak işaretlendi", SHIPPED: "kargoya verildi", DELIVERED: "teslim edildi", CANCELLED: "iptal edildi" }[status];
  notify({
    userId: order.userId,
    actorId: user.id,
    type: "SYSTEM",
    title: `Siparişin ${label}`,
    url: "/panel/pazar",
  });

  revalidatePath("/panel/pazar");
}
