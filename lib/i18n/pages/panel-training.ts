import type { Locale } from "@/lib/i18n/config";

/**
 * Panel → Antrenman Günlüğü metinleri.
 *
 * Kapsam: `/panel/antrenman`, `/panel/antrenman/yeni`, `TrainingForm` ve
 * `StreakCalendar`. Antrenman türleri (`typeOptions`) yalnızca ETİKET olarak
 * çevrilir; forma gönderilen değer kanonik (Türkçe) kalır, böylece dil
 * değiştiğinde veritabanındaki geçmiş kayıtlar bozulmaz.
 */
type Copy = {
  meta: { list: string; create: string };
  list: {
    title: string;
    subtitle: string;
    add: string;
    stats: {
      streak: string;
      dayUnit: string;
      total: string;
      totalHint: string;
      last30: string;
      minuteUnit: string;
      avgIntensity: string;
    };
    heatmap: string;
    byDiscipline: string;
    hourUnit: string;
    records: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction: string;
    minuteShort: string;
    roundUnit: string;
    deleteAria: string;
  };
  create: { title: string; subtitle: string };
  form: {
    submit: string;
    offlineTitle: string;
    offlineBody: string;
    queuedTitle: string;
    queuedBody: string;
    pendingSuffix: string;
    date: string;
    discipline: string;
    select: string;
    duration: string;
    intensity: string;
    intensityHint: string;
    type: string;
    /** Kanonik (Türkçe) değer → gösterilecek etiket */
    typeOptions: Record<string, string>;
    rounds: string;
    weight: string;
    weightHint: string;
    mood: string;
    moodOptions: { veryBad: string; bad: string; ok: string; good: string; great: string };
    gym: string;
    techniques: string;
    techniquesHint: string;
    techniquesPlaceholder: string;
    addTechniqueAria: string;
    removeTechniqueAria: (technique: string) => string;
    notes: string;
    notesPlaceholder: string;
    visibility: string;
    visibilityHint: string;
  };
  calendar: { less: string; more: string; minuteShort: string };
};

export const panelTrainingCopy: Record<Locale, Copy> = {
  de: {
    meta: { list: "Trainingstagebuch", create: "Training hinzufügen" },
    list: {
      title: "Trainingstagebuch",
      subtitle: "Halte jede Einheit fest und lass deinen Streak wachsen",
      add: "Training hinzufügen",
      stats: {
        streak: "Aktueller Streak",
        dayUnit: "Tage",
        total: "Gesamt",
        totalHint: "Einheiten",
        last30: "Letzte 30 Tage",
        minuteUnit: "Minuten",
        avgIntensity: "Ø Intensität",
      },
      heatmap: "Letzte 12 Monate",
      byDiscipline: "Nach Disziplin",
      hourUnit: "Stunden",
      records: "Einträge",
      emptyTitle: "Noch keine Einträge",
      emptyDescription: "Trag dein erstes Training ein — dein Streak startet ab heute.",
      emptyAction: "Training hinzufügen",
      minuteShort: "Min.",
      roundUnit: "Runden",
      deleteAria: "Eintrag löschen",
    },
    create: {
      title: "Training hinzufügen",
      subtitle: "Trag deine Einheit ein — damit dein Streak weiterläuft",
    },
    form: {
      submit: "Training speichern",
      offlineTitle: "Du bist offline",
      offlineBody:
        "Dein Eintrag wird auf dem Gerät gespeichert und automatisch gesendet, sobald die Verbindung zurück ist.",
      queuedTitle: "Training auf deinem Gerät gespeichert",
      queuedBody: "Sobald die Verbindung zurück ist, wird es automatisch deinem Konto hinzugefügt.",
      pendingSuffix: "Einträge warten auf die Synchronisierung.",
      date: "Datum",
      discipline: "Disziplin",
      select: "Auswählen",
      duration: "Dauer (Min.)",
      intensity: "Intensität",
      intensityHint: "1 locker — 5 maximal",
      type: "Art",
      typeOptions: {
        Teknik: "Technik",
        Sparring: "Sparring",
        Kondisyon: "Kondition",
        Kuvvet: "Kraft",
        Drilling: "Drilling",
        "Open Mat": "Open Mat",
        "Özel Ders": "Privatstunde",
      },
      rounds: "Anzahl Runden",
      weight: "Gewicht (kg)",
      weightHint: "Optional zur Verlaufskontrolle",
      mood: "Stimmung",
      moodOptions: {
        veryBad: "Sehr schlecht",
        bad: "Schlecht",
        ok: "Normal",
        good: "Gut",
        great: "Top",
      },
      gym: "Gym",
      techniques: "Trainierte Techniken",
      techniquesHint: "Mit Enter hinzufügen",
      techniquesPlaceholder: "Armbar, Jab-Cross, Double Leg…",
      addTechniqueAria: "Technik hinzufügen",
      removeTechniqueAria: (technique) => `${technique} entfernen`,
      notes: "Notizen",
      notesPlaceholder: "Wie lief es? Woran solltest du arbeiten?",
      visibility: "Sichtbarkeit",
      visibilityHint: "Deine Trainingseinträge sind standardmäßig privat",
    },
    calendar: { less: "Wenig", more: "Viel", minuteShort: "Min." },
  },

  en: {
    meta: { list: "Training log", create: "Add training" },
    list: {
      title: "Training log",
      subtitle: "Log every session and grow your streak",
      add: "Add training",
      stats: {
        streak: "Current streak",
        dayUnit: "days",
        total: "Total",
        totalHint: "sessions",
        last30: "Last 30 days",
        minuteUnit: "minutes",
        avgIntensity: "Avg. intensity",
      },
      heatmap: "Last 12 months",
      byDiscipline: "By discipline",
      hourUnit: "hours",
      records: "Entries",
      emptyTitle: "No entries yet",
      emptyDescription: "Log your first session — your streak starts today.",
      emptyAction: "Add training",
      minuteShort: "min",
      roundUnit: "rounds",
      deleteAria: "Delete entry",
    },
    create: {
      title: "Add training",
      subtitle: "Log your session — keep your streak alive",
    },
    form: {
      submit: "Save training",
      offlineTitle: "You are offline",
      offlineBody:
        "Your entry will be stored on this device and sent automatically once you are back online.",
      queuedTitle: "Training saved on your device",
      queuedBody: "It will be added to your account automatically once you are back online.",
      pendingSuffix: "entries are waiting to be synced.",
      date: "Date",
      discipline: "Discipline",
      select: "Select",
      duration: "Duration (min)",
      intensity: "Intensity",
      intensityHint: "1 light — 5 maximum",
      type: "Type",
      typeOptions: {
        Teknik: "Technique",
        Sparring: "Sparring",
        Kondisyon: "Conditioning",
        Kuvvet: "Strength",
        Drilling: "Drilling",
        "Open Mat": "Open mat",
        "Özel Ders": "Private lesson",
      },
      rounds: "Number of rounds",
      weight: "Weight (kg)",
      weightHint: "Optional, for tracking",
      mood: "Mood",
      moodOptions: {
        veryBad: "Very bad",
        bad: "Bad",
        ok: "Okay",
        good: "Good",
        great: "Great",
      },
      gym: "Gym",
      techniques: "Techniques drilled",
      techniquesHint: "Press Enter to add",
      techniquesPlaceholder: "Armbar, Jab-Cross, Double Leg…",
      addTechniqueAria: "Add technique",
      removeTechniqueAria: (technique) => `Remove ${technique}`,
      notes: "Notes",
      notesPlaceholder: "How did it go? What should you work on?",
      visibility: "Visibility",
      visibilityHint: "Your training entries are private by default",
    },
    calendar: { less: "Less", more: "More", minuteShort: "min" },
  },

  tr: {
    meta: { list: "Antrenman Günlüğü", create: "Antrenman Ekle" },
    list: {
      title: "Antrenman Günlüğü",
      subtitle: "Her seansı kaydet, streak sayacını büyüt",
      add: "Antrenman Ekle",
      stats: {
        streak: "Güncel Streak",
        dayUnit: "gün",
        total: "Toplam",
        totalHint: "antrenman",
        last30: "Son 30 gün",
        minuteUnit: "dakika",
        avgIntensity: "Ort. yoğunluk",
      },
      heatmap: "Son 12 Ay",
      byDiscipline: "Disipline Göre",
      hourUnit: "saat",
      records: "Kayıtlar",
      emptyTitle: "Henüz kayıt yok",
      emptyDescription: "İlk antrenmanını kaydet — streak sayacın bugünden başlasın.",
      emptyAction: "Antrenman Ekle",
      minuteShort: "dk",
      roundUnit: "raunt",
      deleteAria: "Kaydı sil",
    },
    create: {
      title: "Antrenman Ekle",
      subtitle: "Seansını kaydet — streak sayacın devam etsin",
    },
    form: {
      submit: "Antrenmanı Kaydet",
      offlineTitle: "Çevrimdışısın",
      offlineBody: "Kaydın cihazında saklanacak ve bağlantı geri geldiğinde otomatik gönderilecek.",
      queuedTitle: "Antrenman cihazına kaydedildi",
      queuedBody: "Bağlantı geri geldiğinde otomatik olarak hesabına eklenecek.",
      pendingSuffix: "kayıt senkronize edilmeyi bekliyor.",
      date: "Tarih",
      discipline: "Disiplin",
      select: "Seç",
      duration: "Süre (dk)",
      intensity: "Yoğunluk",
      intensityHint: "1 hafif — 5 maksimum",
      type: "Tür",
      typeOptions: {
        Teknik: "Teknik",
        Sparring: "Sparring",
        Kondisyon: "Kondisyon",
        Kuvvet: "Kuvvet",
        Drilling: "Drilling",
        "Open Mat": "Open Mat",
        "Özel Ders": "Özel Ders",
      },
      rounds: "Raunt sayısı",
      weight: "Kilo (kg)",
      weightHint: "Takip için opsiyonel",
      mood: "Ruh hali",
      moodOptions: {
        veryBad: "Çok kötü",
        bad: "Kötü",
        ok: "Normal",
        good: "İyi",
        great: "Harika",
      },
      gym: "Salon",
      techniques: "Çalışılan teknikler",
      techniquesHint: "Enter ile ekle",
      techniquesPlaceholder: "Armbar, Jab-Cross, Double Leg…",
      addTechniqueAria: "Teknik ekle",
      removeTechniqueAria: (technique) => `${technique} kaldır`,
      notes: "Notlar",
      notesPlaceholder: "Nasıl geçti? Neyi geliştirmelisin?",
      visibility: "Görünürlük",
      visibilityHint: "Antrenman kayıtların varsayılan olarak özeldir",
    },
    calendar: { less: "Az", more: "Çok", minuteShort: "dk" },
  },
};

/** Kanonik antrenman türü değerleri — forma gönderilen değer dile bağlı değildir. */
export const TRAINING_TYPE_VALUES = [
  "Teknik",
  "Sparring",
  "Kondisyon",
  "Kuvvet",
  "Drilling",
  "Open Mat",
  "Özel Ders",
] as const;
