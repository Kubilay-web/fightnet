/**
 * §5.2 — Çok dillilik: Almanca (ana), İngilizce, Türkçe.
 *
 * Tasarım kararı: dosya sistemi rotaları TÜRKÇE kalır (kanonik biçim), URL'ler
 * ise dile göre çevrilir. `/de/kaempfer/x`, `/en/fighters/x` ve `/tr/dovuscular/x`
 * proxy tarafından tek bir kanonik rotaya (`/dovuscular/x`) yeniden yazılır.
 *
 * Neden böyle: alternatif, `app/[locale]/…` altına taşıyıp her dil için ayrı
 * segment klasörü açmaktı — 100'den fazla sayfanın yolunu değiştirir ve her
 * yeni sayfada üç klasör bakımı gerektirirdi. Bu yaklaşımda tek bir eşleme
 * tablosu var; yeni sayfa eklerken sadece buraya bir satır yazılır.
 */

export const LOCALES = ["de", "en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];

/** Dokümanda ana dil Almanca (DACH pazarı). */
export const DEFAULT_LOCALE: Locale = "de";

export const LOCALE_COOKIE = "fn_locale";
export const LOCALE_HEADER = "x-fn-locale";

export const LOCALE_LABEL: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
};

export const LOCALE_FLAG: Record<Locale, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  tr: "🇹🇷",
};

/** `<html lang>` ve Intl için tam etiketler */
export const LOCALE_TAG: Record<Locale, string> = {
  de: "de-DE",
  en: "en-GB",
  tr: "tr-TR",
};

/** Open Graph `og:locale` */
export const OG_LOCALE: Record<Locale, string> = {
  de: "de_DE",
  en: "en_GB",
  tr: "tr_TR",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Kanonik (Türkçe, dosya sistemindeki) segment → dile göre URL segmenti.
 *
 * Yalnızca STATİK segmentler çevrilir; `[slug]`, `[id]` gibi dinamik parçalar
 * olduğu gibi geçer. Bir segment burada yoksa üç dilde de aynı kalır.
 */
export const ROUTE_SEGMENTS: Record<string, Record<Locale, string>> = {
  // Kamuya açık ana bölümler
  dovuscular: { de: "kaempfer", en: "fighters", tr: "dovuscular" },
  salonlar: { de: "gyms", en: "gyms", tr: "salonlar" },
  etkinlikler: { de: "events", en: "events", tr: "etkinlikler" },
  sparring: { de: "sparring", en: "sparring", tr: "sparring" },
  kocluk: { de: "coaching", en: "coaching", tr: "kocluk" },
  akis: { de: "entdecken", en: "discover", tr: "akis" },
  forum: { de: "forum", en: "forum", tr: "forum" },
  harita: { de: "karte", en: "map", tr: "harita" },
  pazar: { de: "marktplatz", en: "marketplace", tr: "pazar" },
  creator: { de: "creator", en: "creator", tr: "creator" },
  arama: { de: "suche", en: "search", tr: "arama" },
  sponsorluk: { de: "sponsoring", en: "sponsorship", tr: "sponsorluk" },

  // Bilgi ve hukuk sayfaları
  hakkinda: { de: "ueber-uns", en: "about", tr: "hakkinda" },
  iletisim: { de: "kontakt", en: "contact", tr: "iletisim" },
  beta: { de: "beta", en: "beta", tr: "beta" },
  premium: { de: "premium", en: "premium", tr: "premium" },
  "salonlar-icin": { de: "fuer-gyms", en: "for-gyms", tr: "salonlar-icin" },
  "veri-lisansi": { de: "datenlizenz", en: "data-license", tr: "veri-lisansi" },
  gizlilik: { de: "datenschutz", en: "privacy", tr: "gizlilik" },
  sartlar: { de: "agb", en: "terms", tr: "sartlar" },
  kunye: { de: "impressum", en: "imprint", tr: "kunye" },
  seffaflik: { de: "transparenz", en: "transparency", tr: "seffaflik" },
  "topluluk-kurallari": { de: "community-richtlinien", en: "community-guidelines", tr: "topluluk-kurallari" },
  "sparring-sozlesmesi": { de: "sparring-vereinbarung", en: "sparring-agreement", tr: "sparring-sozlesmesi" },

  // Kimlik
  giris: { de: "anmelden", en: "login", tr: "giris" },
  kayit: { de: "registrieren", en: "register", tr: "kayit" },
  "ebeveyn-onayi": { de: "elternfreigabe", en: "guardian-consent", tr: "ebeveyn-onayi" },
  cevrimdisi: { de: "offline", en: "offline", tr: "cevrimdisi" },

  // Uygulama alanları
  panel: { de: "dashboard", en: "dashboard", tr: "panel" },
  organizator: { de: "veranstalter", en: "organizer", tr: "organizator" },
  "salon-yonetimi": { de: "gym-verwaltung", en: "gym-admin", tr: "salon-yonetimi" },
  admin: { de: "admin", en: "admin", tr: "admin" },

  // Panel alt sayfaları
  profil: { de: "profil", en: "profile", tr: "profil" },
  antrenman: { de: "training", en: "training", tr: "antrenman" },
  rezervasyonlar: { de: "buchungen", en: "bookings", tr: "rezervasyonlar" },
  mesajlar: { de: "nachrichten", en: "messages", tr: "mesajlar" },
  gonderi: { de: "beitraege", en: "posts", tr: "gonderi" },
  dogrulama: { de: "verifizierung", en: "verification", tr: "dogrulama" },
  passport: { de: "passport", en: "passport", tr: "passport" },
  cihazlar: { de: "geraete", en: "devices", tr: "cihazlar" },
  abonelik: { de: "abo", en: "subscription", tr: "abonelik" },
  bildirimler: { de: "benachrichtigungen", en: "notifications", tr: "bildirimler" },
  itirazlar: { de: "einsprueche", en: "appeals", tr: "itirazlar" },
  ayarlar: { de: "einstellungen", en: "settings", tr: "ayarlar" },
  kefalet: { de: "buergschaften", en: "vouches", tr: "kefalet" },
  sozlesmelerim: { de: "meine-vertraege", en: "my-contracts", tr: "sozlesmelerim" },
  sozlesmeler: { de: "vertraege", en: "contracts", tr: "sozlesmeler" },

  // Ortak alt segmentler
  yeni: { de: "neu", en: "new", tr: "yeni" },
};

/** Yerelleştirilmiş segment → kanonik segment (proxy'de tersine çevirmek için). */
const REVERSE: Record<Locale, Record<string, string>> = (() => {
  const map = { de: {}, en: {}, tr: {} } as Record<Locale, Record<string, string>>;
  for (const [canonical, byLocale] of Object.entries(ROUTE_SEGMENTS)) {
    for (const locale of LOCALES) {
      map[locale][byLocale[locale]] = canonical;
    }
  }
  return map;
})();

/** Kanonik yolu belirtilen dilin URL'ine çevirir: `/dovuscular/x` → `/en/fighters/x` */
export function localizePath(path: string, locale: Locale): string {
  const [pathname, rest] = splitPath(path);
  const segments = pathname.split("/").filter(Boolean);
  const translated = segments.map((s) => ROUTE_SEGMENTS[s]?.[locale] ?? s);
  return `/${locale}${translated.length ? `/${translated.join("/")}` : ""}${rest}`;
}

/** Yerelleştirilmiş yolu kanonik hâle getirir: `/en/fighters/x` → `/dovuscular/x` */
export function canonicalizePath(path: string, locale: Locale): string {
  const [pathname, rest] = splitPath(path);
  const segments = pathname.split("/").filter(Boolean);
  const canonical = segments.map((s) => REVERSE[locale][s] ?? s);
  return `/${canonical.join("/")}${rest}`;
}

/** URL'in başındaki dil önekini ayırır. */
export function splitLocale(pathname: string): { locale: Locale | null; rest: string } {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && isLocale(segments[0])) {
    return { locale: segments[0], rest: `/${segments.slice(1).join("/")}` };
  }
  return { locale: null, rest: pathname };
}

/** Sorgu dizesi ve fragment'ı yol dönüşümlerinin dışında tutar. */
function splitPath(path: string): [string, string] {
  const i = path.search(/[?#]/);
  return i === -1 ? [path, ""] : [path.slice(0, i), path.slice(i)];
}

/** `Accept-Language` başlığından en uygun dili seçer. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
