import type { Locale } from "@/lib/i18n/config";

/**
 * `/hakkinda` sayfasının metinleri.
 *
 * Dur/Devam kapılarının ay numaraları `KPI_GATES` içinde kalır; burada yalnızca
 * satırların yeşil/kırmızı açıklamaları çevrilir, böylece eşik değerleri tek
 * kaynaktan yönetilir.
 */
type Copy = {
  meta: { title: string; description: string };
  badge: string;
  title: string;
  intro: string;
  why: { heading: string; body: string };
  differentiators: { heading: string; items: { t: string; b: string }[] };
  principles: { heading: string; items: { term: string; body: string }[] };
  roadmap: { heading: string; items: { phase: string; body: string }[] };
  gates: {
    heading: string;
    body: string;
    columns: { month: string; green: string; red: string };
    monthPrefix: string;
    rows: Record<number, { green: string; red: string }>;
  };
  privacy: { heading: string; body: string };
  cta: { join: string; forGyms: string };
};

export const aboutCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Über uns",
      description:
        "FIGHTNET ist die unabhängige Plattform für Kampfsport in der DACH-Region. Unsere Vision, unsere Prinzipien und unsere Roadmap.",
    },
    badge: "Über uns",
    title: "Ein Amateurmeister soll genauso sichtbar sein wie ein UFC-Kämpfer",
    intro:
      "FIGHTNET ist eine unabhängige Plattform für den Kampfsport im deutschsprachigen Raum (Deutschland, Österreich, Schweiz). Sie bringt Athletinnen und Athleten, Trainer, Gyms, Veranstalter, Fans und Sponsoren in einer einzigen App zusammen.",
    why: {
      heading: "Warum es uns gibt",
      body:
        "Wer heute ein Amateurturnier sucht, landet beim Landesverband, wer einen UFC-Kampf verfolgen will bei Tapology, wer ein Gym sucht bei Google und wer einen Sparringpartner braucht bei Bekannten. Einen zentralen Ort gibt es nicht. Dazu kommt: Tapology, Sherdog und BoxRec decken ausschließlich Profis ab — ein deutscher BJJ-Amateurmeister ist digital unsichtbar.",
    },
    differentiators: {
      heading: "Drei Dinge, die uns unterscheiden",
      items: [
        {
          t: "Unabhängig von Verbänden",
          b: "Weder ein Box-, noch ein MMA-, noch ein BJJ-Verband besitzt die Plattform. Das schützt Kämpferinnen und Kämpfer davor, zum politischen Werkzeug zu werden.",
        },
        {
          t: "Vertikale Spezialisierung",
          b: "Anders als sportartenübergreifende Plattformen konzentrieren wir uns ausschließlich auf den Kampfsport. Jede Funktion ist auf diesen Sport zugeschnitten.",
        },
        {
          t: "Profi-Standard für die Amateurszene",
          b: "Die Amateurszene in Deutschland und Österreich ist digital unsichtbar. Das ändern wir.",
        },
      ],
    },
    principles: {
      heading: "Unsere Grundprinzipien",
      items: [
        {
          term: "Community First",
          body:
            "Erst lebt die Community, dann wird der Kampfsport organisiert. Community-Funktionen kommen vor SaaS-Funktionen.",
        },
        {
          term: "Value First",
          body:
            "Daten werden nur erhoben, wenn die Nutzerin oder der Nutzer einen klaren Mehrwert davon hat. Im Onboarding gibt es kein überflüssiges Feld.",
        },
        {
          term: "Sichtbarkeitsstufen",
          body:
            "Für jeden einzelnen Datenpunkt entscheidet die Nutzerin oder der Nutzer, wer was zu sehen bekommt.",
        },
        {
          term: "Trust by Design",
          body:
            "Vertrauen entsteht nicht durch Marketingversprechen, sondern durch Systemdesign: Verifizierungsstufen, Bürgschaftsmodell, transparente Moderation.",
        },
      ],
    },
    roadmap: {
      heading: "Roadmap",
      items: [
        {
          phase: "Beta (12 Monate)",
          body: "Early Access auf Einladung, Testen und Iterieren mit Gründungsmitgliedern",
        },
        {
          phase: "Phase 1a",
          body: "Profile, Verifizierung, Trainingstagebuch, Sparring, Livescore",
        },
        {
          phase: "Phase 1b",
          body: "Gym-Finder, Buchungen, Karte, Profile für mehrere Sportarten",
        },
        {
          phase: "Phase 2",
          body: "Veranstalter-Dashboard, Video-Uploads, Forum, Creator-Abos",
        },
        {
          phase: "Phase 3",
          body: "Vollständiges SaaS, Ausrüstungs-Marktplatz, Livestream/PPV, Datenlizenz",
        },
      ],
    },
    gates: {
      heading: "Stop-/Go-Gates",
      body:
        "Aus Gründen der Transparenz machen wir unsere Meilensteine öffentlich. An jedem Gate erfolgt eine Bewertung in Grün, Gelb oder Rot — und wenn nötig ein Kurswechsel.",
      columns: { month: "Monat", green: "Grün", red: "Rot" },
      monthPrefix: "Monat",
      rows: {
        4: { green: "≥20 Warteliste-Einträge", red: "<10 Einträge" },
        5: { green: "≥5 LOI", red: "<2 LOI" },
        6: { green: "≥5 zahlende Gyms + 50 MAVN", red: "<3 zahlende Gyms" },
        9: { green: "≥10 zahlende Gyms + 200 MAVN", red: "<5 zahlende Gyms" },
        12: { green: "≥20 Gyms + 500 MAVN", red: "<10 Gyms" },
      },
    },
    privacy: {
      heading: "Datenschutz",
      body:
        "Alle unsere Server stehen in der EU (AWS Frankfurt). Wir sind DSGVO-konform: granulare Einwilligung, Löschung innerhalb von 30 Tagen, Datenportabilität als JSON/CSV sowie Verschlüsselung mit TLS 1.2+ und AES-256.",
    },
    cta: { join: "Kostenlos beitreten", forGyms: "Für Gyms" },
  },

  en: {
    meta: {
      title: "About us",
      description:
        "FIGHTNET is the independent platform for combat sports in the DACH region. Our vision, our principles and our roadmap.",
    },
    badge: "About us",
    title: "An amateur champion deserves the same visibility as a UFC fighter",
    intro:
      "FIGHTNET is an independent platform for combat sports in the German-speaking region (Germany, Austria, Switzerland). It brings athletes, coaches, gyms, organizers, fans and sponsors together in a single app.",
    why: {
      heading: "Why we exist",
      body:
        "Right now, finding an amateur tournament means checking a regional federation, following a UFC bout means Tapology, finding a gym means Google, and finding a sparring partner means asking around. There is no central place for any of it. On top of that, Tapology, Sherdog and BoxRec only cover professionals — a German BJJ amateur champion is digitally invisible.",
    },
    differentiators: {
      heading: "Three things that set us apart",
      items: [
        {
          t: "Independent of federations",
          b: "No boxing, MMA or BJJ federation owns the platform. That keeps athletes from being used as a political tool.",
        },
        {
          t: "Vertical specialization",
          b: "Unlike cross-sport platforms, we work on combat sports and nothing else. Every feature is built for the sport.",
        },
        {
          t: "Professional standard, amateur level",
          b: "The amateur scene in Germany and Austria is digitally invisible. We are changing that.",
        },
      ],
    },
    principles: {
      heading: "Our core principles",
      items: [
        {
          term: "Community First",
          body:
            "The community comes to life first, then the sport gets organized around it. Community features ship before SaaS features.",
        },
        {
          term: "Value First",
          body:
            "We only collect data when the user gets a clear benefit from it. No pointless fields during onboarding.",
        },
        {
          term: "Visibility levels",
          body: "For every single data point, the user decides who gets to see it.",
        },
        {
          term: "Trust by Design",
          body:
            "Trust is built through system design rather than marketing promises: verification levels, a vouching model and transparent moderation.",
        },
      ],
    },
    roadmap: {
      heading: "Roadmap",
      items: [
        {
          phase: "Beta (12 months)",
          body: "Invite-only early access, testing and iterating with Founding Members",
        },
        { phase: "Phase 1a", body: "Profiles, verification, training log, sparring, live scoring" },
        { phase: "Phase 1b", body: "Gym finder, bookings, map, multi-sport profiles" },
        { phase: "Phase 2", body: "Organizer dashboard, video uploads, forum, Creator subscriptions" },
        { phase: "Phase 3", body: "Full SaaS, gear marketplace, livestream/PPV, data licensing" },
      ],
    },
    gates: {
      heading: "Stop/Go gates",
      body:
        "For the sake of transparency we publish our milestones openly. At every gate we grade ourselves green, amber or red — and change course if we have to.",
      columns: { month: "Month", green: "Green", red: "Red" },
      monthPrefix: "Month",
      rows: {
        4: { green: "≥20 waitlist sign-ups", red: "<10 sign-ups" },
        5: { green: "≥5 LOIs", red: "<2 LOIs" },
        6: { green: "≥5 paying gyms + 50 MAVU", red: "<3 paying gyms" },
        9: { green: "≥10 paying gyms + 200 MAVU", red: "<5 paying gyms" },
        12: { green: "≥20 gyms + 500 MAVU", red: "<10 gyms" },
      },
    },
    privacy: {
      heading: "Data protection",
      body:
        "All of our servers are in the EU (AWS Frankfurt). We are GDPR-compliant: granular consent, deletion within 30 days, data portability as JSON or CSV, and TLS 1.2+ / AES-256 encryption.",
    },
    cta: { join: "Join for free", forGyms: "For Gyms" },
  },

  tr: {
    meta: {
      title: "Hakkımızda",
      description:
        "FIGHTNET, DACH bölgesinde dövüş sporları için bağımsız platformdur. Vizyonumuz, ilkelerimiz ve yol haritamız.",
    },
    badge: "Hakkımızda",
    title: "Amatör şampiyon, bir UFC dövüşçüsü kadar görünür olmalı",
    intro:
      "FIGHTNET, Almanca konuşulan bölgede (Almanya, Avusturya, İsviçre) dövüş sporları için bağımsız bir platformdur. Sporcuları, antrenörleri, salonları, organizatörleri, hayranları ve sponsorları tek bir uygulamada bir araya getirir.",
    why: {
      heading: "Neden var olduk",
      body:
        "Bugün bir amatör turnuva bulmak için bölge federasyonuna, bir UFC maçı için Tapology'ye, salon aramak için Google'a, sparring partneri için tanıdıklara bakılıyor. Merkezi bir yer yok. Üstelik Tapology, Sherdog ve BoxRec yalnızca profesyonelleri kapsıyor — bir Alman BJJ amatör şampiyonu dijital olarak görünmez.",
    },
    differentiators: {
      heading: "Bizi farklı kılan üç şey",
      items: [
        {
          t: "Federasyondan bağımsızlık",
          b: "Ne boks, ne MMA, ne BJJ federasyonu platformu sahiplenir. Bu, sporcuları politik araç olmaktan korur.",
        },
        {
          t: "Dikey uzmanlaşma",
          b: "Çapraz-spor platformlarının aksine yalnızca dövüş sporlarına odaklanıyoruz. Her özellik spora özel.",
        },
        {
          t: "Profesyonel standart, amatör seviye",
          b: "Almanya ve Avusturya'nın amatör alanı dijital olarak görünmez. Bunu değiştiriyoruz.",
        },
      ],
    },
    principles: {
      heading: "Temel ilkelerimiz",
      items: [
        {
          term: "Community First",
          body:
            "Önce topluluk yaşasın, sonra dövüş sporu organize edilsin. Topluluk özellikleri SaaS özelliklerinden önce gelir.",
        },
        {
          term: "Value First",
          body:
            "Veri yalnızca kullanıcı net bir fayda gördüğünde toplanır. Onboarding'de gereksiz alan yok.",
        },
        {
          term: "Görünürlük seviyeleri",
          body: "Her veri noktası için kimin ne göreceğine kullanıcı karar verir.",
        },
        {
          term: "Trust by Design",
          body:
            "Güven pazarlama vaadiyle değil sistem tasarımıyla kurulur: doğrulama seviyeleri, kefalet modeli, şeffaf moderasyon.",
        },
      ],
    },
    roadmap: {
      heading: "Yol haritası",
      items: [
        { phase: "Beta (12 ay)", body: "Davetli erken erişim, Kurucu Üyelerle test ve iterasyon" },
        { phase: "Faz 1a", body: "Profiller, doğrulama, antrenman günlüğü, sparring, canlı skor" },
        { phase: "Faz 1b", body: "Salon bulucu, rezervasyon, harita, çoklu spor profilleri" },
        { phase: "Faz 2", body: "Organizatör paneli, video yüklemeleri, forum, Creator abonelikleri" },
        { phase: "Faz 3", body: "Tam SaaS, ekipman pazarı, canlı yayın/PPV, veri lisansı" },
      ],
    },
    gates: {
      heading: "Dur/Devam kapıları",
      body:
        "Şeffaflık gereği kilometre taşlarımızı açık paylaşıyoruz. Her kapıda yeşil/sarı/kırmızı değerlendirmesi yapılır ve gerekirse yön değiştirilir.",
      columns: { month: "Ay", green: "Yeşil", red: "Kırmızı" },
      monthPrefix: "Ay",
      rows: {
        4: { green: "≥20 bekleme listesi", red: "<10 bekleme" },
        5: { green: "≥5 LOI", red: "<2 LOI" },
        6: { green: "≥5 ödeyen + 50 MAVU", red: "<3 ödeyen" },
        9: { green: "≥10 ödeyen + 200 MAVU", red: "<5 ödeyen" },
        12: { green: "≥20 salon + 500 MAVU", red: "<10 salon" },
      },
    },
    privacy: {
      heading: "Veri koruması",
      body:
        "Tüm sunucularımız AB'dedir (AWS Frankfurt). KVKK/GDPR uyumluyuz: granüler izin, 30 gün içinde silme hakkı, JSON/CSV veri taşınabilirliği ve TLS 1.2+ / AES-256 şifreleme.",
    },
    cta: { join: "Ücretsiz Katıl", forGyms: "Salonlar İçin" },
  },
};
