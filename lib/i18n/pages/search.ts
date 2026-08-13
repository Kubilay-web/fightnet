import type { Locale } from "@/lib/i18n/config";

/** `/arama` — site içi arama. */
type Copy = {
  meta: { title: string; description: string };
  title: string;
  subtitle: string;
  placeholder: string;
  startTitle: string;
  startBody: string;
  /** {term} → aranan ifade */
  noResultsTitle: string;
  noResultsBody: string;
  fighters: string;
  gyms: string;
  events: string;
  threads: string;
  /** {count} → yanıt sayısı */
  replyCount: string;
};

export const searchCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Suche",
      description: "Suche auf FIGHTNET nach Kämpfern, Gyms, Events und Forenthemen.",
    },
    title: "Suche",
    subtitle: "Suche nach Kämpfern, Gyms, Events und Forenthemen",
    placeholder: "Wonach suchst du?",
    startTitle: "Starte deine Suche",
    startBody: "Du kannst einen Namen, eine Stadt, ein Gym oder einen Eventtitel eingeben.",
    noResultsTitle: "Keine Treffer für „{term}“",
    noResultsBody: "Versuch es mit einem anderen Suchbegriff.",
    fighters: "Kämpfer",
    gyms: "Gyms",
    events: "Events",
    threads: "Forenthemen",
    replyCount: "{count} Antworten",
  },
  en: {
    meta: {
      title: "Search",
      description: "Search FIGHTNET for fighters, gyms, events and forum threads.",
    },
    title: "Search",
    subtitle: "Search for fighters, gyms, events and forum threads",
    placeholder: "What are you looking for?",
    startTitle: "Start searching",
    startBody: "You can type a name, a city, a gym or an event title.",
    noResultsTitle: "No results for “{term}”",
    noResultsBody: "Try a different search term.",
    fighters: "Fighters",
    gyms: "Gyms",
    events: "Events",
    threads: "Forum threads",
    replyCount: "{count} replies",
  },
  tr: {
    meta: {
      title: "Arama",
      description: "FIGHTNET'te dövüşçü, salon, etkinlik ve forum konusu ara.",
    },
    title: "Arama",
    subtitle: "Dövüşçü, salon, etkinlik ve forum konularında ara",
    placeholder: "Ne arıyorsun?",
    startTitle: "Aramaya başla",
    startBody: "İsim, şehir, salon veya etkinlik adı yazabilirsin.",
    noResultsTitle: "\"{term}\" için sonuç yok",
    noResultsBody: "Farklı bir arama terimi dene.",
    fighters: "Dövüşçüler",
    gyms: "Salonlar",
    events: "Etkinlikler",
    threads: "Forum Konuları",
    replyCount: "{count} yanıt",
  },
};
