import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import Image from "next/image";
import { ShoppingBag, MapPin } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { Badge, Card, CardBody, Section, EmptyState, Pagination, ButtonLink } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { cld } from "@/lib/image";
import { formatMoney, timeAgo } from "@/lib/utils";
import { PAGE_SIZE, MARKETPLACE_FEE_RATE } from "@/lib/constants";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { disciplineOptions, labelsFor } from "@/lib/i18n/labels";
import {
  marketplaceCopy, PRODUCT_CATEGORY_KEYS, type ProductCategoryKey,
} from "@/lib/i18n/pages/marketplace";

export async function generateMetadata(): Promise<Metadata> {
  const c = marketplaceCopy[await getLocale()].list;
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: await metadataAlternates("/pazar"),
  };
}

export const revalidate = 120;

type SP = Promise<Record<string, string | undefined>>;

export default async function MarketplacePage({ searchParams }: { searchParams: SP }) {
  const [sp, locale] = await Promise.all([searchParams, getLocale()]);
  const copy = marketplaceCopy[locale];
  const c = copy.list;
  const L = labelsFor(locale);
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
        title={c.title}
        subtitle={c.subtitle.replace("{rate}", String(MARKETPLACE_FEE_RATE * 100))}
        action={
          <ButtonLink href="/panel/pazar/yeni" size="sm">
            {c.createListing}
          </ButtonLink>
        }
      >
        <FilterBar
          basePath="/pazar"
          current={sp}
          filters={[
            {
              key: "category",
              label: c.filterCategory,
              options: PRODUCT_CATEGORY_KEYS.map((k) => ({ value: k, label: copy.categories[k] })),
            },
            { key: "discipline", label: c.filterDiscipline, options: disciplineOptions(locale) },
            {
              key: "condition",
              label: c.filterCondition,
              options: [
                { value: "NEW", label: copy.conditions.NEW },
                { value: "LIKE_NEW", label: copy.conditions.LIKE_NEW },
                { value: "USED", label: copy.conditions.USED },
              ],
            },
            {
              key: "sort",
              label: c.filterSort,
              options: [
                { value: "new", label: c.sortNew },
                { value: "price_asc", label: c.sortPriceAsc },
                { value: "price_desc", label: c.sortPriceDesc },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder={c.searchPlaceholder}
        />

        {products.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-10" />}
            title={c.emptyTitle}
            description={c.emptyBody}
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
                          {p.condition === "NEW"
                            ? copy.conditions.NEW
                            : p.condition === "LIKE_NEW"
                              ? copy.conditions.LIKE_NEW
                              : copy.conditions.USED}
                        </Badge>
                      </span>
                    </div>
                    <CardBody className="flex flex-col gap-1.5">
                      <h3 className="truncate font-bold">{p.title}</h3>
                      <p className="text-lg font-black">{formatMoney(p.price, p.currency, LOCALE_TAG[locale])}</p>
                      <p className="truncate text-xs text-muted">
                        {copy.categories[p.category as ProductCategoryKey] ?? p.category}
                        {p.discipline && ` · ${L.discipline[p.discipline]}`}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted">
                        {p.city && (
                          <>
                            <MapPin className="size-3 shrink-0" />
                            {p.city} ·{" "}
                          </>
                        )}
                        {timeAgo(p.createdAt, locale)}
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
