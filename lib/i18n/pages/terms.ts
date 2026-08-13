import type { Locale } from "@/lib/i18n/config";

/**
 * §5.2 — `/sartlar` (agb · terms) sayfasının üç dildeki metni.
 *
 * Almanca sürüm AGB dili ve BGB terminolojisiyle yazılmıştır; uygulanacak
 * hukuk üç dilde de Alman hukukudur.
 */

/** Düz paragraf ya da içinde tek bir iç bağlantı geçen paragraf. */
type Paragraph = string | { before: string; linkLabel: string; after: string };

type Section = {
  heading: string;
  paragraphs?: Paragraph[];
  items?: string[];
};

type Copy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lastUpdated: string;
  draft: { title: string; body: string };
  sections: Section[];
};

export const termsCopy: Record<Locale, Copy> = {
  tr: {
    metaTitle: "Kullanım Şartları",
    metaDescription: "FIGHTNET platform kullanım şartları ve koşulları.",
    title: "Kullanım Şartları",
    lastUpdated: "Son güncelleme:",
    draft: {
      title: "Taslak metin",
      body: "Bu metin bir taslaktır ve yayına almadan önce avukat incelemesinden geçmelidir.",
    },
    sections: [
      {
        heading: "1. Kapsam",
        paragraphs: [
          "Bu şartlar FIGHTNET web ve mobil uygulamalarının kullanımını düzenler. Hesap oluşturarak bu şartları kabul etmiş sayılırsınız.",
        ],
      },
      {
        heading: "2. Hesap",
        items: [
          "Hesap açmak için en az 14 yaşında olmalısınız; 18 yaş altı için ebeveyn onayı zorunludur",
          "Doğru ve güncel bilgi vermekle yükümlüsünüz",
          "Hesap güvenliğinden ve şifrenizden siz sorumlusunuz",
          "Bir kişi yalnızca bir kişisel hesap açabilir",
        ],
      },
      {
        heading: "3. Doğrulama ve kefalet",
        paragraphs: [
          "Doğrulama seviyeleri platform güvenliği içindir. Sahte belge sunmak hesabın kalıcı kapatılmasına yol açar. Antrenörler kefil oldukları sporcular için itibarlarıyla sorumludur; sahte kefalet antrenör statüsünün geri alınmasıyla sonuçlanır.",
        ],
      },
      {
        heading: "4. Sparring — önemli sorumluluk feragati",
        paragraphs: [
          {
            before:
              "FIGHTNET yalnızca sporcuları buluşturan bir aracıdır. Sparring seanslarına katılım tamamen kullanıcıların kendi sorumluluğundadır. Ayrıntılar için ",
            linkLabel: "Sparring Sözleşmesi",
            after: " sayfasına bakın.",
          },
        ],
      },
      {
        heading: "5. İçerik kuralları",
        items: [
          "Yüklediğiniz içeriğin haklarına sahip olmalısınız",
          "Cinsel içerik, nefret söylemi, taciz ve şiddet teşviki yasaktır",
          "Doping teşviki ve aşırı kilo düşürme talimatı yasaktır",
          "Yüklediğiniz içerik sizin kalır; FIGHTNET'e platformda gösterme lisansı verirsiniz",
          "Video içerikler otomatik ön filtreden ve moderasyon onayından geçer",
        ],
      },
      {
        heading: "6. Ücretli hizmetler",
        items: [
          "Salon abonelikleri aylık faturalandırılır, istediğiniz zaman iptal edilebilir",
          "Kurucu Üyeler ömür boyu ayrıcalıklı fiyatı korur",
          "Creator aboneliklerinde FIGHTNET %15 komisyon alır, %85 içerik üreticisine gider",
          "Ekipman pazarında platform komisyonu %12'dir",
        ],
      },
      {
        heading: "7. Fesih",
        paragraphs: [
          "Hesabınızı istediğiniz zaman silebilirsiniz. FIGHTNET, kural ihlali durumunda hesapları askıya alabilir veya kapatabilir. 3 güvensiz sparring raporu otomatik askıya alma ile sonuçlanır.",
        ],
      },
      {
        heading: "8. Sorumluluk sınırı",
        paragraphs: [
          "FIGHTNET, kullanıcılar arasındaki anlaşmazlıklardan, sparring sırasında oluşan yaralanmalardan veya salonların sunduğu hizmetlerden sorumlu değildir. Platform \"olduğu gibi\" sunulur.",
        ],
      },
      {
        heading: "9. Değişiklikler",
        paragraphs: [
          "Şartlarda yapılan önemli değişiklikler 30 gün önceden e-posta ile bildirilir. Devam eden kullanım, yeni şartların kabulü anlamına gelir.",
        ],
      },
      {
        heading: "10. Uygulanacak hukuk",
        paragraphs: [
          "Alman hukuku uygulanır. Tüketici koruma mevzuatının zorunlu hükümleri saklıdır.",
        ],
      },
    ],
  },

  de: {
    metaTitle: "Allgemeine Geschäftsbedingungen",
    metaDescription: "Nutzungsbedingungen und AGB der Plattform FIGHTNET.",
    title: "Allgemeine Geschäftsbedingungen",
    lastUpdated: "Zuletzt aktualisiert:",
    draft: {
      title: "Entwurfstext",
      body: "Dieser Text ist ein Entwurf und muss vor der Veröffentlichung anwaltlich geprüft werden.",
    },
    sections: [
      {
        heading: "1. Geltungsbereich",
        paragraphs: [
          "Diese Bedingungen regeln die Nutzung der Web- und Mobilanwendungen von FIGHTNET. Mit der Erstellung eines Kontos erkennst du diese Bedingungen an.",
        ],
      },
      {
        heading: "2. Konto",
        items: [
          "Für die Eröffnung eines Kontos musst du mindestens 14 Jahre alt sein; unter 18 Jahren ist die Einwilligung der Erziehungsberechtigten erforderlich",
          "Du bist verpflichtet, richtige und aktuelle Angaben zu machen",
          "Für die Sicherheit deines Kontos und dein Passwort bist du selbst verantwortlich",
          "Pro Person ist nur ein persönliches Konto zulässig",
        ],
      },
      {
        heading: "3. Verifizierung und Bürgschaft",
        paragraphs: [
          "Die Verifizierungsstufen dienen der Sicherheit der Plattform. Das Einreichen gefälschter Dokumente führt zur dauerhaften Schließung des Kontos. Trainerinnen und Trainer haften mit ihrer Reputation für die Athletinnen und Athleten, für die sie bürgen; eine falsche Bürgschaft führt zum Entzug des Trainerstatus.",
        ],
      },
      {
        heading: "4. Sparring — wichtiger Haftungsausschluss",
        paragraphs: [
          {
            before:
              "FIGHTNET ist ausschließlich ein Vermittler, der Sportlerinnen und Sportler zusammenbringt. Die Teilnahme an Sparring-Einheiten erfolgt vollständig auf eigene Gefahr der Nutzerinnen und Nutzer. Einzelheiten findest du auf der Seite ",
            linkLabel: "Sparring-Vereinbarung",
            after: ".",
          },
        ],
      },
      {
        heading: "5. Inhaltsregeln",
        items: [
          "Du musst über die Rechte an den von dir hochgeladenen Inhalten verfügen",
          "Sexuelle Inhalte, Hassrede, Belästigung und die Aufforderung zu Gewalt sind verboten",
          "Die Förderung von Doping und Anleitungen zu extremem Gewichtmachen sind verboten",
          "Die von dir hochgeladenen Inhalte bleiben deine; du räumst FIGHTNET eine Lizenz zur Darstellung auf der Plattform ein",
          "Videoinhalte durchlaufen einen automatischen Vorfilter und eine Freigabe durch die Moderation",
        ],
      },
      {
        heading: "6. Kostenpflichtige Leistungen",
        items: [
          "Gym-Abonnements werden monatlich abgerechnet und können jederzeit gekündigt werden",
          "Gründungsmitglieder behalten ihren Vorzugspreis lebenslang",
          "Bei Creator-Abonnements behält FIGHTNET 15 % Provision, 85 % gehen an die Creator",
          "Auf dem Ausrüstungsmarktplatz beträgt die Plattformprovision 12 %",
        ],
      },
      {
        heading: "7. Kündigung",
        paragraphs: [
          "Du kannst dein Konto jederzeit löschen. FIGHTNET kann Konten bei Regelverstößen sperren oder schließen. Drei Meldungen wegen unsicheren Sparrings führen automatisch zur Sperrung.",
        ],
      },
      {
        heading: "8. Haftungsbeschränkung",
        paragraphs: [
          "FIGHTNET haftet nicht für Streitigkeiten zwischen Nutzerinnen und Nutzern, für Verletzungen während des Sparrings oder für die von Gyms erbrachten Leistungen. Die Plattform wird „wie besehen“ bereitgestellt; die Haftung für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit bleibt hiervon unberührt (§ 276 Abs. 3, § 309 Nr. 7 BGB).",
        ],
      },
      {
        heading: "9. Änderungen",
        paragraphs: [
          "Wesentliche Änderungen dieser Bedingungen werden 30 Tage im Voraus per E-Mail angekündigt. Die fortgesetzte Nutzung gilt als Zustimmung zu den neuen Bedingungen.",
        ],
      },
      {
        heading: "10. Anwendbares Recht",
        paragraphs: [
          "Es gilt deutsches Recht. Die zwingenden Vorschriften des Verbraucherschutzrechts bleiben unberührt.",
        ],
      },
    ],
  },

  en: {
    metaTitle: "Terms of Use",
    metaDescription: "Terms and conditions for using the FIGHTNET platform.",
    title: "Terms of Use",
    lastUpdated: "Last updated:",
    draft: {
      title: "Draft text",
      body: "This text is a draft and must be reviewed by a lawyer before publication.",
    },
    sections: [
      {
        heading: "1. Scope",
        paragraphs: [
          "These terms govern the use of the FIGHTNET web and mobile applications. By creating an account you accept these terms.",
        ],
      },
      {
        heading: "2. Account",
        items: [
          "You must be at least 14 years old to open an account; guardian consent is mandatory under 18",
          "You are obliged to provide accurate and up-to-date information",
          "You are responsible for the security of your account and for your password",
          "Each person may open only one personal account",
        ],
      },
      {
        heading: "3. Verification and vouching",
        paragraphs: [
          "Verification levels exist for the safety of the platform. Submitting forged documents leads to permanent closure of the account. Coaches stake their reputation on the athletes they vouch for; a false vouch results in the withdrawal of coach status.",
        ],
      },
      {
        heading: "4. Sparring — important disclaimer",
        paragraphs: [
          {
            before:
              "FIGHTNET is merely an intermediary that brings athletes together. Participation in sparring sessions is entirely at the users' own risk. For details, see the ",
            linkLabel: "Sparring Agreement",
            after: " page.",
          },
        ],
      },
      {
        heading: "5. Content rules",
        items: [
          "You must hold the rights to the content you upload",
          "Sexual content, hate speech, harassment and incitement to violence are prohibited",
          "Promoting doping and giving instructions for extreme weight cutting are prohibited",
          "Content you upload remains yours; you grant FIGHTNET a licence to display it on the platform",
          "Video content passes through an automated pre-filter and moderation approval",
        ],
      },
      {
        heading: "6. Paid services",
        items: [
          "Gym subscriptions are billed monthly and can be cancelled at any time",
          "Founding Members keep their preferential price for life",
          "On creator subscriptions FIGHTNET takes a 15% commission; 85% goes to the creator",
          "The platform commission on the equipment marketplace is 12%",
        ],
      },
      {
        heading: "7. Termination",
        paragraphs: [
          "You may delete your account at any time. FIGHTNET may suspend or close accounts in the event of rule violations. Three unsafe-sparring reports result in an automatic suspension.",
        ],
      },
      {
        heading: "8. Limitation of liability",
        paragraphs: [
          "FIGHTNET is not liable for disputes between users, for injuries occurring during sparring or for the services provided by gyms. The platform is provided \"as is\"; liability for intent and gross negligence, and for injury to life, body or health, remains unaffected.",
        ],
      },
      {
        heading: "9. Changes",
        paragraphs: [
          "Material changes to these terms are announced by email 30 days in advance. Continued use constitutes acceptance of the new terms.",
        ],
      },
      {
        heading: "10. Governing law",
        paragraphs: [
          "German law applies. Mandatory consumer protection provisions remain unaffected.",
        ],
      },
    ],
  },
};
