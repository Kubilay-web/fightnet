import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel` ana sayfasının metinleri (§5.2).
 *
 * Sayı içeren satırlar fonksiyon olarak tutulur: Almancada yüzde işareti sayıdan
 * sonra, Türkçede önce gelir; aynı şekilde "3 dakika"/"3 Minuten" gibi ekler dile
 * göre farklı yerde durur. Şablonu dilin kendisine bırakmak, string birleştirme
 * yerine tek parça cümle yazmayı mümkün kılar.
 */
type Copy = {
  meta: { title: string };
  greeting: string;
  profileComplete: (score: number) => string;
  viewProfile: string;
  completion: { title: string; percent: (score: number) => string };
  nextStep: {
    avatar: { text: string; cta: string };
    sport: { text: string; cta: string };
    bio: { text: string; cta: string };
    city: { text: string; cta: string };
    verify: { text: string; cta: string };
  };
  verifyAlert: { title: string; body: string; pending: string; start: string };
  stats: {
    streak: string;
    streakHint: string;
    week: string;
    weekHint: (minutes: number) => string;
    followers: string;
    pending: string;
    pendingHint: string;
  };
  quick: { training: string; sparring: string; post: string; gym: string };
  trainings: {
    title: string;
    all: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    minutesShort: string;
    intensity: string;
  };
  bookings: {
    title: string;
    all: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
  };
  disciplines: { title: string; edit: string; recordLegend: string };
};

export const panelHomeCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Mein Dashboard" },
    greeting: "Hallo,",
    profileComplete: (score) => `Profil zu ${score}% ausgefüllt`,
    viewProfile: "Mein Profil ansehen",
    completion: {
      title: "Vervollständige dein Profil",
      percent: (score) => `${score}%`,
    },
    nextStep: {
      avatar: {
        text: "Füge ein Profilfoto hinzu — Profile mit Foto werden dreimal häufiger aufgerufen.",
        cta: "Foto hinzufügen",
      },
      sport: {
        text: "Füge eine Disziplin hinzu — welche Sportarten trainierst du?",
        cta: "Disziplin hinzufügen",
      },
      bio: {
        text: "Schreib eine kurze Bio — damit Sponsoren und Trainer dich kennenlernen.",
        cta: "Bio schreiben",
      },
      city: {
        text: "Trag deine Stadt ein — damit Sparringpartner in deiner Region dich finden.",
        cta: "Stadt hinzufügen",
      },
      verify: {
        text: "Schließe deine Verifizierung ab und schalte alle Funktionen frei.",
        cta: "Verifizieren",
      },
    },
    verifyAlert: {
      title: "Verifizierung abschließen",
      body:
        "Sparringsuche und Live-Kommentare stehen Mitgliedern ab Stufe 1 (Identität verifiziert) offen.",
      pending: " Deine Anfrage wird geprüft.",
      start: "Jetzt starten",
    },
    stats: {
      streak: "Streak",
      streakHint: "Tage in Folge",
      week: "Diese Woche",
      weekHint: (minutes) => `${minutes} Minuten`,
      followers: "Follower",
      pending: "Offen",
      pendingHint: "Sparring-Anfragen",
    },
    quick: {
      training: "Training eintragen",
      sparring: "Sparring-Anzeige",
      post: "Beitrag teilen",
      gym: "Gym finden",
    },
    trainings: {
      title: "Letzte Trainings",
      all: "Alle",
      emptyTitle: "Noch keine Einträge",
      emptyBody: "Trag dein erstes Training ein und starte deinen Streak-Zähler.",
      emptyCta: "Training eintragen",
      minutesShort: "Min",
      intensity: "Intensität",
    },
    bookings: {
      title: "Anstehende Buchungen",
      all: "Alle",
      emptyTitle: "Keine Buchungen",
      emptyBody: "Vereinbare ein Probetraining in einem Gym in deiner Region.",
      emptyCta: "Gym finden",
    },
    disciplines: {
      title: "Meine Disziplinen",
      edit: "Bearbeiten",
      recordLegend: "Siege – Niederlagen – Unentschieden",
    },
  },

  en: {
    meta: { title: "My dashboard" },
    greeting: "Hi,",
    profileComplete: (score) => `Profile ${score}% complete`,
    viewProfile: "View my profile",
    completion: {
      title: "Complete your profile",
      percent: (score) => `${score}%`,
    },
    nextStep: {
      avatar: {
        text: "Add a profile photo — profiles with one get three times more views.",
        cta: "Add photo",
      },
      sport: {
        text: "Add a discipline — which sports do you train?",
        cta: "Add discipline",
      },
      bio: {
        text: "Write a short bio — let sponsors and coaches get to know you.",
        cta: "Write bio",
      },
      city: {
        text: "Add your city — let sparring partners in your area find you.",
        cta: "Add city",
      },
      verify: {
        text: "Complete your verification and unlock every feature.",
        cta: "Verify",
      },
    },
    verifyAlert: {
      title: "Complete your verification",
      body:
        "Sparring search and live commentary are open to members from Level 1 (identity verified) upwards.",
      pending: " Your request is under review.",
      start: "Start now",
    },
    stats: {
      streak: "Streak",
      streakHint: "days in a row",
      week: "This week",
      weekHint: (minutes) => `${minutes} minutes`,
      followers: "Followers",
      pending: "Pending",
      pendingHint: "sparring requests",
    },
    quick: {
      training: "Log training",
      sparring: "Sparring listing",
      post: "Share post",
      gym: "Find a gym",
    },
    trainings: {
      title: "Recent training",
      all: "See all",
      emptyTitle: "No entries yet",
      emptyBody: "Log your first session and start your streak counter.",
      emptyCta: "Log training",
      minutesShort: "min",
      intensity: "Intensity",
    },
    bookings: {
      title: "Upcoming bookings",
      all: "See all",
      emptyTitle: "No bookings",
      emptyBody: "Book a trial session at a gym in your area.",
      emptyCta: "Find a gym",
    },
    disciplines: {
      title: "My disciplines",
      edit: "Edit",
      recordLegend: "Wins – Losses – Draws",
    },
  },

  tr: {
    meta: { title: "Panelim" },
    greeting: "Merhaba,",
    profileComplete: (score) => `Profil %${score} tamamlandı`,
    viewProfile: "Profilimi Gör",
    completion: {
      title: "Profilini tamamla",
      percent: (score) => `%${score}`,
    },
    nextStep: {
      avatar: {
        text: "Profil fotoğrafı ekle — profiller 3 kat daha fazla görüntülenir.",
        cta: "Fotoğraf Ekle",
      },
      sport: {
        text: "Disiplin ekle — hangi sporları yapıyorsun?",
        cta: "Disiplin Ekle",
      },
      bio: {
        text: "Kısa bir biyografi yaz — sponsorlar ve antrenörler seni tanısın.",
        cta: "Bio Yaz",
      },
      city: {
        text: "Şehrini ekle — bölgendeki sparring partnerleri seni bulsun.",
        cta: "Şehir Ekle",
      },
      verify: {
        text: "Doğrulamanı tamamla ve tüm özelliklerin kilidini aç.",
        cta: "Doğrula",
      },
    },
    verifyAlert: {
      title: "Doğrulamanı tamamla",
      body: "Sparring araması ve canlı yorum, Seviye 1 (kimlik doğrulanmış) üyelere açıktır.",
      pending: " Talebin inceleniyor.",
      start: "Hemen başlat",
    },
    stats: {
      streak: "Streak",
      streakHint: "art arda gün",
      week: "Bu hafta",
      weekHint: (minutes) => `${minutes} dakika`,
      followers: "Takipçi",
      pending: "Bekleyen",
      pendingHint: "sparring talebi",
    },
    quick: {
      training: "Antrenman Ekle",
      sparring: "Sparring İlanı",
      post: "Gönderi Paylaş",
      gym: "Salon Bul",
    },
    trainings: {
      title: "Son Antrenmanlar",
      all: "Tümü",
      emptyTitle: "Henüz kayıt yok",
      emptyBody: "İlk antrenmanını kaydet, streak sayacını başlat.",
      emptyCta: "Antrenman Ekle",
      minutesShort: "dk",
      intensity: "Yoğunluk",
    },
    bookings: {
      title: "Yaklaşan Rezervasyonlar",
      all: "Tümü",
      emptyTitle: "Rezervasyon yok",
      emptyBody: "Bölgendeki salonlarda deneme antrenmanı ayarla.",
      emptyCta: "Salon Bul",
    },
    disciplines: {
      title: "Disiplinlerim",
      edit: "Düzenle",
      recordLegend: "Galibiyet – Mağlubiyet – Berabere",
    },
  },
};
