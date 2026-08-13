import type { Locale } from "@/lib/i18n/config";

/** `/iletisim` sayfasının metinleri. E-posta adresleri üç dilde de aynıdır. */
type ChannelKey = "gyms" | "sponsorship" | "press" | "safety";

type Copy = {
  meta: { title: string; description: string };
  title: string;
  intro: string;
  channels: Record<ChannelKey, { t: string; b: string }>;
  waitlist: { heading: string; body: string };
};

export const contactCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Kontakt",
      description: "Nimm Kontakt mit FIGHTNET auf — Gym-Partnerschaften, Sponsoring, Presse und Support.",
    },
    title: "Kontakt",
    intro:
      "Du hast eine Frage oder ein Angebot? Erreiche uns über die folgenden Kanäle — in der Regel antworten wir innerhalb von 2 Werktagen.",
    channels: {
      gyms: { t: "Gyms", b: "Gründungsmitgliedschaft und Gym-Partnerschaften" },
      sponsorship: { t: "Sponsoring", b: "Markenkooperationen und Werbung" },
      press: { t: "Presse", b: "Pressekit und Interviewanfragen" },
      safety: { t: "Sicherheit & Datenschutz", b: "Datenanfragen und Sicherheitsmeldungen" },
    },
    waitlist: {
      heading: "Trag dich in die Warteliste ein",
      body:
        "Wenn du Beta-Zugang bekommen oder dein Gym eintragen möchtest, füll das Formular aus — wir melden uns, sobald du mit der Einladung an der Reihe bist.",
    },
  },

  en: {
    meta: {
      title: "Contact",
      description: "Get in touch with FIGHTNET — gym partnerships, sponsorship, press and support.",
    },
    title: "Contact",
    intro:
      "Got a question or a proposal? Reach us through the channels below — we usually reply within 2 working days.",
    channels: {
      gyms: { t: "Gyms", b: "Founding Membership and gym partnerships" },
      sponsorship: { t: "Sponsorship", b: "Brand collaborations and advertising" },
      press: { t: "Press", b: "Press kit and interview requests" },
      safety: { t: "Security & Data Protection", b: "Data requests and security reports" },
    },
    waitlist: {
      heading: "Join the waitlist",
      body:
        "If you want beta access or want to list your gym, fill in the form — we will reach out when your invite comes up.",
    },
  },

  tr: {
    meta: {
      title: "İletişim",
      description: "FIGHTNET ile iletişime geç — salon ortaklığı, sponsorluk, basın ve destek.",
    },
    title: "İletişim",
    intro:
      "Sorunun ya da teklifin mi var? Aşağıdaki kanallardan bize ulaş — genelde 2 iş günü içinde yanıt veriyoruz.",
    channels: {
      gyms: { t: "Salonlar", b: "Kurucu Üyelik ve salon ortaklığı" },
      sponsorship: { t: "Sponsorluk", b: "Marka işbirlikleri ve reklam" },
      press: { t: "Basın", b: "Basın kiti ve röportaj talepleri" },
      safety: { t: "Güvenlik & KVKK", b: "Veri talepleri ve güvenlik bildirimleri" },
    },
    waitlist: {
      heading: "Bekleme listesine katıl",
      body:
        "Beta erişimi almak veya salonunu kaydetmek istiyorsan formu doldur — davet sıradayken sana ulaşırız.",
    },
  },
};
