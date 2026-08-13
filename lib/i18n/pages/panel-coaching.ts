import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel/kocluk`, `/panel/kocluk/yeni` ve `components/coaching-forms.tsx`
 * metinleri.
 *
 * Komisyon oranı (`COACHING_FEE_RATE`) ve süre/kontenjan gibi sayılar tek
 * kaynakta kalsın diye metinlerde `{rate}`, `{n}` yer tutucuları kullanılır;
 * değerler kullanım yerinde `replace` ile yerleştirilir.
 */
type Copy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  stats: {
    activeOffers: string;
    openSessions: string;
    completed: string;
    netEarnings: string;
    netHint: string;
  };
  offers: {
    heading: string;
    newOffer: string;
    emptyTitle: string;
    emptyDescription: string;
    published: string;
    closed: string;
    /** `kontenjan {n}` */
    capacity: string;
    /** `{n} seans` */
    sessions: string;
    unpublish: string;
    publish: string;
  };
  incoming: {
    heading: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    cancelSession: string;
  };
  received: {
    heading: string;
    emptyTitle: string;
    emptyDescription: string;
    browse: string;
    payAlert: string;
    payNow: string;
    joinSession: string;
    coachNote: string;
    cancel: string;
  };
  /** Dakika kısaltması */
  minutes: string;
  newOffer: {
    meta: { title: string };
    title: string;
    /** `Platform komisyonu %{rate} — …` */
    subtitle: string;
    verifyTitle: string;
    verifyBody: string;
    verifyCta: string;
    policyTitle: string;
    policyBody: string;
  };
  offerForm: {
    submit: string;
    title: string;
    titlePlaceholder: string;
    description: string;
    descriptionHint: string;
    format: string;
    level: string;
    levelHint: string;
    allLevels: string;
    disciplines: string;
    price: string;
    /** `Platform komisyonu %{rate}` */
    priceHint: string;
    duration: string;
    capacity: string;
    capacityHint: string;
    cover: string;
    minorsTitle: string;
    minorsBody: string;
    minorsSwitch: string;
    activeSwitch: string;
  };
  requestForm: {
    payError: string;
    loginCta: string;
    submit: string;
    preferredAt: string;
    preferredAtHint: string;
    note: string;
    noteHint: string;
    ready: string;
    goToPayment: string;
  };
  scheduleForm: {
    submit: string;
    when: string;
    meetingUrl: string;
    meetingUrlHint: string;
    note: string;
  };
  completeForm: {
    submit: string;
    note: string;
    noteHint: string;
  };
  reviewForm: {
    submit: string;
    rating: string;
    review: string;
    note: string;
  };
};

export const panelCoachingCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Coaching" },
    title: "Online-Coaching",
    subtitle: "§4.3 — Trainer bieten digitales Coaching an, Athleten buchen Einheiten",
    stats: {
      activeOffers: "Aktive Angebote",
      openSessions: "Offene Einheiten",
      completed: "Abgeschlossen",
      netEarnings: "Nettoeinnahmen",
      netHint: "Abzüglich Provision",
    },
    offers: {
      heading: "Meine Angebote",
      newOffer: "Neues Angebot",
      emptyTitle: "Du hast noch keine Angebote",
      emptyDescription:
        "Erstelle dein erstes Coaching-Angebot, damit Athleten dich finden und Einheiten buchen können.",
      published: "Veröffentlicht",
      closed: "Geschlossen",
      capacity: "Kapazität {n}",
      sessions: "{n} Einheiten",
      unpublish: "Offline nehmen",
      publish: "Veröffentlichen",
    },
    incoming: {
      heading: "Eingehende Einheiten",
      subtitle: "Anfragen mit abgeschlossener Zahlung erscheinen hier",
      emptyTitle: "Keine offenen Einheiten",
      emptyDescription: "Bezahlte Anfragen landen in dieser Liste.",
      cancelSession: "Einheit stornieren",
    },
    received: {
      heading: "Meine gebuchten Einheiten",
      emptyTitle: "Du hast noch keine Einheit gebucht",
      emptyDescription: "Sieh dir die Coaching-Angebote an und finde den passenden Trainer.",
      browse: "Angebote ansehen",
      payAlert: "Schließe die Zahlung ab, damit deine Anfrage an den Trainer weitergeleitet wird.",
      payNow: "Zahlung abschließen",
      joinSession: "An der Einheit teilnehmen",
      coachNote: "Notiz des Trainers: ",
      cancel: "Stornieren",
    },
    minutes: "Min.",
    newOffer: {
      meta: { title: "Neues Coaching-Angebot" },
      title: "Neues Coaching-Angebot",
      subtitle: "Plattformprovision {rate} % — mit Trainer-Tools-Abo die Hälfte",
      verifyTitle: "Zuerst ist Verifizierung Stufe 2 nötig",
      verifyBody:
        "Coaching ist eine kostenpflichtige Leistung. Damit Athleten wissen, wem sie ihr Geld zahlen, muss dein Trainerstatus verifiziert sein (§4.5). Lade deine Trainerlizenz hoch; nach der Freigabe kannst du ein Angebot einstellen.",
      verifyCta: "Zur Verifizierung",
      policyTitle: "Inhaltsrichtlinie",
      policyBody:
        "Gesundheitsberatung, Doping-Anleitungen und Anweisungen zum extremen Gewichtmachen sind verboten (§4.7). Angebote durchlaufen vor der Veröffentlichung einen automatischen Vorfilter.",
    },
    offerForm: {
      submit: "Angebot veröffentlichen",
      title: "Titel",
      titlePlaceholder: "MMA-Bodenkampf — 1:1-Videoanalyse",
      description: "Beschreibung",
      descriptionHint:
        "Beschreibe, was du wem und wie beibringst. Gesundheitsberatung und Anleitungen zum Gewichtmachen sind verboten.",
      format: "Format",
      level: "Zielniveau",
      levelHint: "Leer lassen für alle Niveaus",
      allLevels: "Alle Niveaus",
      disciplines: "Disziplinen",
      price: "Preis pro Einheit (€)",
      priceHint: "Plattformprovision {rate} %",
      duration: "Dauer (Min.)",
      capacity: "Kapazität",
      capacityHint: "Anzahl gleichzeitig offener Einheiten",
      cover: "Titelbild",
      minorsTitle: "Athleten unter 18 Jahren",
      minorsBody:
        "Die Arbeit mit minderjährigen Athleten erfordert die Einwilligung der Erziehungsberechtigten (§11.1). Setze dieses Häkchen nur, wenn du über die erforderlichen Freigaben verfügst.",
      minorsSwitch: "Offen für Athleten unter 18",
      activeSwitch: "Angebot sofort veröffentlichen",
    },
    requestForm: {
      payError: "Zahlung konnte nicht gestartet werden",
      loginCta: "Zum Anfragen anmelden",
      submit: "Anfrage erstellen",
      preferredAt: "Wunschtermin",
      preferredAtHint: "Du wirst benachrichtigt, sobald der Trainer den Termin bestätigt",
      note: "Deine Notiz",
      noteHint: "Dein Ziel, deine Trainingserfahrung, das Thema, an dem du arbeiten möchtest",
      ready: "Deine Anfrage steht. Schließe die Zahlung ab, damit sie an den Trainer geht.",
      goToPayment: "Zur Zahlung",
    },
    scheduleForm: {
      submit: "Einheit planen",
      when: "Datum und Uhrzeit",
      meetingUrl: "Meeting-Link",
      meetingUrlHint: "Wird dem Athleten erst nach der Planung angezeigt",
      note: "Der Athlet wird per Benachrichtigung und E-Mail informiert.",
    },
    completeForm: {
      submit: "Als abgeschlossen markieren",
      note: "Deine Notiz an den Athleten",
      noteHint: "Was habt ihr trainiert, was ist der nächste Schritt",
    },
    reviewForm: {
      submit: "Bewerten",
      rating: "Bewertung",
      review: "Dein Kommentar",
      note: "Deine Bewertung fließt in den Durchschnitt auf der Angebotsseite ein.",
    },
  },

  en: {
    meta: { title: "Coaching" },
    title: "Online coaching",
    subtitle: "§4.3 — Coaches offer digital coaching, athletes book sessions",
    stats: {
      activeOffers: "Active listings",
      openSessions: "Open sessions",
      completed: "Completed",
      netEarnings: "Net earnings",
      netHint: "Commission deducted",
    },
    offers: {
      heading: "My listings",
      newOffer: "New listing",
      emptyTitle: "You don't have any listings yet",
      emptyDescription:
        "Create your first coaching listing so athletes can find you and book sessions.",
      published: "Live",
      closed: "Closed",
      capacity: "capacity {n}",
      sessions: "{n} sessions",
      unpublish: "Unpublish",
      publish: "Publish",
    },
    incoming: {
      heading: "Incoming sessions",
      subtitle: "Requests with completed payment show up here",
      emptyTitle: "No open sessions",
      emptyDescription: "Paid requests land in this list.",
      cancelSession: "Cancel session",
    },
    received: {
      heading: "Sessions I booked",
      emptyTitle: "You haven't booked a session yet",
      emptyDescription: "Browse the coaching listings and find the coach that fits you.",
      browse: "Browse listings",
      payAlert: "Complete the payment so your request is forwarded to the coach.",
      payNow: "Complete payment",
      joinSession: "Join the session",
      coachNote: "Coach's note: ",
      cancel: "Cancel",
    },
    minutes: "min",
    newOffer: {
      meta: { title: "New coaching listing" },
      title: "New coaching listing",
      subtitle: "Platform commission {rate}% — half of that with a Coach Tools subscription",
      verifyTitle: "Level 2 verification is required first",
      verifyBody:
        "Coaching is a paid service. So that athletes know who they are paying, your coaching status has to be verified (§4.5). Upload your coaching licence; once it is approved you can publish a listing.",
      verifyCta: "Go to verification",
      policyTitle: "Content policy",
      policyBody:
        "Health advice, doping guidance and extreme weight-cutting instructions are prohibited (§4.7). Listings pass through an automated pre-filter before going live.",
    },
    offerForm: {
      submit: "Publish listing",
      title: "Title",
      titlePlaceholder: "MMA ground game — one-on-one video analysis",
      description: "Description",
      descriptionHint:
        "Write what you teach, to whom and how. Health advice and weight-cutting guidance are prohibited.",
      format: "Format",
      level: "Target level",
      levelHint: "Leave empty for all levels",
      allLevels: "All levels",
      disciplines: "Disciplines",
      price: "Session price (€)",
      priceHint: "Platform commission {rate}%",
      duration: "Duration (min)",
      capacity: "Capacity",
      capacityHint: "Number of sessions open at the same time",
      cover: "Cover image",
      minorsTitle: "Athletes under 18",
      minorsBody:
        "Working with underage athletes requires guardian consent (§11.1). Only tick this box if you hold the necessary permissions.",
      minorsSwitch: "Open to athletes under 18",
      activeSwitch: "Publish the listing straight away",
    },
    requestForm: {
      payError: "Could not start the payment",
      loginCta: "Log in to send a request",
      submit: "Create request",
      preferredAt: "Preferred date",
      preferredAtHint: "You'll be notified once the coach confirms the date",
      note: "Your note",
      noteHint: "Your goal, how long you have trained, the topic you want to work on",
      ready: "Your request is ready. Complete the payment so it reaches the coach.",
      goToPayment: "Go to payment",
    },
    scheduleForm: {
      submit: "Schedule session",
      when: "Date and time",
      meetingUrl: "Meeting link",
      meetingUrlHint: "Shown to the athlete only after scheduling",
      note: "The athlete is informed by notification and email.",
    },
    completeForm: {
      submit: "Mark as completed",
      note: "Your note to the athlete",
      noteHint: "What you worked on, what the next step should be",
    },
    reviewForm: {
      submit: "Submit review",
      rating: "Rating",
      review: "Your comment",
      note: "Your review counts toward the average shown on the listing page.",
    },
  },

  tr: {
    meta: { title: "Koçluk" },
    title: "Online Koçluk",
    subtitle: "§4.3 — Antrenörler dijital koçluk sunar, sporcular seans alır",
    stats: {
      activeOffers: "Aktif ilan",
      openSessions: "Açık seans",
      completed: "Tamamlanan",
      netEarnings: "Net kazanç",
      netHint: "Komisyon düşülmüş",
    },
    offers: {
      heading: "İlanlarım",
      newOffer: "Yeni ilan",
      emptyTitle: "Henüz ilanın yok",
      emptyDescription: "İlk koçluk ilanını oluştur; sporcular seni bulup seans alabilsin.",
      published: "Yayında",
      closed: "Kapalı",
      capacity: "kontenjan {n}",
      sessions: "{n} seans",
      unpublish: "Yayından kaldır",
      publish: "Yayına al",
    },
    incoming: {
      heading: "Gelen Seanslar",
      subtitle: "Ödemesi tamamlanan talepler burada görünür",
      emptyTitle: "Açık seans yok",
      emptyDescription: "Ödenen talepler bu listeye düşer.",
      cancelSession: "Seansı iptal et",
    },
    received: {
      heading: "Aldığım Seanslar",
      emptyTitle: "Henüz seans almadın",
      emptyDescription: "Koçluk ilanlarına göz at ve sana uygun antrenörü bul.",
      browse: "İlanlara göz at",
      payAlert: "Talebin antrenöre iletilmesi için ödemeyi tamamla.",
      payNow: "Ödemeyi tamamla",
      joinSession: "Seansa katıl",
      coachNote: "Antrenör notu: ",
      cancel: "İptal et",
    },
    minutes: "dk",
    newOffer: {
      meta: { title: "Yeni Koçluk İlanı" },
      title: "Yeni Koçluk İlanı",
      subtitle: "Platform komisyonu %{rate} — Antrenör Araçları abonesiysen yarısı",
      verifyTitle: "Önce Seviye 2 doğrulama gerekiyor",
      verifyBody:
        "Koçluk parayla satılan bir hizmet. Sporcuların kime para ödediğini bilmesi için antrenörlük durumunun doğrulanmış olması şart (§4.5). Antrenör lisansını yükle, onay sonrası ilan açabilirsin.",
      verifyCta: "Doğrulamaya git",
      policyTitle: "İçerik politikası",
      policyBody:
        "Sağlık tavsiyesi, doping yönlendirmesi ve aşırı kilo düşürme talimatı yasaktır (§4.7). İlanlar yayına girmeden otomatik ön filtreden geçer.",
    },
    offerForm: {
      submit: "İlanı Yayınla",
      title: "Başlık",
      titlePlaceholder: "MMA yer oyunu — birebir video analizi",
      description: "Açıklama",
      descriptionHint:
        "Neyi, kime, nasıl öğrettiğini yaz. Sağlık tavsiyesi ve kilo düşürme yönlendirmesi yasaktır.",
      format: "Biçim",
      level: "Hedef seviye",
      levelHint: "Boş bırakılırsa tüm seviyeler",
      allLevels: "Tüm seviyeler",
      disciplines: "Disiplinler",
      price: "Seans ücreti (€)",
      priceHint: "Platform komisyonu %{rate}",
      duration: "Süre (dk)",
      capacity: "Kontenjan",
      capacityHint: "Aynı anda açık seans sayısı",
      cover: "Kapak görseli",
      minorsTitle: "18 yaş altı sporcular",
      minorsBody:
        "Reşit olmayan sporcularla çalışmak veli onayı gerektirir (§11.1). Bu kutuyu yalnızca gerekli izinlere sahipsen işaretle.",
      minorsSwitch: "18 yaş altı sporculara açık",
      activeSwitch: "İlan hemen yayında olsun",
    },
    requestForm: {
      payError: "Ödeme başlatılamadı",
      loginCta: "Talep göndermek için giriş yap",
      submit: "Talep Oluştur",
      preferredAt: "Tercih ettiğin tarih",
      preferredAtHint: "Antrenör kesinleştirdiğinde bildirim alırsın",
      note: "Notun",
      noteHint: "Hedefin, tecrübe süren, üzerinde çalışmak istediğin konu",
      ready: "Talebin hazır. Antrenöre iletilmesi için ödemeyi tamamla.",
      goToPayment: "Ödemeye geç",
    },
    scheduleForm: {
      submit: "Seansı Planla",
      when: "Tarih ve saat",
      meetingUrl: "Toplantı bağlantısı",
      meetingUrlHint: "Sporcuya yalnızca planlandıktan sonra gösterilir",
      note: "Sporcu bildirim ve e-posta ile bilgilendirilir.",
    },
    completeForm: {
      submit: "Tamamlandı olarak işaretle",
      note: "Sporcuya notun",
      noteHint: "Ne çalıştınız, sonraki adım ne olmalı",
    },
    reviewForm: {
      submit: "Değerlendir",
      rating: "Puan",
      review: "Yorumun",
      note: "Değerlendirmen ilan sayfasında ortalamaya yansır.",
    },
  },
};
