import type { Locale } from "@/lib/i18n/config";

/**
 * `/veri-lisansi` sayfası ve başvuru formunun (`components/data-license-form`)
 * metinleri.
 *
 * Ücret aralığı `DATA_LICENSE_FEES` içinde tek kaynakta kalır; burada yalnızca
 * `{min}` / `{max}` yer tutucularıyla biçim tutulur. Uç nokta adları, sorgu
 * parametreleri, HTTP durum kodları, başlık adları ve curl örneği üç dilde de
 * aynıdır — çevrilmez, sözlüğe de kopyalanmaz.
 */

/** `lib/data-license.ts` içindeki `DATASETS` anahtarları (o modül server-only). */
export type DatasetKey = "events" | "fights" | "gyms" | "athletes_public";

/** İstemci formuna prop olarak geçen bölüm. */
export type DataLicenseFormCopy = {
  errorFallback: string;
  doneTitle: string;
  doneBody: string;
  organization: { label: string; placeholder: string };
  contactName: { label: string; placeholder: string };
  contactEmail: { label: string; placeholder: string };
  vatId: { label: string; hint: string; placeholder: string };
  country: { label: string; options: Record<"DE" | "AT" | "CH" | "TR" | "NL" | "FR", string> };
  scopes: { label: string };
  useCase: { label: string; hint: string; placeholder: string };
  submit: string;
  legal: string;
};

type Copy = {
  meta: { title: string; description: string };
  badge: string;
  title: string;
  /** `<b>` ile vurgulanan orta parça ayrı tutulur. */
  intro: { lead: string; strong: string; tail: string };
  principle: { title: string; body: string };
  licensed: { heading: string; items: string[] };
  never: { heading: string; items: string[]; note: string };
  pricing: {
    heading: string;
    federation: {
      badge: string;
      /** `{min}` / `{max}` → DATA_LICENSE_FEES */
      price: string;
      perYear: string;
      body: string;
    };
    media: { badge: string; price: string; body: string };
    terms: string;
  };
  api: {
    heading: string;
    /** `(` ile biter; ardından `fnk_…` kod parçası gelir */
    keyBefore: string;
    /** `fnk_…` ile ` Authorization` kod parçaları arasındaki metin */
    keyAfter: string;
    /** ` Authorization` kod parçasından sonraki metin */
    authAfter: string;
    endpointsHeading: string;
    datasets: Record<DatasetKey, string>;
    paramsHeading: string;
    page: string;
    size: string;
    since: string;
    rateLead: string;
    rateMid: string;
    rateTail: string;
    scopeLead: string;
    scopeMid: string;
    scopeTail: string;
  };
  apply: { heading: string; body: string };
  form: DataLicenseFormCopy;
  cta: { privacy: string; contact: string };
};

export const dataLicenseCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Datenlizenz",
      description:
        "Datenlizenz von FIGHTNET für Verbände, Medienhäuser und Forschende: REST-API für Eventkalender, Fightcards, Gym-Verzeichnis und öffentliche Athletenprofile.",
    },
    badge: "B2B · §4.4",
    title: "Datenlizenz",
    intro: {
      lead:
        "Verbände, Sportmedien, Analyseunternehmen außerhalb des Wettgeschäfts und akademisch Forschende können über eine vertraglich geregelte REST-API auf die öffentlichen Daten von FIGHTNET zugreifen. Eine Lizenz bedeutet nicht, die Daten zu kaufen, sondern ",
      strong: "das Recht, sie für einen bestimmten Zweck zu nutzen",
      tail:
        ": Eine Nutzung außerhalb des im Vertrag genannten Zwecks, der Weiterverkauf und das massenhafte Kopieren sind untersagt.",
    },
    principle: {
      title: "Grundprinzip",
      body:
        "Ein Datenpunkt wird nur dann lizenziert, wenn die Nutzerin oder der Nutzer ihn selbst öffentlich gemacht hat. Ändert eine Athletin oder ein Athlet die Sichtbarkeitseinstellung, verschwindet sie oder er sofort aus allen API-Antworten — auch aus laufenden Lizenzen.",
    },
    licensed: {
      heading: "Was lizenziert wird",
      items: [
        "Eventkalender: Titel, Datum, Ort, Disziplin, Status",
        "Fightcards und offizielle Ergebnisse: Name, Gewichtsklasse, Runde, Methode",
        "Gym-Verzeichnis: Name, Stadt, Disziplinen, Verifizierungsstatus",
        "Öffentliche Athletenprofile: Name, Disziplin, Level, Wettkampfbilanz",
      ],
    },
    never: {
      heading: "Was niemals lizenziert wird",
      items: [
        "Gesundheits- und Verletzungsdaten — in keinem Umfang, unter keinen Umständen",
        "Trainingstagebücher, Gewichtsverlauf, Puls- und Wearable-Messwerte",
        "Private Nachrichten, Sparringanfragen und Gesprächsinhalte",
        "Keinerlei Datensätze von Nutzerinnen und Nutzern unter 18 Jahren",
        "E-Mail, Telefon, Adresse, IBAN und weitere Kontakt- und Zahlungsdaten",
        "Profile und Profilbereiche, deren Sichtbarkeit nicht PUBLIC ist",
        "Identitätsnachweise (KYC) und Verifizierungsanträge",
      ],
      note:
        "Diese Liste kann vertraglich eingeschränkt, aber nicht erweitert werden. Weder ein Aufpreis noch öffentliches Interesse oder wissenschaftliche Forschung ändern diesen Umfang.",
    },
    pricing: {
      heading: "Preise",
      federation: {
        badge: "Verband",
        price: "{min}-{max} €",
        perYear: "/Jahr",
        body:
          "Für nationale und regionale Verbände. Die Gebühr richtet sich nach der Anzahl der angefragten Datensätze und dem Anfragelimit pro Minute.",
      },
      media: {
        badge: "Medien · Forschung",
        price: "Auf Anfrage",
        body:
          "Für Verlage und kommerzielle Analysen nach Nutzungsvolumen kalkuliert. Für nicht gewinnorientierte akademische Arbeiten kann eine kostenlose Testlizenz vergeben werden.",
      },
      terms:
        "Alle Lizenzen laufen 12 Monate, werden jährlich im Voraus in Rechnung gestellt und verlängern sich nicht automatisch. Bei einem Vertragsverstoß wird die Lizenz ohne Vorankündigung gesperrt, die Gebühr wird nicht erstattet.",
    },
    api: {
      heading: "API-Nutzung",
      keyBefore:
        "Nach der Freigabe erhältst du einen API-Schlüssel, der nur ein einziges Mal angezeigt wird (",
      keyAfter:
        " ist das Präfix). Der Schlüssel wird ausschließlich als Prüfsumme (Hash) gespeichert; geht er verloren, wird ein neuer erzeugt. Anfragen werden mit dem Header",
      authAfter: " signiert:",
      endpointsHeading: "Endpunkte",
      datasets: {
        events: "Eventkalender — Datum, Ort, Disziplin, Status",
        fights: "Fightcards und Ergebnisse — Name, Gewichtsklasse, Methode",
        gyms: "Gym-Verzeichnis — Name, Stadt, Disziplinen, Verifizierungsstatus",
        athletes_public: "Öffentliche Athletenprofile — Name, Disziplin, Bilanz",
      },
      paramsHeading: "Parameter und Limits",
      page: "— Seitennummer (Standard 1)",
      size: "— Seitengröße (Standard 50, maximal 200)",
      since: "— ISO-Datum; nur Datensätze, die danach aktualisiert wurden",
      rateLead: "Das Ratenlimit ist lizenzspezifisch und wird in jeder Antwort über die Header",
      rateMid: "mitgeteilt. Wird das Limit überschritten, antwortet die API mit",
      rateTail: ".",
      scopeLead: "Wird ein Datensatz außerhalb des Lizenzumfangs angefragt, antwortet die API mit",
      scopeMid: ", bei ungültigem oder abgelaufenem Schlüssel mit",
      scopeTail: ".",
    },
    apply: {
      heading: "Antrag",
      body:
        "Beschreibe den Verwendungszweck so konkret wie möglich — das ist bei der Prüfung das entscheidende Feld. Anträge mit unklarem Zweck oder offener Weiterverkaufsabsicht werden abgelehnt.",
    },
    form: {
      errorFallback: "Der Antrag konnte nicht gesendet werden, bitte versuche es erneut.",
      doneTitle: "Dein Antrag ist bei uns eingegangen",
      doneBody:
        "Wir prüfen deinen Verwendungszweck und die angefragten Datensätze. Bei einer Freigabe schicken wir dir den API-Schlüssel und den Vertragsentwurf per E-Mail (in der Regel innerhalb von 5 Werktagen).",
      organization: { label: "Name der Organisation", placeholder: "Deutscher MMA Bund" },
      contactName: { label: "Ansprechpartner", placeholder: "Vor- und Nachname" },
      contactEmail: { label: "Geschäftliche E-Mail", placeholder: "daten@verband.de" },
      vatId: {
        label: "Steuer- / USt-IdNr.",
        hint: "Für die Rechnung erforderlich",
        placeholder: "DE123456789",
      },
      country: {
        label: "Land",
        options: {
          DE: "Deutschland",
          AT: "Österreich",
          CH: "Schweiz",
          TR: "Türkei",
          NL: "Niederlande",
          FR: "Frankreich",
        },
      },
      scopes: { label: "Angefragte Datensätze" },
      useCase: {
        label: "Verwendungszweck",
        hint:
          "Mindestens 30 Zeichen. Beschreibe, wo, wofür und wie lange du die Daten nutzen willst.",
        placeholder:
          "Der Verband möchte die jährliche Wettkampfstatistik erstellen und den Eventkalender der Mitgliedsvereine auf der eigenen Website anzeigen …",
      },
      submit: "Lizenzantrag senden",
      legal:
        "Der Antrag ist kein Vertragsangebot. Die Lizenz wird erst nach schriftlichem Vertrag und Zahlung aktiv; bei Missbrauch wird sie einseitig gesperrt.",
    },
    cta: { privacy: "Datenschutzerklärung", contact: "Bei Fragen" },
  },

  en: {
    meta: {
      title: "Data license",
      description:
        "FIGHTNET data license for federations, media outlets and researchers: a REST API for the event calendar, fight cards, gym directory and public athlete profiles.",
    },
    badge: "B2B · §4.4",
    title: "Data license",
    intro: {
      lead:
        "Federations, sports media, non-betting analytics companies and academic researchers can access FIGHTNET's public data through a contractual REST API. A license does not mean buying the data, it means acquiring ",
      strong: "the right to use it for a specific purpose",
      tail:
        ": use beyond the purpose stated in the contract, resale and bulk copying are prohibited.",
    },
    principle: {
      title: "Core principle",
      body:
        "A data point is only licensed if the user made it public themselves. An athlete who changes their privacy setting drops out of every API response immediately, including active licenses.",
    },
    licensed: {
      heading: "What is licensed",
      items: [
        "Event calendar: title, date, venue, discipline, status",
        "Fight cards and official results: name, weight class, round, method",
        "Gym directory: name, city, disciplines, verification status",
        "Public athlete profiles: name, discipline, level, competition record",
      ],
    },
    never: {
      heading: "What is never licensed",
      items: [
        "Health and injury data — in no scope, under no circumstances",
        "Training logs, weight tracking, heart-rate and wearable measurements",
        "Private messages, sparring requests and conversation content",
        "No records whatsoever belonging to users under the age of 18",
        "Email, phone, address, IBAN and other contact or payment data",
        "Profiles and profile sections whose privacy setting is not PUBLIC",
        "Identity verification (KYC) documents and verification requests",
      ],
      note:
        "This list can be narrowed by contract but never widened. Neither an extra fee nor public interest nor scientific research changes this scope.",
    },
    pricing: {
      heading: "Pricing",
      federation: {
        badge: "Federation",
        price: "€{min}-{max}",
        perYear: "/year",
        body:
          "For national and regional federations. The fee depends on the number of datasets requested and on the per-minute request limit.",
      },
      media: {
        badge: "Media · Research",
        price: "On request",
        body:
          "Priced by usage volume for publishers and commercial analytics. Non-profit academic work may receive a free trial license.",
      },
      terms:
        "All licenses run for 12 months, are invoiced annually in advance and do not renew automatically. In case of a breach of contract the license is suspended without notice and the fee is not refunded.",
    },
    api: {
      heading: "Using the API",
      keyBefore: "Once approved, you receive an API key that is shown only once (",
      keyAfter:
        " is the prefix). The key is stored only as a digest (hash), so if it is lost a new one is generated. Requests are signed with the",
      authAfter: " header:",
      endpointsHeading: "Endpoints",
      datasets: {
        events: "Event calendar — date, venue, discipline, status",
        fights: "Fight cards and results — name, weight class, method",
        gyms: "Gym directory — name, city, disciplines, verification status",
        athletes_public: "Public athlete profiles — name, discipline, record",
      },
      paramsHeading: "Parameters and limits",
      page: "— page number (default 1)",
      size: "— page size (default 50, maximum 200)",
      since: "— ISO date; only records updated after that date",
      rateLead: "The rate limit is license-specific and is reported in every response through the",
      rateMid: "headers. If the limit is exceeded, the API returns",
      rateTail: ".",
      scopeLead: "Requesting a dataset outside the licensed scope returns",
      scopeMid: ", and an invalid or expired key returns",
      scopeTail: ".",
    },
    apply: {
      heading: "Application",
      body:
        "Describe your use case as concretely as possible — it is the decisive field in the review. Applications with a vague purpose or open to resale are rejected.",
    },
    form: {
      errorFallback: "The application could not be sent, please try again.",
      doneTitle: "Your application has reached us",
      doneBody:
        "We will review your use case and the datasets you requested. If it is approved, your API key and the draft contract are sent by email (usually within 5 working days).",
      organization: { label: "Organization name", placeholder: "Deutscher MMA Bund" },
      contactName: { label: "Contact person", placeholder: "First and last name" },
      contactEmail: { label: "Business email", placeholder: "data@federation.de" },
      vatId: {
        label: "Tax / VAT number",
        hint: "Required for invoicing",
        placeholder: "DE123456789",
      },
      country: {
        label: "Country",
        options: {
          DE: "Germany",
          AT: "Austria",
          CH: "Switzerland",
          TR: "Türkiye",
          NL: "Netherlands",
          FR: "France",
        },
      },
      scopes: { label: "Requested datasets" },
      useCase: {
        label: "Use case",
        hint:
          "At least 30 characters. Describe where, for what purpose and for how long you will use the data.",
        placeholder:
          "The federation wants to compile annual competition statistics and show the event calendar of its member clubs on our own website…",
      },
      submit: "Submit license application",
      legal:
        "An application is not a contract offer. The license only becomes active after a written contract and payment; in case of misuse it is suspended unilaterally.",
    },
    cta: { privacy: "Privacy policy", contact: "If you have questions" },
  },

  tr: {
    meta: {
      title: "Veri Lisansı",
      description:
        "Federasyonlar, medya kuruluşları ve araştırmacılar için FIGHTNET veri lisansı: etkinlik takvimi, dövüş kartları, salon dizini ve herkese açık sporcu profilleri için REST API.",
    },
    badge: "B2B · §4.4",
    title: "Veri Lisansı",
    intro: {
      lead:
        "Federasyonlar, spor medyası, bahis dışı analiz şirketleri ve akademik araştırmacılar FIGHTNET'in herkese açık verilerine sözleşmeli bir REST API üzerinden erişebilir. Lisans, veriyi satın almak değil ",
      strong: "belirli bir amaçla kullanma hakkı",
      tail:
        " almaktır: sözleşmede yazan amaç dışında kullanım, yeniden satış ve toplu kopyalama yasaktır.",
    },
    principle: {
      title: "Temel ilke",
      body:
        "Bir veri yalnızca kullanıcının kendisi onu herkese açık yaptıysa lisanslanır. Gizlilik ayarını değiştiren bir sporcu, aktif lisanslar dahil tüm API yanıtlarından derhal çıkar.",
    },
    licensed: {
      heading: "Neler lisanslanır",
      items: [
        "Etkinlik takvimi: başlık, tarih, yer, disiplin, durum",
        "Dövüş kartları ve resmî sonuçlar: isim, kilo sınıfı, raunt, yöntem",
        "Salon dizini: ad, şehir, disiplinler, doğrulama durumu",
        "Herkese açık sporcu profilleri: ad, disiplin, seviye, müsabaka bilançosu",
      ],
    },
    never: {
      heading: "Neler asla lisanslanmaz",
      items: [
        "Sağlık ve yaralanma verisi — hiçbir kapsamda, hiçbir koşulda",
        "Antrenman günlükleri, kilo takibi, nabız/wearable ölçümleri",
        "Özel mesajlar, sparring talepleri ve konuşma içerikleri",
        "18 yaşından küçük kullanıcılara ait hiçbir kayıt",
        "E-posta, telefon, adres, IBAN ve diğer iletişim/ödeme verileri",
        "Gizlilik ayarı PUBLIC olmayan profiller ve profil bölümleri",
        "Kimlik doğrulama (KYC) belgeleri ve doğrulama başvuruları",
      ],
      note:
        "Bu liste sözleşmeyle daraltılabilir, genişletilemez. Ek ücret, kamu yararı veya bilimsel araştırma gerekçesi bu kapsamı değiştirmez.",
    },
    pricing: {
      heading: "Fiyatlandırma",
      federation: {
        badge: "Federasyon",
        price: "{min}-{max} €",
        perYear: "/yıl",
        body:
          "Ulusal ve bölgesel federasyonlar için. Ücret, talep edilen veri kümesi sayısına ve dakikadaki istek sınırına göre belirlenir.",
      },
      media: {
        badge: "Medya · Araştırma",
        price: "Teklif",
        body:
          "Yayıncılar ve ticari analiz için kullanım hacmine göre fiyatlanır. Kâr amacı gütmeyen akademik çalışmalarda ücretsiz deneme lisansı verilebilir.",
      },
      terms:
        "Tüm lisanslar 12 ay sürelidir, yıllık peşin faturalanır ve otomatik yenilenmez. Sözleşme ihlalinde lisans bildirimsiz askıya alınır, ücret iade edilmez.",
    },
    api: {
      heading: "API kullanımı",
      keyBefore: "Onaydan sonra tek seferliğine gösterilen bir API anahtarı alırsın (",
      keyAfter:
        " ile başlar). Anahtar yalnızca özet (hash) olarak saklandığı için kaybolursa yenisi üretilir. İstekler",
      authAfter: " başlığıyla imzalanır:",
      endpointsHeading: "Uç noktalar",
      datasets: {
        events: "Etkinlik takvimi — tarih, yer, disiplin, durum",
        fights: "Dövüş kartları ve sonuçlar — isim, kilo sınıfı, yöntem",
        gyms: "Salon dizini — ad, şehir, disiplinler, doğrulama durumu",
        athletes_public: "Herkese açık sporcu profilleri — ad, disiplin, bilanço",
      },
      paramsHeading: "Parametreler ve sınırlar",
      page: "— sayfa numarası (varsayılan 1)",
      size: "— sayfa boyutu (varsayılan 50, en fazla 200)",
      since: "— ISO tarih; yalnızca o tarihten sonra güncellenen kayıtlar",
      rateLead: "Hız sınırı lisansa özeldir ve her yanıtta",
      rateMid: "başlıklarıyla bildirilir. Sınır aşılırsa",
      rateTail: " döner.",
      scopeLead: "Kapsam dışı bir veri kümesi istenirse",
      scopeMid: ", anahtar geçersiz veya süresi dolmuşsa",
      scopeTail: " döner.",
    },
    apply: {
      heading: "Başvuru",
      body:
        "Kullanım amacını olabildiğince somut yaz — değerlendirmede en belirleyici alan budur. Amacı belirsiz veya yeniden satışa açık başvurular reddedilir.",
    },
    form: {
      errorFallback: "Başvuru gönderilemedi, lütfen tekrar deneyin.",
      doneTitle: "Başvurun bize ulaştı",
      doneBody:
        "Kullanım amacını ve talep ettiğin veri kümelerini inceleyeceğiz. Onay durumunda API anahtarın ve sözleşme taslağın e-posta ile iletilir (genelde 5 iş günü).",
      organization: { label: "Kurum adı", placeholder: "Deutscher MMA Bund" },
      contactName: { label: "Yetkili kişi", placeholder: "Ad Soyad" },
      contactEmail: { label: "Kurumsal e-posta", placeholder: "veri@federasyon.de" },
      vatId: {
        label: "Vergi / VAT numarası",
        hint: "Fatura için gerekli",
        placeholder: "DE123456789",
      },
      country: {
        label: "Ülke",
        options: {
          DE: "Almanya",
          AT: "Avusturya",
          CH: "İsviçre",
          TR: "Türkiye",
          NL: "Hollanda",
          FR: "Fransa",
        },
      },
      scopes: { label: "Talep edilen veri kümeleri" },
      useCase: {
        label: "Kullanım amacı",
        hint: "En az 30 karakter. Veriyi nerede, hangi amaçla ve ne kadar süre kullanacağını yaz.",
        placeholder:
          "Federasyon yıllık müsabaka istatistiklerini derlemek ve üye kulüplerin etkinlik takvimini kendi sitemizde göstermek için…",
      },
      submit: "Lisans Başvurusu Gönder",
      legal:
        "Başvuru bir sözleşme teklifi değildir. Lisans yalnızca yazılı sözleşme ve ödeme sonrası etkinleşir; kötüye kullanım durumunda tek taraflı askıya alınır.",
    },
    cta: { privacy: "Gizlilik politikası", contact: "Sorularınız için" },
  },
};
