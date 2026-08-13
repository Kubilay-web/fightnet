import type { Locale } from "@/lib/i18n/config";

/**
 * `/pazar` ve `/pazar/[slug]`.
 *
 * Kategori anahtarları veritabanında Türkçe metin olarak saklanıyor
 * (`Product.category` serbest metin), bu yüzden `categories` tablosunun
 * anahtarları Türkçe kalır ve yalnızca gösterim adı çevrilir. Filtre
 * değerlerinin değişmemesi mevcut ilanların kaybolmasını önler.
 */
export const PRODUCT_CATEGORY_KEYS = [
  "Eldiven",
  "Kimono / Gi",
  "Koruyucu",
  "Şort / Rashguard",
  "Kum torbası",
  "Ayakkabı",
  "Bandaj",
  "Diğer",
] as const;

export type ProductCategoryKey = (typeof PRODUCT_CATEGORY_KEYS)[number];

type Copy = {
  list: {
    meta: { title: string; description: string };
    title: string;
    /** {rate} → komisyon yüzdesi */
    subtitle: string;
    createListing: string;
    filterCategory: string;
    filterDiscipline: string;
    filterCondition: string;
    filterSort: string;
    sortNew: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
  };
  detail: {
    notFound: string;
    breadcrumb: string;
    soldOutBadge: string;
    /** {count} → stok adedi */
    stock: string;
    shippingAvailable: string;
    pickupOnly: string;
    /** {time} → üyelik süresi */
    memberSince: string;
    ownListingTitle: string;
    ownListingLead: string;
    ownListingLink: string;
    ownListingTail: string;
    soldOutTitle: string;
    soldOutLead: string;
    soldOutLink: string;
    soldOutTail: string;
    loginBody: string;
    login: string;
    /** {rate} → komisyon yüzdesi */
    feeNote: string;
  };
  conditions: { NEW: string; LIKE_NEW: string; USED: string };
  categories: Record<ProductCategoryKey, string>;
};

export const marketplaceCopy: Record<Locale, Copy> = {
  de: {
    list: {
      meta: {
        title: "Ausrüstungsmarkt",
        description:
          "Kampfsport-Ausrüstung: Handschuhe, Kimono, Schoner, Boxsack. Kaufen, verkaufen, tauschen.",
      },
      title: "Ausrüstungsmarkt",
      subtitle: "Kampfsport-Ausrüstung — Plattformprovision {rate} %",
      createListing: "Anzeige aufgeben",
      filterCategory: "Kategorie",
      filterDiscipline: "Disziplin",
      filterCondition: "Zustand",
      filterSort: "Sortierung",
      sortNew: "Neueste",
      sortPriceAsc: "Günstigste zuerst",
      sortPriceDesc: "Teuerste zuerst",
      searchPlaceholder: "Artikel suchen…",
      emptyTitle: "Kein Artikel gefunden",
      emptyBody:
        "Gib die erste Anzeige auf — biete der Community Ausrüstung an, die du nicht mehr brauchst.",
    },
    detail: {
      notFound: "Anzeige nicht gefunden",
      breadcrumb: "Ausrüstungsmarkt",
      soldOutBadge: "Ausverkauft",
      stock: "{count} Stück auf Lager",
      shippingAvailable: "Versand möglich",
      pickupOnly: "Nur Abholung",
      memberSince: "Mitglied seit {time}",
      ownListingTitle: "Das ist deine eigene Anzeige",
      ownListingLead: "Zum Bearbeiten oder Zurückziehen geh auf",
      ownListingLink: "Meine Anzeigen",
      ownListingTail: ".",
      soldOutTitle: "Diese Anzeige ist ausverkauft",
      soldOutLead: "Für ähnliche Ausrüstung",
      soldOutLink: "schau dich im Markt um",
      soldOutTail: ".",
      loginBody: "Zum Bestellen musst du angemeldet sein.",
      login: "Anmelden",
      feeNote:
        "FIGHTNET erhebt {rate} % Provision auf Verkäufe. Dopingmittel, Wirkversprechen für Nahrungsergänzung und Produkte zum Gewichtmachen sind verboten — melde Anzeigen, die gegen die Regeln verstoßen.",
    },
    conditions: { NEW: "Neu", LIKE_NEW: "Wie neu", USED: "Gebraucht" },
    categories: {
      Eldiven: "Handschuhe",
      "Kimono / Gi": "Kimono / Gi",
      Koruyucu: "Schoner",
      "Şort / Rashguard": "Shorts / Rashguard",
      "Kum torbası": "Boxsack",
      Ayakkabı: "Schuhe",
      Bandaj: "Bandagen",
      Diğer: "Sonstiges",
    },
  },

  en: {
    list: {
      meta: {
        title: "Gear marketplace",
        description:
          "Combat sports gear: gloves, kimonos, protective equipment, punching bags. Buy, sell, trade.",
      },
      title: "Gear marketplace",
      subtitle: "Combat sports gear — platform commission {rate} %",
      createListing: "Post a listing",
      filterCategory: "Category",
      filterDiscipline: "Discipline",
      filterCondition: "Condition",
      filterSort: "Sorting",
      sortNew: "Newest",
      sortPriceAsc: "Cheapest first",
      sortPriceDesc: "Most expensive first",
      searchPlaceholder: "Search for an item…",
      emptyTitle: "No item found",
      emptyBody: "Post the first listing — offer the community the gear you no longer use.",
    },
    detail: {
      notFound: "Listing not found",
      breadcrumb: "Gear marketplace",
      soldOutBadge: "Sold out",
      stock: "{count} in stock",
      shippingAvailable: "Shipping available",
      pickupOnly: "Collection only",
      memberSince: "Member for {time}",
      ownListingTitle: "This is your own listing",
      ownListingLead: "To edit it or take it down, go to",
      ownListingLink: "My listings",
      ownListingTail: ".",
      soldOutTitle: "This listing is sold out",
      soldOutLead: "For similar gear,",
      soldOutLink: "browse the marketplace",
      soldOutTail: ".",
      loginBody: "You need to be logged in to place an order.",
      login: "Log in",
      feeNote:
        "FIGHTNET takes {rate} % commission on sales. Doping substances, supplement claims and weight-cutting products are prohibited — report any listing that breaks the rules.",
    },
    conditions: { NEW: "New", LIKE_NEW: "Like new", USED: "Used" },
    categories: {
      Eldiven: "Gloves",
      "Kimono / Gi": "Kimono / Gi",
      Koruyucu: "Protective gear",
      "Şort / Rashguard": "Shorts / Rashguard",
      "Kum torbası": "Punching bag",
      Ayakkabı: "Shoes",
      Bandaj: "Hand wraps",
      Diğer: "Other",
    },
  },

  tr: {
    list: {
      meta: {
        title: "Ekipman Pazarı",
        description: "Dövüş sporu ekipmanları: eldiven, kimono, koruyucu, torba. Al, sat, takas et.",
      },
      title: "Ekipman Pazarı",
      subtitle: "Dövüş sporu ekipmanları — platform komisyonu %{rate}",
      createListing: "İlan Ver",
      filterCategory: "Kategori",
      filterDiscipline: "Disiplin",
      filterCondition: "Durum",
      filterSort: "Sıralama",
      sortNew: "En yeni",
      sortPriceAsc: "Ucuzdan pahalıya",
      sortPriceDesc: "Pahalıdan ucuza",
      searchPlaceholder: "Ürün ara…",
      emptyTitle: "Ürün bulunamadı",
      emptyBody: "İlk ilanı sen ver — kullanmadığın ekipmanı topluluğa sun.",
    },
    detail: {
      notFound: "İlan bulunamadı",
      breadcrumb: "Ekipman Pazarı",
      soldOutBadge: "Tükendi",
      stock: "{count} adet stokta",
      shippingAvailable: "Kargo var",
      pickupOnly: "Yalnızca elden teslim",
      memberSince: "{time} beri üye",
      ownListingTitle: "Bu senin ilanın",
      ownListingLead: "Düzenlemek veya yayından kaldırmak için",
      ownListingLink: "İlanlarım",
      ownListingTail: " sayfasına git.",
      soldOutTitle: "Bu ilan tükendi",
      soldOutLead: "Benzer ekipmanlar için",
      soldOutLink: "pazara göz at",
      soldOutTail: ".",
      loginBody: "Sipariş vermek için giriş yapmalısın.",
      login: "Giriş yap",
      feeNote:
        "FIGHTNET satışlardan %{rate} komisyon alır. Doping maddesi, takviye iddiası ve kilo düşürme ürünleri yasaktır — kurallara aykırı ilanları bildir.",
    },
    conditions: { NEW: "Sıfır", LIKE_NEW: "Sıfır gibi", USED: "Kullanılmış" },
    categories: {
      Eldiven: "Eldiven",
      "Kimono / Gi": "Kimono / Gi",
      Koruyucu: "Koruyucu",
      "Şort / Rashguard": "Şort / Rashguard",
      "Kum torbası": "Kum torbası",
      Ayakkabı: "Ayakkabı",
      Bandaj: "Bandaj",
      Diğer: "Diğer",
    },
  },
};
