import type { Locale } from "@/lib/i18n/config";

/**
 * §5.2 — `/kunye` (impressum · imprint) sayfasının üç dildeki metni.
 *
 * Almanca sürüm § 5 DDG (eski § 5 TMG) ve § 18 Abs. 2 MStV gerekliliklerine
 * göre adlandırılmıştır. Yer tutucu değerler ([...]) üç dilde de aynıdır.
 */

type Section = { heading: string; items: string[] };

type Copy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  notice: { title: string; body: string };
  sections: Section[];
  dispute: { heading: string; before: string; linkLabel: string; after: string };
  liability: { heading: string; body: string };
};

export const imprintCopy: Record<Locale, Copy> = {
  tr: {
    metaTitle: "Künye (Impressum)",
    metaDescription: "FIGHTNET yasal künye bilgileri.",
    title: "Künye (Impressum)",
    notice: {
      title: "Doldurulması gerekiyor",
      body: "Almanya'da TMG §5 gereği künye bilgileri zorunludur. Aşağıdaki alanlar tüzel kişilik kurulduktan sonra doldurulmalıdır.",
    },
    sections: [
      {
        heading: "Hizmet sağlayıcı",
        items: ["Şirket adı: [Doldurulacak]", "Adres: [Sokak, Posta kodu, Şehir]", "Ülke: Almanya"],
      },
      {
        heading: "Temsilci",
        items: ["Yetkili kişi: [Ad Soyad]"],
      },
      {
        heading: "İletişim",
        items: ["E-posta: [kontakt@fightnet.app]", "Telefon: [Opsiyonel]"],
      },
      {
        heading: "Sicil bilgileri",
        items: ["Ticaret sicili: [Amtsgericht, HRB numarası]", "Vergi numarası (USt-IdNr.): [DE...]"],
      },
      {
        heading: "İçerikten sorumlu kişi (§18 Abs. 2 MStV)",
        items: ["[Ad Soyad, Adres]"],
      },
    ],
    dispute: {
      heading: "AB uyuşmazlık çözümü",
      before: "Avrupa Komisyonu çevrimiçi uyuşmazlık çözümü platformu: ",
      linkLabel: "ec.europa.eu/consumers/odr",
      after: ". Tüketici hakem heyeti nezdinde uyuşmazlık çözümüne katılma zorunluluğumuz bulunmamaktadır.",
    },
    liability: {
      heading: "Sorumluluk",
      body: "Kullanıcılar tarafından oluşturulan içerikten FIGHTNET sorumlu değildir. Bir ihlal bildirimi aldığımızda ilgili içeriği derhal inceler ve gerekirse kaldırırız (Notice-and-Action, DSA).",
    },
  },

  de: {
    metaTitle: "Impressum",
    metaDescription: "Gesetzliche Anbieterkennzeichnung von FIGHTNET.",
    title: "Impressum",
    notice: {
      title: "Muss noch ausgefüllt werden",
      body: "In Deutschland ist eine Anbieterkennzeichnung nach § 5 DDG (vormals § 5 TMG) verpflichtend. Die folgenden Felder sind nach Gründung der Gesellschaft auszufüllen.",
    },
    sections: [
      {
        heading: "Diensteanbieter",
        items: ["Firmenname: [Auszufüllen]", "Anschrift: [Straße, PLZ, Ort]", "Land: Deutschland"],
      },
      {
        heading: "Vertretung",
        items: ["Vertretungsberechtigte Person: [Vor- und Nachname]"],
      },
      {
        heading: "Kontakt",
        items: ["E-Mail: [kontakt@fightnet.app]", "Telefon: [Optional]"],
      },
      {
        heading: "Registerangaben",
        items: [
          "Handelsregister: [Amtsgericht, HRB-Nummer]",
          "Umsatzsteuer-Identifikationsnummer (USt-IdNr.): [DE...]",
        ],
      },
      {
        heading: "Inhaltlich verantwortlich (§ 18 Abs. 2 MStV)",
        items: ["[Vor- und Nachname, Anschrift]"],
      },
    ],
    dispute: {
      heading: "EU-Streitbeilegung",
      before: "Plattform der Europäischen Kommission zur Online-Streitbeilegung: ",
      linkLabel: "ec.europa.eu/consumers/odr",
      after: ". Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet.",
    },
    liability: {
      heading: "Haftung für Inhalte",
      body: "Für von Nutzerinnen und Nutzern erstellte Inhalte ist FIGHTNET nicht verantwortlich. Sobald uns eine Meldung über einen Rechtsverstoß erreicht, prüfen wir den betreffenden Inhalt unverzüglich und entfernen ihn erforderlichenfalls (Notice-and-Action, DSA).",
    },
  },

  en: {
    metaTitle: "Imprint (Impressum)",
    metaDescription: "FIGHTNET legal imprint information.",
    title: "Imprint (Impressum)",
    notice: {
      title: "To be completed",
      body: "In Germany an imprint is mandatory under § 5 DDG (formerly § 5 TMG). The fields below must be completed once the legal entity has been incorporated.",
    },
    sections: [
      {
        heading: "Service provider",
        items: ["Company name: [To be completed]", "Address: [Street, postcode, city]", "Country: Germany"],
      },
      {
        heading: "Representation",
        items: ["Authorised representative: [First name Last name]"],
      },
      {
        heading: "Contact",
        items: ["Email: [kontakt@fightnet.app]", "Phone: [Optional]"],
      },
      {
        heading: "Register details",
        items: [
          "Commercial register: [Local court, HRB number]",
          "VAT identification number (USt-IdNr.): [DE...]",
        ],
      },
      {
        heading: "Responsible for content (§ 18(2) MStV)",
        items: ["[First name Last name, address]"],
      },
    ],
    dispute: {
      heading: "EU dispute resolution",
      before: "European Commission online dispute resolution platform: ",
      linkLabel: "ec.europa.eu/consumers/odr",
      after: ". We are not obliged to take part in dispute resolution proceedings before a consumer arbitration board.",
    },
    liability: {
      heading: "Liability",
      body: "FIGHTNET is not responsible for content created by users. As soon as we receive notice of an infringement, we review the content concerned without delay and remove it where necessary (notice-and-action, DSA).",
    },
  },
};
