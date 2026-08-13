import type { Locale } from "@/lib/i18n/config";

/**
 * Admin kabuğunun metinleri: `app/admin/layout.tsx` üst çubuğu ve
 * `components/admin-nav.tsx` yan/alt menüsü.
 *
 * Menü girdilerinin `href` değerleri kanonik (Türkçe) kalır — çeviriyi
 * `components/i18n/link.tsx` yapar; burada yalnızca görünen etiketler durur.
 */
type Copy = {
  badge: string;
  backToSite: string;
  navLabel: string;
  nav: {
    overview: string;
    kpi: string;
    verification: string;
    moderation: string;
    appeals: string;
    users: string;
    gyms: string;
    events: string;
    passport: string;
    forum: string;
    spotlight: string;
    sponsors: string;
    dataLicense: string;
    ads: string;
    waitlist: string;
    betaCodes: string;
    services: string;
  };
};

export const adminShellCopy: Record<Locale, Copy> = {
  de: {
    badge: "Admin",
    backToSite: "Zurück zur Website",
    navLabel: "Admin-Menü",
    nav: {
      overview: "Übersicht",
      kpi: "KPI-Tracking",
      verification: "Verifizierungs-Warteschlange",
      moderation: "Moderation",
      appeals: "Einsprüche (DSA)",
      users: "Nutzer",
      gyms: "Gyms",
      events: "Events",
      passport: "Passport-Dokumente",
      forum: "Forum",
      spotlight: "Spotlight",
      sponsors: "Sponsoren",
      dataLicense: "Datenlizenz",
      ads: "Werbung",
      waitlist: "Warteliste",
      betaCodes: "Beta-Codes",
      services: "Dienste",
    },
  },

  en: {
    badge: "Admin",
    backToSite: "Back to site",
    navLabel: "Admin menu",
    nav: {
      overview: "Overview",
      kpi: "KPI tracking",
      verification: "Verification queue",
      moderation: "Moderation",
      appeals: "Appeals (DSA)",
      users: "Users",
      gyms: "Gyms",
      events: "Events",
      passport: "Passport documents",
      forum: "Forum",
      spotlight: "Spotlight",
      sponsors: "Sponsors",
      dataLicense: "Data licensing",
      ads: "Ads",
      waitlist: "Waitlist",
      betaCodes: "Beta codes",
      services: "Services",
    },
  },

  tr: {
    badge: "Admin",
    backToSite: "Siteye dön",
    navLabel: "Admin menüsü",
    nav: {
      overview: "Genel Bakış",
      kpi: "KPI Takibi",
      verification: "Doğrulama Kuyruğu",
      moderation: "Moderasyon",
      appeals: "İtirazlar (DSA)",
      users: "Kullanıcılar",
      gyms: "Salonlar",
      events: "Etkinlikler",
      passport: "Passport Belgeleri",
      forum: "Forum",
      spotlight: "Spotlight",
      sponsors: "Sponsorlar",
      dataLicense: "Veri Lisansı",
      ads: "Reklamlar",
      waitlist: "Bekleme Listesi",
      betaCodes: "Beta Kodları",
      services: "Servisler",
    },
  },
};
