import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel/ayarlar` ve `/panel/bildirimler` sayfaları ile bunlara bağlı istemci
 * bileşenlerinin (`settings-forms`, `push-toggle`, `guardian-notice`) metinleri.
 *
 * Push açma/kapama sırasında oluşan hatalar da buraya alındı: bunlar tarayıcıda
 * üretilen istemci hatalarıdır, sunucu eylemlerinden dönen mesajlar değildir.
 */
type Copy = {
  meta: { title: string };
  header: { title: string; subtitle: string };
  prefs: string;
  pushSection: { title: string; subtitle: string };
  passwordSection: string;
  data: { title: string; subtitle: string; healthNote: string };
  danger: { title: string; alertTitle: string; alertBody: string };
  settingsForm: {
    submit: string;
    language: string;
    languageHint: string;
    theme: string;
    themes: { dark: string; light: string; system: string };
    defaultVisibility: string;
    pushSwitch: string;
    emailSwitch: string;
  };
  passwordForm: {
    submit: string;
    current: string;
    next: string;
    nextHint: string;
  };
  export: { title: string; body: string; button: string };
  deleteForm: { submit: string; confirmLabel: (username: string) => string };
  guardian: {
    title: string;
    body: string;
    submit: string;
    emailLabel: string;
    savedHint: (email: string) => string;
    defaultHint: string;
    placeholder: string;
  };
  push: {
    checking: string;
    unsupported: string;
    deniedTitle: string;
    deniedBody: string;
    on: string;
    off: string;
    description: string;
    turnOn: string;
    turnOff: string;
    subscribeFailed: string;
    enableFailed: string;
  };
  notifications: {
    meta: { title: string };
    title: string;
    unread: (n: number) => string;
    allRead: string;
    markAll: string;
    emptyTitle: string;
    emptyBody: string;
  };
};

export const panelSettingsCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Einstellungen" },
    header: { title: "Einstellungen", subtitle: "Deine Sprach-, Benachrichtigungs- und Datenschutzeinstellungen" },
    prefs: "Präferenzen",
    pushSection: { title: "Push-Benachrichtigungen", subtitle: "Wird pro Gerät einzeln eingestellt" },
    passwordSection: "Passwort",
    data: {
      title: "Meine Daten",
      subtitle: "DSGVO — lade deine Daten herunter oder lösche dein Konto",
      healthNote:
        "Gesundheitsdaten von deinen Geräten sind in diesem Paket nicht enthalten; über Dashboard → Geräte kannst du die Einwilligung widerrufen und alles sofort löschen lassen.",
    },
    danger: {
      title: "Gefahrenzone",
      alertTitle: "Konto endgültig löschen",
      alertBody:
        "Dein gesamtes Profil, deine Trainingseinträge, Beiträge und Buchungen werden endgültig gelöscht. Dieser Schritt lässt sich nicht rückgängig machen.",
    },
    settingsForm: {
      submit: "Einstellungen speichern",
      language: "Sprache",
      languageHint: "§5.2 — Deutsch, Englisch, Türkisch",
      theme: "Design",
      themes: { dark: "Dunkel", light: "Hell", system: "System" },
      defaultVisibility: "Standard-Sichtbarkeit",
      pushSwitch: "Push-Benachrichtigungen",
      emailSwitch: "E-Mail-Benachrichtigungen",
    },
    passwordForm: {
      submit: "Passwort ändern",
      current: "Aktuelles Passwort",
      next: "Neues Passwort",
      nextHint: "Mindestens 8 Zeichen, eine Ziffer",
    },
    export: {
      title: "Meine Daten herunterladen",
      body: "Dein Profil, deine Trainingseinträge, Beiträge und Buchungen im JSON-Format.",
      button: "JSON herunterladen",
    },
    deleteForm: {
      submit: "Mein Konto endgültig löschen",
      confirmLabel: (username) => `Zur Bestätigung deinen Benutzernamen eingeben: ${username}`,
    },
    guardian: {
      title: "Warten auf Elternfreigabe",
      body:
        "Du bist unter 18. Bis deine Erziehungsberechtigten zustimmen, sind Sparring-Matching, Wettkampfanmeldung und Nachrichten von Erwachsenen gesperrt. Dein Profil, dein Trainingstagebuch und der Feed sind immer offen.",
      submit: "Freigabelink senden",
      emailLabel: "E-Mail der Erziehungsberechtigten",
      savedHint: (email) => `Hinterlegt: ${email}`,
      defaultHint: "Der Freigabelink geht an diese Adresse",
      placeholder: "eltern@beispiel.de",
    },
    push: {
      checking: "Wird geprüft…",
      unsupported:
        "Dieser Browser unterstützt keine Push-Benachrichtigungen. Wenn du FIGHTNET auf dem iPhone zum Home-Bildschirm hinzufügst, funktionieren die Benachrichtigungen.",
      deniedTitle: "Benachrichtigungen im Browser blockiert",
      deniedBody:
        "Du musst die Benachrichtigungsberechtigung in den Website-Einstellungen in der Adressleiste wieder aktivieren.",
      on: "Auf diesem Gerät aktiv",
      off: "Auf diesem Gerät aus",
      description: "Sparring-Anfragen, Kämpfe der Athleten, denen du folgst, und Livescore-Updates.",
      turnOn: "Benachrichtigungen aktivieren",
      turnOff: "Deaktivieren",
      subscribeFailed: "Registrierung fehlgeschlagen",
      enableFailed: "Benachrichtigungen konnten nicht aktiviert werden",
    },
    notifications: {
      meta: { title: "Benachrichtigungen" },
      title: "Benachrichtigungen",
      unread: (n) => `${n} ungelesen`,
      allRead: "Alles gelesen",
      markAll: "Alle als gelesen markieren",
      emptyTitle: "Keine Benachrichtigungen",
      emptyBody: "Benachrichtigungen zu Follows, Sparring-Anfragen und Livescore erscheinen hier.",
    },
  },

  en: {
    meta: { title: "Settings" },
    header: { title: "Settings", subtitle: "Your language, notification and privacy preferences" },
    prefs: "Preferences",
    pushSection: { title: "Push notifications", subtitle: "Set separately on each device" },
    passwordSection: "Password",
    data: {
      title: "My data",
      subtitle: "GDPR — download your data or delete your account",
      healthNote:
        "Health data from your devices is not included in this package; you can withdraw consent under Dashboard → Devices and have all of it deleted immediately.",
    },
    danger: {
      title: "Danger zone",
      alertTitle: "Delete account permanently",
      alertBody:
        "Your entire profile, training logs, posts and bookings will be permanently deleted. This cannot be undone.",
    },
    settingsForm: {
      submit: "Save settings",
      language: "Language",
      languageHint: "§5.2 — German, English, Turkish",
      theme: "Theme",
      themes: { dark: "Dark", light: "Light", system: "System" },
      defaultVisibility: "Default visibility",
      pushSwitch: "Push notifications",
      emailSwitch: "Email notifications",
    },
    passwordForm: {
      submit: "Change password",
      current: "Current password",
      next: "New password",
      nextHint: "At least 8 characters, one digit",
    },
    export: {
      title: "Download my data",
      body: "Your profile, training logs, posts and bookings in JSON format.",
      button: "Download JSON",
    },
    deleteForm: {
      submit: "Permanently delete my account",
      confirmLabel: (username) => `Type your username to confirm: ${username}`,
    },
    guardian: {
      title: "Waiting for guardian consent",
      body:
        "You are under 18. Until your guardian approves, sparring matching, competition registration and messages from adults are disabled. Your profile, training log and the feed stay open at all times.",
      submit: "Send consent link",
      emailLabel: "Guardian email",
      savedHint: (email) => `On file: ${email}`,
      defaultHint: "The consent link goes to this address",
      placeholder: "guardian@example.com",
    },
    push: {
      checking: "Checking…",
      unsupported:
        "This browser does not support push notifications. Add FIGHTNET to your home screen on iPhone and notifications will work.",
      deniedTitle: "Notifications blocked in the browser",
      deniedBody: "You need to re-enable the notification permission in the site settings in the address bar.",
      on: "On for this device",
      off: "Off for this device",
      description: "Sparring requests, bouts of the athletes you follow, and live score updates.",
      turnOn: "Turn on notifications",
      turnOff: "Turn off",
      subscribeFailed: "Registration failed",
      enableFailed: "Could not turn on notifications",
    },
    notifications: {
      meta: { title: "Notifications" },
      title: "Notifications",
      unread: (n) => `${n} unread`,
      allRead: "All caught up",
      markAll: "Mark all as read",
      emptyTitle: "No notifications",
      emptyBody: "Follows, sparring requests and live score notifications appear here.",
    },
  },

  tr: {
    meta: { title: "Ayarlar" },
    header: { title: "Ayarlar", subtitle: "Dil, bildirim ve gizlilik tercihlerin" },
    prefs: "Tercihler",
    pushSection: { title: "Push Bildirimleri", subtitle: "Cihaz başına ayrı ayarlanır" },
    passwordSection: "Şifre",
    data: {
      title: "Verilerim",
      subtitle: "KVKK/GDPR — verilerini indir veya hesabını sil",
      healthNote:
        "Cihazlardan gelen sağlık verilerin bu pakete dahil değildir; Panel → Cihazlar sayfasından izni geri alarak tümünü anında sildirebilirsin.",
    },
    danger: {
      title: "Tehlikeli Bölge",
      alertTitle: "Hesabı kalıcı olarak sil",
      alertBody:
        "Tüm profilin, antrenman kayıtların, gönderilerin ve rezervasyonların kalıcı olarak silinir. Bu işlem geri alınamaz.",
    },
    settingsForm: {
      submit: "Ayarları Kaydet",
      language: "Dil",
      languageHint: "§5.2 — Almanca, İngilizce, Türkçe",
      theme: "Tema",
      themes: { dark: "Karanlık", light: "Açık", system: "Sistem" },
      defaultVisibility: "Varsayılan görünürlük",
      pushSwitch: "Push bildirimleri",
      emailSwitch: "E-posta bildirimleri",
    },
    passwordForm: {
      submit: "Şifreyi Değiştir",
      current: "Mevcut şifre",
      next: "Yeni şifre",
      nextHint: "En az 8 karakter, bir rakam",
    },
    export: {
      title: "Verilerimi indir",
      body: "Profilin, antrenman kayıtların, gönderilerin ve rezervasyonların JSON formatında.",
      button: "JSON İndir",
    },
    deleteForm: {
      submit: "Hesabımı Kalıcı Olarak Sil",
      confirmLabel: (username) => `Onaylamak için kullanıcı adını yaz: ${username}`,
    },
    guardian: {
      title: "Veli onayı bekleniyor",
      body:
        "18 yaşın altındasın. Velin onaylayana kadar sparring eşleşmesi, müsabaka kaydı ve yetişkinlerden gelen mesajlar kapalı. Profilin, antrenman günlüğün ve akış her zaman açık.",
      submit: "Onay bağlantısını gönder",
      emailLabel: "Veli e-postası",
      savedHint: (email) => `Kayıtlı: ${email}`,
      defaultHint: "Onay bağlantısı bu adrese gider",
      placeholder: "veli@ornek.de",
    },
    push: {
      checking: "Kontrol ediliyor…",
      unsupported:
        "Bu tarayıcı push bildirimlerini desteklemiyor. iPhone'da FIGHTNET'i ana ekrana eklersen bildirimler çalışır.",
      deniedTitle: "Bildirimler tarayıcıda engellenmiş",
      deniedBody: "Adres çubuğundaki site ayarlarından bildirim iznini tekrar açman gerekiyor.",
      on: "Bu cihazda açık",
      off: "Bu cihazda kapalı",
      description: "Sparring istekleri, takip edilen sporcuların maçları ve canlı skor güncellemeleri.",
      turnOn: "Bildirimleri aç",
      turnOff: "Kapat",
      subscribeFailed: "Kayıt başarısız",
      enableFailed: "Bildirimler açılamadı",
    },
    notifications: {
      meta: { title: "Bildirimler" },
      title: "Bildirimler",
      unread: (n) => `${n} okunmamış`,
      allRead: "Hepsi okundu",
      markAll: "Tümünü okundu işaretle",
      emptyTitle: "Bildirim yok",
      emptyBody: "Takip, sparring talebi ve canlı skor bildirimleri burada görünür.",
    },
  },
};
