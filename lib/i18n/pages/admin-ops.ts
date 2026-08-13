import type { Locale } from "@/lib/i18n/config";

/**
 * Admin operasyon sayfalarının metinleri (§5.2).
 *
 * Kapsanan sayfalar: etkinlikler, passport, forum, spotlight, sponsorlar,
 * veri-lisansi, reklamlar, bekleme-listesi, beta-kodlari, servisler.
 *
 * Not: Zod doğrulama mesajları ve sunucu eylemlerinin döndürdüğü serbest metin
 * hatalar bilinçli olarak Türkçe kalır — bunlar yalnızca yöneticiye görünür ve
 * `lib/validators.ts` tek kaynak olarak korunur.
 */

/* ─────────────────────────── Etkinlikler ─────────────────────────── */

type EventsCopy = {
  meta: { title: string };
  title: string;
  subtitle: (total: number) => string;
  filterStatus: string;
  status: {
    draft: string;
    published: string;
    live: string;
    finished: string;
    cancelled: string;
  };
  searchPlaceholder: string;
  empty: string;
  fights: string;
  liveComments: string;
  views: string;
  publish: string;
  goLive: string;
  finish: string;
  cancel: string;
};

export const adminEventsCopy: Record<Locale, EventsCopy> = {
  de: {
    meta: { title: "Events" },
    title: "Events",
    subtitle: (total) => `${total} Events — Veröffentlichungsstatus und Livescore-Steuerung`,
    filterStatus: "Status",
    status: {
      draft: "Entwurf",
      published: "Veröffentlicht",
      live: "Live",
      finished: "Beendet",
      cancelled: "Abgesagt",
    },
    searchPlaceholder: "Event suchen…",
    empty: "Keine Events gefunden",
    fights: "Kämpfe",
    liveComments: "Live-Kommentare",
    views: "Aufrufe",
    publish: "Veröffentlichen",
    goLive: "Live schalten",
    finish: "Beenden",
    cancel: "Absagen",
  },
  en: {
    meta: { title: "Events" },
    title: "Events",
    subtitle: (total) => `${total} events — publication status and live score control`,
    filterStatus: "Status",
    status: {
      draft: "Draft",
      published: "Published",
      live: "Live",
      finished: "Finished",
      cancelled: "Cancelled",
    },
    searchPlaceholder: "Search events…",
    empty: "No events found",
    fights: "fights",
    liveComments: "live comments",
    views: "views",
    publish: "Publish",
    goLive: "Go live",
    finish: "Finish",
    cancel: "Cancel",
  },
  tr: {
    meta: { title: "Etkinlikler" },
    title: "Etkinlikler",
    subtitle: (total) => `${total} etkinlik — yayın durumu ve canlı skor kontrolü`,
    filterStatus: "Durum",
    status: {
      draft: "Taslak",
      published: "Yayında",
      live: "Canlı",
      finished: "Tamamlandı",
      cancelled: "İptal",
    },
    searchPlaceholder: "Etkinlik ara…",
    empty: "Etkinlik bulunamadı",
    fights: "müsabaka",
    liveComments: "canlı yorum",
    views: "görüntülenme",
    publish: "Yayınla",
    goLive: "Canlıya Al",
    finish: "Bitir",
    cancel: "İptal",
  },
};

/* ──────────────────────────── Passport ───────────────────────────── */

type PassportCopy = {
  meta: { title: string };
  title: string;
  subtitle: (count: number) => string;
  emptyTitle: string;
  emptyDescription: string;
  issued: string;
  expires: string;
  openDocument: string;
};

export const adminPassportCopy: Record<Locale, PassportCopy> = {
  de: {
    meta: { title: "Passport-Dokumente" },
    title: "Passport-Dokumente",
    subtitle: (count) => `${count} Dokumente warten auf Prüfung — Stufe Beweis-Sammler (§9.1)`,
    emptyTitle: "Warteschlange leer",
    emptyDescription: "Keine offenen Dokumente.",
    issued: "Ausgestellt",
    expires: "Gültig bis",
    openDocument: "Dokument vergrößern",
  },
  en: {
    meta: { title: "Passport documents" },
    title: "Passport documents",
    subtitle: (count) => `${count} documents awaiting review — Evidence Collector level (§9.1)`,
    emptyTitle: "Queue is clear",
    emptyDescription: "No pending documents.",
    issued: "Issued",
    expires: "Valid until",
    openDocument: "Enlarge document",
  },
  tr: {
    meta: { title: "Passport Belgeleri" },
    title: "Passport Belgeleri",
    subtitle: (count) => `${count} belge inceleme bekliyor — Kanıt Toplayıcı seviyesi (§9.1)`,
    emptyTitle: "Kuyruk temiz",
    emptyDescription: "Bekleyen belge yok.",
    issued: "Veriliş",
    expires: "Geçerlilik",
    openDocument: "Belgeyi büyüt",
  },
};

/* ───────────────────────────── Forum ─────────────────────────────── */

type ForumCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  categories: string;
  threadsCount: (count: number) => string;
  recentThreads: string;
  emptyThreads: string;
  pinned: string;
  locked: string;
  replies: string;
  views: string;
  pin: string;
  unpin: string;
  lock: string;
  unlock: string;
};

export const adminForumCopy: Record<Locale, ForumCopy> = {
  de: {
    meta: { title: "Forum-Verwaltung" },
    title: "Forum-Verwaltung",
    subtitle: "Kategorien, Themen und Moderation",
    categories: "Kategorien",
    threadsCount: (count) => `${count} Themen`,
    recentThreads: "Neueste Themen",
    emptyThreads: "Keine Themen",
    pinned: "Angepinnt",
    locked: "Gesperrt",
    replies: "Antworten",
    views: "Aufrufe",
    pin: "Anpinnen",
    unpin: "Pin entfernen",
    lock: "Sperren",
    unlock: "Entsperren",
  },
  en: {
    meta: { title: "Forum administration" },
    title: "Forum administration",
    subtitle: "Categories, threads and moderation",
    categories: "Categories",
    threadsCount: (count) => `${count} threads`,
    recentThreads: "Latest threads",
    emptyThreads: "No threads",
    pinned: "Pinned",
    locked: "Locked",
    replies: "replies",
    views: "views",
    pin: "Pin",
    unpin: "Unpin",
    lock: "Lock",
    unlock: "Unlock",
  },
  tr: {
    meta: { title: "Forum Yönetimi" },
    title: "Forum Yönetimi",
    subtitle: "Kategoriler, konular ve moderasyon",
    categories: "Kategoriler",
    threadsCount: (count) => `${count} konu`,
    recentThreads: "Son Konular",
    emptyThreads: "Konu yok",
    pinned: "Sabit",
    locked: "Kilitli",
    replies: "yanıt",
    views: "görüntülenme",
    pin: "Sabitle",
    unpin: "Sabiti Kaldır",
    lock: "Kilitle",
    unlock: "Kilidi Aç",
  },
};

/* ─────────────────────────── Spotlight ───────────────────────────── */

type SpotlightCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  scheduled: string;
  empty: string;
  delete: string;
};

export const adminSpotlightCopy: Record<Locale, SpotlightCopy> = {
  de: {
    meta: { title: "Spotlight" },
    title: "Athlet des Tages",
    subtitle: "Lege fest, welcher Athlet auf der Startseite hervorgehoben wird (§4.1 Spotlight)",
    scheduled: "Geplante Spotlights",
    empty: "Noch keine Spotlights",
    delete: "Löschen",
  },
  en: {
    meta: { title: "Spotlight" },
    title: "Athlete of the day",
    subtitle: "Choose the athlete to be featured on the homepage (§4.1 Spotlight)",
    scheduled: "Scheduled spotlights",
    empty: "No spotlights yet",
    delete: "Delete",
  },
  tr: {
    meta: { title: "Spotlight" },
    title: "Günün Sporcusu",
    subtitle: "Ana sayfada öne çıkarılacak sporcuyu belirle (§4.1 Spotlight)",
    scheduled: "Planlanmış Spotlight'lar",
    empty: "Henüz spotlight yok",
    delete: "Sil",
  },
};

/* ─────────────────────────── Sponsorlar ──────────────────────────── */

type SponsorsCopy = {
  meta: { title: string };
  title: string;
  subtitle: (brands: number, offers: number, pending: number) => string;
  appStatus: {
    APPLIED: string;
    ACCEPTED: string;
    REJECTED: string;
    OPEN: string;
    CLOSED: string;
  };
  applications: { heading: string; subtitle: string; empty: string };
  followers: string;
  offers: { heading: string; empty: string; emptyDescription: string };
  applicationsBadge: (count: number) => string;
  open: string;
  closed: string;
  minFollowers: (value: string) => string;
  deadline: (date: string) => string;
  newOffer: string;
  newSponsor: string;
};

export const adminSponsorsCopy: Record<Locale, SponsorsCopy> = {
  de: {
    meta: { title: "Sponsoren" },
    title: "Sponsoren-Portal",
    subtitle: (brands, offers, pending) =>
      `${brands} Marken · ${offers} Angebote · ${pending} Bewerbungen offen`,
    appStatus: {
      APPLIED: "Beworben",
      ACCEPTED: "Angenommen",
      REJECTED: "Abgelehnt",
      OPEN: "Offen",
      CLOSED: "Geschlossen",
    },
    applications: {
      heading: "Bewerbungen",
      subtitle: "Sponsoring-Anfragen von Athletinnen und Athleten",
      empty: "Keine Bewerbungen",
    },
    followers: "Follower",
    offers: {
      heading: "Angebote",
      empty: "Keine Angebote",
      emptyDescription: "Veröffentliche unten das erste Sponsoring-Angebot.",
    },
    applicationsBadge: (count) => `${count} Bewerbungen`,
    open: "Offen",
    closed: "Geschlossen",
    minFollowers: (value) => `min. ${value} Follower`,
    deadline: (date) => `bis ${date}`,
    newOffer: "Neues Angebot",
    newSponsor: "Neue Sponsorenmarke",
  },
  en: {
    meta: { title: "Sponsors" },
    title: "Sponsor portal",
    subtitle: (brands, offers, pending) =>
      `${brands} brands · ${offers} offers · ${pending} applications pending`,
    appStatus: {
      APPLIED: "Applied",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      OPEN: "Open",
      CLOSED: "Closed",
    },
    applications: {
      heading: "Applications",
      subtitle: "Sponsorship requests from athletes",
      empty: "No applications",
    },
    followers: "followers",
    offers: {
      heading: "Offers",
      empty: "No offers",
      emptyDescription: "Publish the first sponsorship offer below.",
    },
    applicationsBadge: (count) => `${count} applications`,
    open: "Open",
    closed: "Closed",
    minFollowers: (value) => `min ${value} followers`,
    deadline: (date) => `due ${date}`,
    newOffer: "New offer",
    newSponsor: "New sponsor brand",
  },
  tr: {
    meta: { title: "Sponsorlar" },
    title: "Sponsor Portalı",
    subtitle: (brands, offers, pending) =>
      `${brands} marka · ${offers} teklif · ${pending} başvuru bekliyor`,
    appStatus: {
      APPLIED: "Başvurdu",
      ACCEPTED: "Kabul",
      REJECTED: "Ret",
      OPEN: "Açık",
      CLOSED: "Kapalı",
    },
    applications: {
      heading: "Başvurular",
      subtitle: "Sporcuların sponsorluk talepleri",
      empty: "Başvuru yok",
    },
    followers: "takipçi",
    offers: {
      heading: "Teklifler",
      empty: "Teklif yok",
      emptyDescription: "Aşağıdan ilk sponsorluk teklifini yayınla.",
    },
    applicationsBadge: (count) => `${count} başvuru`,
    open: "Açık",
    closed: "Kapalı",
    minFollowers: (value) => `min ${value} takipçi`,
    deadline: (date) => `son ${date}`,
    newOffer: "Yeni Teklif",
    newSponsor: "Yeni Sponsor Markası",
  },
};

/* ────────────────────────── Veri lisansı ─────────────────────────── */

type DataLicenseCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  publicPage: string;
  status: {
    REQUESTED: string;
    TRIAL: string;
    ACTIVE: string;
    SUSPENDED: string;
    EXPIRED: string;
    REJECTED: string;
  };
  stats: {
    pending: string;
    active: string;
    revenue: string;
    revenueHint: (min: number, max: number) => string;
  };
  alert: { title: string; body: string };
  empty: { title: string; description: string };
  applications: { heading: string; subtitle: (count: number) => string };
  expiredBadge: string;
  vat: string;
  key: string;
  perYear: string;
  rateLimit: string;
  requests: string;
  lastUsed: (when: string) => string;
  note: string;
};

export const adminDataLicenseCopy: Record<Locale, DataLicenseCopy> = {
  de: {
    meta: { title: "Datenlizenz" },
    title: "Datenlizenz",
    subtitle:
      "§4.4 — B2B-API-Zugang. Lizenziert werden ausschließlich die nach §8.3 öffentlich zugänglichen Daten.",
    publicPage: "Öffentliche Seite",
    status: {
      REQUESTED: "Ausstehend",
      TRIAL: "Testphase",
      ACTIVE: "Aktiv",
      SUSPENDED: "Ausgesetzt",
      EXPIRED: "Abgelaufen",
      REJECTED: "Abgelehnt",
    },
    stats: {
      pending: "Offene Anträge",
      active: "Aktive Lizenzen",
      revenue: "Jährliche Lizenzerlöse",
      revenueHint: (min, max) => `Verbandsband ${min}-${max} €`,
    },
    alert: {
      title: "Vor der Freigabe",
      body:
        "Ist der Anwendungsfall konkret? Steht der beantragte Umfang im Verhältnis zum Zweck? Für Gesundheitsdaten, Trainingstagebuch, Nachrichten oder minderjährige Nutzerinnen und Nutzer gibt es keine Ausnahme — diese Daten sind in der API ohnehin nicht enthalten.",
    },
    empty: {
      title: "Noch keine Anträge",
      description: "Anträge von Verbänden und Medien laufen über die Seite /datenlizenz ein.",
    },
    applications: { heading: "Anträge", subtitle: (count) => `${count} Einträge` },
    expiredBadge: "Frist abgelaufen",
    vat: "USt-IdNr.",
    key: "Schlüssel",
    perYear: "/Jahr",
    rateLimit: "Anfragen/Min.",
    requests: "Anfragen",
    lastUsed: (when) => `zuletzt genutzt ${when}`,
    note: "Notiz:",
  },
  en: {
    meta: { title: "Data licence" },
    title: "Data licence",
    subtitle: "§4.4 — B2B API access. Only data that is public under §8.3 is ever licensed.",
    publicPage: "Public page",
    status: {
      REQUESTED: "Pending",
      TRIAL: "Trial",
      ACTIVE: "Active",
      SUSPENDED: "Suspended",
      EXPIRED: "Expired",
      REJECTED: "Rejected",
    },
    stats: {
      pending: "Pending requests",
      active: "Active licences",
      revenue: "Annual licence revenue",
      revenueHint: (min, max) => `Federation band ${min}-${max} €`,
    },
    alert: {
      title: "Before you approve",
      body:
        "Is the use case concrete? Is the requested scope proportionate to the purpose? No exception is ever made for health data, training logs, messages or underage users — that data is not in the API to begin with.",
    },
    empty: {
      title: "No requests yet",
      description: "Federation and media requests come in through the /data-license page.",
    },
    applications: { heading: "Requests", subtitle: (count) => `${count} records` },
    expiredBadge: "Past expiry",
    vat: "VAT",
    key: "Key",
    perYear: "/year",
    rateLimit: "requests/min",
    requests: "requests",
    lastUsed: (when) => `last used ${when}`,
    note: "Note:",
  },
  tr: {
    meta: { title: "Veri Lisansı" },
    title: "Veri Lisansı",
    subtitle: "§4.4 — B2B API erişimi. Yalnızca §8.3'e göre herkese açık veriler lisanslanır.",
    publicPage: "Kamuya açık sayfa",
    status: {
      REQUESTED: "Bekliyor",
      TRIAL: "Deneme",
      ACTIVE: "Aktif",
      SUSPENDED: "Askıda",
      EXPIRED: "Süresi doldu",
      REJECTED: "Reddedildi",
    },
    stats: {
      pending: "Bekleyen başvuru",
      active: "Aktif lisans",
      revenue: "Yıllık lisans geliri",
      revenueHint: (min, max) => `Federasyon bandı ${min}-${max} €`,
    },
    alert: {
      title: "Onaylamadan önce",
      body:
        "Kullanım amacı somut mu? Talep edilen kapsam amaçla orantılı mı? Sağlık verisi, antrenman günlüğü, mesaj veya reşit olmayan kullanıcı içeren hiçbir istisna yapılmaz — bu veriler API'de zaten yer almaz.",
    },
    empty: {
      title: "Henüz başvuru yok",
      description: "Federasyon ve medya başvuruları /veri-lisansi sayfasından gelir.",
    },
    applications: { heading: "Başvurular", subtitle: (count) => `${count} kayıt` },
    expiredBadge: "Süre doldu",
    vat: "VAT",
    key: "Anahtar",
    perYear: "/yıl",
    rateLimit: "istek/dk",
    requests: "istek",
    lastUsed: (when) => `son kullanım ${when}`,
    note: "Not:",
  },
};

/* ─────────────────────────── Reklamlar ───────────────────────────── */

type AdsCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  policy: { title: string; bold: string; rest: string };
  newAd: string;
  liveAds: string;
  empty: string;
  active: string;
  inactive: string;
  ctr: (value: string) => string;
  pause: string;
  publish: string;
  delete: string;
};

export const adminAdsCopy: Record<Locale, AdsCopy> = {
  de: {
    meta: { title: "Anzeigen" },
    title: "Banner-Anzeigen",
    subtitle: "Werbeflächen für Kampfsportmarken",
    policy: {
      title: "Richtlinie",
      bold: "Sportwetten-Werbung wird nicht ausgespielt.",
      rest: "Werbung für Alkohol, Dopingmittel und Produkte zum extremen Gewichtmachen wird ebenfalls nicht akzeptiert.",
    },
    newAd: "Neue Anzeige",
    liveAds: "Laufende Anzeigen",
    empty: "Keine Anzeigen",
    active: "Aktiv",
    inactive: "Inaktiv",
    ctr: (value) => `CTR ${value} %`,
    pause: "Pausieren",
    publish: "Veröffentlichen",
    delete: "Löschen",
  },
  en: {
    meta: { title: "Ads" },
    title: "Banner ads",
    subtitle: "Ad slots for combat sports brands",
    policy: {
      title: "Policy",
      bold: "Sports betting ads are never published.",
      rest: "Ads for alcohol, doping products and extreme weight-cutting products are not accepted either.",
    },
    newAd: "New ad",
    liveAds: "Live ads",
    empty: "No ads",
    active: "Active",
    inactive: "Inactive",
    ctr: (value) => `CTR ${value}%`,
    pause: "Pause",
    publish: "Publish",
    delete: "Delete",
  },
  tr: {
    meta: { title: "Reklamlar" },
    title: "Banner Reklamları",
    subtitle: "Dövüş sporu markaları için reklam alanları",
    policy: {
      title: "Politika",
      bold: "Spor bahis reklamı yayınlanmaz.",
      rest: "Alkol, doping ürünü ve aşırı kilo düşürme ürünlerinin reklamı da kabul edilmez.",
    },
    newAd: "Yeni Reklam",
    liveAds: "Yayındaki Reklamlar",
    empty: "Reklam yok",
    active: "Aktif",
    inactive: "Pasif",
    ctr: (value) => `CTR %${value}`,
    pause: "Duraklat",
    publish: "Yayınla",
    delete: "Sil",
  },
};

/* ────────────────────────── Bekleme listesi ──────────────────────── */

type WaitlistCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  stats: {
    total: string;
    pending: string;
    invited: string;
    conversion: string;
    conversionValue: (rate: number) => string;
    convertedHint: (count: number) => string;
  };
  filterStatus: string;
  status: {
    PENDING: string;
    INVITED: string;
    CONVERTED: string;
    UNSUBSCRIBED: string;
  };
  filterRole: string;
  roles: {
    ATHLETE: string;
    COACH: string;
    GYM_OWNER: string;
    ORGANIZER: string;
    FAN: string;
  };
  searchPlaceholder: string;
  empty: string;
  columns: {
    email: string;
    name: string;
    role: string;
    cityGym: string;
    signedUp: string;
    status: string;
    action: string;
  };
  invite: string;
};

export const adminWaitlistCopy: Record<Locale, WaitlistCopy> = {
  de: {
    meta: { title: "Warteliste" },
    title: "Warteliste",
    subtitle: "Anmeldungen zum Beta-Programm — Einladungen und Conversion im Blick",
    stats: {
      total: "Gesamt",
      pending: "Wartet",
      invited: "Eingeladen",
      conversion: "Conversion",
      conversionValue: (rate) => `${rate} %`,
      convertedHint: (count) => `${count} sind Mitglied geworden`,
    },
    filterStatus: "Status",
    status: {
      PENDING: "Wartet",
      INVITED: "Eingeladen",
      CONVERTED: "Mitglied geworden",
      UNSUBSCRIBED: "Abgemeldet",
    },
    filterRole: "Rolle",
    roles: {
      ATHLETE: "Athlet",
      COACH: "Trainer",
      GYM_OWNER: "Gym",
      ORGANIZER: "Veranstalter",
      FAN: "Fan",
    },
    searchPlaceholder: "E-Mail, Name, Gym oder Stadt…",
    empty: "Keine Einträge",
    columns: {
      email: "E-Mail",
      name: "Name",
      role: "Rolle",
      cityGym: "Stadt / Gym",
      signedUp: "Anmeldung",
      status: "Status",
      action: "Aktion",
    },
    invite: "Einladen",
  },
  en: {
    meta: { title: "Waitlist" },
    title: "Waitlist",
    subtitle: "Beta programme sign-ups — invitations and conversion tracking",
    stats: {
      total: "Total",
      pending: "Pending",
      invited: "Invited",
      conversion: "Conversion",
      conversionValue: (rate) => `${rate}%`,
      convertedHint: (count) => `${count} became members`,
    },
    filterStatus: "Status",
    status: {
      PENDING: "Pending",
      INVITED: "Invited",
      CONVERTED: "Became member",
      UNSUBSCRIBED: "Unsubscribed",
    },
    filterRole: "Role",
    roles: {
      ATHLETE: "Athlete",
      COACH: "Coach",
      GYM_OWNER: "Gym",
      ORGANIZER: "Organizer",
      FAN: "Fan",
    },
    searchPlaceholder: "Email, name, gym or city…",
    empty: "No entries",
    columns: {
      email: "Email",
      name: "Name",
      role: "Role",
      cityGym: "City / Gym",
      signedUp: "Signed up",
      status: "Status",
      action: "Action",
    },
    invite: "Invite",
  },
  tr: {
    meta: { title: "Bekleme Listesi" },
    title: "Bekleme Listesi",
    subtitle: "Beta programı kayıtları — davet ve dönüşüm takibi",
    stats: {
      total: "Toplam",
      pending: "Bekliyor",
      invited: "Davet edildi",
      conversion: "Dönüşüm",
      conversionValue: (rate) => `%${rate}`,
      convertedHint: (count) => `${count} üye oldu`,
    },
    filterStatus: "Durum",
    status: {
      PENDING: "Bekliyor",
      INVITED: "Davet edildi",
      CONVERTED: "Üye oldu",
      UNSUBSCRIBED: "Ayrıldı",
    },
    filterRole: "Rol",
    roles: {
      ATHLETE: "Sporcu",
      COACH: "Antrenör",
      GYM_OWNER: "Salon",
      ORGANIZER: "Organizatör",
      FAN: "Hayran",
    },
    searchPlaceholder: "E-posta, isim, salon veya şehir…",
    empty: "Kayıt yok",
    columns: {
      email: "E-posta",
      name: "İsim",
      role: "Rol",
      cityGym: "Şehir / Salon",
      signedUp: "Kayıt",
      status: "Durum",
      action: "İşlem",
    },
    invite: "Davet Et",
  },
};

/* ────────────────────────── Beta kodları ─────────────────────────── */

type BetaCodesCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  alert: { before: string; price: string; after: string };
  newCode: string;
  codes: string;
  empty: string;
  columns: {
    code: string;
    label: string;
    usage: string;
    perk: string;
    validity: string;
    status: string;
    action: string;
  };
  founder: string;
  unlimited: string;
  disabled: string;
  exhausted: string;
  active: string;
  close: string;
  open: string;
};

export const adminBetaCodesCopy: Record<Locale, BetaCodesCopy> = {
  de: {
    meta: { title: "Beta-Codes" },
    title: "Beta-Zugangscodes",
    subtitle: "Early Access auf Einladung — Vorteile für Gründungsmitglieder (§6)",
    alert: {
      before: "Als Gründer markierte Codes geben der Nutzerin oder dem Nutzer lebenslang den Vorzugspreis von ",
      price: "50 €/Monat",
      after: " sowie das Gründer-Abzeichen im Profil.",
    },
    newCode: "Neuer Code",
    codes: "Codes",
    empty: "Keine Codes",
    columns: {
      code: "Code",
      label: "Bezeichnung",
      usage: "Nutzung",
      perk: "Vorteil",
      validity: "Gültigkeit",
      status: "Status",
      action: "Aktion",
    },
    founder: "Gründer",
    unlimited: "Unbefristet",
    disabled: "Deaktiviert",
    exhausted: "Aufgebraucht",
    active: "Aktiv",
    close: "Deaktivieren",
    open: "Aktivieren",
  },
  en: {
    meta: { title: "Beta codes" },
    title: "Beta access codes",
    subtitle: "Invite-only early access — Founding Member perks (§6)",
    alert: {
      before: "Codes flagged as founder give the user a lifetime preferential price of ",
      price: "50 €/month",
      after: " and a Founder badge on their profile.",
    },
    newCode: "New code",
    codes: "Codes",
    empty: "No codes",
    columns: {
      code: "Code",
      label: "Label",
      usage: "Usage",
      perk: "Perk",
      validity: "Validity",
      status: "Status",
      action: "Action",
    },
    founder: "Founder",
    unlimited: "Unlimited",
    disabled: "Disabled",
    exhausted: "Exhausted",
    active: "Active",
    close: "Disable",
    open: "Enable",
  },
  tr: {
    meta: { title: "Beta Kodları" },
    title: "Beta Erişim Kodları",
    subtitle: "Davetli erken erişim — Kurucu Üye ayrıcalıkları (§6)",
    alert: {
      before: "Kurucu işaretli kodlar, kullanıcıya ömür boyu ",
      price: "50 €/ay",
      after: " ayrıcalıklı fiyat ve profilinde Kurucu rozeti verir.",
    },
    newCode: "Yeni Kod",
    codes: "Kodlar",
    empty: "Kod yok",
    columns: {
      code: "Kod",
      label: "Etiket",
      usage: "Kullanım",
      perk: "Ayrıcalık",
      validity: "Geçerlilik",
      status: "Durum",
      action: "İşlem",
    },
    founder: "Kurucu",
    unlimited: "Süresiz",
    disabled: "Kapalı",
    exhausted: "Tükendi",
    active: "Aktif",
    close: "Kapat",
    open: "Aç",
  },
};

/* ────────────────────────── Servis durumu ────────────────────────── */

type ServicesCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  state: { ACTIVE: string; FALLBACK: string; MISSING: string };
  alert: {
    title: string;
    p1: string;
    b1: string;
    p2: string;
    b2: string;
    p3: string;
  };
  stats: {
    active: string;
    activeHint: string;
    fallback: string;
    fallbackHint: string;
    missing: string;
    missingHint: string;
  };
  ifNotConfigured: string;
  envVars: string;
  defined: string;
  notDefined: string;
  footer: { p1: string; b: string; p2: string };
};

export const adminServicesCopy: Record<Locale, ServicesCopy> = {
  de: {
    meta: { title: "Dienststatus" },
    title: "Dienststatus",
    subtitle: "§5.3 — Der Status der externen Anbieter auf einen Blick",
    state: { ACTIVE: "Aktiv", FALLBACK: "Fallback", MISSING: "Fehlt" },
    alert: {
      title: "Kein Dienst ist zwingend erforderlich",
      p1: "Jedes Modul hat einen Fallback, der ohne Schlüssel funktioniert: manuelle Freigabe, lokale Heuristik oder Datenbankabfrage. Diese Tabelle zeigt, was ",
      b1: "automatisch",
      p2: " und was ",
      b2: "manuell",
      p3: " läuft. Sobald ein Schlüssel hinterlegt ist, wechselt das jeweilige Modul in den Automatikmodus — eine Codeänderung ist nicht nötig.",
    },
    stats: {
      active: "Aktiv",
      activeHint: "Schlüssel hinterlegt, automatisch",
      fallback: "Fallback",
      fallbackHint: "läuft ohne Schlüssel",
      missing: "Fehlt",
      missingHint: "Funktion deaktiviert",
    },
    ifNotConfigured: "Ohne Konfiguration",
    envVars: "Umgebungsvariablen",
    defined: " definiert",
    notDefined: " nicht definiert",
    footer: {
      p1: "Die ",
      b: "Werte",
      p2: " der Schlüssel werden auf diesem Bildschirm unter keinen Umständen angezeigt; aufgelistet werden nur der Name der Variablen und ob sie definiert ist. Die Werte existieren ausschließlich in der Serverumgebung.",
    },
  },
  en: {
    meta: { title: "Service status" },
    title: "Service status",
    subtitle: "§5.3 — The status of every external provider at a glance",
    state: { ACTIVE: "Active", FALLBACK: "Fallback", MISSING: "Missing" },
    alert: {
      title: "No service is mandatory",
      p1: "Every module has a fallback that works without a key: manual approval, a local heuristic or a database query. This table shows what runs ",
      b1: "automatically",
      p2: " and what runs ",
      b2: "manually",
      p3: ". The moment a key is defined, that module switches to automatic mode — no code change required.",
    },
    stats: {
      active: "Active",
      activeHint: "key defined, automatic",
      fallback: "Fallback",
      fallbackHint: "running without a key",
      missing: "Missing",
      missingHint: "feature disabled",
    },
    ifNotConfigured: "If not configured",
    envVars: "Environment variables",
    defined: " defined",
    notDefined: " not defined",
    footer: {
      p1: "Key ",
      b: "values",
      p2: " are never shown on this screen under any circumstances; only the name of the variable and whether it is defined are listed. The values exist solely in the server environment.",
    },
  },
  tr: {
    meta: { title: "Servis Durumu" },
    title: "Servis Durumu",
    subtitle: "§5.3 — Harici sağlayıcıların tek bakışta durumu",
    state: { ACTIVE: "Aktif", FALLBACK: "Yedek akış", MISSING: "Eksik" },
    alert: {
      title: "Hiçbir servis zorunlu değildir",
      p1: "Her modülün anahtarsız çalışan bir yedek akışı (fallback) vardır: manuel onay, yerel heuristik ya da veritabanı sorgusu. Bu tablo neyin ",
      b1: "otomatik",
      p2: ", neyin ",
      b2: "elle",
      p3: " yürüdüğünü gösterir. Anahtar tanımlandığı anda ilgili modül otomatik moda geçer — kod değişikliği gerekmez.",
    },
    stats: {
      active: "Aktif",
      activeHint: "anahtar tanımlı, otomatik",
      fallback: "Yedek akış",
      fallbackHint: "anahtarsız çalışıyor",
      missing: "Eksik",
      missingHint: "özellik kapalı",
    },
    ifNotConfigured: "Yapılandırılmazsa",
    envVars: "Ortam değişkenleri",
    defined: " tanımlı",
    notDefined: " tanımlı değil",
    footer: {
      p1: "Anahtar ",
      b: "değerleri",
      p2: " bu ekranda hiçbir koşulda gösterilmez; yalnızca değişken adı ve tanımlı olup olmadığı listelenir. Değerler yalnızca sunucu ortamında bulunur.",
    },
  },
};
