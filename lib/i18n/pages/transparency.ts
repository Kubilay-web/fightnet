import type { Locale } from "@/lib/i18n/config";

/**
 * §11.5 — Şeffaflık raporunun metinleri.
 *
 * Rakamlar sayfada veritabanından üretilir; burada yalnızca açıklama metni
 * bulunur. `{year}` yer tutucusu render sırasında doldurulur.
 */
interface Copy {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  betaTitle: string;
  betaBody: string;

  reportsHeading: string;
  reportsTotal: string;
  reportsOpen: string;
  reportsResolved: string;
  reportsDismissed: string;

  responseHeading: string;
  responseBody: string;
  avgResponse: string;
  within24h: string;
  hoursSuffix: string;

  reasonsHeading: string;
  reasonsEmpty: string;

  appealsHeading: string;
  appealsBody: string;
  appealsTotal: string;
  appealsOpen: string;
  appealsUpheld: string;
  appealsOverturned: string;

  howHeading: string;
  howFlag: string;
  howContactPre: string;
  howContactLink: string;
  howContactPost: string;
  howAppealPre: string;
  howAppealLink: string;
  howAppealPost: string;

  autoHeading: string;
  autoBody1: string;
  autoBody2Pre: string;
  autoBody2Link: string;
  autoBody2Post: string;
  autoScanned: string;
  autoApproved: string;
  autoReview: string;
  autoBlocked: string;
  autoTools: string;
  autoToolsFallback: string;

  docsHeading: string;
  docsRules: string;
  docsRulesNote: string;
  docsPrivacy: string;
  docsPrivacyNote: string;
  docsImprint: string;
  docsImprintNote: string;

  footerNote: string;
}

export const transparencyCopy: Record<Locale, Copy> = {
  tr: {
    metaTitle: "Şeffaflık Raporu",
    metaDescription:
      "FIGHTNET moderasyon şeffaflık raporu — bildirim sayıları, işlem süreleri ve itiraz sonuçları. DSA uyumlu.",
    title: "Şeffaflık Raporu {year}",
    intro:
      "Bu sayfa Dijital Hizmetler Yasası (DSA) kapsamındaki şeffaflık yükümlülüğümüzü karşılar. Rakamlar moderasyon kayıtlarımızdan otomatik üretilir ve saatlik tazelenir — elle düzenlenmez. Hiçbir sayı tek bir kullanıcıya, içeriğe veya bildirimi yapan kişiye geri götürülemez.",
    betaTitle: "Beta aşaması notu",
    betaBody:
      "Platform Beta programındadır. Bu dönemde moderasyon kurucu tarafından yürütülür ve otomatik ön filtreler (görsel/video ve metin analizi) ile desteklenir. Kullanıcı sayısı 1.000 aylık aktif doğrulanmış üyeyi aştığında ayrı bir moderasyon ekibi kurulur.",

    reportsHeading: "Bildirimler",
    reportsTotal: "Toplam bildirim",
    reportsOpen: "Açık",
    reportsResolved: "İşlem yapıldı",
    reportsDismissed: "Reddedildi",

    responseHeading: "Tepki süresi",
    responseBody:
      "Notice-and-Action prosedürümüz 24 saat içinde tepki verilmesini öngörür (DSA gerekliliği). Aşağıdaki değerler bu yıl sonuçlandırılan bildirimlerin son 500 kaydından hesaplanır.",
    avgResponse: "Ortalama tepki süresi",
    within24h: "24 saat içinde sonuçlanan",
    hoursSuffix: "saat",

    reasonsHeading: "Bildirim gerekçeleri",
    reasonsEmpty: "Bu yıl henüz bildirim alınmadı.",

    appealsHeading: "İtirazlar",
    appealsBody:
      "Moderasyon kararlarına itiraz edilebilir. İtiraz, kararı veren kişiden bağımsız olarak yeniden değerlendirilir ve sonuç kullanıcıya bildirilir.",
    appealsTotal: "Toplam itiraz",
    appealsOpen: "İnceleniyor",
    appealsUpheld: "Karar korundu",
    appealsOverturned: "Karar geri alındı",

    howHeading: "Nasıl bildirim yaparım?",
    howFlag: "Her gönderi, yorum, profil, ilan ve etkinlikte bayrak simgeli bildir düğmesi vardır.",
    howContactPre: "Hesabın yoksa veya acil bir güvenlik durumu varsa ",
    howContactLink: "iletişim sayfasından",
    howContactPost: " bize ulaş.",
    howAppealPre: "Hakkında işlem yapılan içeriğin sahibiysen ",
    howAppealLink: "panelinden itiraz edebilirsin",
    howAppealPost: ".",

    autoHeading: "Otomatik araçlar",
    autoBody1:
      "Her gönderi, yorum, forum konusu ve ilan yayına girmeden otomatik ön filtreden geçer. Metin zararlı dil, tehdit, doping ve aşırı kilo düşürme yönlendirmesi için taranır; görseller ve video poster kareleri müstehcenlik ve şiddet için analiz edilir. Videolar filtreden geçse bile ayrıca insan incelemesine alınır.",
    autoBody2Pre:
      "Filtre yüksek güvenle ihlal tespit ederse içerik yayınlanmaz. Bu karar nihai değildir: etkilenen kullanıcı gerekçeyi görür ve ",
    autoBody2Link: "itiraz edebilir",
    autoBody2Post:
      "; itirazı bir insan değerlendirir. Orta düzey şüphede içerik doğrudan engellenmez, insan incelemesi kuyruğuna alınır.",
    autoScanned: "Taranan içerik",
    autoApproved: "Otomatik onaylanan",
    autoReview: "İncelemeye alınan",
    autoBlocked: "Yayınlanmayan",
    autoTools: "Kullanılan araçlar — metin: {text}, görsel: {image}.",
    autoToolsFallback:
      " Harici analiz servisleri bu kurulumda etkin değil; filtre platformun kendi kural sözlüğüyle çalışır.",

    docsHeading: "İlgili belgeler",
    docsRules: "Topluluk Kuralları",
    docsRulesNote: "hangi içeriğin kaldırıldığı",
    docsPrivacy: "Gizlilik Açıklaması",
    docsPrivacyNote: "verilerin nasıl işlendiği",
    docsImprint: "Künye (Impressum)",
    docsImprintNote: "yasal sorumlu ve iletişim noktası",

    footerNote: "Son güncelleme: otomatik · Kapsam: 1 Ocak {year} – bugün",
  },

  de: {
    metaTitle: "Transparenzbericht",
    metaDescription:
      "FIGHTNET Transparenzbericht zur Moderation — Meldungszahlen, Bearbeitungszeiten und Einspruchsergebnisse. DSA-konform.",
    title: "Transparenzbericht {year}",
    intro:
      "Diese Seite erfüllt unsere Transparenzpflicht nach dem Digital Services Act (DSA). Die Zahlen werden automatisch aus unseren Moderationsdaten erzeugt und stündlich aktualisiert — sie werden nicht manuell bearbeitet. Keine Zahl lässt sich auf eine einzelne Person, einen einzelnen Inhalt oder eine meldende Person zurückführen.",
    betaTitle: "Hinweis zur Beta-Phase",
    betaBody:
      "Die Plattform befindet sich im Beta-Programm. In dieser Phase wird die Moderation vom Gründer durchgeführt und durch automatische Vorfilter (Bild-/Video- und Textanalyse) unterstützt. Sobald die Zahl der monatlich aktiven verifizierten Mitglieder 1.000 übersteigt, wird ein eigenes Moderationsteam aufgebaut.",

    reportsHeading: "Meldungen",
    reportsTotal: "Meldungen gesamt",
    reportsOpen: "Offen",
    reportsResolved: "Bearbeitet",
    reportsDismissed: "Abgelehnt",

    responseHeading: "Reaktionszeit",
    responseBody:
      "Unser Notice-and-Action-Verfahren sieht eine Reaktion innerhalb von 24 Stunden vor (DSA-Anforderung). Die folgenden Werte beruhen auf den letzten 500 in diesem Jahr abgeschlossenen Meldungen.",
    avgResponse: "Durchschnittliche Reaktionszeit",
    within24h: "Innerhalb von 24 Stunden erledigt",
    hoursSuffix: "Std.",

    reasonsHeading: "Meldegründe",
    reasonsEmpty: "In diesem Jahr sind bisher keine Meldungen eingegangen.",

    appealsHeading: "Einsprüche",
    appealsBody:
      "Gegen Moderationsentscheidungen kann Einspruch eingelegt werden. Der Einspruch wird unabhängig von der entscheidenden Person erneut geprüft und das Ergebnis mitgeteilt.",
    appealsTotal: "Einsprüche gesamt",
    appealsOpen: "In Prüfung",
    appealsUpheld: "Entscheidung bestätigt",
    appealsOverturned: "Entscheidung aufgehoben",

    howHeading: "Wie melde ich etwas?",
    howFlag:
      "Jeder Beitrag, Kommentar, jedes Profil, Angebot und Event hat einen Melde-Button mit Flaggensymbol.",
    howContactPre: "Wenn du kein Konto hast oder ein akuter Sicherheitsfall vorliegt, erreichst du uns über die ",
    howContactLink: "Kontaktseite",
    howContactPost: ".",
    howAppealPre: "Wenn dir der betroffene Inhalt gehört, kannst du ",
    howAppealLink: "im Dashboard Einspruch einlegen",
    howAppealPost: ".",

    autoHeading: "Automatisierte Werkzeuge",
    autoBody1:
      "Jeder Beitrag, Kommentar, jedes Forumsthema und Angebot durchläuft vor der Veröffentlichung einen automatischen Vorfilter. Texte werden auf schädliche Sprache, Drohungen, Doping und Anleitungen zu extremem Gewichtmachen geprüft; Bilder und Video-Vorschaubilder werden auf Nacktheit und Gewalt analysiert. Videos gehen auch nach bestandenem Filter zusätzlich in die menschliche Prüfung.",
    autoBody2Pre:
      "Erkennt der Filter mit hoher Sicherheit einen Verstoß, wird der Inhalt nicht veröffentlicht. Diese Entscheidung ist nicht endgültig: Die betroffene Person sieht die Begründung und kann ",
    autoBody2Link: "Einspruch einlegen",
    autoBody2Post:
      "; der Einspruch wird von einem Menschen geprüft. Bei mittlerem Verdacht wird der Inhalt nicht direkt gesperrt, sondern in die Prüfwarteschlange gestellt.",
    autoScanned: "Geprüfte Inhalte",
    autoApproved: "Automatisch freigegeben",
    autoReview: "Zur Prüfung vorgelegt",
    autoBlocked: "Nicht veröffentlicht",
    autoTools: "Eingesetzte Werkzeuge — Text: {text}, Bild: {image}.",
    autoToolsFallback:
      " Externe Analysedienste sind in dieser Installation nicht aktiv; der Filter arbeitet mit dem plattformeigenen Regelwerk.",

    docsHeading: "Zugehörige Dokumente",
    docsRules: "Community-Richtlinien",
    docsRulesNote: "welche Inhalte entfernt werden",
    docsPrivacy: "Datenschutzerklärung",
    docsPrivacyNote: "wie Daten verarbeitet werden",
    docsImprint: "Impressum",
    docsImprintNote: "rechtlich verantwortliche Stelle und Kontaktpunkt",

    footerNote: "Letzte Aktualisierung: automatisch · Zeitraum: 1. Januar {year} – heute",
  },

  en: {
    metaTitle: "Transparency report",
    metaDescription:
      "FIGHTNET moderation transparency report — report volumes, handling times and appeal outcomes. DSA compliant.",
    title: "Transparency report {year}",
    intro:
      "This page fulfils our transparency obligation under the Digital Services Act (DSA). The figures are generated automatically from our moderation records and refreshed hourly — they are not edited by hand. No figure can be traced back to an individual user, a specific piece of content or the person who filed a report.",
    betaTitle: "Beta phase note",
    betaBody:
      "The platform is in its Beta programme. During this period moderation is carried out by the founder and supported by automated pre-filters (image/video and text analysis). Once monthly active verified members exceed 1,000, a dedicated moderation team will be established.",

    reportsHeading: "Reports",
    reportsTotal: "Total reports",
    reportsOpen: "Open",
    reportsResolved: "Actioned",
    reportsDismissed: "Dismissed",

    responseHeading: "Response time",
    responseBody:
      "Our notice-and-action procedure targets a response within 24 hours (a DSA requirement). The values below are calculated from the last 500 reports closed this year.",
    avgResponse: "Average response time",
    within24h: "Closed within 24 hours",
    hoursSuffix: "hours",

    reasonsHeading: "Report reasons",
    reasonsEmpty: "No reports have been received this year yet.",

    appealsHeading: "Appeals",
    appealsBody:
      "Moderation decisions can be appealed. An appeal is reviewed independently of the person who made the original decision and the outcome is communicated to the user.",
    appealsTotal: "Total appeals",
    appealsOpen: "Under review",
    appealsUpheld: "Decision upheld",
    appealsOverturned: "Decision overturned",

    howHeading: "How do I report something?",
    howFlag: "Every post, comment, profile, listing and event has a flag-icon report button.",
    howContactPre: "If you do not have an account or there is an urgent safety concern, reach us via the ",
    howContactLink: "contact page",
    howContactPost: ".",
    howAppealPre: "If you own the content that was actioned, you can ",
    howAppealLink: "appeal from your dashboard",
    howAppealPost: ".",

    autoHeading: "Automated tools",
    autoBody1:
      "Every post, comment, forum thread and listing passes through an automated pre-filter before publication. Text is screened for harmful language, threats, doping and extreme weight-cutting instructions; images and video poster frames are analysed for nudity and violence. Videos go to human review as well, even after passing the filter.",
    autoBody2Pre:
      "If the filter detects a violation with high confidence, the content is not published. That decision is not final: the affected user sees the reason and can ",
    autoBody2Link: "file an appeal",
    autoBody2Post:
      "; the appeal is assessed by a human. Where suspicion is moderate, content is not blocked outright but queued for human review.",
    autoScanned: "Content screened",
    autoApproved: "Auto-approved",
    autoReview: "Sent to review",
    autoBlocked: "Not published",
    autoTools: "Tools in use — text: {text}, image: {image}.",
    autoToolsFallback:
      " External analysis services are not enabled in this installation; the filter runs on the platform's own rule dictionary.",

    docsHeading: "Related documents",
    docsRules: "Community guidelines",
    docsRulesNote: "what content gets removed",
    docsPrivacy: "Privacy notice",
    docsPrivacyNote: "how data is processed",
    docsImprint: "Imprint",
    docsImprintNote: "legally responsible entity and point of contact",

    footerNote: "Last updated: automatic · Period: 1 January {year} – today",
  },
};
