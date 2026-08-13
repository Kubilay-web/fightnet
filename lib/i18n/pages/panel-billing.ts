import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel/abonelik` sayfası ile ödeme düğmelerinin (`billing-buttons`,
 * `checkout-button`, `subscribe-button`) metinleri.
 *
 * Plan fiyatları `PLATFORM_PLANS` içinde tek kaynakta kalır; burada yalnızca
 * plan adları, sloganları ve özellik listeleri üç dilde tutulur. Böylece fiyat
 * değiştiğinde çeviri dosyalarına dokunmak gerekmez.
 */
type PlanKey = "PREMIUM" | "COACH_TOOLS";

type PlanCopy = {
  label: string;
  tagline: string;
  features: string[];
};

type Copy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  stripeMissingTitle: string;
  stripeMissingBody: string;
  plans: Record<PlanKey, PlanCopy>;
  planCard: {
    active: string;
    perMonth: string;
    nextRenewal: string;
    extend: string;
    /** `{plan} ol` */
    subscribe: string;
    coachToolsLocked: string;
  };
  portal: {
    heading: string;
    body: string;
  };
  connect: {
    heading: string;
    subtitle: string;
    statusPrefix: string;
    active: string;
    onboarding: string;
    restricted: string;
    none: string;
    note: string;
  };
  invoices: {
    heading: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    /** `KDV {vat}` */
    vat: string;
    status: Record<string, string>;
  };
  payments: {
    heading: string;
    emptyTitle: string;
    purpose: Record<string, string>;
    status: Record<string, string>;
  };
  stats: {
    activeSubscriptions: string;
    totalPayments: string;
    paidThisYear: string;
    invoices: string;
  };
  billingButtons: {
    portalError: string;
    portalCta: string;
    connectError: string;
    refreshStatus: string;
    stripeDashboard: string;
    finishSetup: string;
    enablePayouts: string;
  };
  checkoutButton: { error: string };
  subscribeButton: {
    error: string;
    active: string;
    cancel: string;
    /** `{price}/ay destekle` */
    support: string;
  };
};

export const panelBillingCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Abo und Zahlungen" },
    title: "Abo und Zahlungen",
    subtitle: "§4.3 / §4.4 — Premium, Trainer-Tools und dein Rechnungsverlauf",
    stripeMissingTitle: "Zahlungsinfrastruktur nicht konfiguriert",
    stripeMissingBody:
      "In dieser Installation ist kein Stripe-Schlüssel hinterlegt; Käufe können nicht gestartet werden. Abo- und Rechnungsdatensätze lassen sich weiterhin ansehen. Sobald die Schlüssel hinterlegt sind, funktioniert diese Seite unverändert.",
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
    planCard: {
      active: "Aktiv",
      perMonth: "/ Monat",
      nextRenewal: "Nächste Verlängerung: ",
      extend: "Zeitraum verlängern",
      subscribe: "{plan} abonnieren",
      coachToolsLocked: "Trainer-Tools können nur in Trainerkonten aktiviert werden.",
    },
    portal: {
      heading: "Zahlungsmethode und Kündigung",
      body: "Kartenwechsel, SEPA-Mandat und die Kündigung des Abos erfolgen im Stripe-Kundenportal.",
    },
    connect: {
      heading: "Auszahlungen (Stripe Connect)",
      subtitle: "Deine Einnahmen aus Creator-Abos, Coaching und PPV werden hierhin ausgezahlt",
      statusPrefix: "Status: ",
      active: "Du kannst Zahlungen empfangen",
      onboarding: "Einrichtung unvollständig",
      restricted: "Weitere Angaben erforderlich",
      none: "Nicht eingerichtet",
      note: "Ein Stripe-Express-Konto erfordert keine BaFin-Lizenz; Identitäts- und Steuerprüfung übernimmt Stripe (§4.6). Solange das Konto nicht bereit ist, wird nichts an dich ausgezahlt — der Betrag bleibt auf der Plattform.",
    },
    invoices: {
      heading: "Meine Rechnungen",
      subtitle: "GoBD-konform, 10 Jahre Aufbewahrung",
      emptyTitle: "Keine Rechnungen",
      emptyDescription: "Sobald du bezahlst, wird deine Rechnung hier aufgeführt.",
      vat: "MwSt. {vat}",
      status: {
        DRAFT: "Entwurf",
        ISSUED: "Ausgestellt",
        PAID: "Bezahlt",
        OVERDUE: "Überfällig",
        CANCELLED: "Storniert (Storno)",
        REFUNDED: "Erstattet",
      },
    },
    payments: {
      heading: "Zahlungsverlauf",
      emptyTitle: "Noch keine Zahlungen",
      purpose: {
        CREATOR_SUBSCRIPTION: "Creator-Abo",
        MARKETPLACE_ORDER: "Marktplatz-Bestellung",
        PPV_TICKET: "PPV-Ticket",
        PREMIUM: "Premium",
        COACH_TOOLS: "Trainer-Tools",
        COACHING_SESSION: "Coaching-Einheit",
        GYM_PLAN: "Gym-Abo",
        EVENT_REGISTRATION: "Wettkampfanmeldung",
        DATA_LICENSE: "Datenlizenz",
      },
      status: {
        PENDING: "Ausstehend",
        PAID: "Bezahlt",
        FAILED: "Fehlgeschlagen",
        REFUNDED: "Erstattet",
        CANCELLED: "Storniert",
      },
    },
    stats: {
      activeSubscriptions: "Aktive Abos",
      totalPayments: "Zahlungen gesamt",
      paidThisYear: "Dieses Jahr gezahlt",
      invoices: "Rechnungen",
    },
    billingButtons: {
      portalError: "Portal konnte nicht geöffnet werden",
      portalCta: "Zahlungseinstellungen verwalten",
      connectError: "Vorgang konnte nicht abgeschlossen werden",
      refreshStatus: "Status aktualisieren",
      stripeDashboard: "Stripe-Dashboard",
      finishSetup: "Einrichtung abschließen",
      enablePayouts: "Auszahlungen aktivieren",
    },
    checkoutButton: { error: "Zahlung konnte nicht gestartet werden" },
    subscribeButton: {
      error: "Abo konnte nicht gestartet werden",
      active: "Aktives Abo",
      cancel: "Abo kündigen",
      support: "{price}/Monat unterstützen",
    },
  },

  en: {
    meta: { title: "Subscription and payments" },
    title: "Subscription and payments",
    subtitle: "§4.3 / §4.4 — Premium, Coach Tools and your invoice history",
    stripeMissingTitle: "Payment infrastructure is not configured",
    stripeMissingBody:
      "No Stripe key is defined in this installation, so purchases cannot be started. Subscription and invoice records can still be viewed. Once the keys are set, this page works exactly as it is.",
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
    planCard: {
      active: "Active",
      perMonth: "/ month",
      nextRenewal: "Next renewal: ",
      extend: "Extend period",
      subscribe: "Get {plan}",
      coachToolsLocked: "Coach Tools can only be activated on coach accounts.",
    },
    portal: {
      heading: "Payment method and cancellation",
      body: "Card changes, the SEPA mandate and subscription cancellation are handled in the Stripe customer portal.",
    },
    connect: {
      heading: "Getting paid (Stripe Connect)",
      subtitle: "Your income from Creator subscriptions, coaching and PPV is transferred here",
      statusPrefix: "Status: ",
      active: "You can receive payments",
      onboarding: "Setup left unfinished",
      restricted: "Additional information required",
      none: "Not set up",
      note: "A Stripe Express account does not require a BaFin licence; identity and tax verification happen on Stripe's side (§4.6). Until the account is ready, nothing is transferred to you — the amount is held on the platform.",
    },
    invoices: {
      heading: "My invoices",
      subtitle: "GoBD-compliant, retained for 10 years",
      emptyTitle: "No invoices",
      emptyDescription: "Once you make a payment, your invoice is listed here.",
      vat: "VAT {vat}",
      status: {
        DRAFT: "Draft",
        ISSUED: "Issued",
        PAID: "Paid",
        OVERDUE: "Overdue",
        CANCELLED: "Cancelled (reversal)",
        REFUNDED: "Refunded",
      },
    },
    payments: {
      heading: "Payment history",
      emptyTitle: "No payments yet",
      purpose: {
        CREATOR_SUBSCRIPTION: "Creator subscription",
        MARKETPLACE_ORDER: "Marketplace order",
        PPV_TICKET: "PPV ticket",
        PREMIUM: "Premium",
        COACH_TOOLS: "Coach Tools",
        COACHING_SESSION: "Coaching session",
        GYM_PLAN: "Gym subscription",
        EVENT_REGISTRATION: "Competition registration",
        DATA_LICENSE: "Data licence",
      },
      status: {
        PENDING: "Pending",
        PAID: "Paid",
        FAILED: "Failed",
        REFUNDED: "Refunded",
        CANCELLED: "Cancelled",
      },
    },
    stats: {
      activeSubscriptions: "Active subscriptions",
      totalPayments: "Total payments",
      paidThisYear: "Paid this year",
      invoices: "Invoices",
    },
    billingButtons: {
      portalError: "Could not open the portal",
      portalCta: "Manage payment settings",
      connectError: "The action could not be completed",
      refreshStatus: "Refresh status",
      stripeDashboard: "Stripe dashboard",
      finishSetup: "Finish setup",
      enablePayouts: "Enable getting paid",
    },
    checkoutButton: { error: "Could not start the payment" },
    subscribeButton: {
      error: "Could not start the subscription",
      active: "Active subscription",
      cancel: "Cancel subscription",
      support: "Support with {price}/month",
    },
  },

  tr: {
    meta: { title: "Abonelik ve Ödemeler" },
    title: "Abonelik ve Ödemeler",
    subtitle: "§4.3 / §4.4 — Premium, Antrenör Araçları ve fatura geçmişin",
    stripeMissingTitle: "Ödeme altyapısı yapılandırılmamış",
    stripeMissingBody:
      "Bu kurulumda Stripe anahtarı tanımlı değil; satın alma başlatılamaz. Abonelik ve fatura kayıtları görüntülenebilir. Anahtarlar tanımlandığında bu sayfa olduğu gibi çalışır.",
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
    planCard: {
      active: "Aktif",
      perMonth: "/ ay",
      nextRenewal: "Sonraki yenileme: ",
      extend: "Dönem uzat",
      subscribe: "{plan} ol",
      coachToolsLocked: "Antrenör Araçları yalnızca antrenör hesaplarında açılabilir.",
    },
    portal: {
      heading: "Ödeme yöntemi ve iptal",
      body: "Kart değişikliği, SEPA mandatı ve abonelik iptali Stripe müşteri portalında yapılır.",
    },
    connect: {
      heading: "Para alma (Stripe Connect)",
      subtitle: "Creator aboneliği, koçluk ve PPV gelirlerin buraya aktarılır",
      statusPrefix: "Durum: ",
      active: "Ödeme alabilirsin",
      onboarding: "Kurulum yarım kaldı",
      restricted: "Ek bilgi gerekiyor",
      none: "Kurulmadı",
      note: "Stripe Express hesabı BaFin lisansı gerektirmez; kimlik ve vergi doğrulaması Stripe tarafında yapılır (§4.6). Hesap hazır olmadan sana aktarım yapılmaz, tutar platformda bekletilir.",
    },
    invoices: {
      heading: "Faturalarım",
      subtitle: "GoBD uyumlu, 10 yıl saklanır",
      emptyTitle: "Fatura yok",
      emptyDescription: "Ödeme yaptığında faturan burada listelenir.",
      vat: "KDV {vat}",
      status: {
        DRAFT: "Taslak",
        ISSUED: "Kesildi",
        PAID: "Ödendi",
        OVERDUE: "Gecikmiş",
        CANCELLED: "İptal (Storno)",
        REFUNDED: "İade",
      },
    },
    payments: {
      heading: "Ödeme geçmişi",
      emptyTitle: "Henüz ödeme yok",
      purpose: {
        CREATOR_SUBSCRIPTION: "Creator aboneliği",
        MARKETPLACE_ORDER: "Pazar siparişi",
        PPV_TICKET: "PPV bileti",
        PREMIUM: "Premium",
        COACH_TOOLS: "Antrenör Araçları",
        COACHING_SESSION: "Koçluk seansı",
        GYM_PLAN: "Salon aboneliği",
        EVENT_REGISTRATION: "Müsabaka kaydı",
        DATA_LICENSE: "Veri lisansı",
      },
      status: {
        PENDING: "Bekliyor",
        PAID: "Ödendi",
        FAILED: "Başarısız",
        REFUNDED: "İade",
        CANCELLED: "İptal",
      },
    },
    stats: {
      activeSubscriptions: "Aktif abonelik",
      totalPayments: "Toplam ödeme",
      paidThisYear: "Bu yıl ödenen",
      invoices: "Fatura",
    },
    billingButtons: {
      portalError: "Portal açılamadı",
      portalCta: "Ödeme ayarlarını yönet",
      connectError: "İşlem tamamlanamadı",
      refreshStatus: "Durumu yenile",
      stripeDashboard: "Stripe panosu",
      finishSetup: "Kurulumu tamamla",
      enablePayouts: "Ödeme almayı aç",
    },
    checkoutButton: { error: "Ödeme başlatılamadı" },
    subscribeButton: {
      error: "Abonelik başlatılamadı",
      active: "Aktif abonelik",
      cancel: "Aboneliği iptal et",
      support: "{price}/ay destekle",
    },
  },
};
