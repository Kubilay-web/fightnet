import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel/profil` sayfası ve `components/profile-forms.tsx` metinleri.
 *
 * Disiplin, seviye ve kemer adları burada YOKTUR: onlar `lib/constants.ts`
 * içindeki tek kaynaktan gelir ve bilanço biçimi (`12-3-1`) dilden bağımsızdır.
 */
type Copy = {
  meta: { title: string };
  loadError: string;
  profileSection: { title: string; subtitle: string };
  disciplinesSection: { title: string; subtitle: string };
  form: {
    submit: string;
    avatar: string;
    avatarUpload: string;
    cover: string;
    coverUpload: string;
    name: string;
    bio: string;
    bioHint: string;
    city: string;
    postalCode: string;
    country: string;
    countries: { DE: string; AT: string; CH: string; TR: string };
    birthDate: string;
    height: string;
    reach: string;
    stance: string;
    stances: { orthodox: string; southpaw: string; switch: string };
    website: string;
    instagram: string;
    instagramHint: string;
    youtube: string;
    youtubeHint: string;
    visibility: string;
    visibilityHint: string;
    selectPlaceholder: string;
  };
  manager: {
    pro: string;
    years: (n: number) => string;
    primaryBadge: string;
    edit: string;
    deleteAria: string;
    stripes: (n: number) => string;
    editTitle: (discipline: string) => string;
    closeAria: string;
    addTitle: string;
    addButton: string;
  };
  sport: {
    submitAdd: string;
    submitUpdate: string;
    discipline: string;
    level: string;
    weightClass: string;
    selectPlaceholder: string;
    belt: string;
    stripes: string;
    weightKg: string;
    yearsActive: string;
    status: string;
    isPro: string;
    record: string;
    wins: string;
    losses: string;
    draws: string;
    ko: string;
    sub: string;
    koAria: string;
    subAria: string;
    isPrimary: string;
  };
};

export const panelProfileCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Mein Profil" },
    loadError: "Profil konnte nicht geladen werden. Bitte die Datenbankverbindung prüfen.",
    profileSection: {
      title: "Mein Profil",
      subtitle: "Diese Angaben erscheinen in deinem öffentlichen Profil",
    },
    disciplinesSection: {
      title: "Meine Disziplinen",
      subtitle: "Du kannst mehrere Kampfsportarten hinzufügen (§4.2 Multi-Sport-Profil)",
    },
    form: {
      submit: "Profil speichern",
      avatar: "Profilfoto",
      avatarUpload: "Foto hochladen",
      cover: "Titelbild",
      coverUpload: "Titelbild hochladen",
      name: "Vor- und Nachname",
      bio: "Biografie",
      bioHint: "Hier lernen Sponsoren und Trainer dich kennen",
      city: "Stadt",
      postalCode: "Postleitzahl",
      country: "Land",
      countries: { DE: "Deutschland", AT: "Österreich", CH: "Schweiz", TR: "Türkei" },
      birthDate: "Geburtsdatum",
      height: "Größe (cm)",
      reach: "Reichweite (cm)",
      stance: "Auslage",
      stances: { orthodox: "Orthodox", southpaw: "Southpaw", switch: "Switch" },
      website: "Website",
      instagram: "Instagram",
      instagramHint: "ohne @",
      youtube: "YouTube",
      youtubeHint: "Kanalname",
      visibility: "Profil-Sichtbarkeit",
      visibilityHint: "Wer darf dein Profil sehen?",
      selectPlaceholder: "Auswählen",
    },
    manager: {
      pro: "Pro",
      years: (n) => `${n} Jahre`,
      primaryBadge: "Haupt",
      edit: "Bearbeiten",
      deleteAria: "Löschen",
      stripes: (n) => `${n} Streifen`,
      editTitle: (discipline) => `${discipline} bearbeiten`,
      closeAria: "Schließen",
      addTitle: "Neue Disziplin hinzufügen",
      addButton: "Disziplin hinzufügen",
    },
    sport: {
      submitAdd: "Hinzufügen",
      submitUpdate: "Aktualisieren",
      discipline: "Disziplin",
      level: "Niveau",
      weightClass: "Gewichtsklasse",
      selectPlaceholder: "Auswählen",
      belt: "Gürtel",
      stripes: "Anzahl Streifen",
      weightKg: "Gewicht (kg)",
      yearsActive: "Aktive Jahre",
      status: "Status",
      isPro: "Ich bin Profisportler:in",
      record: "Wettkampfbilanz",
      wins: "Siege",
      losses: "Niederlagen",
      draws: "Unentschieden",
      ko: "KO",
      sub: "Sub",
      koAria: "Siege durch KO",
      subAria: "Siege durch Submission",
      isPrimary: "Als Hauptdisziplin festlegen",
    },
  },

  en: {
    meta: { title: "My profile" },
    loadError: "Could not load your profile. Please check the database connection.",
    profileSection: {
      title: "My profile",
      subtitle: "The details shown on your public profile",
    },
    disciplinesSection: {
      title: "My disciplines",
      subtitle: "You can add more than one combat sport (§4.2 multi-sport profile)",
    },
    form: {
      submit: "Save profile",
      avatar: "Profile photo",
      avatarUpload: "Upload photo",
      cover: "Cover image",
      coverUpload: "Upload cover",
      name: "Full name",
      bio: "Biography",
      bioHint: "This is where sponsors and coaches get to know you",
      city: "City",
      postalCode: "Postal code",
      country: "Country",
      countries: { DE: "Germany", AT: "Austria", CH: "Switzerland", TR: "Türkiye" },
      birthDate: "Date of birth",
      height: "Height (cm)",
      reach: "Reach (cm)",
      stance: "Stance",
      stances: { orthodox: "Orthodox", southpaw: "Southpaw", switch: "Switch" },
      website: "Website",
      instagram: "Instagram",
      instagramHint: "without @",
      youtube: "YouTube",
      youtubeHint: "channel name",
      visibility: "Profile visibility",
      visibilityHint: "Who can see your profile?",
      selectPlaceholder: "Select",
    },
    manager: {
      pro: "Pro",
      years: (n) => `${n} years`,
      primaryBadge: "Primary",
      edit: "Edit",
      deleteAria: "Delete",
      stripes: (n) => `${n} stripes`,
      editTitle: (discipline) => `Edit ${discipline}`,
      closeAria: "Close",
      addTitle: "Add a new discipline",
      addButton: "Add discipline",
    },
    sport: {
      submitAdd: "Add",
      submitUpdate: "Update",
      discipline: "Discipline",
      level: "Level",
      weightClass: "Weight class",
      selectPlaceholder: "Select",
      belt: "Belt",
      stripes: "Number of stripes",
      weightKg: "Weight (kg)",
      yearsActive: "Years active",
      status: "Status",
      isPro: "I am a professional athlete",
      record: "Competition record",
      wins: "Wins",
      losses: "Losses",
      draws: "Draws",
      ko: "KO",
      sub: "Sub",
      koAria: "Wins by KO",
      subAria: "Wins by submission",
      isPrimary: "Make this my primary discipline",
    },
  },

  tr: {
    meta: { title: "Profilim" },
    loadError: "Profil yüklenemedi. Veritabanı bağlantısını kontrol edin.",
    profileSection: {
      title: "Profilim",
      subtitle: "Herkese açık profilinde görünen bilgiler",
    },
    disciplinesSection: {
      title: "Disiplinlerim",
      subtitle: "Birden fazla dövüş sporu ekleyebilirsin (§4.2 çoklu spor profili)",
    },
    form: {
      submit: "Profili Kaydet",
      avatar: "Profil fotoğrafı",
      avatarUpload: "Fotoğraf yükle",
      cover: "Kapak görseli",
      coverUpload: "Kapak yükle",
      name: "Ad Soyad",
      bio: "Biyografi",
      bioHint: "Sponsorlar ve antrenörler seni burada tanır",
      city: "Şehir",
      postalCode: "Posta kodu",
      country: "Ülke",
      countries: { DE: "Almanya", AT: "Avusturya", CH: "İsviçre", TR: "Türkiye" },
      birthDate: "Doğum tarihi",
      height: "Boy (cm)",
      reach: "Kulaç (cm)",
      stance: "Duruş",
      stances: { orthodox: "Ortodoks", southpaw: "Southpaw", switch: "Switch" },
      website: "Web sitesi",
      instagram: "Instagram",
      instagramHint: "@ olmadan",
      youtube: "YouTube",
      youtubeHint: "kanal adı",
      visibility: "Profil görünürlüğü",
      visibilityHint: "Profilini kimler görebilir?",
      selectPlaceholder: "Seç",
    },
    manager: {
      pro: "Pro",
      years: (n) => `${n} yıl`,
      primaryBadge: "Ana",
      edit: "Düzenle",
      deleteAria: "Sil",
      stripes: (n) => `${n} bant`,
      editTitle: (discipline) => `${discipline} düzenle`,
      closeAria: "Kapat",
      addTitle: "Yeni disiplin ekle",
      addButton: "Disiplin Ekle",
    },
    sport: {
      submitAdd: "Ekle",
      submitUpdate: "Güncelle",
      discipline: "Disiplin",
      level: "Seviye",
      weightClass: "Kilo sınıfı",
      selectPlaceholder: "Seç",
      belt: "Kemer",
      stripes: "Bant sayısı",
      weightKg: "Kilo (kg)",
      yearsActive: "Aktif yıl",
      status: "Durum",
      isPro: "Profesyonel sporcuyum",
      record: "Müsabaka bilançosu",
      wins: "Galibiyet",
      losses: "Mağlubiyet",
      draws: "Berabere",
      ko: "KO",
      sub: "Sub",
      koAria: "KO galibiyeti",
      subAria: "Submission galibiyeti",
      isPrimary: "Ana disiplinim olsun",
    },
  },
};
