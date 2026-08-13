import type { Locale } from "@/lib/i18n/config";

/** `/etkinlikler` takvim sayfası ve `/etkinlikler/[slug]` etkinlik sayfası. */
type Copy = {
  list: {
    meta: { title: string; description: string };
    title: string;
    subtitle: string;
    addEvent: string;
    filterDiscipline: string;
    filterType: string;
    filterStatus: string;
    statusLive: string;
    statusUpcoming: string;
    statusFinished: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    /** {count} → etkinlik sayısı */
    resultCount: string;
  };
  detail: {
    notFound: string;
    /** {title} {date} {city} */
    metaDescription: string;
    /** {time} → kapı açılış saati */
    doorsAt: string;
    capacity: string;
    buyTicket: string;
    liveStream: string;
    directions: string;
    organizer: string;
    streamPpvTitle: string;
    streamTitle: string;
    fightCard: string;
    /** {count} → müsabaka sayısı */
    fightCount: string;
    registrationTitle: string;
    registrationSubtitle: string;
    registrationLoginBody: string;
    login: string;
  };
};

export const eventsCopy: Record<Locale, Copy> = {
  de: {
    list: {
      meta: {
        title: "Events",
        description:
          "Kampfsport-Events, Turniere und Galas im DACH-Raum. Verfolge sie mit Livescore und Kommentar-Feed.",
      },
      title: "Eventkalender",
      subtitle: "Lokale und internationale Kampfsport-Events — mit Livescore",
      addEvent: "Event eintragen",
      filterDiscipline: "Disziplin",
      filterType: "Art",
      filterStatus: "Status",
      statusLive: "Live",
      statusUpcoming: "Kommend",
      statusFinished: "Abgeschlossen",
      searchPlaceholder: "Event oder Stadt suchen…",
      emptyTitle: "Kein Event gefunden",
      emptyBody: "Mit diesen Filtern gibt es kein Event. Bald kommen neue dazu.",
      resultCount: "{count} Events",
    },
    detail: {
      notFound: "Event nicht gefunden",
      metaDescription:
        "{title} — {date}, {city}. Livescore und Kampfkarte auf FIGHTNET.",
      doorsAt: "Einlass {time}",
      capacity: "Kapazität",
      buyTicket: "Ticket kaufen",
      liveStream: "Livestream",
      directions: "Route",
      organizer: "Veranstalter",
      streamPpvTitle: "Livestream (PPV)",
      streamTitle: "Livestream",
      fightCard: "Kampfkarte",
      fightCount: "{count} Kämpfe",
      registrationTitle: "Wettkampfanmeldung",
      registrationSubtitle: "Melde dich als Athlet für dieses Event an",
      registrationLoginBody:
        "Für die Wettkampfanmeldung musst du angemeldet und auf Stufe 1 verifiziert sein.",
      login: "Anmelden",
    },
  },

  en: {
    list: {
      meta: {
        title: "Events",
        description:
          "Combat sports events, tournaments and galas across the DACH region. Follow them with live scoring and a commentary feed.",
      },
      title: "Event calendar",
      subtitle: "Local and international combat sports events — with live scoring",
      addEvent: "Add an event",
      filterDiscipline: "Discipline",
      filterType: "Type",
      filterStatus: "Status",
      statusLive: "Live",
      statusUpcoming: "Upcoming",
      statusFinished: "Finished",
      searchPlaceholder: "Search for an event or city…",
      emptyTitle: "No event found",
      emptyBody: "There is no event matching these filters. New ones are added regularly.",
      resultCount: "{count} events",
    },
    detail: {
      notFound: "Event not found",
      metaDescription: "{title} — {date}, {city}. Live scoring and fight card on FIGHTNET.",
      doorsAt: "Doors open {time}",
      capacity: "Capacity",
      buyTicket: "Buy a ticket",
      liveStream: "Live stream",
      directions: "Directions",
      organizer: "Organizer",
      streamPpvTitle: "Live stream (PPV)",
      streamTitle: "Live stream",
      fightCard: "Fight card",
      fightCount: "{count} bouts",
      registrationTitle: "Competition registration",
      registrationSubtitle: "Register as an athlete for this event",
      registrationLoginBody:
        "To register for a bout you need to be logged in and verified at Level 1.",
      login: "Log in",
    },
  },

  tr: {
    list: {
      meta: {
        title: "Etkinlikler",
        description:
          "DACH bölgesindeki dövüş sporu etkinlikleri, turnuvalar ve galalar. Canlı skor ve yorum akışıyla takip et.",
      },
      title: "Etkinlik Takvimi",
      subtitle: "Yerel ve küresel dövüş sporu etkinlikleri — canlı skorla",
      addEvent: "Etkinlik Ekle",
      filterDiscipline: "Disiplin",
      filterType: "Tür",
      filterStatus: "Durum",
      statusLive: "Canlı",
      statusUpcoming: "Yaklaşan",
      statusFinished: "Tamamlanan",
      searchPlaceholder: "Etkinlik veya şehir ara…",
      emptyTitle: "Etkinlik bulunamadı",
      emptyBody: "Bu filtrelerle etkinlik yok. Yakında yenileri eklenecek.",
      resultCount: "{count} etkinlik",
    },
    detail: {
      notFound: "Etkinlik bulunamadı",
      metaDescription:
        "{title} — {date}, {city}. Canlı skor ve dövüş kartı FIGHTNET'te.",
      doorsAt: "Kapı açılış {time}",
      capacity: "Kapasite",
      buyTicket: "Bilet Al",
      liveStream: "Canlı Yayın",
      directions: "Yol tarifi",
      organizer: "Organizatör",
      streamPpvTitle: "Canlı Yayın (PPV)",
      streamTitle: "Canlı Yayın",
      fightCard: "Dövüş Kartı",
      fightCount: "{count} müsabaka",
      registrationTitle: "Müsabaka Kaydı",
      registrationSubtitle: "Bu etkinliğe sporcu olarak kaydol",
      registrationLoginBody:
        "Müsabaka kaydı için giriş yapman ve Seviye 1 doğrulaman gerekiyor.",
      login: "Giriş yap",
    },
  },
};
