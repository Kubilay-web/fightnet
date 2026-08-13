import type { Locale } from "@/lib/i18n/config";

/**
 * Panel kenar çubuğu (`components/panel-nav.tsx`) ve kullanıcı menüsü
 * (`components/layout/user-menu.tsx`) etiketleri.
 *
 * Menü öğelerinin `href` değerleri kanonik (Türkçe) kalır; çeviriyi
 * `components/i18n/link` yapar. Burada yalnızca görünen ad tutulur ve anahtar
 * kümesi tip olarak sabitlendiği için yeni bir menü satırı eklendiğinde üç dilin
 * tamamı derleme zamanında zorunlu olur.
 */
export type PanelNavKey =
  | "panel"
  | "profil"
  | "antrenman"
  | "sparring"
  | "rezervasyonlar"
  | "mesajlar"
  | "gonderi"
  | "pazar"
  | "dogrulama"
  | "passport"
  | "creator"
  | "kocluk"
  | "cihazlar"
  | "sozlesmelerim"
  | "abonelik"
  | "bildirimler"
  | "itirazlar"
  | "ayarlar"
  | "kefalet"
  | "salonYonetimi"
  | "etkinliklerim";

export type UserMenuKey =
  | "panel"
  | "profil"
  | "antrenman"
  | "sparring"
  | "rezervasyonlar"
  | "dogrulama"
  | "creator"
  | "bildirimler"
  | "ayarlar";

type Copy = {
  navAria: string;
  nav: Record<PanelNavKey, string>;
  menu: Record<UserMenuKey, string>;
  admin: string;
  logout: string;
};

export const panelNavCopy: Record<Locale, Copy> = {
  de: {
    navAria: "Dashboard-Menü",
    nav: {
      panel: "Dashboard",
      profil: "Profil",
      antrenman: "Training",
      sparring: "Sparring",
      rezervasyonlar: "Buchungen",
      mesajlar: "Nachrichten",
      gonderi: "Meine Beiträge",
      pazar: "Meine Anzeigen",
      dogrulama: "Verifizierung",
      passport: "Passport",
      creator: "Creator",
      kocluk: "Coaching",
      cihazlar: "Geräte",
      sozlesmelerim: "Meine Verträge",
      abonelik: "Abo",
      bildirimler: "Benachrichtigungen",
      itirazlar: "Meine Einsprüche",
      ayarlar: "Einstellungen",
      kefalet: "Meine Bürgschaften",
      salonYonetimi: "Gym-Verwaltung",
      etkinliklerim: "Meine Events",
    },
    menu: {
      panel: "Mein Dashboard",
      profil: "Mein Profil",
      antrenman: "Trainingstagebuch",
      sparring: "Sparring",
      rezervasyonlar: "Meine Buchungen",
      dogrulama: "Verifizierung",
      creator: "Creator",
      bildirimler: "Benachrichtigungen",
      ayarlar: "Einstellungen",
    },
    admin: "Admin-Panel",
    logout: "Abmelden",
  },

  en: {
    navAria: "Dashboard menu",
    nav: {
      panel: "Dashboard",
      profil: "Profile",
      antrenman: "Training",
      sparring: "Sparring",
      rezervasyonlar: "Bookings",
      mesajlar: "Messages",
      gonderi: "My posts",
      pazar: "My listings",
      dogrulama: "Verification",
      passport: "Passport",
      creator: "Creator",
      kocluk: "Coaching",
      cihazlar: "Devices",
      sozlesmelerim: "My contracts",
      abonelik: "Subscription",
      bildirimler: "Notifications",
      itirazlar: "My appeals",
      ayarlar: "Settings",
      kefalet: "My vouches",
      salonYonetimi: "Gym admin",
      etkinliklerim: "My events",
    },
    menu: {
      panel: "My dashboard",
      profil: "My profile",
      antrenman: "Training log",
      sparring: "Sparring",
      rezervasyonlar: "My bookings",
      dogrulama: "Verification",
      creator: "Creator",
      bildirimler: "Notifications",
      ayarlar: "Settings",
    },
    admin: "Admin panel",
    logout: "Log out",
  },

  tr: {
    navAria: "Panel menüsü",
    nav: {
      panel: "Panel",
      profil: "Profil",
      antrenman: "Antrenman",
      sparring: "Sparring",
      rezervasyonlar: "Rezervasyonlar",
      mesajlar: "Mesajlar",
      gonderi: "Gönderilerim",
      pazar: "İlanlarım",
      dogrulama: "Doğrulama",
      passport: "Passport",
      creator: "Creator",
      kocluk: "Koçluk",
      cihazlar: "Cihazlar",
      sozlesmelerim: "Sözleşmelerim",
      abonelik: "Abonelik",
      bildirimler: "Bildirimler",
      itirazlar: "İtirazlarım",
      ayarlar: "Ayarlar",
      kefalet: "Kefaletlerim",
      salonYonetimi: "Salon Yönetimi",
      etkinliklerim: "Etkinliklerim",
    },
    menu: {
      panel: "Panelim",
      profil: "Profilim",
      antrenman: "Antrenman Günlüğü",
      sparring: "Sparring",
      rezervasyonlar: "Rezervasyonlarım",
      dogrulama: "Doğrulama",
      creator: "Creator",
      bildirimler: "Bildirimler",
      ayarlar: "Ayarlar",
    },
    admin: "Admin Panel",
    logout: "Çıkış Yap",
  },
};
