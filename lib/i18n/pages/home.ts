import type { Locale } from "@/lib/i18n/config";

/**
 * `/` ana sayfasının metinleri.
 *
 * Sözlükte (`dict.home.*`) zaten bulunan başlıklar burada TEKRARLANMAZ; bu
 * modül yalnızca ana sayfaya özgü metinleri taşır: rozetler,
 * bölüm alt başlıkları, özellik kartları, ilkeler ve bekleme listesi bloğu.
 *
 * Özellik kartlarının ikon ve `href` değerleri sayfada kalır; buradaki
 * `features.items` dizisi onunla AYNI SIRADA olmalıdır.
 */
type Copy = {
  meta: { title: string; description: string };
  hero: {
    badgeBeta: string;
    badgeFounder: string;
    ctaFighters: string;
    trustVerification: string;
    trustHosting: string;
    trustIndependent: string;
  };
  sections: {
    spotlightSub: string;
    spotlightBadge: string;
    followers: string;
    viewProfile: string;
    upcomingSub: string;
    calendar: string;
    fightersSub: string;
    gymsSub: string;
    postsSub: string;
    feed: string;
  };
  features: { heading: string; subtitle: string; items: { title: string; body: string }[] };
  principles: { heading: string; subtitle: string; items: { title: string; body: string }[] };
  waitlist: { badge: string; heading: string; body: string };
};

export const homeCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "FIGHTNET — Die unabhängige Kampfsport-Plattform im DACH-Raum",
      description:
        "Verifizierte Kämpferprofile, Gym-Finder, Sparring-Matching, Trainingstagebuch und Livescore — alles an einem Ort.",
    },
    hero: {
      badgeBeta: "Beta · Early Access auf Einladung",
      badgeFounder: "Gründungsmitglied 50 €/Monat",
      ctaFighters: "Kämpfer entdecken",
      trustVerification: "Verifizierung in 3 Stufen",
      trustHosting: "Hosting in der EU · DSGVO",
      trustIndependent: "Verbandsunabhängig",
    },
    sections: {
      spotlightSub: "Jeden Tag ein Kämpfer im Rampenlicht",
      spotlightBadge: "Spotlight",
      followers: "Follower",
      viewProfile: "Profil ansehen",
      upcomingSub: "Der lokale und globale Kampfsportkalender",
      calendar: "Kalender",
      fightersSub: "Verifizierte Profile — vom Amateur bis zum Profi",
      gymsSub: "Finde Kampfsport-Gyms in deiner Region und vereinbare ein Probetraining",
      postsSub: "Die neuesten Trainings- und Wettkampfinhalte aus der Community",
      feed: "Feed",
    },
    features: {
      heading: "Was die Plattform bietet",
      subtitle: "Community zuerst — Infrastruktur danach",
      items: [
        {
          title: "Verifizierung in 3 Stufen",
          body:
            "E-Mail, Ausweis und Selfie (KYC) sowie Statusprüfung. Trainer können für bis zu 20 ihrer Schützlinge bürgen.",
        },
        {
          title: "Trainingstagebuch",
          body:
            "Halte jede Einheit fest und baue deine Serie aus. Funktioniert offline und synchronisiert, sobald die Verbindung zurück ist.",
        },
        {
          title: "Sparring-Matching",
          body:
            "Finde in deiner Region Partner nach Disziplin, Niveau und Gewicht. Nach jeder Einheit folgt eine Sicherheitsbewertung.",
        },
        {
          title: "Livescore mit Kommentar",
          body:
            "Ergebnisse laufender Kämpfe in Echtzeit, dazu ein Live-Kommentar Runde für Runde.",
        },
        {
          title: "Gym-Finder und Buchung",
          body:
            "Sieh dir Gyms auf der Karte an und melde dich über einen eigenen Ablauf zum Probetraining an.",
        },
        {
          title: "Creator-Abos",
          body:
            "Athleten eröffnen ihre eigene Aboseite, Fans unterstützen sie. 85 % bleiben beim Athleten.",
        },
      ],
    },
    principles: {
      heading: "Unsere Grundprinzipien",
      subtitle: "Vier Prinzipien sind der Kompass für jede Funktions- und Designentscheidung.",
      items: [
        {
          title: "Community First",
          body:
            "Erst soll die Community auf FIGHTNET leben. Dann soll der Kampfsport über FIGHTNET organisiert werden.",
        },
        {
          title: "Value First",
          body:
            "Daten werden nur erhoben, wenn die Nutzerin oder der Nutzer einen klaren Mehrwert davon hat. Kein überflüssiges Feld, kein Sammelreflex.",
        },
        {
          title: "Sichtbarkeitsstufen",
          body:
            "Für jeden Datenpunkt entscheidest du, wer was sieht — von öffentlich bis vollständig privat.",
        },
        {
          title: "Trust by Design",
          body:
            "Vertrauen entsteht nicht durch Marketingversprechen, sondern durch Systemdesign: Verifizierung, Bürgschaft, transparente Moderation.",
        },
      ],
    },
    waitlist: {
      badge: "Beta-Programm",
      heading: "Trag dich für den Early Access ein",
      body:
        "FIGHTNET startet mit Early Access auf Einladung. Gründungsmitglieder behalten den Vorzugspreis von 50 €/Monat auf Lebenszeit und tragen das Gründer-Abzeichen im Profil.",
    },
  },

  en: {
    meta: {
      title: "FIGHTNET — The independent combat sports platform for the DACH region",
      description:
        "Verified fighter profiles, gym finder, sparring matching, training log and live scores — all in one place.",
    },
    hero: {
      badgeBeta: "Beta · Invite-only early access",
      badgeFounder: "Founding member 50 €/month",
      ctaFighters: "Explore fighters",
      trustVerification: "Three-level verification",
      trustHosting: "Hosted in the EU · GDPR",
      trustIndependent: "Independent of federations",
    },
    sections: {
      spotlightSub: "A different fighter in the spotlight every day",
      spotlightBadge: "Spotlight",
      followers: "followers",
      viewProfile: "View profile",
      upcomingSub: "The local and global combat sports calendar",
      calendar: "Calendar",
      fightersSub: "Verified profiles — from amateur to professional",
      gymsSub: "Find combat sports gyms in your area and arrange a trial session",
      postsSub: "The newest training and competition content from the community",
      feed: "Feed",
    },
    features: {
      heading: "What the platform offers",
      subtitle: "Community first — infrastructure second",
      items: [
        {
          title: "Three-level verification",
          body:
            "Email, ID and selfie (KYC) plus status checks. Coaches can vouch for up to 20 of their students.",
        },
        {
          title: "Training log",
          body:
            "Record every session and grow your streak. Works offline and syncs as soon as you are back online.",
        },
        {
          title: "Sparring matching",
          body:
            "Find partners in your area by discipline, level and weight. Every session ends with a safety rating.",
        },
        {
          title: "Live scoring with commentary",
          body: "Real-time results from ongoing bouts, with round-by-round live commentary.",
        },
        {
          title: "Gym finder and booking",
          body:
            "See gyms on the map and sign up for a trial session through a dedicated flow.",
        },
        {
          title: "Creator subscriptions",
          body:
            "Athletes open their own subscription page and fans support them. 85 % stays with the athlete.",
        },
      ],
    },
    principles: {
      heading: "Our core principles",
      subtitle: "Four principles are the compass for every feature and design decision.",
      items: [
        {
          title: "Community First",
          body:
            "First the community should live on FIGHTNET. Then combat sports should be organized through FIGHTNET.",
        },
        {
          title: "Value First",
          body:
            "We only collect data when the user gets a clear benefit from it. No pointless fields, no urge to collect.",
        },
        {
          title: "Visibility levels",
          body:
            "For every data point you decide who sees what — from fully public to completely private.",
        },
        {
          title: "Trust by Design",
          body:
            "Trust is built through system design rather than marketing promises: verification, vouching and transparent moderation.",
        },
      ],
    },
    waitlist: {
      badge: "Beta programme",
      heading: "Join the early access list",
      body:
        "FIGHTNET is launching with invite-only early access. Founding Members keep the privileged price of 50 €/month for life and carry the Founder badge on their profile.",
    },
  },

  tr: {
    meta: {
      title: "FIGHTNET — DACH'ın bağımsız dövüş sporu platformu",
      description:
        "Doğrulanmış dövüşçü profilleri, salon bulucu, sparring eşleştirme, antrenman günlüğü ve canlı skor — hepsi tek yerde.",
    },
    hero: {
      badgeBeta: "Beta · Davetli Erken Erişim",
      badgeFounder: "Kurucu Üye 50 €/ay",
      ctaFighters: "Dövüşçüleri Keşfet",
      trustVerification: "3 seviyeli doğrulama",
      trustHosting: "AB'de barındırma · KVKK",
      trustIndependent: "Federasyondan bağımsız",
    },
    sections: {
      spotlightSub: "Her gün öne çıkan bir dövüşçü",
      spotlightBadge: "Spotlight",
      followers: "takipçi",
      viewProfile: "Profili Gör",
      upcomingSub: "Yerel ve küresel dövüş sporu takvimi",
      calendar: "Takvim",
      fightersSub: "Doğrulanmış profiller — amatörden profesyonele",
      gymsSub: "Bölgendeki dövüş sporu salonlarını bul, deneme antrenmanı ayarla",
      postsSub: "Topluluktan en yeni antrenman ve müsabaka içerikleri",
      feed: "Akış",
    },
    features: {
      heading: "Platformda neler var",
      subtitle: "Topluluk önce — altyapı sonra",
      items: [
        {
          title: "3 Seviyeli Doğrulama",
          body:
            "E-posta, kimlik+selfie (KYC) ve durum doğrulaması. Antrenörler 20 öğrencisine kadar kefil olabilir.",
        },
        {
          title: "Antrenman Günlüğü",
          body:
            "Her seansı kaydet, streak sayacını büyüt. Çevrimdışı çalışır, bağlantı gelince senkronize olur.",
        },
        {
          title: "Sparring Eşleştirme",
          body:
            "Bölgende disiplin, seviye ve kiloya göre partner bul. Her seans sonrası güvenlik değerlendirmesi.",
        },
        {
          title: "Yorumlu Canlı Skor",
          body: "Devam eden müsabakaların anlık sonuçları, tur tur canlı yorum akışı.",
        },
        {
          title: "Salon Bulucu & Rezervasyon",
          body: "Harita üzerinde salonları gör, deneme antrenmanı için özel akışla kayıt ol.",
        },
        {
          title: "Creator Abonelikleri",
          body: "Sporcular kendi abonelik sayfasını açar, hayranlar destekler. %85 sporcuda kalır.",
        },
      ],
    },
    principles: {
      heading: "Temel İlkelerimiz",
      subtitle: "Dört ilke tüm özellik ve tasarım kararlarımıza pusula olur.",
      items: [
        {
          title: "Community First",
          body:
            "Önce topluluk FIGHTNET'te yaşasın. Sonra dövüş sporu FIGHTNET üzerinden organize edilsin.",
        },
        {
          title: "Value First",
          body:
            "Veri yalnızca kullanıcı net bir fayda gördüğünde toplanır. Gereksiz alan yok, veri toplama refleksi yok.",
        },
        {
          title: "Görünürlük Seviyeleri",
          body:
            "Her veri noktası için kimin ne göreceğine sen karar verirsin — herkese açıktan tamamen özele.",
        },
        {
          title: "Trust by Design",
          body:
            "Güven pazarlama vaadiyle değil sistem tasarımıyla kurulur: doğrulama, kefalet, şeffaf moderasyon.",
        },
      ],
    },
    waitlist: {
      badge: "Beta Programı",
      heading: "Erken erişim listesine katıl",
      body:
        "FIGHTNET davetli erken erişimle başlıyor. Kurucu Üyeler ömür boyu 50 €/ay ayrıcalıklı fiyatı korur ve profilinde Kurucu rozeti taşır.",
    },
  },
};
