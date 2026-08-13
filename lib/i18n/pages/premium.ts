import type { Locale } from "@/lib/i18n/config";

/**
 * `/premium` sayfasının metinleri.
 *
 * Fiyatlar `PLATFORM_PLANS`, komisyon oranları `PLATFORM_FEE_RATE` /
 * `COACHING_FEE_RATE` içinde tek kaynakta kalır; burada yalnızca plan adları,
 * sloganları, özellik listeleri ve oranın cümle içindeki yeri tutulur. Böylece
 * fiyat veya oran değiştiğinde çeviri dosyasına dokunmak gerekmez.
 */
type PlanKey = "PREMIUM" | "COACH_TOOLS";

type PlanCopy = {
  label: string;
  tagline: string;
  features: string[];
};

type Copy = {
  meta: { title: string; description: string };
  badge: string;
  title: string;
  intro: string;
  plans: Record<PlanKey, PlanCopy>;
  perMonth: string;
  vatNote: string;
  free: { heading: string; items: string[] };
  fees: {
    heading: string;
    /** `{platform}` → Creator komisyonu, `{coaching}` → koçluk komisyonu */
    body: string;
    /** Yüzde biçimi: `{n}` → tam sayı oran */
    percentFormat: string;
  };
  faq: { heading: string; items: { q: string; a: string }[] };
  cta: { subscription: string; register: string; about: string };
};

export const premiumCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Premium und Trainer-Tools",
      description:
        "FIGHTNET Premium bietet ein werbefreies Erlebnis und erweiterte Statistiken; die Trainer-Tools bringen Schülerverwaltung und ein größeres Bürgschaftskontingent. Monatlich, ohne Mindestlaufzeit.",
    },
    badge: "Premium",
    title: "FIGHTNET ohne Werbung und echte Werkzeuge für Trainer",
    intro:
      "Die gesamte Plattform ist kostenlos nutzbar: Profil, Trainingstagebuch, Sparringsuche, Gym-Finder und Events stehen allen offen. Die beiden folgenden Abos machen das Erlebnis werbefrei und geben Trainerinnen und Trainern einen skalierbaren Arbeitsbereich. Monatlich, ohne Mindestlaufzeit.",
    plans: {
      PREMIUM: {
        label: "Premium",
        tagline: "FIGHTNET ohne Werbung",
        features: [
          "Keine Banner- und Feed-Werbung",
          "Erweiterte Trainingsstatistiken und Export",
          "Bevorzugte Sichtbarkeit in der Sparringsuche",
          "Premium-Abzeichen im Profil",
        ],
      },
      COACH_TOOLS: {
        label: "Trainer-Tools",
        tagline: "SaaS für Trainer",
        features: [
          "Unbegrenzte Schülerverwaltung und Zuweisung von Trainingsplänen",
          "Bürgschaftskontingent steigt von 20 auf 50",
          "Entwicklungs-Dashboard für Schüler und Abwanderungswarnungen",
          "Provisionsrabatt bei Online-Coaching-Angeboten",
          "Ablaufverfolgung für Zertifikate und Lizenzen",
        ],
      },
    },
    perMonth: "/ Monat",
    vatNote:
      "Alle Preise verstehen sich inklusive Mehrwertsteuer. Die Trainer-Tools lassen sich nur in Trainerkonten aktivieren.",
    free: {
      heading: "Was es auch ohne Abo gibt",
      items: [
        "Profil, Wettkampfbilanz, Trainingstagebuch und Serien-Tracking",
        "Sparringpartner-Suche, Gym-Finder und Karte",
        "Eventkalender, Livescore, Forum und Entdecken-Feed",
        "Verifizierungsstufen und Trainerbürgschaft",
      ],
    },
    fees: {
      heading: "Provisionen",
      body:
        "Außer dem Abo fällt keine Mitgliedsgebühr an. Die Plattform erhebt eine Provision ausschließlich auf umsatzbeteiligte Transaktionen: {platform} auf Creator-Abos und vergleichbare Inhaltserlöse, {coaching} auf Online-Coaching-Sessions. Der Restbetrag geht über Stripe Connect direkt an dich.",
      percentFormat: "{n} %",
    },
    faq: {
      heading: "Häufige Fragen",
      items: [
        {
          q: "Wie kündige ich?",
          a: "Im Abo-Bereich deines Dashboards kündigst du mit einem einzigen Klick — du musst keine E-Mail schreiben und keine Hotline anrufen. Es gibt kein Kündigungsformular, keine Wartefrist und keinen „Bleib doch“-Schritt.",
        },
        {
          q: "Verliere ich den Zugang sofort, wenn ich kündige?",
          a: "Nein. Alle Premium-Funktionen bleiben bis zum Ende des bezahlten Zeitraums aktiv; es wird lediglich nicht verlängert. Danach wechselt dein Konto automatisch in den kostenlosen Tarif, und keine deiner Daten wird gelöscht.",
        },
        {
          q: "Was genau bedeutet „werbefrei“?",
          a: "Für Premium-Abonnentinnen und -Abonnenten wird Werbung serverseitig gar nicht erst gerendert — sie wird nicht per CSS im Browser versteckt. Es wird also kein Werbebild in deinen Browser geladen, es geht keine Anfrage an den Werbetreibenden und es läuft kein Messcode. Das ist technisch ein wirklich werbefreies Erlebnis.",
        },
        {
          q: "Wer kann die Trainer-Tools buchen?",
          a: "Konten mit der Rolle Trainer. Dein Bürgschaftskontingent steigt, unbegrenzte Schülerverwaltung und das Entwicklungs-Dashboard werden freigeschaltet, und bei Online-Coaching-Angeboten gilt ein Provisionsrabatt.",
        },
        {
          q: "Wie läuft die Zahlung ab?",
          a: "Zahlungen laufen über Stripe; Karten- und SEPA-Mandatsdaten werden nicht auf unseren Servern gespeichert. Deine Rechnungen findest du als PDF in deinem Dashboard.",
        },
      ],
    },
    cta: {
      subscription: "Zum Abo-Bereich",
      register: "Kostenloses Konto erstellen",
      about: "Was ist FIGHTNET?",
    },
  },

  en: {
    meta: {
      title: "Premium and Coach Tools",
      description:
        "FIGHTNET Premium offers an ad-free experience and advanced statistics; Coach Tools add student tracking and an expanded vouch quota. Monthly, no commitment.",
    },
    badge: "Premium",
    title: "FIGHTNET without ads, and real tools for coaches",
    intro:
      "The entire platform is free to use: profile, training log, sparring search, gym finder and events are open to everyone. The two subscriptions below exist to make the experience ad-free and to give coaches a workspace that scales. Monthly, no commitment.",
    plans: {
      PREMIUM: {
        label: "Premium",
        tagline: "FIGHTNET without ads",
        features: [
          "No banner or in-feed advertising",
          "Advanced training statistics and export",
          "Priority visibility in sparring search",
          "Premium badge on your profile",
        ],
      },
      COACH_TOOLS: {
        label: "Coach Tools",
        tagline: "SaaS for coaches",
        features: [
          "Unlimited student tracking and training plan assignment",
          "Vouch quota rises from 20 to 50",
          "Student progress dashboard and retention alerts",
          "Commission discount on online coaching listings",
          "Certificate and licence expiry tracking",
        ],
      },
    },
    perMonth: "/ month",
    vatNote:
      "All prices include VAT. Coach Tools can only be activated on coach accounts.",
    free: {
      heading: "What you get without a subscription",
      items: [
        "Profile, competition record, training log and streak tracking",
        "Sparring partner search, gym finder and map",
        "Event calendar, live scoring, forum and discover feed",
        "Verification levels and coach vouching",
      ],
    },
    fees: {
      heading: "Commissions",
      body:
        "Apart from the subscription there is no membership fee. The platform only takes a commission on revenue-sharing transactions: {platform} on Creator subscriptions and comparable content revenue, {coaching} on online coaching sessions. The remainder is paid straight to you via Stripe Connect.",
      percentFormat: "{n}%",
    },
    faq: {
      heading: "Frequently asked questions",
      items: [
        {
          q: "How do I cancel?",
          a: "You cancel with a single click from the subscription screen in your dashboard — no email to write, no support line to call. There is no cancellation form, no waiting period and no “please stay” step.",
        },
        {
          q: "Do I lose access immediately when I cancel?",
          a: "No. All Premium features stay active until the end of the period you paid for; it simply is not renewed. When the period ends your account automatically returns to the free plan and none of your data is deleted.",
        },
        {
          q: "What exactly does “ad-free” mean?",
          a: "For Premium subscribers, ads are never rendered on the server at all — they are not hidden with CSS on the client. That means no ad image is ever downloaded to your browser, no request goes to the advertiser and no measurement code runs. Technically, this is a genuinely ad-free experience.",
        },
        {
          q: "Who can get Coach Tools?",
          a: "Accounts with the coach role. Your vouch quota increases, unlimited student tracking and the progress dashboard are unlocked, and a commission discount applies to online coaching listings.",
        },
        {
          q: "How are payments processed?",
          a: "Payments are taken through Stripe; card and SEPA mandate details are not stored on our servers. Your invoices are listed as PDFs in your dashboard.",
        },
      ],
    },
    cta: {
      subscription: "Go to the subscription screen",
      register: "Create a free account",
      about: "What is FIGHTNET?",
    },
  },

  tr: {
    meta: {
      title: "Premium ve Antrenör Araçları",
      description:
        "FIGHTNET Premium reklamsız deneyim ve gelişmiş istatistikler sunar; Antrenör Araçları öğrenci takibi ve genişletilmiş kefalet kotası getirir. Aylık, taahhütsüz.",
    },
    badge: "Premium",
    title: "Reklamsız FIGHTNET ve antrenörler için gerçek araçlar",
    intro:
      "Platformun tamamı ücretsiz kullanılabilir: profil, antrenman günlüğü, sparring arama, salon bulucu ve etkinlikler herkese açıktır. Aşağıdaki iki abonelik, deneyimi reklamsız hale getirmek ve antrenörlere ölçeklenebilir bir çalışma alanı vermek içindir. Aylık, taahhütsüz.",
    plans: {
      PREMIUM: {
        label: "Premium",
        tagline: "Reklamsız FIGHTNET",
        features: [
          "Banner ve akış içi reklam gösterilmez",
          "Gelişmiş antrenman istatistikleri ve dışa aktarım",
          "Sparring aramada öncelikli görünürlük",
          "Profilde Premium rozeti",
        ],
      },
      COACH_TOOLS: {
        label: "Antrenör Araçları",
        tagline: "Antrenörler için SaaS",
        features: [
          "Sınırsız öğrenci takibi ve antrenman planı ataması",
          "Kefalet kotası 20'den 50'ye çıkar",
          "Öğrenci gelişim panosu ve tutulma uyarıları",
          "Online koçluk ilanlarında komisyon indirimi",
          "Sertifika ve lisans son kullanma takibi",
        ],
      },
    },
    perMonth: "/ ay",
    vatNote:
      "Fiyatlar KDV dahildir. Antrenör Araçları yalnızca antrenör hesaplarında etkinleştirilebilir.",
    free: {
      heading: "Abonelik olmadan da neler var",
      items: [
        "Profil, müsabaka bilançosu, antrenman günlüğü ve seri takibi",
        "Sparring partneri arama, salon bulucu ve harita",
        "Etkinlik takvimi, canlı skor, forum ve keşfet akışı",
        "Doğrulama seviyeleri ve antrenör kefaleti",
      ],
    },
    fees: {
      heading: "Komisyonlar",
      body:
        "Abonelik dışında bir üyelik ücreti yoktur. Platform yalnızca gelir paylaşımlı işlemlerden komisyon alır: Creator abonelikleri ve benzeri içerik gelirlerinde {platform}, online koçluk seanslarında {coaching}. Kalan tutar Stripe Connect üzerinden doğrudan sana aktarılır.",
      percentFormat: "%{n}",
    },
    faq: {
      heading: "Sık sorulanlar",
      items: [
        {
          q: "Nasıl iptal ederim?",
          a: "Panelindeki abonelik ekranından tek tıkla iptal edersin — e-posta yazmana, destek hattı aramana gerek yoktur. İptal formu, bekleme süresi veya “kalmaya ikna” adımı yoktur.",
        },
        {
          q: "İptal edince erişimim hemen kesilir mi?",
          a: "Hayır. Ödediğin dönemin sonuna kadar tüm Premium özellikleri açık kalır; yenileme yapılmaz. Dönem bittiğinde hesabın otomatik olarak ücretsiz plana döner, hiçbir verin silinmez.",
        },
        {
          q: "“Reklamsız” tam olarak ne demek?",
          a: "Premium aboneye reklamlar sunucuda hiç render edilmez — istemcide CSS ile gizlenmez. Yani reklam görseli tarayıcına hiç indirilmez, reklam veren tarafına hiçbir istek gitmez ve ölçüm kodu çalışmaz. Bu, teknik olarak gerçek anlamda reklamsız bir deneyimdir.",
        },
        {
          q: "Antrenör Araçları’nı kim alabilir?",
          a: "Antrenör rolündeki hesaplar. Kefalet kotan yükselir, sınırsız öğrenci takibi ve gelişim panosu açılır; online koçluk ilanlarında komisyon indirimi uygulanır.",
        },
        {
          q: "Ödeme nasıl işleniyor?",
          a: "Ödemeler Stripe üzerinden alınır; kart ve SEPA mandatı bilgileri bizim sunucularımızda saklanmaz. Faturaların panelinde PDF olarak listelenir.",
        },
      ],
    },
    cta: {
      subscription: "Abonelik ekranına git",
      register: "Ücretsiz hesap aç",
      about: "FIGHTNET nedir?",
    },
  },
};
