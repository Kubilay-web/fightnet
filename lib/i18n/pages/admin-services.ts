import type { Locale } from "@/lib/i18n/config";
import type { ServiceKey, ServiceStatus } from "@/lib/services";

/**
 * §5.3 — `/admin/servisler` tablosunun satır metinleri.
 *
 * `lib/services/index.ts` yalnızca ölçüm yapar: hangi anahtar tanımlı, hangi
 * sağlayıcı seçili, hangi açıklama varyantı geçerli. Burada sadece o
 * anahtarların dile göre okunuşu var — sayfanın kabuğu (başlık, rozet
 * etiketleri, altbilgi) `adminServicesCopy` içinde kalır.
 *
 * Dinamik cümleler fonksiyon olarak tutuldu: Almancada yan cümle sonda,
 * Türkçede tamlama hâlinde gelir, bu yüzden dize birleştirme dile bırakılamaz.
 *
 * Sağlayıcı adları (onfido, mapbox, perspective, skribble …) marka/tanımlayıcı
 * olduğu için hiçbir dilde çevrilmez; parametre olarak olduğu gibi basılır.
 * Ortam değişkeni adları ve §-referansları da üç dilde birebir korunur.
 */

/** Servis başına açıklama varyantları — `ServiceDetail` birleşiminin metin karşılığı. */
type Details = {
  stripe: {
    connected: (mode: string, webhook: boolean) => string;
    missing: string;
  };
  moderation: {
    providers: (text: string, image: string) => string;
  };
  kyc: {
    provider: (provider: string) => string;
  };
  stream: {
    channel: (auth: boolean) => string;
    missing: string;
  };
  sepa: {
    configured: string;
    missing: string;
  };
  esign: {
    qualified: (provider: string) => string;
    advanced: (provider: string) => string;
  };
  search: {
    configured: string;
    missing: string;
  };
  analytics: {
    configured: string;
    missing: string;
  };
  geo: {
    provider: (provider: string) => string;
  };
  health: {
    cloud: string;
    missing: string;
  };
  aws: {
    configured: string;
    missing: string;
  };
};

/**
 * Anahtar kümesi `lib/services/index.ts`'ten türer: yeni bir servis eklendiğinde
 * de/en/tr üçü birden derleme hatası verir.
 */
type Copy = {
  services: {
    [K in ServiceKey]: {
      name: string;
      section: string;
      /** Yapılandırılmadığında ne olur */
      fallback: string;
      details: Details[K];
    };
  };
};

export const adminServiceRowsCopy: Record<Locale, Copy> = {
  de: {
    services: {
      stripe: {
        name: "Stripe Connect",
        section: "§5.3 Zahlungen",
        fallback:
          "Abonnement- und Bestelldatensätze werden angelegt, es erfolgt jedoch kein Einzug; die Nutzerin oder der Nutzer wird ausdrücklich darauf hingewiesen.",
        details: {
          connected: (mode, webhook) =>
            `Verbunden — ${mode === "live" ? "LIVE-Schlüssel" : "Test-Schlüssel"}${
              webhook ? ", Webhook-Prüfung aktiv" : ", Webhook-Secret fehlt"
            }`,
          missing: "Kein Schlüssel — Zahlung kann nicht ausgelöst werden",
        },
      },
      moderation: {
        name: "Inhalts-Vorfilter",
        section: "§11.3 Tor 3",
        fallback:
          "Die lokale Wörterbuch-Heuristik greift — Doping, Gewichtmachen, sexuelle Inhalte und Drohungen werden erkannt.",
        details: {
          providers: (text, image) => `Text: ${text} · Bild: ${image}`,
        },
      },
      kyc: {
        name: "Identitätsverifizierung",
        section: "§4.5 Stufe 1",
        fallback:
          "Manueller Ablauf: Die Nutzerin oder der Nutzer lädt Dokument + Selfie hoch, die Administration bestätigt unter /admin/dogrulama.",
        details: {
          provider: (provider) => `Anbieter: ${provider}`,
        },
      },
      stream: {
        name: "Amazon IVS Livestream",
        section: "§4.4 PPV",
        fallback:
          "Die Veranstalterin oder der Veranstalter trägt eine externe HLS/DASH-Adresse ein; die PPV-Sperre wird serverseitig anhand des Kaufdatensatzes durchgesetzt.",
        details: {
          channel: (auth) =>
            `Kanalverwaltung aktiv${
              auth ? ", autorisierte Wiedergabesignatur aktiv" : ", keine Wiedergabesignatur"
            }`,
          missing: "Keine AWS-Zugangsdaten",
        },
      },
      sepa: {
        name: "SEPA-Gläubiger-ID",
        section: "§4.6 Vertragsverwaltung",
        fallback:
          "Der Einzug läuft über Stripe SEPA-Lastschrift; die Erzeugung von Sammeldateien ist deaktiviert.",
        details: {
          configured: "Gläubiger-ID hinterlegt, pain.008 kann erzeugt werden",
          missing: "Keine Gläubiger-ID",
        },
      },
      esign: {
        name: "eIDAS-Digitalsignatur",
        section: "§4.6",
        fallback:
          "Interne FES-Versiegelung: Dokument-Hash + Identität der unterzeichnenden Person + Zeitstempel werden per HMAC miteinander verbunden. Für BGB §126b ausreichend.",
        details: {
          qualified: (provider) => `Anbieter: ${provider} · QES möglich`,
          advanced: (provider) => `Anbieter: ${provider} · FES (fortgeschrittene Signatur)`,
        },
      },
      search: {
        name: "Algolia-Suche",
        section: "§5.3",
        fallback:
          "Die Suche läuft über eine Datenbankabfrage (das Ziel < 500 ms wird über die Indizes aus §5.6 erreicht).",
        details: {
          configured: "Indexierung und Suche laufen über Algolia",
          missing: "Kein Schlüssel",
        },
      },
      analytics: {
        name: "PostHog-Analytics",
        section: "§5.3 / §5.7",
        fallback: "Produktanalytik deaktiviert; KPIs werden aus der Datenbank berechnet (lib/kpi.ts).",
        details: {
          configured: "Ereignisse werden in die EU-Region gesendet",
          missing: "Kein Schlüssel",
        },
      },
      geo: {
        name: "Geokodierung",
        section: "§5.3 Karten",
        fallback:
          "Die Gym-Inhaberin oder der Gym-Inhaber trägt die Koordinaten manuell ein. Die Kartenansicht funktioniert ohnehin ohne externes SDK.",
        details: {
          provider: (provider) => `Anbieter: ${provider}`,
        },
      },
      health: {
        name: "Geräte-Synchronisierung",
        section: "§4.4",
        fallback:
          "Apple HealthKit und Health Connect arbeiten mit einem Geräte-Token — ein Serverschlüssel ist nicht erforderlich.",
        details: {
          cloud: "Garmin/Polar-Cloud-Verbindung aktiv",
          missing: "Kein Schlüssel für den Cloud-Anbieter",
        },
      },
      aws: {
        name: "AWS-Zugangsdaten",
        section: "§5.4",
        fallback: "Rekognition und IVS deaktiviert; beide haben ihre eigene Rückfallebene.",
        details: {
          configured: "Gemeinsame Zugangsdaten für Rekognition und IVS",
          missing: "Nicht definiert",
        },
      },
    },
  },

  en: {
    services: {
      stripe: {
        name: "Stripe Connect",
        section: "§5.3 Payments",
        fallback:
          "Subscription and order records are still created but no money is collected; the user is told so explicitly.",
        details: {
          connected: (mode, webhook) =>
            `Connected — ${mode === "live" ? "LIVE key" : "test key"}${
              webhook ? ", webhook verification on" : ", webhook secret missing"
            }`,
          missing: "No key — payments cannot be initiated",
        },
      },
      moderation: {
        name: "Content pre-filter",
        section: "§11.3 Gate 3",
        fallback:
          "The local dictionary heuristic runs — doping, weight cutting, sexual content and threats are caught.",
        details: {
          providers: (text, image) => `Text: ${text} · Image: ${image}`,
        },
      },
      kyc: {
        name: "Identity verification",
        section: "§4.5 Level 1",
        fallback:
          "Manual flow: the user uploads a document + selfie, an admin approves it from /admin/dogrulama.",
        details: {
          provider: (provider) => `Provider: ${provider}`,
        },
      },
      stream: {
        name: "Amazon IVS live streaming",
        section: "§4.4 PPV",
        fallback:
          "The organizer enters an external HLS/DASH address; the PPV lock is enforced server-side against the purchase record.",
        details: {
          channel: (auth) =>
            `Channel management on${
              auth ? ", authorized playback signature on" : ", no playback signature"
            }`,
          missing: "No AWS credentials",
        },
      },
      sepa: {
        name: "SEPA creditor identifier",
        section: "§4.6 Contract management",
        fallback:
          "Collection runs through Stripe SEPA Direct Debit; batch file generation is disabled.",
        details: {
          configured: "Gläubiger-ID defined, pain.008 can be generated",
          missing: "No Gläubiger-ID",
        },
      },
      esign: {
        name: "eIDAS digital signature",
        section: "§4.6",
        fallback:
          "Internal FES seal: document hash + signer identity + timestamp are bound together with HMAC. Sufficient for BGB §126b.",
        details: {
          qualified: (provider) => `Provider: ${provider} · QES possible`,
          advanced: (provider) => `Provider: ${provider} · FES (advanced signature)`,
        },
      },
      search: {
        name: "Algolia search",
        section: "§5.3",
        fallback:
          "Search runs as a database query (the < 500 ms target is met by the §5.6 indexes).",
        details: {
          configured: "Indexing and search run on Algolia",
          missing: "No key",
        },
      },
      analytics: {
        name: "PostHog analytics",
        section: "§5.3 / §5.7",
        fallback: "Product analytics is off; KPIs are computed from the database (lib/kpi.ts).",
        details: {
          configured: "Events are sent to the EU region",
          missing: "No key",
        },
      },
      geo: {
        name: "Geocoding",
        section: "§5.3 Maps",
        fallback:
          "The gym owner enters the coordinates manually. The map view already works without an external SDK.",
        details: {
          provider: (provider) => `Provider: ${provider}`,
        },
      },
      health: {
        name: "Device sync",
        section: "§4.4",
        fallback:
          "Apple HealthKit and Health Connect work with a device token — no server key required.",
        details: {
          cloud: "Garmin/Polar cloud connection on",
          missing: "No cloud provider key",
        },
      },
      aws: {
        name: "AWS credentials",
        section: "§5.4",
        fallback: "Rekognition and IVS are off; both have their own fallback.",
        details: {
          configured: "Shared credentials for Rekognition and IVS",
          missing: "Not defined",
        },
      },
    },
  },

  tr: {
    services: {
      stripe: {
        name: "Stripe Connect",
        section: "§5.3 Ödemeler",
        fallback: "Abonelik ve sipariş kayıtları oluşur ama tahsilat yapılmaz; kullanıcıya açıkça bildirilir.",
        details: {
          connected: (mode, webhook) =>
            `Bağlı — ${mode === "live" ? "CANLI anahtar" : "test anahtarı"}${
              webhook ? ", webhook doğrulaması açık" : ", webhook secret eksik"
            }`,
          missing: "Anahtar yok — ödeme başlatılamaz",
        },
      },
      moderation: {
        name: "İçerik ön filtresi",
        section: "§11.3 Kapı 3",
        fallback: "Yerel sözlük heuristiği çalışır — doping, kilo düşürme, cinsel içerik ve tehdit yakalanır.",
        details: {
          providers: (text, image) => `Metin: ${text} · Görsel: ${image}`,
        },
      },
      kyc: {
        name: "Kimlik doğrulama",
        section: "§4.5 Seviye 1",
        fallback: "Manuel akış: kullanıcı belge + selfie yükler, admin /admin/dogrulama'dan onaylar.",
        details: {
          provider: (provider) => `Sağlayıcı: ${provider}`,
        },
      },
      stream: {
        name: "Amazon IVS canlı yayın",
        section: "§4.4 PPV",
        fallback:
          "Organizatör harici HLS/DASH adresi girer; PPV kilidi sunucu tarafında satın alma kaydıyla uygulanır.",
        details: {
          channel: (auth) =>
            `Kanal yönetimi açık${auth ? ", yetkili oynatma imzası açık" : ", oynatma imzası yok"}`,
          missing: "AWS kimlik bilgisi yok",
        },
      },
      sepa: {
        name: "SEPA alacaklı kimliği",
        section: "§4.6 Sözleşme yönetimi",
        fallback: "Tahsilat Stripe SEPA Direct Debit üzerinden yapılır; toplu dosya üretimi kapalı.",
        details: {
          configured: "Gläubiger-ID tanımlı, pain.008 üretilebilir",
          missing: "Gläubiger-ID yok",
        },
      },
      esign: {
        name: "eIDAS dijital imza",
        section: "§4.6",
        fallback:
          "Dahili FES mührü: belge özeti + imzalayan kimliği + zaman damgası HMAC ile bağlanır. BGB §126b için yeterlidir.",
        details: {
          qualified: (provider) => `Sağlayıcı: ${provider} · QES mümkün`,
          advanced: (provider) => `Sağlayıcı: ${provider} · FES (gelişmiş imza)`,
        },
      },
      search: {
        name: "Algolia arama",
        section: "§5.3",
        fallback: "Arama veritabanı sorgusuyla çalışır (< 500 ms hedefi §5.6 indekslerle karşılanır).",
        details: {
          configured: "İndeksleme ve arama Algolia'da",
          missing: "Anahtar yok",
        },
      },
      analytics: {
        name: "PostHog analitik",
        section: "§5.3 / §5.7",
        fallback: "Ürün analitiği kapalı; KPI'lar veritabanından hesaplanır (lib/kpi.ts).",
        details: {
          configured: "Olaylar AB bölgesine gönderiliyor",
          missing: "Anahtar yok",
        },
      },
      geo: {
        name: "Coğrafi kodlama",
        section: "§5.3 Haritalar",
        fallback: "Salon sahibi koordinatı elle girer. Harita görünümü harici SDK'sız zaten çalışıyor.",
        details: {
          provider: (provider) => `Sağlayıcı: ${provider}`,
        },
      },
      health: {
        name: "Donanım senkronu",
        section: "§4.4",
        fallback: "Apple HealthKit ve Health Connect cihaz jetonuyla çalışır — sunucu anahtarı gerektirmez.",
        details: {
          cloud: "Garmin/Polar bulut bağlantısı açık",
          missing: "Bulut sağlayıcı anahtarı yok",
        },
      },
      aws: {
        name: "AWS kimlik bilgisi",
        section: "§5.4",
        fallback: "Rekognition ve IVS kapalı; her ikisinin de kendi fallback'i var.",
        details: {
          configured: "Rekognition ve IVS için ortak kimlik",
          missing: "Tanımlı değil",
        },
      },
    },
  },
};

/** Servis durumunu dile göre tek satırlık açıklamaya çevirir. */
export function serviceDetailText(copy: Copy, status: ServiceStatus): string {
  switch (status.key) {
    case "stripe": {
      const d = copy.services.stripe.details;
      return status.detailKey === "connected"
        ? d.connected(status.detailParams.mode, status.detailParams.webhook)
        : d.missing;
    }
    case "moderation":
      return copy.services.moderation.details.providers(status.detailParams.text, status.detailParams.image);
    case "kyc":
      return copy.services.kyc.details.provider(status.detailParams.provider);
    case "stream": {
      const d = copy.services.stream.details;
      return status.detailKey === "channel" ? d.channel(status.detailParams.auth) : d.missing;
    }
    case "sepa": {
      const d = copy.services.sepa.details;
      return status.detailKey === "configured" ? d.configured : d.missing;
    }
    case "esign": {
      const d = copy.services.esign.details;
      return status.detailKey === "qualified"
        ? d.qualified(status.detailParams.provider)
        : d.advanced(status.detailParams.provider);
    }
    case "search": {
      const d = copy.services.search.details;
      return status.detailKey === "configured" ? d.configured : d.missing;
    }
    case "analytics": {
      const d = copy.services.analytics.details;
      return status.detailKey === "configured" ? d.configured : d.missing;
    }
    case "geo":
      return copy.services.geo.details.provider(status.detailParams.provider);
    case "health": {
      const d = copy.services.health.details;
      return status.detailKey === "cloud" ? d.cloud : d.missing;
    }
    case "aws": {
      const d = copy.services.aws.details;
      return status.detailKey === "configured" ? d.configured : d.missing;
    }
  }
}
