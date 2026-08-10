import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, MapPin } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { Badge, Card, CardBody, Section, EmptyState, Pagination, ButtonLink } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { cld } from "@/lib/image";
import { formatMoney, timeAgo } from "@/lib/utils";
import { DISCIPLINES, DISCIPLINE_LABEL, PAGE_SIZE, MARKETPLACE_FEE_RATE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Ekipman Pazarı",
  description: "Dövüş sporu ekipmanları: eldiven, kimono, koruyucu, torba. Al, sat, takas et.",
};

export const revalidate = 120;

const CATEGORIES = [
  "Eldiven", "Kimono / Gi", "Koruyucu", "Şort / Rashguard",
  "Kum torbası", "Ayakkabı", "Bandaj", "Diğer",
];

type SP = Promise<Record<string, string | undefined>>;

export default async function MarketplacePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where: Prisma.ProductWhereInput = { isActive: true, stock: { gt: 0 } };
  if (sp.category) where.category = sp.category;
  if (sp.discipline) where.discipline = sp.discipline as never;
  if (sp.condition) where.condition = sp.condition as never;
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
      { city: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sp.sort === "price_asc" ? { price: "asc" } : sp.sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    safe(
      () =>
        prisma.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true, slug: true, title: true, description: true, price: true, currency: true,
            condition: true, category: true, discipline: true, images: true, city: true,
            shipping: true, createdAt: true,
            seller: { select: { name: true, slug: true, verification: true } },
          },
        }),
      [],
    ),
    safe(() => prisma.product.count({ where }), 0),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title="Ekipman Pazarı"
        subtitle={`Dövüş sporu ekipmanları — platform komisyonu %${MARKETPLACE_FEE_RATE * 100}`}
        action={
          <ButtonLink href="/panel/pazar/yeni" size="sm">
            İlan Ver
          </ButtonLink>
        }
      >
        <FilterBar
          basePath="/pazar"
          current={sp}
          filters={[
            { key: "category", label: "Kategori", options: CATEGORIES.map((c) => ({ value: c, label: c })) },
            { key: "discipline", label: "Disiplin", options: DISCIPLINES.map((d) => ({ value: d.value, label: d.label })) },
            {
              key: "condition",
              label: "Durum",
              options: [
                { value: "NEW", label: "Sıfır" },
                { value: "LIKE_NEW", label: "Sıfır gibi" },
                { value: "USED", label: "Kullanılmış" },
              ],
            },
            {
              key: "sort",
              label: "Sıralama",
              options: [
                { value: "new", label: "En yeni" },
                { value: "price_asc", label: "Ucuzdan pahalıya" },
                { value: "price_desc", label: "Pahalıdan ucuza" },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder="Ürün ara…"
        />

        {products.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-10" />}
            title="Ürün bulunamadı"
            description="İlk ilanı sen ver — kullanmadığın ekipmanı topluluğa sun."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {products.map((p) => {
                const images = (p.images ?? []) as { url: string }[];
                return (
                  <Card key={p.id} hover className="overflow-hidden">
                    <Link href={`/pazar/${p.slug}`} className="block">
                    <div className="relative aspect-square bg-ink-200 dark:bg-ink-800">
                      {images[0] ? (
                        <Image
                          src={cld(images[0].url, { w: 400, h: 400 })}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-muted">
                          <ShoppingBag className="size-8" />
                        </span>
                      )}
                      <span className="absolute left-2 top-2">
                        <Badge tone={p.condition === "NEW" ? "green" : "neutral"}>
                          {p.condition === "NEW" ? "Sıfır" : p.condition === "LIKE_NEW" ? "Sıfır gibi" : "Kullanılmış"}
                        </Badge>
                      </span>
                    </div>
                    <CardBody className="flex flex-col gap-1.5">
                      <h3 className="truncate font-bold">{p.title}</h3>
                      <p className="text-lg font-black">{formatMoney(p.price, p.currency)}</p>
                      <p className="truncate text-xs text-muted">
                        {p.category}
                        {p.discipline && ` · ${DISCIPLINE_LABEL[p.discipline]}`}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted">
                        {p.city && (
                          <>
                            <MapPin className="size-3 shrink-0" />
                            {p.city} ·{" "}
                          </>
                        )}
                        {timeAgo(p.createdAt)}
                      </p>
                    </CardBody>
                    </Link>
                  </Card>
                );
              })}
            </div>
            <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/pazar" params={sp} />
          </>
        )}
      </Section>
    </div>
  );
}
