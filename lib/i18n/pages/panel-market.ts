import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel/pazar`, `/panel/pazar/yeni` ve pazar bileşenleri
 * (`product-forms`, `order-actions`).
 *
 * Kategori değerleri KANONİK (Türkçe) kalır — veritabanına ve `productSchema`
 * doğrulamasına giden metin dile göre değişmemeli. Yalnızca ekranda gösterilen
 * etiket çevrilir; eşleme `categories` altında tutulur.
 */
export const PRODUCT_CATEGORY_VALUES = [
  "Eldiven", "Kimono / Gi", "Koruyucu", "Şort / Rashguard",
  "Kum torbası", "Ayakkabı", "Bandaj", "Diğer",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORY_VALUES)[number];

type OrderStatusKey = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";

type Copy = {
  meta: { title: string };
  title: string;
  /** `pct` = MARKETPLACE_FEE_RATE * 100 */
  subtitle: (pct: number) => string;
  newListing: string;
  verifyAlert: { title: string; body: string; link: string };
  myListings: string;
  emptyProducts: { title: string; description: string; action: string };
  stockCount: (n: number) => string;
  viewCount: (n: number) => string;
  active: string;
  inactive: string;
  incoming: { title: string; subtitle: string; empty: string };
  commission: (amount: string) => string;
  myOrders: { title: string; empty: string };
  orderStatus: Record<OrderStatusKey, string>;

  new: {
    meta: { title: string };
    title: string;
    subtitle: (pct: number) => string;
    forbidden: { title: string; body: string };
  };

  categories: Record<ProductCategory, string>;

  form: {
    submit: string;
    title: string;
    titlePlaceholder: string;
    description: string;
    descriptionHint: string;
    category: string;
    categoryEmpty: string;
    discipline: string;
    disciplineHint: string;
    disciplineAny: string;
    condition: string;
    conditionNew: string;
    conditionLikeNew: string;
    conditionUsed: string;
    price: string;
    stock: string;
    city: string;
    cityHint: string;
    cityPlaceholder: string;
    feePrefix: (pct: number) => string;
    feeRemainder: string;
    shipping: string;
    images: string;
    imagesHint: string;
    removeImageAria: string;
    addImage: string;
  };

  actions: {
    unpublish: string;
    publish: string;
    deletePermanently: string;
    cancel: string;
    deleteAria: string;
  };

  order: {
    submit: string;
    noticeBefore: string;
    noticeStrong: string;
    noticeAfter: string;
    quantity: string;
    unitPrice: string;
    unitPriceHint: string;
    name: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    countries: { DE: string; AT: string; CH: string };
    note: string;
    notePlaceholder: string;
  };

  seller: {
    markPaid: string;
    markShipped: string;
    markDelivered: string;
    cancel: string;
  };
};

export const panelMarketCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Meine Inserate" },
    title: "Ausrüstungs-Marktplatz",
    subtitle: (pct) =>
      `Deine Inserate, eingehende Bestellungen und deine Käufe — Provision ${pct} %`,
    newListing: "Neues Inserat",
    verifyAlert: {
      title: "Für ein Inserat ist eine Verifizierung nötig",
      body: "Vertrauen auf dem Marktplatz entsteht durch eine verifizierte Identität.",
      link: "Auf Stufe 1 wechseln",
    },
    myListings: "Meine Inserate",
    emptyProducts: {
      title: "Du hast noch keine Inserate",
      description: "Biete der Community deine ungenutzten Handschuhe, dein Kimono oder deinen Schutz an.",
      action: "Inserat aufgeben",
    },
    stockCount: (n) => `${n} Stück`,
    viewCount: (n) => `${n} Aufrufe`,
    active: "Veröffentlicht",
    inactive: "Inaktiv",
    incoming: {
      title: "Eingehende Bestellungen",
      subtitle: "Anfragen, die dich als Verkäufer erreichen",
      empty: "Noch keine Bestellungen",
    },
    commission: (amount) => `(Provision ${amount})`,
    myOrders: { title: "Meine Bestellungen", empty: "Du hast noch nichts gekauft" },
    orderStatus: {
      PENDING: "Ausstehend",
      PAID: "Bezahlt",
      SHIPPED: "Versandt",
      DELIVERED: "Zugestellt",
      CANCELLED: "Storniert",
      REFUNDED: "Erstattet",
    },

    new: {
      meta: { title: "Neues Inserat" },
      title: "Neues Inserat",
      subtitle: (pct) =>
        `Biete deine Ausrüstung der Community an — beim Verkauf ${pct} % Plattform-Provision`,
      forbidden: {
        title: "Was nicht verkauft werden darf",
        body:
          "Dopingmittel, Produkte mit Supplement-Versprechen, Hilfsmittel zum Gewichtmachen und gebrauchte Mundschutze dürfen nicht eingestellt werden. Inserate, die gegen die Regeln verstoßen, werden entfernt.",
      },
    },

    categories: {
      "Eldiven": "Handschuhe",
      "Kimono / Gi": "Kimono / Gi",
      "Koruyucu": "Schutzausrüstung",
      "Şort / Rashguard": "Shorts / Rashguard",
      "Kum torbası": "Sandsack",
      "Ayakkabı": "Schuhe",
      "Bandaj": "Bandagen",
      "Diğer": "Sonstiges",
    },

    form: {
      submit: "Inserat veröffentlichen",
      title: "Titel",
      titlePlaceholder: "Fairtex BGV1 Boxhandschuhe 16 oz",
      description: "Beschreibung",
      descriptionHint: "Zustand, Nutzungsdauer, Mängel — sei ehrlich",
      category: "Kategorie",
      categoryEmpty: "Auswählen",
      discipline: "Disziplin",
      disciplineHint: "Optional",
      disciplineAny: "Egal",
      condition: "Zustand",
      conditionNew: "Neu",
      conditionLikeNew: "Wie neu",
      conditionUsed: "Gebraucht",
      price: "Preis (€)",
      stock: "Stückzahl",
      city: "Stadt",
      cityHint: "Für die Abholung",
      cityPlaceholder: "Frankfurt",
      feePrefix: (pct) => `Kommt der Verkauf zustande, beträgt die Plattform-Provision ${pct} % =`,
      feeRemainder: "Für dich bleiben:",
      shipping: "Ich versende",
      images: "Bilder",
      imagesHint: "Maximal 8 · das erste Bild wird zum Titelbild",
      removeImageAria: "Bild entfernen",
      addImage: "Hinzufügen",
    },

    actions: {
      unpublish: "Offline nehmen",
      publish: "Online stellen",
      deletePermanently: "Endgültig löschen",
      cancel: "Abbrechen",
      deleteAria: "Inserat löschen",
    },

    order: {
      submit: "Bestellung senden",
      noticeBefore: "Eine Bestellung ist eine ",
      noticeStrong: "Reservierung",
      noticeAfter:
        ". Die Zahlung erfolgt derzeit direkt zwischen Käufer und Verkäufer; FIGHTNET zieht nichts ein. Bei Streitigkeiten kannst du das Inserat melden.",
      quantity: "Stückzahl",
      unitPrice: "Stückpreis",
      unitPriceHint: "Die Summe wird mit der Stückzahl multipliziert",
      name: "Vor- und Nachname",
      street: "Adresse",
      postalCode: "Postleitzahl",
      city: "Stadt",
      country: "Land",
      countries: { DE: "Deutschland", AT: "Österreich", CH: "Schweiz" },
      note: "Notiz an den Verkäufer",
      notePlaceholder: "Ich würde die Abholung bevorzugen…",
    },

    seller: {
      markPaid: "Zahlung erhalten",
      markShipped: "Versandt",
      markDelivered: "Zugestellt",
      cancel: "Stornieren",
    },
  },

  en: {
    meta: { title: "My listings" },
    title: "Gear marketplace",
    subtitle: (pct) => `Your listings, incoming orders and your purchases — ${pct}% commission`,
    newListing: "New listing",
    verifyAlert: {
      title: "Verification required to post a listing",
      body: "Trust on the marketplace comes from a verified identity.",
      link: "Move up to Level 1",
    },
    myListings: "My listings",
    emptyProducts: {
      title: "You have no listings yet",
      description: "Offer the community the gloves, gi or protective gear you no longer use.",
      action: "Post a listing",
    },
    stockCount: (n) => `${n} in stock`,
    viewCount: (n) => `${n} views`,
    active: "Published",
    inactive: "Inactive",
    incoming: {
      title: "Incoming orders",
      subtitle: "Requests that reach you as a seller",
      empty: "No orders yet",
    },
    commission: (amount) => `(commission ${amount})`,
    myOrders: { title: "My orders", empty: "You have not bought anything yet" },
    orderStatus: {
      PENDING: "Pending",
      PAID: "Paid",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      REFUNDED: "Refunded",
    },

    new: {
      meta: { title: "New listing" },
      title: "New listing",
      subtitle: (pct) => `Offer your gear to the community — ${pct}% platform commission on a sale`,
      forbidden: {
        title: "What cannot be sold",
        body:
          "Doping substances, products making supplement claims, weight-cutting aids and second-hand mouthguards cannot be listed. Listings that break the rules are removed.",
      },
    },

    categories: {
      "Eldiven": "Gloves",
      "Kimono / Gi": "Kimono / Gi",
      "Koruyucu": "Protective gear",
      "Şort / Rashguard": "Shorts / Rashguard",
      "Kum torbası": "Punching bag",
      "Ayakkabı": "Shoes",
      "Bandaj": "Hand wraps",
      "Diğer": "Other",
    },

    form: {
      submit: "Publish listing",
      title: "Title",
      titlePlaceholder: "Fairtex BGV1 boxing gloves 16 oz",
      description: "Description",
      descriptionHint: "Condition, how long it was used, flaws — be honest",
      category: "Category",
      categoryEmpty: "Select",
      discipline: "Discipline",
      disciplineHint: "Optional",
      disciplineAny: "Any",
      condition: "Condition",
      conditionNew: "New",
      conditionLikeNew: "Like new",
      conditionUsed: "Used",
      price: "Price (€)",
      stock: "Quantity",
      city: "City",
      cityHint: "For local pickup",
      cityPlaceholder: "Frankfurt",
      feePrefix: (pct) => `If the sale goes through, the platform commission is ${pct}% =`,
      feeRemainder: "You keep:",
      shipping: "I ship items",
      images: "Images",
      imagesHint: "Up to 8 · the first image becomes the cover",
      removeImageAria: "Remove image",
      addImage: "Add",
    },

    actions: {
      unpublish: "Unpublish",
      publish: "Publish",
      deletePermanently: "Delete permanently",
      cancel: "Cancel",
      deleteAria: "Delete listing",
    },

    order: {
      submit: "Send order",
      noticeBefore: "An order is a ",
      noticeStrong: "reservation",
      noticeAfter:
        ". Payment currently happens directly between buyer and seller; FIGHTNET does not collect anything. If there is a dispute, you can report the listing.",
      quantity: "Quantity",
      unitPrice: "Unit price",
      unitPriceHint: "The total is calculated by multiplying with the quantity",
      name: "Full name",
      street: "Address",
      postalCode: "Postcode",
      city: "City",
      country: "Country",
      countries: { DE: "Germany", AT: "Austria", CH: "Switzerland" },
      note: "Note to the seller",
      notePlaceholder: "I would prefer local pickup…",
    },

    seller: {
      markPaid: "Payment received",
      markShipped: "Shipped it",
      markDelivered: "Delivered",
      cancel: "Cancel",
    },
  },

  tr: {
    meta: { title: "İlanlarım" },
    title: "Ekipman Pazarı",
    subtitle: (pct) => `İlanların, gelen siparişler ve satın aldıkların — komisyon %${pct}`,
    newListing: "Yeni İlan",
    verifyAlert: {
      title: "İlan vermek için doğrulama gerekli",
      body: "Pazarda güven, doğrulanmış kimlikten gelir.",
      link: "Seviye 1'e geç",
    },
    myListings: "İlanlarım",
    emptyProducts: {
      title: "Henüz ilanın yok",
      description: "Kullanmadığın eldiveni, kimonoyu ya da koruyucuyu topluluğa sun.",
      action: "İlan ver",
    },
    stockCount: (n) => `${n} adet`,
    viewCount: (n) => `${n} görüntülenme`,
    active: "Yayında",
    inactive: "Pasif",
    incoming: {
      title: "Gelen Siparişler",
      subtitle: "Satıcı olarak sana ulaşan talepler",
      empty: "Henüz sipariş yok",
    },
    commission: (amount) => `(komisyon ${amount})`,
    myOrders: { title: "Siparişlerim", empty: "Henüz satın alman yok" },
    orderStatus: {
      PENDING: "Beklemede",
      PAID: "Ödendi",
      SHIPPED: "Kargoda",
      DELIVERED: "Teslim edildi",
      CANCELLED: "İptal",
      REFUNDED: "İade",
    },

    new: {
      meta: { title: "Yeni İlan" },
      title: "Yeni İlan",
      subtitle: (pct) => `Ekipmanını topluluğa sun — satışta %${pct} platform komisyonu`,
      forbidden: {
        title: "Neler satılamaz",
        body:
          "Doping maddeleri, takviye iddiası içeren ürünler, kilo düşürme yardımcıları ve ikinci el koruyucu ağızlıklar yayınlanamaz. Kurallara aykırı ilanlar kaldırılır.",
      },
    },

    categories: {
      "Eldiven": "Eldiven",
      "Kimono / Gi": "Kimono / Gi",
      "Koruyucu": "Koruyucu",
      "Şort / Rashguard": "Şort / Rashguard",
      "Kum torbası": "Kum torbası",
      "Ayakkabı": "Ayakkabı",
      "Bandaj": "Bandaj",
      "Diğer": "Diğer",
    },

    form: {
      submit: "İlanı Yayınla",
      title: "Başlık",
      titlePlaceholder: "Fairtex BGV1 boks eldiveni 16 oz",
      description: "Açıklama",
      descriptionHint: "Durum, kullanım süresi, kusurlar — dürüst ol",
      category: "Kategori",
      categoryEmpty: "Seç",
      discipline: "Disiplin",
      disciplineHint: "Opsiyonel",
      disciplineAny: "Fark etmez",
      condition: "Durum",
      conditionNew: "Sıfır",
      conditionLikeNew: "Sıfır gibi",
      conditionUsed: "Kullanılmış",
      price: "Fiyat (€)",
      stock: "Adet",
      city: "Şehir",
      cityHint: "Elden teslim için",
      cityPlaceholder: "Frankfurt",
      feePrefix: (pct) => `Satış gerçekleşirse platform komisyonu %${pct} =`,
      feeRemainder: "Sana kalan:",
      shipping: "Kargo gönderimi yapıyorum",
      images: "Görseller",
      imagesHint: "En fazla 8 · ilk görsel kapak olur",
      removeImageAria: "Görseli kaldır",
      addImage: "Ekle",
    },

    actions: {
      unpublish: "Yayından kaldır",
      publish: "Yayına al",
      deletePermanently: "Kalıcı olarak sil",
      cancel: "Vazgeç",
      deleteAria: "İlanı sil",
    },

    order: {
      submit: "Siparişi Gönder",
      noticeBefore: "Sipariş bir ",
      noticeStrong: "rezervasyondur",
      noticeAfter:
        ". Ödeme şu an alıcı ve satıcı arasında yapılır; FIGHTNET tarafı tahsil etmez. Anlaşmazlıkta ilanı bildirebilirsin.",
      quantity: "Adet",
      unitPrice: "Birim fiyat",
      unitPriceHint: "Toplam, adet ile çarpılarak hesaplanır",
      name: "Ad Soyad",
      street: "Adres",
      postalCode: "Posta kodu",
      city: "Şehir",
      country: "Ülke",
      countries: { DE: "Almanya", AT: "Avusturya", CH: "İsviçre" },
      note: "Satıcıya not",
      notePlaceholder: "Elden teslim tercih ederim…",
    },

    seller: {
      markPaid: "Ödeme alındı",
      markShipped: "Kargoya verdim",
      markDelivered: "Teslim edildi",
      cancel: "İptal et",
    },
  },
};
