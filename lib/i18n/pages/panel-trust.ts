import type { Locale } from "@/lib/i18n/config";

/**
 * §4.5 / §11.5 — Güven katmanının metinleri: doğrulama seviyeleri, FIGHTNET
 * Passport, antrenör kefaleti, itirazlar ve içerik bildirme.
 *
 * Sunucu sayfaları ve istemci formları aynı modülü paylaşır; her bölüm ayrı
 * export olduğu için bir bileşen yalnızca kendi metnini içe aktarır.
 *
 * Zod doğrulama mesajları ve sunucu eylemlerinin döndürdüğü serbest metinler
 * burada DEĞİLDİR — onlar `lib/validators.ts` ve `actions.ts` içinde kalır.
 */

/* ------------------------------------------------------------------ */
/* Doğrulama sayfası (/panel/dogrulama)                                */
/* ------------------------------------------------------------------ */

type LevelKey = "LEVEL_0" | "LEVEL_1" | "LEVEL_2";

type VerificationCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  currentLevel: string;
  completed: string;
  levels: Record<LevelKey, { title: string; desc: string; perks: string[] }>;
  requestsTitle: string;
  /** `{level}` yerine mevcut seviye etiketi geçer. */
  requestFor: string;
  status: { approved: string; rejected: string; pending: string };
  pending: { title: string; body: string };
  maxLevel: { title: string; body: string };
  apply: { l1Title: string; l1Subtitle: string; l2Title: string; l2Subtitle: string };
};

export const verificationCopy: Record<Locale, VerificationCopy> = {
  de: {
    meta: { title: "Verifizierung" },
    title: "Verifizierung",
    subtitle: "Vertrauen entsteht durch Systemdesign — Verifizierung in 3 Stufen (§4.5)",
    currentLevel: "Deine aktuelle Stufe:",
    completed: "Abgeschlossen",
    levels: {
      LEVEL_0: {
        title: "Stufe 0 — Basis",
        desc: "Nur E-Mail-Bestätigung. Du kannst mit Einschränkungen lesen und kommentieren.",
        perks: ["Profil anlegen", "Beiträge sehen", "Eingeschränkt kommentieren"],
      },
      LEVEL_1: {
        title: "Stufe 1 — Identität verifiziert",
        desc: "Ausweisdokument + Selfie-Abgleich (KYC). Das Klarnamen-Profil wird freigeschaltet.",
        perks: ["Sparringsuche", "Live-Kommentare", "Klarnamen-Badge", "Buchungspriorität"],
      },
      LEVEL_2: {
        title: "Stufe 2 — Status verifiziert",
        desc: "Stufe 1 + Statusnachweis (Verbandsmitgliedschaft, Trainerlizenz, Gym-Nachweis).",
        perks: [
          "Bürgschaft für Schüler",
          "Gym-/Event-Verwaltung",
          "Sponsorenportal",
          "Creator-Seite",
        ],
      },
    },
    requestsTitle: "Meine Anträge",
    requestFor: "Antrag auf {level}",
    status: { approved: "Genehmigt", rejected: "Abgelehnt", pending: "In Prüfung" },
    pending: {
      title: "Dein Antrag wird geprüft",
      body:
        "Unser Verifizierungsteam prüft deine Dokumente. Sobald eine Entscheidung vorliegt, erhältst du eine Benachrichtigung. In der Regel dauert es 24-48 Stunden.",
    },
    maxLevel: {
      title: "Du bist auf der höchsten Stufe",
      body:
        "Alle Plattformfunktionen sind für dein Konto freigeschaltet. Du kannst jetzt für deine Schüler bürgen.",
    },
    apply: {
      l1Title: "Antrag auf Stufe 1",
      l1Subtitle: "Bestätige deine Identität mit Ausweisdokument und Selfie",
      l2Title: "Antrag auf Stufe 2",
      l2Subtitle: "Weise deinen Status als Athlet / Trainer / Gym nach",
    },
  },

  en: {
    meta: { title: "Verification" },
    title: "Verification",
    subtitle: "Trust is built through system design — 3-level verification (§4.5)",
    currentLevel: "Your current level:",
    completed: "Completed",
    levels: {
      LEVEL_0: {
        title: "Level 0 — Basic",
        desc: "Email confirmation only. You can read and comment with restrictions.",
        perks: ["Create a profile", "See posts", "Limited commenting"],
      },
      LEVEL_1: {
        title: "Level 1 — Identity verified",
        desc: "ID document + selfie match (KYC). Unlocks the real-name profile.",
        perks: ["Sparring search", "Live commenting", "Real-name badge", "Booking priority"],
      },
      LEVEL_2: {
        title: "Level 2 — Status verified",
        desc: "Level 1 + proof of status (federation membership, coaching licence, gym documentation).",
        perks: ["Vouch for students", "Gym/event management", "Sponsor portal", "Creator page"],
      },
    },
    requestsTitle: "My requests",
    requestFor: "{level} request",
    status: { approved: "Approved", rejected: "Rejected", pending: "Under review" },
    pending: {
      title: "Your request is under review",
      body:
        "Our verification team is checking your documents. You will get a notification once there is a decision. It usually takes 24-48 hours.",
    },
    maxLevel: {
      title: "You are at the highest level",
      body: "Every platform feature is unlocked for your account. You can now vouch for your students.",
    },
    apply: {
      l1Title: "Level 1 application",
      l1Subtitle: "Verify your identity with an ID document and a selfie",
      l2Title: "Level 2 application",
      l2Subtitle: "Document your athlete / coach / gym status",
    },
  },

  tr: {
    meta: { title: "Doğrulama" },
    title: "Doğrulama",
    subtitle: "Güven, sistem tasarımıyla kurulur — 3 seviyeli doğrulama (§4.5)",
    currentLevel: "Mevcut seviyen:",
    completed: "Tamamlandı",
    levels: {
      LEVEL_0: {
        title: "Seviye 0 — Temel",
        desc: "Sadece e-posta onayı. Kısıtlamalarla okuyabilir ve yorum yapabilirsin.",
        perks: ["Profil oluşturma", "Gönderileri görme", "Sınırlı yorum"],
      },
      LEVEL_1: {
        title: "Seviye 1 — Kimlik doğrulanmış",
        desc: "Kimlik belgesi + selfie eşleştirme (KYC). Gerçek isim profili açılır.",
        perks: ["Sparring araması", "Canlı yorum", "Gerçek isim rozeti", "Rezervasyon önceliği"],
      },
      LEVEL_2: {
        title: "Seviye 2 — Durum doğrulanmış",
        desc: "Seviye 1 + durum kanıtı (federasyon üyeliği, antrenör lisansı, salon belgesi).",
        perks: [
          "Öğrencilere kefil olma",
          "Salon/etkinlik yönetimi",
          "Sponsor portalı",
          "Creator sayfası",
        ],
      },
    },
    requestsTitle: "Taleplerim",
    requestFor: "{level} talebi",
    status: { approved: "Onaylandı", rejected: "Reddedildi", pending: "İnceleniyor" },
    pending: {
      title: "Talebin inceleniyor",
      body:
        "Doğrulama ekibimiz belgelerini kontrol ediyor. Sonuçlandığında bildirim alacaksın. Genelde 24-48 saat sürer.",
    },
    maxLevel: {
      title: "En yüksek seviyedesin",
      body: "Tüm platform özellikleri hesabına açık. Artık öğrencilerine kefil olabilirsin.",
    },
    apply: {
      l1Title: "Seviye 1 Başvurusu",
      l1Subtitle: "Kimlik belgesi ve selfie ile kimliğini doğrula",
      l2Title: "Seviye 2 Başvurusu",
      l2Subtitle: "Sporcu / antrenör / salon durumunu belgele",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Doğrulama formu (components/verification-form.tsx)                  */
/* ------------------------------------------------------------------ */

type VerificationFormCopy = {
  submit: string;
  privacy: { title: string; body: string };
  idDoc: { label: string; hint: string; upload: string };
  selfie: { label: string; hint: string; upload: string };
  role: {
    label: string;
    select: string;
    ATHLETE: string;
    COACH: string;
    GYM_OWNER: string;
    ORGANIZER: string;
  };
  /** `{n}` yerine 1..3 geçer. */
  proofs: { label: string; hint: string; doc: string };
  note: { label: string; placeholder: string };
};

export const verificationFormCopy: Record<Locale, VerificationFormCopy> = {
  de: {
    submit: "Antrag senden",
    privacy: {
      title: "Wie deine Daten geschützt werden",
      body:
        "Deine Ausweisdokumente werden ausschließlich zur Verifizierung genutzt, verschlüsselt auf EU-Servern gespeichert und innerhalb von 30 Tagen nach der Freigabe gelöscht. Dokumentbilder erscheinen niemals in deinem Profil.",
    },
    idDoc: {
      label: "Ausweisdokument",
      hint: "Personalausweis, Reisepass oder Führerschein",
      upload: "Dokument hochladen",
    },
    selfie: {
      label: "Selfie",
      hint: "Foto, auf dem du dein Dokument in der Hand hältst",
      upload: "Selfie hochladen",
    },
    role: {
      label: "Welchen Status weist du nach?",
      select: "Auswählen",
      ATHLETE: "Athlet (Verbandslizenz / Wettkampfnachweis)",
      COACH: "Trainer (Trainerlizenz)",
      GYM_OWNER: "Gym-Betreiber (Gewerbenachweis)",
      ORGANIZER: "Veranstalter (Veranstaltungsnachweis)",
    },
    proofs: {
      label: "Nachweisdokumente",
      hint: "Du kannst höchstens 3 Dokumente hochladen",
      doc: "Dokument {n}",
    },
    note: {
      label: "Zusätzliche Anmerkung",
      placeholder: "Gibt es etwas, das unser Verifizierungsteam wissen sollte?",
    },
  },

  en: {
    submit: "Submit request",
    privacy: {
      title: "How your data is protected",
      body:
        "Your identity documents are used for verification only, stored encrypted on EU servers and deleted within 30 days of approval. Document images never appear on your profile.",
    },
    idDoc: {
      label: "Identity document",
      hint: "ID card, passport or driving licence",
      upload: "Upload document",
    },
    selfie: {
      label: "Selfie",
      hint: "A photo of you holding your document",
      upload: "Upload selfie",
    },
    role: {
      label: "Which status are you verifying?",
      select: "Select",
      ATHLETE: "Athlete (federation licence / competition record)",
      COACH: "Coach (coaching licence)",
      GYM_OWNER: "Gym owner (business registration)",
      ORGANIZER: "Organizer (event registration)",
    },
    proofs: {
      label: "Proof documents",
      hint: "You can upload up to 3 documents",
      doc: "Document {n}",
    },
    note: {
      label: "Additional note",
      placeholder: "Is there anything the verification team should know?",
    },
  },

  tr: {
    submit: "Talebi Gönder",
    privacy: {
      title: "Verilerin nasıl korunuyor",
      body:
        "Kimlik belgelerin yalnızca doğrulama için kullanılır, AB sunucularında şifreli saklanır ve onay sonrası 30 gün içinde silinir. Belge görselleri profilinde asla görünmez.",
    },
    idDoc: {
      label: "Kimlik belgesi",
      hint: "Kimlik kartı, pasaport veya ehliyet",
      upload: "Belgeyi yükle",
    },
    selfie: {
      label: "Selfie",
      hint: "Belgeni elinde tutarken çekilmiş fotoğraf",
      upload: "Selfie yükle",
    },
    role: {
      label: "Hangi durumu doğruluyorsun?",
      select: "Seç",
      ATHLETE: "Sporcu (federasyon lisansı / müsabaka belgesi)",
      COACH: "Antrenör (antrenör lisansı)",
      GYM_OWNER: "Salon İşletmecisi (işletme belgesi)",
      ORGANIZER: "Organizatör (etkinlik kaydı)",
    },
    proofs: {
      label: "Kanıt belgeleri",
      hint: "En fazla 3 belge yükleyebilirsin",
      doc: "Belge {n}",
    },
    note: {
      label: "Ek açıklama",
      placeholder: "Doğrulama ekibinin bilmesi gereken bir şey var mı?",
    },
  },
};

/* ------------------------------------------------------------------ */
/* FIGHTNET Passport sayfası (/panel/passport)                         */
/* ------------------------------------------------------------------ */

type PassportCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  intro: { title: string; body1: string; noHealth: string; body2: string };
  stats: { total: string; approved: string };
  docsTitle: string;
  empty: { title: string; description: string };
  status: { approved: string; rejected: string; pending: string };
  deleteDoc: string;
  addTitle: string;
  why: { title: string; body: string };
};

export const passportCopy: Record<Locale, PassportCopy> = {
  de: {
    meta: { title: "FIGHTNET Passport" },
    title: "FIGHTNET Passport",
    subtitle:
      "Digitale Brieftasche für deine sportlichen Nachweise — Trainerlizenz, Diplom, Turnierbelege",
    intro: {
      title: "Stufe Nachweis-Sammler",
      body1:
        "Du lädst deine Dokumente hoch, das FIGHTNET-Team prüft sie manuell. Freigegebene Dokumente erscheinen als Badge in deinem Profil. ",
      noHealth: "Wir erheben keine Gesundheitsdaten",
      body2: " — ausschließlich sportliche Nachweise.",
    },
    stats: { total: "Dokumente gesamt", approved: "Freigegeben" },
    docsTitle: "Meine Dokumente",
    empty: {
      title: "Keine Dokumente",
      description:
        "Lade deine Trainerlizenz, dein Wettkampfdiplom oder deine Turnierteilnahmebestätigung hoch.",
    },
    status: { approved: "Freigegeben", rejected: "Abgelehnt", pending: "In Prüfung" },
    deleteDoc: "Dokument löschen",
    addTitle: "Dokument hinzufügen",
    why: {
      title: "Warum keine Gesundheitsdaten?",
      body:
        "Gesundheitsdaten unterliegen nach Artikel 9 DSGVO dem höchsten Schutzniveau. Der vereinfachte Passport liefert 80 % des Nutzens ohne diese Komplexität.",
    },
  },

  en: {
    meta: { title: "FIGHTNET Passport" },
    title: "FIGHTNET Passport",
    subtitle:
      "A digital wallet for your sporting credentials — coaching licence, diploma, tournament certificates",
    intro: {
      title: "Evidence collector level",
      body1:
        "You upload your documents and the FIGHTNET team reviews them manually. Approved documents appear as a badge on your profile. ",
      noHealth: "We do not collect health data",
      body2: " — sporting credentials only.",
    },
    stats: { total: "Total documents", approved: "Approved" },
    docsTitle: "My documents",
    empty: {
      title: "No documents",
      description:
        "Upload your coaching licence, competition diploma or tournament participation certificate.",
    },
    status: { approved: "Approved", rejected: "Rejected", pending: "Under review" },
    deleteDoc: "Delete document",
    addTitle: "Add document",
    why: {
      title: "Why no health data?",
      body:
        "Health data requires the highest level of protection under Article 9 GDPR. The simplified Passport delivers 80% of the benefit without that complexity.",
    },
  },

  tr: {
    meta: { title: "FIGHTNET Passport" },
    title: "FIGHTNET Passport",
    subtitle: "Spor kanıtların için dijital cüzdan — antrenör lisansı, diploma, turnuva belgeleri",
    intro: {
      title: "Kanıt Toplayıcı seviyesi",
      body1:
        "Belgelerini yüklersin, FIGHTNET ekibi manuel kontrol eder. Onaylanan belgeler profilinde rozet olarak görünür. ",
      noHealth: "Sağlık verisi toplamıyoruz",
      body2: " — sadece spor kanıtları.",
    },
    stats: { total: "Toplam Belge", approved: "Onaylı" },
    docsTitle: "Belgelerim",
    empty: {
      title: "Belge yok",
      description: "Antrenör lisansı, müsabaka diploması veya turnuva katılım belgeni yükle.",
    },
    status: { approved: "Onaylı", rejected: "Reddedildi", pending: "İnceleniyor" },
    deleteDoc: "Belgeyi sil",
    addTitle: "Belge Ekle",
    why: {
      title: "Neden sağlık verisi yok?",
      body:
        "Sağlık verileri KVKK/GDPR Madde 9 kapsamında en yüksek koruma gerektirir. Sadeleştirilmiş Passport bu karmaşıklık olmadan faydanın %80'ini sunar.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Passport belge formu (components/passport-form.tsx)                 */
/* ------------------------------------------------------------------ */

type PassportFormCopy = {
  submit: string;
  kind: { label: string; select: string };
  title: { label: string; placeholder: string };
  issuer: { label: string; placeholder: string };
  issuedAt: string;
  expiresAt: string;
  file: { label: string; upload: string };
};

export const passportFormCopy: Record<Locale, PassportFormCopy> = {
  de: {
    submit: "Dokument hochladen",
    kind: { label: "Dokumentart", select: "Auswählen" },
    title: { label: "Titel", placeholder: "BJJ Blaugurt-Zertifikat" },
    issuer: { label: "Ausstellende Stelle", placeholder: "Deutscher MMA Verband" },
    issuedAt: "Ausstellungsdatum",
    expiresAt: "Gültig bis",
    file: { label: "Dokumentbild", upload: "Dokument hochladen" },
  },

  en: {
    submit: "Upload document",
    kind: { label: "Document type", select: "Select" },
    title: { label: "Title", placeholder: "BJJ blue belt certificate" },
    issuer: { label: "Issuing body", placeholder: "German MMA Federation" },
    issuedAt: "Issue date",
    expiresAt: "Valid until",
    file: { label: "Document image", upload: "Upload document" },
  },

  tr: {
    submit: "Belgeyi Yükle",
    kind: { label: "Belge türü", select: "Seç" },
    title: { label: "Başlık", placeholder: "BJJ Mavi Kemer Sertifikası" },
    issuer: { label: "Veren kurum", placeholder: "Alman MMA Federasyonu" },
    issuedAt: "Veriliş tarihi",
    expiresAt: "Geçerlilik sonu",
    file: { label: "Belge görseli", upload: "Belgeyi yükle" },
  },
};

/* ------------------------------------------------------------------ */
/* Kefalet sayfası (/panel/kefalet)                                    */
/* ------------------------------------------------------------------ */

type VouchCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  how: { title: string; body1: string; reputation: string; body2: string };
  needLevel2: { title: string; body: string; link: string };
  stats: { active: string; remaining: string };
  newTitle: string;
  listTitle: string;
  empty: { title: string; description: string };
  status: { active: string; revoked: string };
  revoke: string;
};

export const vouchCopy: Record<Locale, VouchCopy> = {
  de: {
    meta: { title: "Meine Bürgschaften" },
    title: "Trainer-Bürgschaft",
    subtitle: "Verifizierte Trainer können für bis zu 20 Amateurschüler bürgen (§4.5)",
    how: {
      title: "So funktioniert es",
      body1:
        "Der Athlet, für den du bürgst, gilt automatisch als auf Stufe 1 verifiziert und die Sparringsuche wird für ihn freigeschaltet.",
      reputation: " Du haftest mit deinem Ruf",
      body2: " — bei einer falschen Bürgschaft wird dir der Trainerstatus entzogen.",
    },
    needLevel2: {
      title: "Für Bürgschaften musst du Trainer auf Stufe 2 sein",
      body: "Lade deine Trainerlizenz hoch und schließe die Statusverifizierung ab.",
      link: "Verifizierung starten",
    },
    stats: { active: "Aktive Bürgschaften", remaining: "Verbleibendes Kontingent" },
    newTitle: "Neue Bürgschaft",
    listTitle: "Athleten, für die ich bürge",
    empty: {
      title: "Noch keine Bürgschaften",
      description: "Gib den Benutzernamen deiner Schüler ein, um sie zu verifizieren.",
    },
    status: { active: "Aktiv", revoked: "Widerrufen" },
    revoke: "Widerrufen",
  },

  en: {
    meta: { title: "My vouches" },
    title: "Coach vouching",
    subtitle: "Verified coaches can vouch for up to 20 amateur students (§4.5)",
    how: {
      title: "How it works",
      body1:
        "The athlete you vouch for is automatically verified at Level 1 and sparring search is unlocked for them.",
      reputation: " You are answerable with your reputation",
      body2: " — a false vouch means your coach status is revoked.",
    },
    needLevel2: {
      title: "You need to be a Level 2 coach to vouch",
      body: "Upload your coaching licence and complete status verification.",
      link: "Start verification",
    },
    stats: { active: "Active vouches", remaining: "Remaining slots" },
    newTitle: "New vouch",
    listTitle: "Athletes I vouch for",
    empty: {
      title: "No vouches yet",
      description: "Enter your students' usernames to verify them.",
    },
    status: { active: "Active", revoked: "Revoked" },
    revoke: "Revoke",
  },

  tr: {
    meta: { title: "Kefaletlerim" },
    title: "Antrenör Kefaleti",
    subtitle: "Doğrulanmış antrenörler 20 amatör öğrencisine kadar kefil olabilir (§4.5)",
    how: {
      title: "Nasıl çalışır",
      body1:
        "Kefil olduğun sporcu otomatik Seviye 1 doğrulanmış olur ve sparring araması açılır.",
      reputation: " İtibarınla sorumlusun",
      body2: " — sahte kefalet durumunda antrenör statün geri alınır.",
    },
    needLevel2: {
      title: "Kefalet için Seviye 2 antrenör olmalısın",
      body: "Antrenör lisansını yükleyip durum doğrulamasını tamamla.",
      link: "Doğrulamayı başlat",
    },
    stats: { active: "Aktif kefalet", remaining: "Kalan hak" },
    newTitle: "Yeni Kefalet",
    listTitle: "Kefil Olduğum Sporcular",
    empty: {
      title: "Henüz kefalet yok",
      description: "Öğrencilerinin kullanıcı adını girerek onları doğrula.",
    },
    status: { active: "Aktif", revoked: "Geri alındı" },
    revoke: "Geri Al",
  },
};

/* ------------------------------------------------------------------ */
/* Kefalet formu (components/vouch-form.tsx)                           */
/* ------------------------------------------------------------------ */

type VouchFormCopy = {
  submit: string;
  username: { label: string; hint: string; placeholder: string };
  note: { label: string; hint: string; placeholder: string };
};

export const vouchFormCopy: Record<Locale, VouchFormCopy> = {
  de: {
    submit: "Bürgschaft übernehmen",
    username: {
      label: "Benutzername des Athleten",
      hint: "Der Athlet muss bei FIGHTNET registriert sein",
      placeholder: "maxmustermann",
    },
    note: {
      label: "Notiz",
      hint: "Wie lange kennst du den Athleten schon?",
      placeholder: "Trainiert seit 2 Jahren in meinem Gym",
    },
  },

  en: {
    submit: "Vouch for athlete",
    username: {
      label: "Athlete's username",
      hint: "The athlete has to be registered on FIGHTNET",
      placeholder: "alexmiller",
    },
    note: {
      label: "Note",
      hint: "How long have you known the athlete?",
      placeholder: "Has been training at my gym for 2 years",
    },
  },

  tr: {
    submit: "Kefil Ol",
    username: {
      label: "Sporcunun kullanıcı adı",
      hint: "Sporcu FIGHTNET'e kayıtlı olmalı",
      placeholder: "ahmetyilmaz",
    },
    note: {
      label: "Not",
      hint: "Sporcuyu ne kadar süredir tanıyorsun?",
      placeholder: "2 yıldır salonumda antrenman yapıyor",
    },
  },
};

/* ------------------------------------------------------------------ */
/* İtirazlar sayfası (/panel/itirazlar)                                */
/* ------------------------------------------------------------------ */

type AppealTarget = "POST" | "COMMENT" | "USER" | "THREAD" | "FORUM_POST" | "MESSAGE";
type AppealStatus = "OPEN" | "UPHELD" | "OVERTURNED" | "DISMISSED";

type AppealsCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  intro1: string;
  transparencyLink: string;
  intro2: string;
  status: Record<AppealStatus, string>;
  target: Record<AppealTarget, string>;
  newTitle: string;
  historyTitle: string;
  empty: string;
  decision: string;
};

export const appealsCopy: Record<Locale, AppealsCopy> = {
  de: {
    meta: { title: "Meine Einsprüche" },
    title: "Meine Einsprüche",
    subtitle: "Einspruch gegen Moderationsentscheidungen — §11.5 DSA-Beschwerdemechanismus",
    intro1:
      "Wenn dein Inhalt entfernt wurde, dein Konto eingeschränkt wurde oder du der Meinung bist, dass deine Meldung ohne Folgen geblieben ist, kannst du Einspruch einlegen. Dein Einspruch wird unabhängig von der Person geprüft, die die Entscheidung getroffen hat. Die Ergebnisse werden gesammelt im",
    transparencyLink: "Transparenzbericht",
    intro2: " veröffentlicht.",
    status: {
      OPEN: "In Prüfung",
      UPHELD: "Entscheidung bestätigt",
      OVERTURNED: "Entscheidung aufgehoben",
      DISMISSED: "Einspruch abgewiesen",
    },
    target: {
      POST: "Beitrag",
      COMMENT: "Kommentar",
      USER: "Konto",
      THREAD: "Forum-Thema",
      FORUM_POST: "Forum-Antwort",
      MESSAGE: "Nachricht",
    },
    newTitle: "Neuer Einspruch",
    historyTitle: "Verlauf",
    empty: "Du hast noch keine Einsprüche",
    decision: "Entscheidung: ",
  },

  en: {
    meta: { title: "My appeals" },
    title: "My appeals",
    subtitle: "Appeal against moderation decisions — §11.5 DSA complaint mechanism",
    intro1:
      "If your content was removed, your account was restricted, or you believe a report you filed went nowhere, you can appeal. Your appeal is reviewed independently of the person who made the original decision. The outcomes are published in aggregate in the",
    transparencyLink: "transparency report",
    intro2: ".",
    status: {
      OPEN: "Under review",
      UPHELD: "Decision upheld",
      OVERTURNED: "Decision overturned",
      DISMISSED: "Appeal dismissed",
    },
    target: {
      POST: "Post",
      COMMENT: "Comment",
      USER: "Account",
      THREAD: "Forum thread",
      FORUM_POST: "Forum reply",
      MESSAGE: "Message",
    },
    newTitle: "New appeal",
    historyTitle: "History",
    empty: "You have no appeals yet",
    decision: "Decision: ",
  },

  tr: {
    meta: { title: "İtirazlarım" },
    title: "İtirazlarım",
    subtitle: "Moderasyon kararlarına itiraz — §11.5 DSA şikayet mekanizması",
    intro1:
      "İçeriğin kaldırıldıysa, hesabın kısıtlandıysa ya da bir bildirimin sonuçsuz kaldığını düşünüyorsan itiraz edebilirsin. İtirazın kararı veren kişiden bağımsız olarak yeniden değerlendirilir. Sonuçlar",
    transparencyLink: "şeffaflık raporunda",
    intro2: " toplu olarak yayınlanır.",
    status: {
      OPEN: "İnceleniyor",
      UPHELD: "Karar korundu",
      OVERTURNED: "Karar geri alındı",
      DISMISSED: "İtiraz reddedildi",
    },
    target: {
      POST: "Gönderi",
      COMMENT: "Yorum",
      USER: "Hesap",
      THREAD: "Forum konusu",
      FORUM_POST: "Forum yanıtı",
      MESSAGE: "Mesaj",
    },
    newTitle: "Yeni İtiraz",
    historyTitle: "Geçmiş",
    empty: "Henüz itirazın yok",
    decision: "Karar: ",
  },
};

/* ------------------------------------------------------------------ */
/* İtiraz formu (components/appeal-form.tsx)                           */
/* ------------------------------------------------------------------ */

type AppealFormTarget = "POST" | "COMMENT" | "THREAD" | "FORUM_POST" | "MESSAGE" | "USER";

type AppealFormCopy = {
  submit: string;
  targetType: { label: string; select: string };
  targets: Record<AppealFormTarget, string>;
  targetId: { label: string; hint: string; placeholder: string };
  body: { label: string; hint: string };
};

export const appealFormCopy: Record<Locale, AppealFormCopy> = {
  de: {
    submit: "Einspruch senden",
    targetType: { label: "Wogegen legst du Einspruch ein?", select: "Auswählen" },
    targets: {
      POST: "Mein Beitrag wurde entfernt",
      COMMENT: "Mein Kommentar wurde entfernt",
      THREAD: "Mein Forum-Thema wurde entfernt",
      FORUM_POST: "Meine Forum-Antwort wurde entfernt",
      MESSAGE: "Meine Nachricht wurde entfernt",
      USER: "Mein Konto wurde eingeschränkt / gesperrt",
    },
    targetId: {
      label: "Link oder Kennung des Inhalts",
      hint:
        "Füge die Adresse des entfernten Inhalts ein. Bei einer Kontobeschränkung gib deinen Benutzernamen an.",
      placeholder: "https://… oder @benutzername",
    },
    body: {
      label: "Deine Begründung",
      hint: "Erkläre, warum die Entscheidung falsch ist. Mindestens 20 Zeichen.",
    },
  },

  en: {
    submit: "Submit appeal",
    targetType: { label: "What are you appealing?", select: "Select" },
    targets: {
      POST: "My post was removed",
      COMMENT: "My comment was removed",
      THREAD: "My forum thread was removed",
      FORUM_POST: "My forum reply was removed",
      MESSAGE: "My message was removed",
      USER: "My account was restricted / suspended",
    },
    targetId: {
      label: "Link or ID of the content",
      hint:
        "Paste the address of the removed content. For an account restriction, enter your username.",
      placeholder: "https://… or @username",
    },
    body: {
      label: "Your reasoning",
      hint: "Explain why the decision is wrong. At least 20 characters.",
    },
  },

  tr: {
    submit: "İtirazı Gönder",
    targetType: { label: "Neye itiraz ediyorsun?", select: "Seç" },
    targets: {
      POST: "Gönderim kaldırıldı",
      COMMENT: "Yorumum kaldırıldı",
      THREAD: "Forum konum kaldırıldı",
      FORUM_POST: "Forum yanıtım kaldırıldı",
      MESSAGE: "Mesajım kaldırıldı",
      USER: "Hesabım kısıtlandı / askıya alındı",
    },
    targetId: {
      label: "İçeriğin bağlantısı veya kimliği",
      hint:
        "Kaldırılan içeriğin adresini yapıştır. Hesap kısıtlaması için kullanıcı adını yaz.",
      placeholder: "https://… veya @kullaniciadi",
    },
    body: {
      label: "Gerekçen",
      hint: "Kararın neden hatalı olduğunu açıkla. En az 20 karakter.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Bildir butonu (components/report-button.tsx)                        */
/* ------------------------------------------------------------------ */

type ReportCopy = {
  report: string;
  done: { title: string; body: string };
  modalTitle: string;
  reason: { label: string; select: string };
  description: { label: string; hint: string };
  error: string;
  cancel: string;
  submit: string;
};

export const reportCopy: Record<Locale, ReportCopy> = {
  de: {
    report: "Melden",
    done: {
      title: "Deine Meldung ist eingegangen",
      body: "Wir prüfen sie innerhalb von 24 Stunden.",
    },
    modalTitle: "Inhalt melden",
    reason: { label: "Grund", select: "Einen Grund auswählen" },
    description: { label: "Beschreibung", hint: "Beschreibe kurz, was du gesehen hast (optional)" },
    error: "Konnte nicht gesendet werden, bitte erneut versuchen.",
    cancel: "Abbrechen",
    submit: "Senden",
  },

  en: {
    report: "Report",
    done: { title: "Your report has been received", body: "We will review it within 24 hours." },
    modalTitle: "Report content",
    reason: { label: "Reason", select: "Choose a reason" },
    description: { label: "Description", hint: "Briefly describe what you saw (optional)" },
    error: "Could not be sent, please try again.",
    cancel: "Cancel",
    submit: "Send",
  },

  tr: {
    report: "Bildir",
    done: { title: "Raporun alındı", body: "24 saat içinde inceleyeceğiz." },
    modalTitle: "İçeriği Bildir",
    reason: { label: "Sebep", select: "Bir sebep seç" },
    description: { label: "Açıklama", hint: "Ne gördüğünü kısaca anlat (opsiyonel)" },
    error: "Gönderilemedi, tekrar dene.",
    cancel: "Vazgeç",
    submit: "Gönder",
  },
};
