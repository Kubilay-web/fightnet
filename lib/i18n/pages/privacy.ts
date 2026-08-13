import type { Locale } from "@/lib/i18n/config";

/**
 * §5.2 — `/gizlilik` (datenschutz · privacy) sayfasının üç dildeki metni.
 *
 * Almanca sürüm DACH hukukuna (DSGVO, TTDSG, DSA) göre yazılmıştır; Türkçe
 * metindeki "KVKK/GDPR" karşılığı Almancada "DSGVO", İngilizcede "GDPR"dır.
 */

/** Düz paragraf ya da içinde kalın bir parça geçen paragraf. */
type Paragraph = string | { before: string; strong: string; after: string };

/** Düz madde ya da "Etiket: metin" biçiminde kalın başlıklı madde. */
type ListItem = string | { label: string; text: string };

type Section = {
  heading: string;
  paragraphs?: Paragraph[];
  items?: ListItem[];
};

type Copy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lastUpdated: string;
  draft: { title: string; body: string };
  sections: Section[];
};

export const privacyCopy: Record<Locale, Copy> = {
  tr: {
    metaTitle: "Gizlilik Politikası",
    metaDescription: "FIGHTNET KVKK/GDPR uyumlu veri koruma açıklaması.",
    title: "Gizlilik Politikası",
    lastUpdated: "Son güncelleme:",
    draft: {
      title: "Taslak metin",
      body:
        "Bu metin teknik uygulamayı yansıtan bir taslaktır. Yayına almadan önce KVKK/GDPR uzmanı bir avukat tarafından gözden geçirilmelidir.",
    },
    sections: [
      {
        heading: "1. Veri sorumlusu",
        paragraphs: [
          "FIGHTNET platformunu işleten tüzel kişi veri sorumlusudur. İletişim bilgileri Künye (Impressum) sayfasında yer alır.",
        ],
      },
      {
        heading: "2. Hangi verileri işliyoruz",
        items: [
          { label: "Hesap verileri:", text: "ad, kullanıcı adı, e-posta, şifre (Bcrypt ile hash'lenir)" },
          {
            label: "Profil verileri:",
            text: "biyografi, şehir, doğum tarihi, boy/kulaç, disiplin ve müsabaka bilançosu",
          },
          {
            label: "Doğrulama verileri:",
            text: "kimlik belgesi ve selfie (yalnızca KYC için, onay sonrası silinir)",
          },
          {
            label: "Aktivite verileri:",
            text: "antrenman kayıtları, sparring ilanları, rezervasyonlar, gönderiler",
          },
          {
            label: "Teknik veriler:",
            text: "IP adresi, tarayıcı bilgisi (güvenlik ve kötüye kullanım önleme amacıyla)",
          },
        ],
      },
      {
        heading: "3. Hukuki dayanak",
        items: [
          "Sözleşmenin ifası (GDPR Md. 6/1-b): hesap yönetimi, rezervasyon, abonelik",
          "Meşru menfaat (Md. 6/1-f): güvenlik, dolandırıcılık önleme, hizmet iyileştirme",
          "Açık rıza (Md. 6/1-a): pazarlama e-postaları, isteğe bağlı profil alanları",
          "Yasal yükümlülük (Md. 6/1-c): fatura saklama, moderasyon kayıtları (DSA)",
        ],
      },
      {
        heading: "4. Sağlık verisi toplamıyoruz",
        paragraphs: [
          "FIGHTNET Passport bilinçli olarak sağlık verisi içermez. GDPR Md. 9 kapsamındaki özel kategori veriler (sağlık raporu, doktor onayı) platformda saklanmaz.",
        ],
      },
      {
        heading: "5. Görünürlük seviyeleri",
        paragraphs: [
          {
            before:
              "Her veri noktası için kimin ne göreceğine sen karar verirsin: Herkese Açık, Topluluk, Salon, Antrenör, Organizatör, Federasyon veya Özel. Antrenman kayıtları varsayılan olarak ",
            strong: "Özel",
            after: "'dir.",
          },
        ],
      },
      {
        heading: "6. Barındırma ve aktarım",
        paragraphs: [
          "Tüm sunucular Avrupa Birliği içindedir (AWS Frankfurt, eu-central-1). Medya dosyaları Cloudinary üzerinde AB bölgesinde saklanır. Veriler AB dışına aktarılmaz.",
        ],
      },
      {
        heading: "7. Güvenlik",
        items: [
          "Aktarımda TLS 1.2+ şifreleme",
          "Depolamada AES-256 şifreleme",
          "Şifreler Bcrypt (cost 11) ile hash'lenir — düz metin saklanmaz",
          "Yönetici erişimi için çok faktörlü doğrulama",
          "Günlük yedekleme, 30 gün saklama",
          "Ödeme verileri asla FIGHTNET'te tutulmaz (PCI-DSS uyumlu sağlayıcı)",
        ],
      },
      {
        heading: "8. Saklama süreleri",
        items: [
          "Hesap verileri: hesap aktif olduğu sürece",
          "KYC belgeleri: doğrulama onayından sonra 30 gün içinde silinir",
          "Moderasyon kayıtları: yasal gereklilik gereği 2 yıl",
          "Silme talebi sonrası: 30 gün içinde tüm veriler silinir",
        ],
      },
      {
        heading: "9. Haklarınız",
        items: [
          "Bilgi talep etme (Md. 15)",
          "Düzeltme (Md. 16)",
          "Silme — \"unutulma hakkı\" (Md. 17): Ayarlar → Hesabı sil",
          "İşlemenin kısıtlanması (Md. 18)",
          "Veri taşınabilirliği (Md. 20): Ayarlar → Verilerimi indir (JSON)",
          "İtiraz (Md. 21) ve denetim makamına şikayet",
        ],
      },
      {
        heading: "10. Çerezler",
        paragraphs: [
          "Yalnızca zorunlu çerezler kullanılır: oturum çerezi (fn_session) ve tema tercihi (fn_theme). İzleme veya reklam çerezi kullanılmaz. Analitik için KVKK uyumlu, çerezsiz ölçüm tercih edilir.",
        ],
      },
      {
        heading: "11. 18 yaş altı kullanıcılar",
        paragraphs: [
          "18 yaş altı üyeler için ebeveyn onayı zorunludur. Doğrulanmamış yetişkinler reşit olmayan kullanıcılara doğrudan mesaj gönderemez. Reşit olmayanlar için ek içerik filtresi uygulanır.",
        ],
      },
      {
        heading: "12. İletişim",
        paragraphs: [
          "Veri koruma talepleriniz için İletişim sayfasındaki adresi kullanabilirsiniz. Taleplere en geç 30 gün içinde yanıt verilir.",
        ],
      },
    ],
  },

  de: {
    metaTitle: "Datenschutzerklärung",
    metaDescription: "DSGVO-konforme Datenschutzerklärung von FIGHTNET.",
    title: "Datenschutzerklärung",
    lastUpdated: "Zuletzt aktualisiert:",
    draft: {
      title: "Entwurfstext",
      body:
        "Dieser Text ist ein Entwurf, der die technische Umsetzung abbildet. Vor der Veröffentlichung muss er von einer auf Datenschutzrecht (DSGVO) spezialisierten Anwältin oder einem spezialisierten Anwalt geprüft werden.",
    },
    sections: [
      {
        heading: "1. Verantwortlicher",
        paragraphs: [
          "Verantwortlicher im Sinne der DSGVO ist die juristische Person, die die Plattform FIGHTNET betreibt. Die Kontaktdaten findest du auf der Seite Impressum.",
        ],
      },
      {
        heading: "2. Welche Daten wir verarbeiten",
        items: [
          {
            label: "Kontodaten:",
            text: "Name, Benutzername, E-Mail-Adresse, Passwort (wird mit Bcrypt gehasht)",
          },
          {
            label: "Profildaten:",
            text: "Biografie, Stadt, Geburtsdatum, Körpergröße/Reichweite, Disziplinen und Kampfbilanz",
          },
          {
            label: "Verifizierungsdaten:",
            text: "Ausweisdokument und Selfie (ausschließlich zur Identitätsprüfung/KYC, nach der Freigabe gelöscht)",
          },
          {
            label: "Aktivitätsdaten:",
            text: "Trainingseinträge, Sparring-Anzeigen, Buchungen, Beiträge",
          },
          {
            label: "Technische Daten:",
            text: "IP-Adresse, Browserinformationen (zur Sicherheit und zur Missbrauchsprävention)",
          },
        ],
      },
      {
        heading: "3. Rechtsgrundlagen",
        items: [
          "Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO): Kontoverwaltung, Buchungen, Abonnements",
          "Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO): Sicherheit, Betrugsprävention, Verbesserung des Dienstes",
          "Ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a DSGVO): Marketing-E-Mails, optionale Profilfelder",
          "Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO): Aufbewahrung von Rechnungen, Moderationsprotokolle (DSA)",
        ],
      },
      {
        heading: "4. Wir erheben keine Gesundheitsdaten",
        paragraphs: [
          "Der FIGHTNET Passport enthält bewusst keine Gesundheitsdaten. Besondere Kategorien personenbezogener Daten im Sinne des Art. 9 DSGVO (ärztliche Atteste, Sporttauglichkeitsbescheinigungen) werden auf der Plattform nicht gespeichert.",
        ],
      },
      {
        heading: "5. Sichtbarkeitsstufen",
        paragraphs: [
          {
            before:
              "Für jeden Datenpunkt entscheidest du selbst, wer was sieht: Öffentlich, Community, Gym, Trainer, Veranstalter, Verband oder Privat. Trainingseinträge sind standardmäßig ",
            strong: "privat",
            after: ".",
          },
        ],
      },
      {
        heading: "6. Hosting und Datenübermittlung",
        paragraphs: [
          "Alle Server stehen innerhalb der Europäischen Union (AWS Frankfurt, eu-central-1). Mediendateien werden bei Cloudinary in der EU-Region gespeichert. Eine Übermittlung von Daten in Drittländer außerhalb der EU findet nicht statt.",
        ],
      },
      {
        heading: "7. Sicherheit",
        items: [
          "Verschlüsselung bei der Übertragung mit TLS 1.2+",
          "Verschlüsselung im Speicher mit AES-256",
          "Passwörter werden mit Bcrypt (Cost 11) gehasht — Klartext wird nicht gespeichert",
          "Mehrfaktor-Authentifizierung für administrative Zugänge",
          "Tägliche Backups mit 30 Tagen Aufbewahrung",
          "Zahlungsdaten werden niemals bei FIGHTNET gespeichert (PCI-DSS-konformer Dienstleister)",
        ],
      },
      {
        heading: "8. Speicherfristen",
        items: [
          "Kontodaten: solange das Konto aktiv ist",
          "KYC-Dokumente: werden innerhalb von 30 Tagen nach Freigabe der Verifizierung gelöscht",
          "Moderationsprotokolle: 2 Jahre aufgrund gesetzlicher Vorgaben",
          "Nach einem Löschantrag: alle Daten werden innerhalb von 30 Tagen gelöscht",
        ],
      },
      {
        heading: "9. Deine Rechte",
        items: [
          "Auskunft (Art. 15 DSGVO)",
          "Berichtigung (Art. 16 DSGVO)",
          "Löschung — „Recht auf Vergessenwerden“ (Art. 17 DSGVO): Einstellungen → Konto löschen",
          "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
          "Datenübertragbarkeit (Art. 20 DSGVO): Einstellungen → Meine Daten herunterladen (JSON)",
          "Widerspruch (Art. 21 DSGVO) sowie Beschwerde bei einer Aufsichtsbehörde",
        ],
      },
      {
        heading: "10. Cookies",
        paragraphs: [
          "Es werden ausschließlich technisch notwendige Cookies eingesetzt: das Session-Cookie (fn_session) und die Theme-Einstellung (fn_theme). Tracking- oder Werbe-Cookies werden nicht verwendet. Für die Reichweitenmessung setzen wir auf eine DSGVO- und TTDSG-konforme, cookiefreie Analyse.",
        ],
      },
      {
        heading: "11. Nutzerinnen und Nutzer unter 18 Jahren",
        paragraphs: [
          "Für Mitglieder unter 18 Jahren ist die Einwilligung der Erziehungsberechtigten erforderlich. Nicht verifizierte Erwachsene können Minderjährigen keine Direktnachrichten senden. Für Minderjährige gilt ein zusätzlicher Inhaltsfilter.",
        ],
      },
      {
        heading: "12. Kontakt",
        paragraphs: [
          "Für datenschutzrechtliche Anliegen kannst du die auf der Kontaktseite angegebene Adresse nutzen. Anfragen werden spätestens innerhalb von 30 Tagen beantwortet.",
        ],
      },
    ],
  },

  en: {
    metaTitle: "Privacy Policy",
    metaDescription: "FIGHTNET's GDPR-compliant data protection notice.",
    title: "Privacy Policy",
    lastUpdated: "Last updated:",
    draft: {
      title: "Draft text",
      body:
        "This text is a draft reflecting the technical implementation. It must be reviewed by a lawyer specialising in data protection law (GDPR) before publication.",
    },
    sections: [
      {
        heading: "1. Data controller",
        paragraphs: [
          "The controller within the meaning of the GDPR is the legal entity operating the FIGHTNET platform. Its contact details can be found on the Imprint page.",
        ],
      },
      {
        heading: "2. What data we process",
        items: [
          { label: "Account data:", text: "name, username, email address, password (hashed with Bcrypt)" },
          {
            label: "Profile data:",
            text: "biography, city, date of birth, height/reach, disciplines and fight record",
          },
          {
            label: "Verification data:",
            text: "identity document and selfie (used solely for KYC, deleted after approval)",
          },
          {
            label: "Activity data:",
            text: "training logs, sparring listings, bookings, posts",
          },
          {
            label: "Technical data:",
            text: "IP address, browser information (for security and abuse prevention)",
          },
        ],
      },
      {
        heading: "3. Legal bases",
        items: [
          "Performance of a contract (Art. 6(1)(b) GDPR): account management, bookings, subscriptions",
          "Legitimate interest (Art. 6(1)(f) GDPR): security, fraud prevention, service improvement",
          "Explicit consent (Art. 6(1)(a) GDPR): marketing emails, optional profile fields",
          "Legal obligation (Art. 6(1)(c) GDPR): invoice retention, moderation records (DSA)",
        ],
      },
      {
        heading: "4. We do not collect health data",
        paragraphs: [
          "The FIGHTNET Passport deliberately contains no health data. Special categories of personal data under Art. 9 GDPR (medical reports, doctor's clearance) are not stored on the platform.",
        ],
      },
      {
        heading: "5. Visibility levels",
        paragraphs: [
          {
            before:
              "For every data point you decide who sees what: Public, Community, Gym, Coach, Organiser, Federation or Private. Training logs are ",
            strong: "private",
            after: " by default.",
          },
        ],
      },
      {
        heading: "6. Hosting and transfers",
        paragraphs: [
          "All servers are located within the European Union (AWS Frankfurt, eu-central-1). Media files are stored with Cloudinary in the EU region. No data is transferred outside the EU.",
        ],
      },
      {
        heading: "7. Security",
        items: [
          "TLS 1.2+ encryption in transit",
          "AES-256 encryption at rest",
          "Passwords are hashed with Bcrypt (cost 11) — never stored in plain text",
          "Multi-factor authentication for administrator access",
          "Daily backups, retained for 30 days",
          "Payment data is never held by FIGHTNET (PCI-DSS compliant provider)",
        ],
      },
      {
        heading: "8. Retention periods",
        items: [
          "Account data: for as long as the account is active",
          "KYC documents: deleted within 30 days of verification approval",
          "Moderation records: 2 years, as required by law",
          "After a deletion request: all data is deleted within 30 days",
        ],
      },
      {
        heading: "9. Your rights",
        items: [
          "Right of access (Art. 15 GDPR)",
          "Rectification (Art. 16 GDPR)",
          "Erasure — the \"right to be forgotten\" (Art. 17 GDPR): Settings → Delete account",
          "Restriction of processing (Art. 18 GDPR)",
          "Data portability (Art. 20 GDPR): Settings → Download my data (JSON)",
          "Objection (Art. 21 GDPR) and complaint to a supervisory authority",
        ],
      },
      {
        heading: "10. Cookies",
        paragraphs: [
          "Only strictly necessary cookies are used: the session cookie (fn_session) and the theme preference (fn_theme). No tracking or advertising cookies are set. For analytics we rely on GDPR-compliant, cookieless measurement.",
        ],
      },
      {
        heading: "11. Users under 18",
        paragraphs: [
          "Guardian consent is mandatory for members under 18. Unverified adults cannot send direct messages to minors. An additional content filter applies to minors.",
        ],
      },
      {
        heading: "12. Contact",
        paragraphs: [
          "For data protection requests please use the address given on the Contact page. Requests are answered within 30 days at the latest.",
        ],
      },
    ],
  },
};
