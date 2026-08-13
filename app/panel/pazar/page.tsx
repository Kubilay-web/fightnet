import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
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
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { panelMarketCopy } from "@/lib/i18n/pages/panel-market";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelMarketCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

/** Rozet rengi dilden bağımsız; etiketler `panelMarketCopy.orderStatus` içinde. */
const ORDER_TONE: Record<string, "neutral" | "amber" | "green" | "blue" | "red"> = {
  PENDING: "amber",
  PAID: "blue",
  SHIPPED: "blue",
  DELIVERED: "green",
  CANCELLED: "red",
  REFUNDED: "red",
};

export default async function MyMarketplacePage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = panelMarketCopy[locale];
  const tag = LOCALE_TAG[locale];

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
        title={copy.title}
        subtitle={copy.subtitle(MARKETPLACE_FEE_RATE * 100)}
        action={<ButtonLink href="/panel/pazar/yeni" size="sm">{copy.newListing}</ButtonLink>}
      />

      {user.verification === "LEVEL_0" && (
        <Alert tone="blue" title={copy.verifyAlert.title}>
          {copy.verifyAlert.body}{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">{copy.verifyAlert.link}</Link>
        </Alert>
      )}

      {/* İlanlarım */}
      <Section title={copy.myListings}>
        {data.products.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-10" />}
            title={copy.emptyProducts.title}
            description={copy.emptyProducts.description}
            action={<ButtonLink href="/panel/pazar/yeni" size="sm">{copy.emptyProducts.action}</ButtonLink>}
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
                        {formatMoney(p.price, "EUR", tag)} · {copy.stockCount(p.stock)} · {copy.viewCount(p.viewCount)} · {timeAgo(p.createdAt, locale)}
                      </p>
                    </div>
                    <Badge tone={p.isActive ? "green" : "neutral"}>{p.isActive ? copy.active : copy.inactive}</Badge>
                    <ProductActions id={p.id} isActive={p.isActive} />
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </Section>

      {/* Gelen siparişler */}
      <Section title={copy.incoming.title} subtitle={copy.incoming.subtitle}>
        {data.incoming.length === 0 ? (
          <EmptyState icon={<Inbox className="size-8" />} title={copy.incoming.empty} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.incoming.map((item) => {
                const addr = (item.order.address ?? {}) as Record<string, string>;
                return (
                  <li key={item.id} className="flex flex-col gap-2 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 flex-1 truncate font-bold">
                        {truncate(item.product.title, 60)} × {item.quantity}
                      </p>
                      <Badge tone={ORDER_TONE[item.order.status]}>{copy.orderStatus[item.order.status]}</Badge>
                    </div>
                    <p className="text-xs text-muted">
                      <Link href={`/dovuscular/${item.order.user.slug}`} className="font-semibold hover:underline">
                        {item.order.user.name}
                      </Link>{" "}
                      · {formatMoney(item.order.total, "EUR", tag)} {copy.commission(formatMoney(item.order.platformFee, "EUR", tag))} ·{" "}
                      {timeAgo(item.order.createdAt, locale)}
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
      <Section title={copy.myOrders.title}>
        {data.myOrders.length === 0 ? (
          <EmptyState icon={<PackageCheck className="size-8" />} title={copy.myOrders.empty} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.myOrders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">
                      {o.items.map((i) => `${i.product.title} × ${i.quantity}`).join(", ")}
                    </p>
                    <p className="text-xs text-muted">
                      {formatMoney(o.total, "EUR", tag)} · {timeAgo(o.createdAt, locale)}
                    </p>
                  </div>
                  <Badge tone={ORDER_TONE[o.status]}>{copy.orderStatus[o.status]}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>
    </div>
  );
}
