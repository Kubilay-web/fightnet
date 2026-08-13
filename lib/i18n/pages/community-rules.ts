import type { Locale } from "@/lib/i18n/config";

/**
 * §5.2 — `/topluluk-kurallari` (community-richtlinien · community-guidelines)
 * sayfasının üç dildeki metni. Moderasyon süreci DSA'nın Notice-and-Action
 * gerekliliğine dayanır; Almanca sürüm bunu açıkça anar.
 */

type Copy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  rules: { t: string; b: string }[];
  moderation: { heading: string; items: string[] };
  sanctions: { heading: string; items: { label: string; text: string }[] };
  appeal: { heading: string; body: string };
  notice: { title: string; body: string };
};

export const communityRulesCopy: Record<Locale, Copy> = {
  tr: {
    metaTitle: "Topluluk Kuralları",
    metaDescription: "FIGHTNET topluluk kuralları — saygı, güvenlik ve şeffaf moderasyon.",
    title: "Topluluk Kuralları",
    intro:
      "FIGHTNET bir dövüş sporu topluluğudur. Bu kurallar herkesin güvenli ve saygılı bir ortamda antrenman yapabilmesi içindir.",
    rules: [
      {
        t: "Saygı esastır",
        b: "Hakaret, aşağılama, ırkçılık, cinsiyetçilik ve nefret söylemi yasaktır. Rakibine saygı duymak dövüş sporunun temelidir.",
      },
      {
        t: "Güvenlik her şeyden önce gelir",
        b: "Güvensiz sparring davranışını bildir. Tehlikeli teknik önerileri ve gözetimsiz ağır sparring teşviki kaldırılır.",
      },
      {
        t: "Doping yok",
        b: "Performans artırıcı madde tavsiyesi, satışı veya kullanımının teşviki kesinlikle yasaktır.",
      },
      {
        t: "Aşırı kilo düşürme yok",
        b: "Tehlikeli kilo düşürme yöntemleri (susuz kalma, aşırı sauna, kusma) paylaşılamaz. Yeme bozukluğunu teşvik eden içerik kaldırılır.",
      },
      {
        t: "Çocukları koru",
        b: "18 yaş altı kullanıcılarla doğrudan iletişim doğrulama gerektirir. Reşit olmayanların özel bilgilerini paylaşma.",
      },
      {
        t: "Cinsel içerik yok",
        b: "Platform bir spor topluluğudur. Cinsel içerik ve müstehcen paylaşım anında kaldırılır.",
      },
      {
        t: "Sahte profil yok",
        b: "Başkası adına hesap açmak, sahte müsabaka bilançosu girmek veya sahte belge sunmak hesabın kapatılmasıyla sonuçlanır.",
      },
      {
        t: "Spam ve reklam kısıtlı",
        b: "İzinsiz ticari tanıtım yapma. Ekipman satışı için Pazar bölümünü kullan.",
      },
    ],
    moderation: {
      heading: "Nasıl moderasyon yapıyoruz",
      items: [
        "Her içerikte rapor butonu vardır",
        "Raporlar 24 saat içinde incelenir (Notice-and-Action, DSA gerekliliği)",
        "Videolar otomatik ön filtreden geçer, sonra insan incelemesi yapılır",
        "Çocuk güvenliği, güvensiz sparring ve şiddet raporları öncelikli işleme alınır",
        "Yıllık şeffaflık raporu yayınlanır",
      ],
    },
    sanctions: {
      heading: "Yaptırımlar",
      items: [
        { label: "Uyarı", text: "— ilk hafif ihlal" },
        { label: "İçerik kaldırma", text: "— kural ihlali içeren gönderi/yorum" },
        { label: "Geçici askı (30 gün)", text: "— tekrarlanan veya ciddi ihlal" },
        { label: "Kalıcı kapatma", text: "— çocuk güvenliği, sahte kimlik, ağır taciz" },
      ],
    },
    appeal: {
      heading: "İtiraz hakkı",
      body: "Bir moderasyon kararına itiraz edebilirsiniz. İtirazlar bağımsız olarak yeniden değerlendirilir ve sonucu size bildirilir.",
    },
    notice: {
      title: "Bir şey mi gördün?",
      body: "Kural ihlali gördüğünde içeriğin yanındaki bayrak simgesine tıkla. Bildirimlerin gizlidir — bildirdiğin kişi kimliğini görmez.",
    },
  },

  de: {
    metaTitle: "Community-Richtlinien",
    metaDescription: "Community-Richtlinien von FIGHTNET — Respekt, Sicherheit und transparente Moderation.",
    title: "Community-Richtlinien",
    intro:
      "FIGHTNET ist eine Kampfsport-Community. Diese Regeln sorgen dafür, dass alle in einem sicheren und respektvollen Umfeld trainieren können.",
    rules: [
      {
        t: "Respekt ist Pflicht",
        b: "Beleidigungen, Herabwürdigungen, Rassismus, Sexismus und Hassrede sind verboten. Respekt vor dem Gegenüber ist die Grundlage des Kampfsports.",
      },
      {
        t: "Sicherheit geht vor",
        b: "Melde unsicheres Sparring-Verhalten. Gefährliche Technikempfehlungen und die Aufforderung zu hartem Sparring ohne Aufsicht werden entfernt.",
      },
      {
        t: "Kein Doping",
        b: "Das Empfehlen, der Verkauf und die Förderung des Konsums leistungssteigernder Substanzen sind strikt verboten.",
      },
      {
        t: "Kein extremes Gewichtmachen",
        b: "Gefährliche Methoden zum Abkochen (Dehydrierung, exzessive Sauna, Erbrechen) dürfen nicht geteilt werden. Inhalte, die Essstörungen fördern, werden entfernt.",
      },
      {
        t: "Schütze Minderjährige",
        b: "Die direkte Kontaktaufnahme mit Nutzerinnen und Nutzern unter 18 Jahren setzt eine Verifizierung voraus. Teile keine privaten Informationen von Minderjährigen.",
      },
      {
        t: "Keine sexuellen Inhalte",
        b: "Die Plattform ist eine Sport-Community. Sexuelle Inhalte und anzügliche Beiträge werden sofort entfernt.",
      },
      {
        t: "Keine Fake-Profile",
        b: "Ein Konto im Namen einer anderen Person zu eröffnen, eine gefälschte Kampfbilanz anzugeben oder gefälschte Dokumente einzureichen führt zur Schließung des Kontos.",
      },
      {
        t: "Spam und Werbung sind eingeschränkt",
        b: "Betreibe keine kommerzielle Werbung ohne Erlaubnis. Nutze für den Verkauf von Ausrüstung den Marktplatz.",
      },
    ],
    moderation: {
      heading: "So moderieren wir",
      items: [
        "Jeder Inhalt hat einen Melde-Button",
        "Meldungen werden innerhalb von 24 Stunden geprüft (Notice-and-Action, Vorgabe des DSA)",
        "Videos durchlaufen einen automatischen Vorfilter und werden anschließend von Menschen geprüft",
        "Meldungen zu Kinder- und Jugendschutz, unsicherem Sparring und Gewalt werden vorrangig bearbeitet",
        "Es wird ein jährlicher Transparenzbericht veröffentlicht",
      ],
    },
    sanctions: {
      heading: "Maßnahmen",
      items: [
        { label: "Verwarnung", text: "— erster leichter Verstoß" },
        { label: "Entfernung von Inhalten", text: "— Beitrag/Kommentar mit Regelverstoß" },
        { label: "Befristete Sperre (30 Tage)", text: "— wiederholter oder schwerer Verstoß" },
        { label: "Dauerhafte Schließung", text: "— Kinderschutz, Identitätsfälschung, schwere Belästigung" },
      ],
    },
    appeal: {
      heading: "Recht auf Einspruch",
      body: "Gegen eine Moderationsentscheidung kannst du Einspruch einlegen. Einsprüche werden unabhängig erneut geprüft und das Ergebnis wird dir mitgeteilt.",
    },
    notice: {
      title: "Etwas gesehen?",
      body: "Wenn du einen Regelverstoß siehst, klicke auf das Flaggen-Symbol neben dem Inhalt. Deine Meldungen sind vertraulich — die gemeldete Person erfährt deine Identität nicht.",
    },
  },

  en: {
    metaTitle: "Community Guidelines",
    metaDescription: "FIGHTNET community guidelines — respect, safety and transparent moderation.",
    title: "Community Guidelines",
    intro:
      "FIGHTNET is a combat sports community. These rules exist so that everyone can train in a safe and respectful environment.",
    rules: [
      {
        t: "Respect comes first",
        b: "Insults, degradation, racism, sexism and hate speech are prohibited. Respect for your opponent is the foundation of combat sports.",
      },
      {
        t: "Safety above everything",
        b: "Report unsafe sparring behaviour. Dangerous technique advice and encouragement of hard, unsupervised sparring will be removed.",
      },
      {
        t: "No doping",
        b: "Recommending, selling or encouraging the use of performance-enhancing substances is strictly prohibited.",
      },
      {
        t: "No extreme weight cutting",
        b: "Dangerous weight-cutting methods (dehydration, excessive sauna, vomiting) must not be shared. Content that promotes eating disorders will be removed.",
      },
      {
        t: "Protect minors",
        b: "Direct contact with users under 18 requires verification. Do not share minors' private information.",
      },
      {
        t: "No sexual content",
        b: "The platform is a sports community. Sexual content and obscene posts are removed immediately.",
      },
      {
        t: "No fake profiles",
        b: "Opening an account in someone else's name, entering a fake fight record or submitting forged documents results in closure of the account.",
      },
      {
        t: "Spam and advertising are restricted",
        b: "Do not post commercial promotion without permission. Use the Marketplace to sell equipment.",
      },
    ],
    moderation: {
      heading: "How we moderate",
      items: [
        "Every piece of content has a report button",
        "Reports are reviewed within 24 hours (notice-and-action, a DSA requirement)",
        "Videos pass through an automated pre-filter and are then reviewed by humans",
        "Reports concerning child safety, unsafe sparring and violence are handled with priority",
        "An annual transparency report is published",
      ],
    },
    sanctions: {
      heading: "Enforcement measures",
      items: [
        { label: "Warning", text: "— first minor violation" },
        { label: "Content removal", text: "— post/comment breaching the rules" },
        { label: "Temporary suspension (30 days)", text: "— repeated or serious violation" },
        { label: "Permanent closure", text: "— child safety, identity fraud, severe harassment" },
      ],
    },
    appeal: {
      heading: "Right to appeal",
      body: "You can appeal a moderation decision. Appeals are re-examined independently and you will be informed of the outcome.",
    },
    notice: {
      title: "Seen something?",
      body: "If you see a rule violation, click the flag icon next to the content. Your reports are confidential — the person you report does not see your identity.",
    },
  },
};
