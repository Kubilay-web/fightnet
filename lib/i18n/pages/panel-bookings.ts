import type { Locale } from "@/lib/i18n/config";

/**
 * Rezervasyon metinleri: `/panel/rezervasyonlar` ve salon sayfasındaki
 * `TrialBookingForm`.
 *
 * Rezervasyon türü seçeneklerinin DEĞERLERİ (`TRIAL`, `DROP_IN`, `PRIVATE`)
 * API sözleşmesinin parçasıdır; burada yalnızca etiketleri çevrilir.
 */
type Copy = {
  meta: { title: string };
  list: {
    title: string;
    subtitle: string;
    findGym: string;
    upcoming: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction: string;
    past: string;
  };
  form: {
    type: string;
    trial: string;
    dropIn: string;
    private: string;
    class: string;
    any: string;
    date: string;
    experience: string;
    experienceHint: string;
    experiencePlaceholder: string;
    goals: string;
    goalsPlaceholder: string;
    phone: string;
    phoneHint: string;
    submit: string;
    submitGuest: string;
    doneTitle: string;
    doneBody: string;
    error: string;
  };
};

export const panelBookingsCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Meine Buchungen" },
    list: {
      title: "Meine Buchungen",
      subtitle: "Deine Probetrainings, Drop-ins und Kursanmeldungen",
      findGym: "Gym finden",
      upcoming: "Anstehend",
      emptyTitle: "Keine anstehenden Buchungen",
      emptyDescription: "Vereinbare ein kostenloses Probetraining in einem Gym in deiner Nähe.",
      emptyAction: "Gym-Finder",
      past: "Vergangen",
    },
    form: {
      type: "Buchungsart",
      trial: "Probetraining (kostenlos)",
      dropIn: "Drop-in",
      private: "Privatstunde",
      class: "Kurs",
      any: "Egal",
      date: "Datum",
      experience: "Deine Erfahrung",
      experienceHint: "Hast du schon Kampfsport gemacht?",
      experiencePlaceholder: "2 Jahre Boxen, mit BJJ fange ich gerade an…",
      goals: "Dein Ziel",
      goalsPlaceholder: "Kondition, Wettkampfvorbereitung…",
      phone: "Telefon",
      phoneHint: "Damit das Gym dich anrufen kann (optional)",
      submit: "Buchung abschicken",
      submitGuest: "Anmelden und buchen",
      doneTitle: "Deine Anfrage ist raus",
      doneBody: "Du bekommst eine Benachrichtigung, sobald das Gym bestätigt.",
      error: "Buchung konnte nicht erstellt werden",
    },
  },

  en: {
    meta: { title: "My bookings" },
    list: {
      title: "My bookings",
      subtitle: "Your trial sessions, drop-ins and class bookings",
      findGym: "Find a gym",
      upcoming: "Upcoming",
      emptyTitle: "No upcoming bookings",
      emptyDescription: "Book a free trial session at a gym near you.",
      emptyAction: "Gym finder",
      past: "Past",
    },
    form: {
      type: "Booking type",
      trial: "Trial session (free)",
      dropIn: "Drop-in",
      private: "Private lesson",
      class: "Class",
      any: "No preference",
      date: "Date",
      experience: "Your experience",
      experienceHint: "Have you done combat sports before?",
      experiencePlaceholder: "2 years of boxing, just starting BJJ…",
      goals: "Your goal",
      goalsPlaceholder: "Conditioning, competition prep…",
      phone: "Phone",
      phoneHint: "So the gym can call you (optional)",
      submit: "Book now",
      submitGuest: "Log in and book",
      doneTitle: "Your request has been sent",
      doneBody: "You will get a notification once the gym confirms.",
      error: "Booking could not be created",
    },
  },

  tr: {
    meta: { title: "Rezervasyonlarım" },
    list: {
      title: "Rezervasyonlarım",
      subtitle: "Deneme antrenmanları, drop-in ve ders kayıtların",
      findGym: "Salon Bul",
      upcoming: "Yaklaşan",
      emptyTitle: "Yaklaşan rezervasyon yok",
      emptyDescription: "Bölgendeki salonlarda ücretsiz deneme antrenmanı ayarla.",
      emptyAction: "Salon Bulucu",
      past: "Geçmiş",
    },
    form: {
      type: "Rezervasyon türü",
      trial: "Deneme Antrenmanı (ücretsiz)",
      dropIn: "Drop-in",
      private: "Özel Ders",
      class: "Ders",
      any: "Fark etmez",
      date: "Tarih",
      experience: "Deneyimin",
      experienceHint: "Daha önce dövüş sporu yaptın mı?",
      experiencePlaceholder: "2 yıl boks, BJJ'e yeni başlıyorum…",
      goals: "Hedefin",
      goalsPlaceholder: "Kondisyon, müsabakaya hazırlık…",
      phone: "Telefon",
      phoneHint: "Salon seni arayabilsin (opsiyonel)",
      submit: "Rezervasyon Yap",
      submitGuest: "Giriş yap ve rezerve et",
      doneTitle: "Talebin gönderildi",
      doneBody: "Salon onayladığında bildirim alacaksın.",
      error: "Rezervasyon oluşturulamadı",
    },
  },
};
