"use client";

import NextLink from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "./provider";

/**
 * `next/link` yerine kullanılan dil farkındalı bağlantı.
 *
 * Kod içindeki tüm `href` değerleri KANONİK (Türkçe) yolda yazılır; çeviri
 * burada, tek noktada yapılır. Böylece yeni sayfa eklerken üç ayrı href
 * yönetmek gerekmez ve bir bağlantının çevrilmeyi unutulması mümkün olmaz.
 *
 * Harici adresler, `mailto:`, `tel:` ve `#` çapaları olduğu gibi geçer.
 */

type Props = ComponentProps<typeof NextLink>;

function isExternal(href: string): boolean {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//") || href.startsWith("#")
  );
}

export const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, ...props }, ref) {
  const locale = useLocale();

  const localized =
    typeof href === "string" && !isExternal(href) && href.startsWith("/")
      ? localizePath(href, locale)
      : href;

  return <NextLink ref={ref} href={localized} {...props} />;
});

export default Link;
