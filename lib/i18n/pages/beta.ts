import type { Locale } from "@/lib/i18n/config";

/**
 * `/beta` sayfasının metinleri.
 *
 * `strong` alanı, madde sonundaki kalın vurguyu taşır; JSX'te `<b>` olarak
 * basılır, böylece işaretleme çeviri metnine gömülmez.
 */
type Copy = {
  meta: { title: string; description: string };
  badge: string;
  title: string;
  intro: string;
  timeline: { heading: string; items: { phase: string; months: string; what: string }[] };
  perks: { heading: string; items: { text: string; strong?: string }[] };
  invite: { heading: string; items: string[] };
};

export const betaCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Beta-Programm",
      description:
        "Das Early-Access-Programm von FIGHTNET auf Einladung — Vorteile für Gründungsmitglieder und die Roadmap für 12 Monate.",
    },
    badge: "Early Access auf Einladung",
    title: "Beta-Programm",
    intro:
      "FIGHTNET startet nicht mit einem großen öffentlichen Launch. Stattdessen wird die Plattform mit einer kleinen Gruppe von Gründungsmitgliedern getestet — der Weg, den auch Superhuman, Notion und Linear gegangen sind. Ein Produkt, das aus echtem Feedback entsteht, reift, bevor es sich für alle öffnet.",
    timeline: {
      heading: "Zeitplan über 12 Monate",
      items: [
        {
          phase: "Beta 0",
          months: "Monat 1–2",
          what: "Landingpage ist online, die Anmeldungen für die Warteliste starten",
        },
        {
          phase: "Beta 1",
          months: "Monat 3–5",
          what: "Kernfunktionen des MVP: Profile, Verifizierung, Trainingstagebuch, Sparring",
        },
        {
          phase: "Beta 2 (geschlossen)",
          months: "Monat 6–8",
          what: "Die ersten Gründungsmitglieder erhalten ihren Beta-Zugangscode, intensives Feedback",
        },
        {
          phase: "Beta 3 (offen)",
          months: "Monat 9–12",
          what: "Mehr Einladungen aus der Warteliste, mehr Marketing, vollständiger Launch",
        },
      ],
    },
    perks: {
      heading: "Vorteile für Gründungsmitglieder",
      items: [
        {
          text: "50 € pro Monat für die ersten 6 Monate — ",
          strong: "diesen Preis behältst du lebenslang",
        },
        { text: "Gründungsmitglied-Badge auf deinem Profil und auf deiner Gym-Seite" },
        { text: "Direkter Einfluss auf die Produkt-Roadmap: Dein Feedback wird zur Funktion" },
        { text: "Als Erste Zugriff auf neue Funktionen" },
      ],
    },
    invite: {
      heading: "So bekommst du eine Einladung",
      items: [
        "Melde dich für die Warteliste an",
        "Dein Beta-Zugangscode kommt per E-Mail",
        "Gib den Code bei der Registrierung ein — deine Gründungsvorteile werden automatisch freigeschaltet",
      ],
    },
  },

  en: {
    meta: {
      title: "Beta Program",
      description:
        "The invite-only early access program of FIGHTNET — Founding Member perks and the 12-month roadmap.",
    },
    badge: "Invite-only early access",
    title: "Beta Program",
    intro:
      "FIGHTNET is not launching with a big public release. Instead the platform is tested with a small group of Founding Members — the same path Superhuman, Notion and Linear took. A product shaped by real feedback matures before it opens up to everyone.",
    timeline: {
      heading: "The 12-month timeline",
      items: [
        {
          phase: "Beta 0",
          months: "Months 1–2",
          what: "Landing page goes live, waitlist sign-ups open",
        },
        {
          phase: "Beta 1",
          months: "Months 3–5",
          what: "Core MVP features: profiles, verification, training log, sparring",
        },
        {
          phase: "Beta 2 (closed)",
          months: "Months 6–8",
          what: "The first Founding Members receive their beta access code, intensive feedback",
        },
        {
          phase: "Beta 3 (open)",
          months: "Months 9–12",
          what: "More invites from the waitlist, marketing ramps up, full launch",
        },
      ],
    },
    perks: {
      heading: "Founding Member perks",
      items: [
        { text: "50 € per month for the first 6 months — ", strong: "you keep that price for life" },
        { text: "A Founder badge on your profile and on your gym page" },
        { text: "Direct influence on the product roadmap: your feedback turns into a feature" },
        { text: "First access to new features" },
      ],
    },
    invite: {
      heading: "How to get an invite",
      items: [
        "Sign up for the waitlist",
        "Your beta access code arrives by email",
        "Enter the code when you register — your Founder perks are applied automatically",
      ],
    },
  },

  tr: {
    meta: {
      title: "Beta Programı",
      description:
        "FIGHTNET davetli erken erişim programı — Kurucu Üye ayrıcalıkları ve 12 aylık yol haritası.",
    },
    badge: "Davetli Erken Erişim",
    title: "Beta Programı",
    intro:
      "FIGHTNET büyük bir halka açık lansmanla başlamaz. Bunun yerine küçük bir Kurucu Üye grubuyla test edilir — Superhuman, Notion ve Linear'ın izlediği yol. Gerçek geri bildirimle şekillenen bir ürün, herkese açılmadan önce olgunlaşır.",
    timeline: {
      heading: "12 aylık zaman çizelgesi",
      items: [
        {
          phase: "Beta 0",
          months: "Ay 1–2",
          what: "Landing sayfası yayında, bekleme listesi kayıtları başlar",
        },
        {
          phase: "Beta 1",
          months: "Ay 3–5",
          what: "MVP temel özellikleri: profiller, doğrulama, antrenman günlüğü, sparring",
        },
        {
          phase: "Beta 2 (Kapalı)",
          months: "Ay 6–8",
          what: "İlk Kurucu Üyeler beta erişim kodu alır, yoğun geri bildirim",
        },
        {
          phase: "Beta 3 (Açık)",
          months: "Ay 9–12",
          what: "Bekleme listesinden daha fazla davet, pazarlama artışı, tam lansman",
        },
      ],
    },
    perks: {
      heading: "Kurucu Üye ayrıcalıkları",
      items: [
        { text: "İlk 6 ay için ayda 50 € — ", strong: "ömür boyu bu fiyatı korursun" },
        { text: "Profilinde ve salon sayfanda Kurucu rozeti" },
        { text: "Ürün yol haritasına doğrudan etki: geri bildirimin özelliğe dönüşür" },
        { text: "Yeni özelliklere ilk erişim" },
      ],
    },
    invite: {
      heading: "Nasıl davet alınır",
      items: [
        "Bekleme listesine kaydol",
        "Beta erişim kodun e-posta ile gelir",
        "Kayıt sırasında kodu gir — Kurucu ayrıcalıkların otomatik tanımlanır",
      ],
    },
  },
};
