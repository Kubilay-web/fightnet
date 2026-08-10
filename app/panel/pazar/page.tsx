import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, PackageCheck, Inbox } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, Section, EmptyState, ButtonLink, Alert } from "@/components/ui";
import { ProductActions } from "@/components/product-forms";
import { SellerOrderActions } from "@/components/order-actions";
import { cld } from "@/lib/image";
import { formatMoney, timeAgo, truncate } from "@/lib/utils";
import { MARKETPLACE_FEE_RATE } from "@/lib/constants";

export const metadata: Metadata = { title: "İlanlarım", robots: { index: false } };
export const dynamic = "force-dynamic";

const ORDER_STATUS: Record<string, { label: string; tone: "neutral" | "amber" | "green" | "blue" | "red" }> = {
  PENDING: { label: "Beklemede", tone: "amber" },
  PAID: { label: "Ödendi", tone: "blue" },
  SHIPPED: { label: "Kargoda", tone: "blue" },
  DELIVERED: { label: "Teslim edildi", tone: "green" },
  CANCELLED: { label: "İptal", tone: "red" },
  REFUNDED: { label: "İade", tone: "red" },
};

export default async function MyMarketplacePage() {
  const user = await requireUser();

  const data = await safe(
    async () => {
      const [products, incoming, myOrders] = await Promise.all([
        prisma.product.findMany({
          where: { sellerId: user.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true, slug: true, title: true, price: true, stock: true,
            isActive: true, images: true, viewCount: true, createdAt: true,
          },
        }),
        // Satıcı olarak bana gelen siparişler
        prisma.orderItem.findMany({
          where: { sellerId: user.id },
          orderBy: { order: { createdAt: "desc" } },
          take: 30,
          select: {
            id: true, quantity: true, price: true,
            product: { select: { title: true, slug: true } },
            order: {
              select: {
                id: true, status: true, total: true, platformFee: true, address: true, createdAt: true,
                user: { select: { name: true, slug: true } },
              },
            },
          },
        }),
        prisma.order.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true, status: true, total: true, createdAt: true,
            items: { select: { quantity: true, product: { select: { title: true, slug: true } } } },
          },
        }),
      ]);
      return { products, incoming, myOrders };
    },
    { products: [], incoming: [], myOrders: [] },
  );

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Ekipman Pazarı"
        subtitle={`İlanların, gelen siparişler ve satın aldıkların — komisyon %${MARKETPLACE_FEE_RATE * 100}`}
        action={<ButtonLink href="/panel/pazar/yeni" size="sm">Yeni İlan</ButtonLink>}
      />

      {user.verification === "LEVEL_0" && (
        <Alert tone="blue" title="İlan vermek için doğrulama gerekli">
          Pazarda güven, doğrulanmış kimlikten gelir.{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">Seviye 1&apos;e geç</Link>
        </Alert>
      )}

      {/* İlanlarım */}
      <Section title="İlanlarım">
        {data.products.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-10" />}
            title="Henüz ilanın yok"
            description="Kullanmadığın eldiveni, kimonoyu ya da koruyucuyu topluluğa sun."
            action={<ButtonLink href="/panel/pazar/yeni" size="sm">İlan ver</ButtonLink>}
          />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.products.map((p) => {
                const images = (p.images ?? []) as { url: string }[];
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 p-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-200 dark:bg-ink-800">
                      {images[0] ? (
                        <Image src={cld(images[0].url, { w: 120, h: 120 })} alt="" fill className="object-cover" sizes="56px" />
                      ) : (
                        <ShoppingBag className="absolute inset-0 m-auto size-5 text-muted" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link href={`/pazar/${p.slug}`} className="truncate font-bold hover:underline">
                        {truncate(p.title, 60)}
                      </Link>
                      <p className="text-xs text-muted">
                        {formatMoney(p.price)} · {p.stock} adet · {p.viewCount} görüntülenme · {timeAgo(p.createdAt)}
                      </p>
                    </div>
                    <Badge tone={p.isActive ? "green" : "neutral"}>{p.isActive ? "Yayında" : "Pasif"}</Badge>
                    <ProductActions id={p.id} isActive={p.isActive} />
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </Section>

      {/* Gelen siparişler */}
      <Section title="Gelen Siparişler" subtitle="Satıcı olarak sana ulaşan talepler">
        {data.incoming.length === 0 ? (
          <EmptyState icon={<Inbox className="size-8" />} title="Henüz sipariş yok" />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.incoming.map((item) => {
                const addr = (item.order.address ?? {}) as Record<string, string>;
                const s = ORDER_STATUS[item.order.status];
                return (
                  <li key={item.id} className="flex flex-col gap-2 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 flex-1 truncate font-bold">
                        {truncate(item.product.title, 60)} × {item.quantity}
                      </p>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </div>
                    <p className="text-xs text-muted">
                      <Link href={`/dovuscular/${item.order.user.slug}`} className="font-semibold hover:underline">
                        {item.order.user.name}
                      </Link>{" "}
                      · {formatMoney(item.order.total)} (komisyon {formatMoney(item.order.platformFee)}) ·{" "}
                      {timeAgo(item.order.createdAt)}
                    </p>
                    {addr.street && (
                      <p className="text-xs text-muted">
                        {addr.name} · {addr.street}, {addr.postalCode} {addr.city} ({addr.country})
                        {addr.note && ` · "${addr.note}"`}
                      </p>
                    )}
                    <SellerOrderActions orderId={item.order.id} status={item.order.status} />
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </Section>

      {/* Satın aldıklarım */}
      <Section title="Siparişlerim">
        {data.myOrders.length === 0 ? (
          <EmptyState icon={<PackageCheck className="size-8" />} title="Henüz satın alman yok" />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.myOrders.map((o) => {
                const s = ORDER_STATUS[o.status];
                return (
                  <li key={o.id} className="flex flex-wrap items-center gap-2 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">
                        {o.items.map((i) => `${i.product.title} × ${i.quantity}`).join(", ")}
                      </p>
                      <p className="text-xs text-muted">
                        {formatMoney(o.total)} · {timeAgo(o.createdAt)}
                      </p>
                    </div>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </Section>
    </div>
  );
}
