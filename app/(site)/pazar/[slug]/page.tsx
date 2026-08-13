import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShoppingBag, MapPin, Truck, PackageX } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Alert, ButtonLink } from "@/components/ui";
import { ReportButton } from "@/components/report-button";
import { OrderForm } from "@/components/product-forms";
import { cld } from "@/lib/image";
import { formatMoney, timeAgo, truncate } from "@/lib/utils";
import { MARKETPLACE_FEE_RATE } from "@/lib/constants";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { labelsFor } from "@/lib/i18n/labels";
import { marketplaceCopy, type ProductCategoryKey } from "@/lib/i18n/pages/marketplace";

export const dynamic = "force-dynamic";

async function loadProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, title: true, description: true, category: true,
      discipline: true, condition: true, price: true, currency: true, stock: true,
      images: true, city: true, shipping: true, isActive: true, viewCount: true, createdAt: true,
      seller: {
        select: {
          id: true, name: true, slug: true, username: true, avatarUrl: true,
          verification: true, isFounder: true, city: true, createdAt: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [product, locale] = await Promise.all([safe(() => loadProduct(slug), null), getLocale()]);
  const c = marketplaceCopy[locale].detail;
  const alternates = await metadataAlternates(`/pazar/${slug}`);
  if (!product) return { title: c.notFound, alternates };

  const images = (product.images ?? []) as { url: string }[];
  return {
    title: product.title,
    description: truncate(product.description, 155),
    alternates,
    openGraph: {
      title: `${product.title} — ${formatMoney(product.price, product.currency, LOCALE_TAG[locale])}`,
      description: truncate(product.description, 155),
      images: images[0] ? [cld(images[0].url, { w: 1200 })] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, session, locale] = await Promise.all([
    safe(() => loadProduct(slug), null),
    getSession(),
    getLocale(),
  ]);
  if (!product) notFound();

  const copy = marketplaceCopy[locale];
  const c = copy.detail;
  const L = labelsFor(locale);

  // Görüntülenme sayacı kritik yol dışında
  prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const images = (product.images ?? []) as { url: string }[];
  const isSeller = session?.sub === product.seller.id;
  const soldOut = product.stock < 1 || !product.isActive;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/pazar" className="hover:text-[var(--fg)]">
          {c.breadcrumb}
        </Link>{" "}
        / <span className="text-[var(--fg)]">{truncate(product.title, 40)}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Görseller */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink-200 dark:bg-ink-800">
            {images[0] ? (
              <Image
                src={cld(images[0].url, { w: 900, h: 900 })}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 550px"
                className="object-cover"
              />
            ) : (
              <ShoppingBag className="absolute inset-0 m-auto size-12 text-muted" />
            )}
            {soldOut && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Badge tone="red" className="text-sm">{c.soldOutBadge}</Badge>
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 9).map((img) => (
                <span key={img.url} className="relative aspect-square overflow-hidden rounded-xl bg-ink-200 dark:bg-ink-800">
                  <Image src={cld(img.url, { w: 300, h: 300 })} alt="" fill className="object-cover" sizes="140px" />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bilgi + sipariş */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={product.condition === "NEW" ? "green" : "neutral"}>
                {copy.conditions[product.condition as keyof typeof copy.conditions]}
              </Badge>
              <Badge>{copy.categories[product.category as ProductCategoryKey] ?? product.category}</Badge>
              {product.discipline && <Badge tone="blue">{L.discipline[product.discipline]}</Badge>}
            </div>
            <h1 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl">{product.title}</h1>
            <p className="mt-1 font-display text-3xl font-black">{formatMoney(product.price, product.currency, LOCALE_TAG[locale])}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>{c.stock.replace("{count}", String(product.stock))}</span>
              {product.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> {product.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                {product.shipping ? (
                  <>
                    <Truck className="size-3" /> {c.shippingAvailable}
                  </>
                ) : (
                  <>
                    <PackageX className="size-3" /> {c.pickupOnly}
                  </>
                )}
              </span>
              <span>{timeAgo(product.createdAt, locale)}</span>
            </p>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed">{product.description}</p>

          {/* Satıcı */}
          <Card>
            <CardBody className="flex items-center gap-3">
              <Avatar src={product.seller.avatarUrl} name={product.seller.name} size="md" href={`/dovuscular/${product.seller.slug}`} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-bold">
                  <Link href={`/dovuscular/${product.seller.slug}`} className="hover:underline">
                    {product.seller.name}
                  </Link>
                  <VerifiedMark level={product.seller.verification} />
                </p>
                <p className="text-xs text-muted">
                  @{product.seller.username}
                  {product.seller.city && ` · ${product.seller.city}`} · {c.memberSince.replace("{time}", timeAgo(product.seller.createdAt, locale))}
                </p>
              </div>
              <ReportButton
                targetType="POST"
                targetId={product.id}
                reportedUserId={product.seller.id}
                authed={!!session}
                compact
              />
            </CardBody>
          </Card>

          {/* Sipariş */}
          {isSeller ? (
            <Alert tone="neutral" title={c.ownListingTitle}>
              {c.ownListingLead}{" "}
              <Link href="/panel/pazar" className="font-bold underline">{c.ownListingLink}</Link>{c.ownListingTail}
            </Alert>
          ) : soldOut ? (
            <Alert tone="amber" title={c.soldOutTitle}>
              {c.soldOutLead}{" "}
              <Link href="/pazar" className="font-bold underline">{c.soldOutLink}</Link>{c.soldOutTail}
            </Alert>
          ) : !session ? (
            <Card>
              <CardBody className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted">{c.loginBody}</p>
                <ButtonLink href={`/giris?next=/pazar/${product.slug}`} size="sm">
                  {c.login}
                </ButtonLink>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <OrderForm
                  productId={product.id}
                  price={product.price}
                  stock={product.stock}
                  shipping={product.shipping}
                />
              </CardBody>
            </Card>
          )}

          <p className="text-xs text-muted">
            {c.feeNote.replace("{rate}", String(MARKETPLACE_FEE_RATE * 100))}
          </p>
        </div>
      </div>
    </div>
  );
}
