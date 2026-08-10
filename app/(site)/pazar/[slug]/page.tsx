import type { Metadata } from "next";
import Link from "next/link";
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
import { DISCIPLINE_LABEL, MARKETPLACE_FEE_RATE } from "@/lib/constants";

export const dynamic = "force-dynamic";

const CONDITION: Record<string, string> = {
  NEW: "Sıfır",
  LIKE_NEW: "Sıfır gibi",
  USED: "Kullanılmış",
};

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
  const product = await safe(() => loadProduct(slug), null);
  if (!product) return { title: "İlan bulunamadı" };

  const images = (product.images ?? []) as { url: string }[];
  return {
    title: product.title,
    description: truncate(product.description, 155),
    openGraph: {
      title: `${product.title} — ${formatMoney(product.price, product.currency)}`,
      description: truncate(product.description, 155),
      images: images[0] ? [cld(images[0].url, { w: 1200 })] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, session] = await Promise.all([safe(() => loadProduct(slug), null), getSession()]);
  if (!product) notFound();

  // Görüntülenme sayacı kritik yol dışında
  prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const images = (product.images ?? []) as { url: string }[];
  const isSeller = session?.sub === product.seller.id;
  const soldOut = product.stock < 1 || !product.isActive;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/pazar" className="hover:text-[var(--fg)]">
          Ekipman Pazarı
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
                <Badge tone="red" className="text-sm">Tükendi</Badge>
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
                {CONDITION[product.condition]}
              </Badge>
              <Badge>{product.category}</Badge>
              {product.discipline && <Badge tone="blue">{DISCIPLINE_LABEL[product.discipline]}</Badge>}
            </div>
            <h1 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl">{product.title}</h1>
            <p className="mt-1 font-display text-3xl font-black">{formatMoney(product.price, product.currency)}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>{product.stock} adet stokta</span>
              {product.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> {product.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                {product.shipping ? (
                  <>
                    <Truck className="size-3" /> Kargo var
                  </>
                ) : (
                  <>
                    <PackageX className="size-3" /> Yalnızca elden teslim
                  </>
                )}
              </span>
              <span>{timeAgo(product.createdAt)}</span>
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
                  {product.seller.city && ` · ${product.seller.city}`} · {timeAgo(product.seller.createdAt)} beri üye
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
            <Alert tone="neutral" title="Bu senin ilanın">
              Düzenlemek veya yayından kaldırmak için{" "}
              <Link href="/panel/pazar" className="font-bold underline">İlanlarım</Link> sayfasına git.
            </Alert>
          ) : soldOut ? (
            <Alert tone="amber" title="Bu ilan tükendi">
              Benzer ekipmanlar için{" "}
              <Link href="/pazar" className="font-bold underline">pazara göz at</Link>.
            </Alert>
          ) : !session ? (
            <Card>
              <CardBody className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted">Sipariş vermek için giriş yapmalısın.</p>
                <ButtonLink href={`/giris?next=/pazar/${product.slug}`} size="sm">
                  Giriş yap
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
            FIGHTNET satışlardan %{MARKETPLACE_FEE_RATE * 100} komisyon alır. Doping maddesi, takviye
            iddiası ve kilo düşürme ürünleri yasaktır — kurallara aykırı ilanları bildir.
          </p>
        </div>
      </div>
    </div>
  );
}
