import type { Locale } from "@/lib/i18n/config";

/**
 * §5.2 — `/sparring-sozlesmesi` (sparring-vereinbarung · sparring-agreement)
 * sayfasının üç dildeki metni.
 *
 * Almanca feragat metni, § 276 Abs. 3 BGB uyarınca kasıt ve ağır ihmal için
 * sorumluluğun sözleşmeyle kaldırılamayacağını açıkça belirtir.
 */

type Section = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

type Copy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: { title: string; body: string };
  sections: Section[];
  autoBan: { heading: string; before: string; strong: string; after: string };
  finalSections: Section[];
  notice: { title: string; body: string };
};

export const sparringAgreementCopy: Record<Locale, Copy> = {
  tr: {
    metaTitle: "Sparring Sözleşmesi",
    metaDescription: "FIGHTNET sparring güvenlik kuralları ve sorumluluk feragatnamesi.",
    title: "Sparring Sözleşmesi",
    intro: {
      title: "Sparring bir müsabaka değildir",
      body: "Sparring, kontrollü bir antrenmandır. Amaç öğrenmektir, rakibi yenmek değil. Bu ayrımı kabul etmeyen kullanıcılar platformdan çıkarılır.",
    },
    sections: [
      {
        heading: "1. Kendi sorumluluğunda katılım",
        paragraphs: [
          "FIGHTNET yalnızca sporcuları buluşturan bir aracıdır. Sparring seansına katılım tamamen kendi sorumluluğunuzdadır. FIGHTNET seansa katılmaz, denetlemez ve oluşabilecek yaralanmalardan sorumlu tutulamaz.",
        ],
      },
      {
        heading: "2. Sağlık beyanı",
        items: [
          "Sparring yapmaya sağlık durumunuzun elverişli olduğunu beyan edersiniz",
          "Bilinen bir kalp rahatsızlığı, sarsıntı geçmişi veya iyileşmemiş sakatlık varsa katılmayın",
          "Son 30 gün içinde nakavt/sarsıntı yaşadıysanız doktor onayı olmadan sparring yapmayın",
        ],
      },
      {
        heading: "3. Güvenlik kuralları",
        items: [
          "Uygun koruyucu ekipman zorunludur: dişlik, eldiven, kasık koruyucu, gerekiyorsa kask",
          "Seans öncesi yoğunluk seviyesi (hafif / orta / sert) açıkça konuşulur",
          "\"Dur\" veya tap sinyali anında saygı görür — istisnasız",
          "Bilinçli sertleştirme, uyarısız güç artırma ve ego sparring yasaktır",
          "Seviye farkı varsa daha deneyimli olan yoğunluğu ayarlamakla yükümlüdür",
          "Sparring gözetimli bir salonda yapılmalıdır; halka açık alanda sparring önerilmez",
        ],
      },
      {
        heading: "4. Reşit olmayanlar",
        paragraphs: [
          "18 yaş altı sporcularla sparring yalnızca Seviye 2 doğrulanmış kullanıcılar tarafından ve antrenör gözetiminde talep edilebilir. Ebeveyn onayı olmadan buluşma yapılamaz.",
        ],
      },
      {
        heading: "5. Değerlendirme sistemi",
        paragraphs: [
          "Her sparring seansından sonra karşılıklı değerlendirme yapılır: güvenlik, teknik ve dakiklik puanlanır. Bu, topluluk içinde itibar oluşturur ve güvenli olmayan davranışları görünür kılar.",
        ],
      },
    ],
    autoBan: {
      heading: "Otomatik yasak eşiği",
      before: "Bir kullanıcı hakkında ",
      strong: "3 güvensiz sparring raporu",
      after: " açıldığında hesap otomatik olarak askıya alınır ve moderasyon incelemesine girer.",
    },
    finalSections: [
      {
        heading: "6. Sorumluluk feragati",
        paragraphs: [
          "Sparring talebi göndererek veya kabul ederek; dövüş sporlarının doğası gereği yaralanma riski taşıdığını anladığınızı, bu riski gönüllü olarak üstlendiğinizi ve FIGHTNET'i her türlü talepten ari tuttuğunuzu kabul edersiniz. Bu feragat, kasıt veya ağır ihmal hallerini kapsamaz.",
        ],
      },
      {
        heading: "7. Sigorta önerisi",
        paragraphs: [
          "Kendi spor sigortanızın sparring antrenmanlarını kapsadığından emin olun. Birçok salon üyeliği bu kapsamı zaten sunar.",
        ],
      },
    ],
    notice: {
      title: "Hukuki inceleme gerekli",
      body: "Bu metin bir taslaktır. Sparring sorumluluk feragatnamesi, yayına almadan önce spor hukuku alanında uzman bir avukat tarafından hazırlanmalı/onaylanmalıdır.",
    },
  },

  de: {
    metaTitle: "Sparring-Vereinbarung",
    metaDescription: "Sicherheitsregeln und Haftungsausschluss für Sparring auf FIGHTNET.",
    title: "Sparring-Vereinbarung",
    intro: {
      title: "Sparring ist kein Wettkampf",
      body: "Sparring ist ein kontrolliertes Training. Das Ziel ist zu lernen, nicht den Partner zu besiegen. Wer diesen Unterschied nicht akzeptiert, wird von der Plattform entfernt.",
    },
    sections: [
      {
        heading: "1. Teilnahme auf eigene Gefahr",
        paragraphs: [
          "FIGHTNET ist ausschließlich ein Vermittler, der Sportlerinnen und Sportler zusammenbringt. Die Teilnahme an einer Sparring-Einheit erfolgt vollständig auf eigene Gefahr. FIGHTNET nimmt an der Einheit nicht teil, beaufsichtigt sie nicht und haftet nicht für dabei entstehende Verletzungen.",
        ],
      },
      {
        heading: "2. Gesundheitserklärung",
        items: [
          "Du erklärst, dass dein Gesundheitszustand für Sparring geeignet ist",
          "Nimm nicht teil, wenn eine bekannte Herzerkrankung, eine Gehirnerschütterung in der Vorgeschichte oder eine nicht ausgeheilte Verletzung vorliegt",
          "Wenn du in den letzten 30 Tagen einen K.-o. oder eine Gehirnerschütterung erlitten hast, sparre nicht ohne ärztliche Freigabe",
        ],
      },
      {
        heading: "3. Sicherheitsregeln",
        items: [
          "Geeignete Schutzausrüstung ist Pflicht: Mundschutz, Handschuhe, Tiefschutz und bei Bedarf Kopfschutz",
          "Vor der Einheit wird die Intensität (leicht / mittel / hart) ausdrücklich abgesprochen",
          "„Stopp“ oder ein Abklopfen wird sofort respektiert — ausnahmslos",
          "Bewusstes Härterwerden, unangekündigtes Erhöhen der Kraft und Ego-Sparring sind verboten",
          "Bei Niveauunterschieden ist die erfahrenere Person verpflichtet, die Intensität anzupassen",
          "Sparring soll in einem beaufsichtigten Gym stattfinden; Sparring im öffentlichen Raum wird nicht empfohlen",
        ],
      },
      {
        heading: "4. Minderjährige",
        paragraphs: [
          "Sparring mit Sportlerinnen und Sportlern unter 18 Jahren darf nur von auf Stufe 2 verifizierten Nutzerinnen und Nutzern und nur unter Aufsicht einer Trainerin oder eines Trainers angefragt werden. Ohne Einwilligung der Erziehungsberechtigten darf kein Treffen stattfinden.",
        ],
      },
      {
        heading: "5. Bewertungssystem",
        paragraphs: [
          "Nach jeder Sparring-Einheit erfolgt eine gegenseitige Bewertung: Sicherheit, Technik und Pünktlichkeit werden benotet. Das baut Reputation innerhalb der Community auf und macht unsicheres Verhalten sichtbar.",
        ],
      },
    ],
    autoBan: {
      heading: "Schwelle für die automatische Sperre",
      before: "Sobald gegen ein Konto ",
      strong: "drei Meldungen wegen unsicheren Sparrings",
      after: " eingehen, wird das Konto automatisch gesperrt und der Moderation zur Prüfung vorgelegt.",
    },
    finalSections: [
      {
        heading: "6. Haftungsausschluss",
        paragraphs: [
          "Mit dem Senden oder Annehmen einer Sparring-Anfrage erkennst du an, dass Kampfsport naturgemäß ein Verletzungsrisiko birgt, dass du dieses Risiko freiwillig übernimmst und FIGHTNET von sämtlichen Ansprüchen freistellst. Dieser Haftungsausschluss gilt nicht für Vorsatz und grobe Fahrlässigkeit (§ 276 Abs. 3 BGB).",
        ],
      },
      {
        heading: "7. Empfehlung zur Versicherung",
        paragraphs: [
          "Stelle sicher, dass deine eigene Sportversicherung Sparring-Training abdeckt. Viele Gym-Mitgliedschaften bieten diesen Schutz bereits.",
        ],
      },
    ],
    notice: {
      title: "Rechtliche Prüfung erforderlich",
      body: "Dieser Text ist ein Entwurf. Der Sparring-Haftungsausschluss muss vor der Veröffentlichung von einer im Sportrecht spezialisierten Anwältin oder einem spezialisierten Anwalt erstellt bzw. freigegeben werden.",
    },
  },

  en: {
    metaTitle: "Sparring Agreement",
    metaDescription: "FIGHTNET sparring safety rules and liability disclaimer.",
    title: "Sparring Agreement",
    intro: {
      title: "Sparring is not a competition",
      body: "Sparring is controlled training. The goal is to learn, not to beat your partner. Users who do not accept this distinction are removed from the platform.",
    },
    sections: [
      {
        heading: "1. Participation at your own risk",
        paragraphs: [
          "FIGHTNET is merely an intermediary that brings athletes together. Participation in a sparring session is entirely at your own risk. FIGHTNET does not take part in the session, does not supervise it and cannot be held liable for any injuries that occur.",
        ],
      },
      {
        heading: "2. Health declaration",
        items: [
          "You declare that your state of health is suitable for sparring",
          "Do not take part if you have a known heart condition, a history of concussion or an unhealed injury",
          "If you have suffered a knockout or concussion in the last 30 days, do not spar without medical clearance",
        ],
      },
      {
        heading: "3. Safety rules",
        items: [
          "Appropriate protective equipment is mandatory: mouthguard, gloves, groin guard and headgear where needed",
          "The intensity level (light / medium / hard) is agreed explicitly before the session",
          "\"Stop\" or a tap is respected immediately — without exception",
          "Deliberately going harder, increasing power without warning and ego sparring are prohibited",
          "Where there is a difference in level, the more experienced partner must adjust the intensity",
          "Sparring should take place in a supervised gym; sparring in public spaces is not recommended",
        ],
      },
      {
        heading: "4. Minors",
        paragraphs: [
          "Sparring with athletes under 18 may only be requested by Level 2 verified users and only under coach supervision. No meeting may take place without guardian consent.",
        ],
      },
      {
        heading: "5. Rating system",
        paragraphs: [
          "After every sparring session both partners rate each other: safety, technique and punctuality are scored. This builds reputation within the community and makes unsafe behaviour visible.",
        ],
      },
    ],
    autoBan: {
      heading: "Automatic ban threshold",
      before: "When ",
      strong: "three unsafe-sparring reports",
      after: " are filed against a user, the account is automatically suspended and referred to moderation review.",
    },
    finalSections: [
      {
        heading: "6. Disclaimer of liability",
        paragraphs: [
          "By sending or accepting a sparring request you acknowledge that combat sports inherently carry a risk of injury, that you assume this risk voluntarily and that you hold FIGHTNET harmless from any and all claims. This waiver does not cover intent or gross negligence.",
        ],
      },
      {
        heading: "7. Insurance recommendation",
        paragraphs: [
          "Make sure your own sports insurance covers sparring training. Many gym memberships already include this cover.",
        ],
      },
    ],
    notice: {
      title: "Legal review required",
      body: "This text is a draft. The sparring liability waiver must be drafted or approved by a lawyer specialising in sports law before publication.",
    },
  },
};
