import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel/sozlesmelerim` ve `components/contract-forms.tsx` metinleri.
 *
 * Sözleşme/fatura durum etiketleri burada tutulur; renk tonları (Badge tone)
 * sayfada kalır çünkü onlar dile bağlı değil. Yasal madde numaraları (BGB
 * §309 Nr. 9, §126b, eIDAS) üç dilde de aynı kalır.
 */
type Copy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  /** `{count} sözleşme imzanı bekliyor` */
  awaitingTitle: string;
  awaitingBody: string;
  emptyTitle: string;
  emptyDescription: string;
  contractStatus: Record<string, string>;
  invoiceStatus: Record<string, string>;
  /** `{fee}/ay` */
  perMonth: string;
  /** `{n} ay asgari süre` */
  minTerm: string;
  /** `{n} gün fesih ihbarı` */
  noticePeriod: string;
  /** `başlangıç {date}` */
  startsAt: string;
  /** `bitiş {date}` */
  endsAt: string;
  terminationReason: string;
  readDocument: string;
  sealValid: string;
  sealInvalid: string;
  signedAt: string;
  provider: string;
  mandate: string;
  sequence: string;
  mandateActive: string;
  mandateInactive: string;
  /** `net {net} + KDV {vat}` */
  invoiceNet: string;
  /** `vade {date}` */
  invoiceDue: string;
  terminateSummary: string;
  terminateBody: string;
  terminateSubmit: string;
  gymPage: string;
  createForm: {
    submit: string;
    memberEmail: string;
    memberEmailHint: string;
    memberEmailPlaceholder: string;
    planName: string;
    planNamePlaceholder: string;
    monthlyFee: string;
    termMonths: string;
    /** `BGB §309 Nr. 9: en fazla {n} ay` */
    termMonthsHint: string;
    noticeDays: string;
    noticeDaysHint: string;
    startsAt: string;
    alertTitle: string;
    alertBody: string;
  };
  invoiceForm: {
    submit: string;
    period: string;
  };
  sepaForm: {
    submit: string;
    sequence: string;
    sequenceHint: string;
    frst: string;
    rcur: string;
    download: string;
    note: string;
  };
  signForm: {
    submit: string;
    debtorName: string;
    bic: string;
    bicHint: string;
    bicPlaceholder: string;
    iban: string;
    ibanHint: string;
    ibanPlaceholder: string;
    consent: string;
    sealNote: string;
  };
  terminateForm: {
    submit: string;
    reason: string;
    reasonHint: string;
    reasonPlaceholder: string;
  };
};

export const panelContractsCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Meine Verträge" },
    title: "Meine Verträge",
    subtitle:
      "Deine digitalen Mitgliedsverträge mit Gyms, deine SEPA-Mandate und deine Rechnungen",
    awaitingTitle: "{count} Verträge warten auf deine Unterschrift",
    awaitingBody:
      "Lies den vollständigen Text, bevor du unterschreibst. Deine Unterschrift wird als fortgeschrittene elektronische Signatur (FES) nach eIDAS versiegelt und belegt, dass der Text nachträglich nicht verändert wurde. Da es sich um einen Fernabsatzvertrag handelt, hast du nach der Unterschrift 14 Tage Widerrufsrecht.",
    emptyTitle: "Du hast keine Verträge",
    emptyDescription:
      "Sobald ein Gym dir einen digitalen Mitgliedsvertrag schickt, erscheint er hier.",
    contractStatus: {
      DRAFT: "Wartet auf deine Unterschrift",
      SENT: "Wartet auf deine Unterschrift",
      SIGNED: "Unterschrieben",
      ACTIVE: "In Kraft",
      TERMINATED: "Gekündigt",
      CANCELLED: "Storniert",
    },
    invoiceStatus: {
      DRAFT: "Entwurf",
      ISSUED: "Offen",
      PAID: "Bezahlt",
      OVERDUE: "Überfällig",
      CANCELLED: "Storno",
      REFUNDED: "Erstattet",
    },
    perMonth: "{fee}/Monat",
    minTerm: "{n} Monate Mindestlaufzeit",
    noticePeriod: "{n} Tage Kündigungsfrist",
    startsAt: "Beginn {date}",
    endsAt: "Ende {date}",
    terminationReason: "Kündigungsgrund: ",
    readDocument: "Vertragstext lesen",
    sealValid: "Signatursiegel verifiziert",
    sealInvalid: "Siegel konnte nicht verifiziert werden",
    signedAt: "Signaturzeitpunkt: ",
    provider: "Anbieter: ",
    mandate: "Mandat: ",
    sequence: "Sequenz: ",
    mandateActive: "Einzugsermächtigung aktiv",
    mandateInactive: "Einzugsermächtigung inaktiv",
    invoiceNet: "netto {net} + MwSt. {vat}",
    invoiceDue: "fällig {date}",
    terminateSummary: "Kündigung einreichen",
    terminateBody:
      "Die Kündigung ist in Textform wirksam (BGB §126b). Der Vertrag endet zum späteren der beiden Zeitpunkte aus Kündigungsfrist und Mindestlaufzeit; nach Ablauf der Mindestlaufzeit läuft der Vertrag unbefristet weiter und kann jederzeit mit einer Frist von 1 Monat gekündigt werden. Dein Mandat wird mit der Kündigung widerrufen.",
    terminateSubmit: "Kündigung absenden",
    gymPage: "Gym-Seite: ",
    createForm: {
      submit: "Vertrag erstellen",
      memberEmail: "E-Mail des Mitglieds",
      memberEmailHint:
        "Die im FIGHTNET-Konto des Mitglieds hinterlegte Adresse — dorthin geht der Vertrag",
      memberEmailPlaceholder: "mitglied@beispiel.de",
      planName: "Tarifname",
      planNamePlaceholder: "Unlimited-Mitgliedschaft",
      monthlyFee: "Monatsbeitrag (€, inkl. MwSt.)",
      termMonths: "Mindestlaufzeit (Monate)",
      termMonthsHint: "BGB §309 Nr. 9: höchstens {n} Monate",
      noticeDays: "Kündigungsfrist (Tage)",
      noticeDaysHint: "0–90 Tage",
      startsAt: "Beginn",
      alertTitle: "Der Vertragstext wird automatisch erzeugt",
      alertBody:
        "Aus den eingegebenen Werten werden Mindestlaufzeit, automatische Verlängerung, SEPA-Mandat, Widerrufsrecht und Datenschutzklauseln in den Text übernommen. Der Text bleibt Entwurf, bis das Mitglied unterschreibt; danach ist kein einziges Zeichen mehr änderbar.",
    },
    invoiceForm: {
      submit: "Rechnung stellen",
      period: "Zeitraum",
    },
    sepaForm: {
      submit: "pain.008 erzeugen",
      sequence: "Mandatssequenz",
      sequenceHint: "Die erste Einreichung geht als FRST, alle weiteren als RCUR",
      frst: "FRST — erste Einreichung",
      rcur: "RCUR — wiederkehrend",
      download: "XML-Datei herunterladen",
      note: "Die IBAN-Felder der Zahlungspflichtigen sind maskiert: die Plattform speichert keine Klartext-IBAN. Vor der Einreichung bei der Bank werden die Kontodaten vom Zahlungsdienstleister ergänzt.",
    },
    signForm: {
      submit: "Vertrag unterschreiben",
      debtorName: "Kontoinhaber",
      bic: "BIC (optional)",
      bicHint: "Bei deutschen IBAN nicht erforderlich",
      bicPlaceholder: "COBADEFFXXX",
      iban: "IBAN",
      ibanHint: "Es wird nur die maskierte Fassung gespeichert — die Klartext-IBAN nicht",
      ibanPlaceholder: "DE89 3704 0044 0532 0130 00",
      consent:
        "Ich habe den Vertragstext gelesen und akzeptiere ihn. Ich ermächtige das Gym, den Beitrag mittels SEPA-Lastschrift von meinem Konto einzuziehen, und weise zugleich mein Kreditinstitut an, diese Lastschriften einzulösen. Mir ist bekannt, dass ich innerhalb von 8 Wochen ab Belastungsdatum die Erstattung verlangen kann.",
      sealNote:
        "Deine Zustimmung wird als fortgeschrittene elektronische Signatur (FES) nach eIDAS versiegelt: Identität, Zeitstempel, IP-Adresse und der SHA-256-Hash des Textes werden miteinander verknüpft. Ändert sich der Text nachträglich, wird das Siegel ungültig.",
    },
    terminateForm: {
      submit: "Kündigung melden",
      reason: "Kündigungsgrund",
      reasonHint:
        "Das Kündigungsdatum berechnet sich aus dem späteren von Kündigungsfrist und Mindestlaufzeit",
      reasonPlaceholder: "Umzug, Gesundheit, Tarifwechsel…",
    },
  },

  en: {
    meta: { title: "My contracts" },
    title: "My contracts",
    subtitle: "Your digital membership contracts with gyms, your SEPA mandates and your invoices",
    awaitingTitle: "{count} contracts are waiting for your signature",
    awaitingBody:
      "Read the full text before you sign. Your signature is sealed as an eIDAS advanced electronic signature (AES) and proves that the text was not altered afterwards. Because this is a distance contract, you have a 14-day right of withdrawal after signing.",
    emptyTitle: "You have no contracts",
    emptyDescription:
      "When a gym sends you a digital membership contract, it will show up here.",
    contractStatus: {
      DRAFT: "Awaiting your signature",
      SENT: "Awaiting your signature",
      SIGNED: "Signed",
      ACTIVE: "In force",
      TERMINATED: "Terminated",
      CANCELLED: "Cancelled",
    },
    invoiceStatus: {
      DRAFT: "Draft",
      ISSUED: "Unpaid",
      PAID: "Paid",
      OVERDUE: "Overdue",
      CANCELLED: "Reversed",
      REFUNDED: "Refunded",
    },
    perMonth: "{fee}/month",
    minTerm: "{n} months minimum term",
    noticePeriod: "{n} days notice period",
    startsAt: "start {date}",
    endsAt: "end {date}",
    terminationReason: "Reason for termination: ",
    readDocument: "Read the contract text",
    sealValid: "Signature seal verified",
    sealInvalid: "Seal could not be verified",
    signedAt: "Signed at: ",
    provider: "Provider: ",
    mandate: "Mandate: ",
    sequence: "Sequence: ",
    mandateActive: "Direct debit authorisation active",
    mandateInactive: "Direct debit authorisation inactive",
    invoiceNet: "net {net} + VAT {vat}",
    invoiceDue: "due {date}",
    terminateSummary: "Send a termination request",
    terminateBody:
      "A termination is valid in text form (BGB §126b). The contract ends on the later of the notice period and the minimum term; once the minimum term has passed, the contract continues indefinitely and can be terminated at any time with one month's notice. Your mandate is revoked along with the termination.",
    terminateSubmit: "Send termination request",
    gymPage: "Gym page: ",
    createForm: {
      submit: "Create contract",
      memberEmail: "Member's email address",
      memberEmailHint:
        "The address registered on the member's FIGHTNET account — the contract lands there",
      memberEmailPlaceholder: "member@example.de",
      planName: "Plan name",
      planNamePlaceholder: "Unlimited membership",
      monthlyFee: "Monthly fee (€, VAT included)",
      termMonths: "Minimum term (months)",
      termMonthsHint: "BGB §309 no. 9: {n} months at most",
      noticeDays: "Notice period (days)",
      noticeDaysHint: "0–90 days",
      startsAt: "Start",
      alertTitle: "The contract text is generated automatically",
      alertBody:
        "The values you enter are written into the text as minimum term, automatic renewal, SEPA mandate, right of withdrawal and data protection clauses. The text stays a draft until the member signs it; after signing not a single character can be changed.",
    },
    invoiceForm: {
      submit: "Issue invoice",
      period: "Period",
    },
    sepaForm: {
      submit: "Generate pain.008",
      sequence: "Mandate sequence",
      sequenceHint: "The first collection is sent as FRST, all following ones as RCUR",
      frst: "FRST — first collection",
      rcur: "RCUR — recurring",
      download: "Download XML file",
      note: "Debtor IBAN fields are masked: the platform never stores a plain IBAN. Before the file is submitted to the bank, the account details are completed by the payment provider.",
    },
    signForm: {
      submit: "Sign the contract",
      debtorName: "Account holder",
      bic: "BIC (optional)",
      bicHint: "Not required for German IBANs",
      bicPlaceholder: "COBADEFFXXX",
      iban: "IBAN",
      ibanHint: "Only the masked version is stored — the plain IBAN is not saved",
      ibanPlaceholder: "DE89 3704 0044 0532 0130 00",
      consent:
        "I have read the contract text and accept it. I authorise the gym to collect the membership fee from my account by SEPA direct debit, and I instruct my bank to honour those debits. I am aware that I can request a refund within 8 weeks of the debit date.",
      sealNote:
        "Your consent is sealed as an eIDAS advanced electronic signature (AES): your identity, a timestamp, your IP address and the SHA-256 hash of the text are bound together. If the text changes afterwards, the seal becomes invalid.",
    },
    terminateForm: {
      submit: "Report termination",
      reason: "Reason for termination",
      reasonHint:
        "The termination date is calculated from the later of the notice period and the minimum term",
      reasonPlaceholder: "Relocation, health, change of plan…",
    },
  },

  tr: {
    meta: { title: "Sözleşmelerim" },
    title: "Sözleşmelerim",
    subtitle: "Salonlarla yaptığın dijital üyelik sözleşmeleri, SEPA mandatların ve faturaların",
    awaitingTitle: "{count} sözleşme imzanı bekliyor",
    awaitingBody:
      "İmzalamadan önce metnin tamamını oku. İmzan eIDAS gelişmiş elektronik imza (FES) olarak mühürlenir ve metnin sonradan değiştirilmediğini kanıtlar. Mesafeli sözleşme olduğu için imzadan sonra 14 gün cayma hakkın vardır.",
    emptyTitle: "Sözleşmen yok",
    emptyDescription: "Bir salon sana dijital üyelik sözleşmesi gönderdiğinde burada görünür.",
    contractStatus: {
      DRAFT: "İmzanı bekliyor",
      SENT: "İmzanı bekliyor",
      SIGNED: "İmzalandı",
      ACTIVE: "Yürürlükte",
      TERMINATED: "Feshedildi",
      CANCELLED: "İptal",
    },
    invoiceStatus: {
      DRAFT: "Taslak",
      ISSUED: "Ödenmedi",
      PAID: "Ödendi",
      OVERDUE: "Gecikti",
      CANCELLED: "Storno",
      REFUNDED: "İade",
    },
    perMonth: "{fee}/ay",
    minTerm: "{n} ay asgari süre",
    noticePeriod: "{n} gün fesih ihbarı",
    startsAt: "başlangıç {date}",
    endsAt: "bitiş {date}",
    terminationReason: "Fesih gerekçesi: ",
    readDocument: "Sözleşme metnini oku",
    sealValid: "İmza mührü doğrulandı",
    sealInvalid: "Mühür doğrulanamadı",
    signedAt: "İmza zamanı: ",
    provider: "Sağlayıcı: ",
    mandate: "Mandat: ",
    sequence: "Dizi: ",
    mandateActive: "Tahsilat yetkisi aktif",
    mandateInactive: "Tahsilat yetkisi kapalı",
    invoiceNet: "net {net} + KDV {vat}",
    invoiceDue: "vade {date}",
    terminateSummary: "Fesih talebi gönder",
    terminateBody:
      "Fesih metin biçiminde geçerlidir (BGB §126b). Sözleşme, ihbar süresi ile asgari sürenin geç olanında sona erer; asgari süre dolduktan sonra sözleşme belirsiz süreli devam eder ve 1 aylık ihbarla her zaman feshedilebilir. Mandatın fesihle birlikte geri alınır.",
    terminateSubmit: "Fesih Talebini Gönder",
    gymPage: "Salon sayfası: ",
    createForm: {
      submit: "Sözleşmeyi Oluştur",
      memberEmail: "Üyenin e-postası",
      memberEmailHint: "Üyenin FIGHTNET hesabında kayıtlı adres — sözleşme oraya düşer",
      memberEmailPlaceholder: "uye@ornek.de",
      planName: "Tarife adı",
      planNamePlaceholder: "Sınırsız Üyelik",
      monthlyFee: "Aylık ücret (€, KDV dahil)",
      termMonths: "Asgari süre (ay)",
      termMonthsHint: "BGB §309 Nr. 9: en fazla {n} ay",
      noticeDays: "Fesih ihbarı (gün)",
      noticeDaysHint: "0–90 gün",
      startsAt: "Başlangıç",
      alertTitle: "Sözleşme metni otomatik üretilir",
      alertBody:
        "Girilen değerlerle asgari süre, otomatik uzama, SEPA mandatı, cayma hakkı ve veri koruma maddeleri metne işlenir. Metin üye imzalayana kadar taslak kalır; imzadan sonra tek karakteri bile değiştirilemez.",
    },
    invoiceForm: {
      submit: "Fatura Kes",
      period: "Dönem",
    },
    sepaForm: {
      submit: "pain.008 Üret",
      sequence: "Mandat dizisi",
      sequenceHint: "İlk tahsilat FRST, sonrakiler RCUR olarak gönderilir",
      frst: "FRST — ilk tahsilat",
      rcur: "RCUR — tekrar eden",
      download: "XML dosyasını indir",
      note: "Borçlu IBAN alanları maskelidir: platform ham IBAN saklamaz. Dosyayı bankaya göndermeden önce hesap bilgileri ödeme kuruluşu tarafından tamamlanır.",
    },
    signForm: {
      submit: "Sözleşmeyi İmzala",
      debtorName: "Hesap sahibi",
      bic: "BIC (isteğe bağlı)",
      bicHint: "Alman IBAN'larında gerekmez",
      bicPlaceholder: "COBADEFFXXX",
      iban: "IBAN",
      ibanHint: "Yalnızca maskelenmiş hâli saklanır — açık IBAN kaydedilmez",
      ibanPlaceholder: "DE89 3704 0044 0532 0130 00",
      consent:
        "Sözleşme metnini okudum ve kabul ediyorum. Salonu, aidatı hesabımdan SEPA Lastschrift yöntemiyle tahsil etmeye yetkilendiriyorum; bankama da bu talimatları ödemesi yönünde talimat veriyorum. Borçlandırma tarihinden itibaren 8 hafta içinde iade talep edebileceğimi biliyorum.",
      sealNote:
        "Onayın eIDAS gelişmiş elektronik imza (FES) olarak mühürlenir: kimliğin, zaman damgası, IP adresin ve metnin SHA-256 özeti birbirine bağlanır. Metin sonradan değişirse mühür geçersiz olur.",
    },
    terminateForm: {
      submit: "Fesih Bildir",
      reason: "Fesih gerekçesi",
      reasonHint: "Fesih tarihi, ihbar süresi ile asgari sürenin geç olanına göre hesaplanır",
      reasonPlaceholder: "Taşınma, sağlık, tarife değişikliği…",
    },
  },
};
