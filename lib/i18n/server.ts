import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale, localizePath, LOCALES, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";
import { absoluteUrl } from "../utils";

/**
 * Sunucu tarafında aktif dil.
 *
 * Proxy her isteğe `x-fn-locale` başlığı ekler; burada tek kez okunur ve
 * React `cache` sayesinde aynı render ağacındaki tüm çağrılar aynı sonucu
 * paylaşır.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const h = await headers();
  const value = h.get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

/** Sunucu bileşenlerinde çeviri sözlüğü. */
export const getDict = cache(async (): Promise<Dictionary> => {
  return getDictionary(await getLocale());
});

/** Aktif dile göre kanonik yolu URL'e çevirir. */
export async function path(canonical: string): Promise<string> {
  return localizePath(canonical, await getLocale());
}

/**
 * SEO alternatifleri — her sayfa üç dilde de erişilebilir olduğu için
 * `hreflang` etiketleri zorunludur, aksi halde arama motorları üç sürümü
 * yinelenen içerik sayar.
 */
export function alternatesFor(canonicalPath: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = absoluteUrl(localizePath(canonicalPath, locale));
  }
  languages["x-default"] = absoluteUrl(localizePath(canonicalPath, DEFAULT_LOCALE));
  return { languages };
}

/** `generateMetadata` içinde tek satırda kanonik + alternatifler. */
export async function metadataAlternates(canonicalPath: string) {
  const locale = await getLocale();
  return {
    canonical: absoluteUrl(localizePath(canonicalPath, locale)),
    ...alternatesFor(canonicalPath),
  };
}
