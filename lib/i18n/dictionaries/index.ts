import type { Locale } from "../config";
import { tr } from "./tr";
import { de } from "./de";
import { en } from "./en";

/**
 * Sözlük tipi Türkçe sürümden türetilir: yeni bir anahtar eklendiğinde
 * `de.ts` ve `en.ts` derleme hatası verir. Böylece eksik çeviri sessizce
 * üretime çıkamaz.
 */
export type Dictionary = {
  -readonly [K in keyof typeof tr]: { -readonly [P in keyof (typeof tr)[K]]: string };
};

const DICTIONARIES: Record<Locale, Dictionary> = { tr, de, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
