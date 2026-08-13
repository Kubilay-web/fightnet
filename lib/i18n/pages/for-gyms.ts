import type { Locale } from "@/lib/i18n/config";

/** `/salonlar-icin` sayfasının metinleri. Fiyatlar üç dilde de aynıdır. */
type Copy = {
  meta: { title: string; description: string };
  badge: string;
  title: string;
  intro: string;
  founder: {
    badge: string;
    price: string;
    perMonth: string;
    note: { text: string; strong: string };
    features: string[];
  };
  standard: {
    badge: string;
    price: string;
    perMonth: string;
    note: string;
    limited: string;
  };
  start: { heading: string; items: string[] };
  existing: { heading: string; body: string };
  waitlist: { heading: string };
  cta: string;
};

export const forGymsCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Für Gyms",
      description:
        "FIGHTNET Gründungsmitgliedschaft: für 50 € pro Monat neue Mitglieder gewinnen, Probetrainings abwickeln, Kursplan und Buchungen verwalten.",
    },
    badge: "Gründungsmitgliedschaft",
    title: "Speziell für den Kampfsport entwickelte Software für dein Gym",
    intro:
      "Allgemeine Studio-Software wie Eversports oder Mindbody funktioniert auch im Kampfsport, ist aber eben allgemein. Sie versteht weder Gürtel-Verifizierungen noch Sparringstufen oder Wettkampfhistorien. FIGHTNET wurde ausschließlich für den Kampfsport entwickelt.",
    founder: {
      badge: "Gründerpreis",
      price: "50 €",
      perMonth: "/Monat",
      note: {
        text: "Für die ersten 6 Monate. ",
        strong: "Gründungsmitglieder behalten diesen Preis lebenslang.",
      },
      features: [
        "Verifiziertes Gym-Profil und Sichtbarkeit auf der Karte",
        "Probetrainings-Flow — du kennst die Interessenten, bevor sie in der Halle stehen",
        "Verwaltung des wöchentlichen Kursplans",
        "Buchungsanfragen und Freigabe-Flow",
        "Level-2-Verifizierung und Bürgschaftsrecht für deine Trainer",
        "Einblick in die Trainingsaktivität deiner Mitglieder",
        "Events anlegen und Livescore",
        "Gründungs-Gym-Badge",
      ],
    },
    standard: {
      badge: "Standard",
      price: "100-150 €",
      perMonth: "/Monat",
      note: "Der Preis für Gyms, die nach dem vollständigen Launch dazukommen.",
      limited:
        "Die Gründungsmitgliedschaft ist nur während des Beta-Programms offen — die Plätze sind begrenzt.",
    },
    start: {
      heading: "So legen wir los",
      items: [
        "Melde dich für die Warteliste an — dein Beta-Zugangscode kommt per E-Mail",
        "Registriere dich als Gym-Betreiber und schließe die Level-2-Verifizierung ab",
        "Leg dein Gym-Profil an: Logo, Titelbild, Disziplinen, Kursplan",
        "Nach der Freigabe durch das Admin-Team geht dein Gym online (24-48 Stunden)",
        "Lade deine Mitglieder ein — deine Trainer können für ihre Schützlinge bürgen",
      ],
    },
    existing: {
      heading: "Wenn du bereits Software im Einsatz hast",
      body:
        "Du kannst FIGHTNET als Schicht über deinem bestehenden System nutzen statt als Konkurrenz dazu. Vertragsverwaltung und SEPA-Zahlungen richten sich ausschließlich an neue Gyms ohne bestehende Software und werden erst nach dem regionalen Pilotprojekt freigeschaltet.",
    },
    waitlist: { heading: "Trag dich in die Warteliste ein" },
    cta: "Kontaktiere uns",
  },

  en: {
    meta: {
      title: "For Gyms",
      description:
        "FIGHTNET Founding Membership: 50 € per month for member acquisition, a trial-class flow, class schedule and booking management.",
    },
    badge: "Founding Membership",
    title: "Software built for combat sports, made for your gym",
    intro:
      "General studio software such as Eversports or Mindbody works for combat sports, but it is generic. It does not understand belt verifications, sparring levels or competition records. FIGHTNET was designed for combat sports and nothing else.",
    founder: {
      badge: "Founder Price",
      price: "50 €",
      perMonth: "/month",
      note: {
        text: "For the first 6 months. ",
        strong: "Founding Members keep this price for life.",
      },
      features: [
        "Verified gym profile and visibility on the map",
        "Trial-class flow — you know who is coming before they walk in",
        "Weekly class schedule management",
        "Booking requests and an approval flow",
        "Level 2 verification and vouching rights for your coaches",
        "Insight into the training activity of your members",
        "Event creation and live scoring",
        "Founding Gym badge",
      ],
    },
    standard: {
      badge: "Standard",
      price: "100-150 €",
      perMonth: "/month",
      note: "The price for gyms that join after the full launch.",
      limited: "Founding Membership is only open during the beta program — places are limited.",
    },
    start: {
      heading: "How we get started",
      items: [
        "Sign up for the waitlist — your beta access code arrives by email",
        "Register as a Gym Owner and complete Level 2 verification",
        "Build your gym profile: logo, cover image, disciplines, class schedule",
        "Once an admin approves it, your gym goes live (24-48 hours)",
        "Invite your members — your coaches can vouch for their students",
      ],
    },
    existing: {
      heading: "If you already have software",
      body:
        "You can run FIGHTNET as a layer on top of your existing system rather than as a competitor to it. Contract management and SEPA payments are aimed only at new gyms without existing software and will arrive after the regional pilot.",
    },
    waitlist: { heading: "Join the waitlist" },
    cta: "Get in touch",
  },

  tr: {
    meta: {
      title: "Salonlar İçin",
      description:
        "FIGHTNET Kurucu Üyelik: ayda 50 € ile üye kazanımı, deneme antrenmanı akışı, ders programı ve rezervasyon yönetimi.",
    },
    badge: "Kurucu Üyelik",
    title: "Salonun için dövüş sporuna özel yazılım",
    intro:
      "Eversports ve Mindbody gibi genel salon yazılımları dövüş sporu için çalışır ama geneldir. Kemer doğrulamalarını, sparring seviyelerini veya müsabaka geçmişlerini anlamazlar. FIGHTNET yalnızca dövüş sporları için tasarlandı.",
    founder: {
      badge: "Kurucu Fiyat",
      price: "50 €",
      perMonth: "/ay",
      note: {
        text: "İlk 6 ay için. ",
        strong: "Kurucu Üyeler bu fiyatı ömür boyu korur.",
      },
      features: [
        "Doğrulanmış salon profili ve harita görünürlüğü",
        "Deneme antrenmanı akışı — öğrenci gelmeden önce tanıyorsun",
        "Haftalık ders programı yönetimi",
        "Rezervasyon talepleri ve onay akışı",
        "Antrenörlerin için Seviye 2 doğrulama ve kefalet hakkı",
        "Üyelerinin antrenman aktivitesini görme",
        "Etkinlik oluşturma ve canlı skor",
        "Kurucu Salon rozeti",
      ],
    },
    standard: {
      badge: "Standart",
      price: "100-150 €",
      perMonth: "/ay",
      note: "Tam lansmandan sonra yeni katılan salonlar için geçerli fiyat.",
      limited: "Kurucu Üyelik yalnızca Beta programı süresince açıktır — kontenjan sınırlıdır.",
    },
    start: {
      heading: "Nasıl başlarız",
      items: [
        "Bekleme listesine kaydol — beta erişim kodun e-postana gelir",
        "Salon İşletmecisi olarak kayıt ol, Seviye 2 doğrulamasını tamamla",
        "Salon profilini oluştur: logo, kapak, disiplinler, ders programı",
        "Admin onayından sonra salonun yayına girer (24-48 saat)",
        "Üyelerini davet et — antrenörlerin öğrencilerine kefil olabilir",
      ],
    },
    existing: {
      heading: "Mevcut yazılımın varsa",
      body:
        "FIGHTNET'i mevcut sistemine rakip değil, üstüne katman olarak kullanabilirsin. Sözleşme yönetimi ve SEPA ödeme özellikleri yalnızca mevcut yazılımı olmayan yeni salonlar için, bölgesel pilot sonrası devreye alınacak.",
    },
    waitlist: { heading: "Bekleme listesine katıl" },
    cta: "Bize ulaş",
  },
};
