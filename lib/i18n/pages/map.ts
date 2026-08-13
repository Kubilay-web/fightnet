import type { Locale } from "@/lib/i18n/config";

/** `/harita` — salon ve etkinlik haritası. */
type Copy = {
  meta: { title: string; description: string };
  title: string;
  /** {gyms} {events} → haritadaki sayılar */
  subtitle: string;
};

export const mapCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Karte",
      description: "Sieh dir Kampfsport-Gyms und Events im DACH-Raum auf der Karte an.",
    },
    title: "Karte",
    subtitle: "{gyms} Gyms und {events} Events auf der Karte",
  },
  en: {
    meta: {
      title: "Map",
      description: "See combat sports gyms and events across the DACH region on the map.",
    },
    title: "Map",
    subtitle: "{gyms} gyms and {events} events on the map",
  },
  tr: {
    meta: {
      title: "Harita",
      description: "DACH bölgesindeki dövüş sporu salonlarını ve etkinliklerini harita üzerinde gör.",
    },
    title: "Harita",
    subtitle: "{gyms} salon ve {events} etkinlik haritada",
  },
};
