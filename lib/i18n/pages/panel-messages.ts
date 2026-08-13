import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel/mesajlar` listesi, sohbet detayı ve `message-forms` bileşenleri.
 *
 * Sunucu eylemlerinin döndürdüğü hata metinleri (§11.1 çocuk koruması gibi)
 * `actions.ts` içinde kalır; burada yalnızca arayüz metinleri çevrilir.
 */
type Copy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  restricted: { title: string; body: string };
  empty: { title: string; description: string };
  deletedUser: string;
  conversationStarted: string;

  thread: {
    meta: { title: string };
    backAria: string;
    minorNotice: string;
    bannedNotice: string;
    empty: string;
  };

  composer: {
    placeholder: string;
    sendAria: string;
    hint: string;
    messageButton: string;
  };
};

export const panelMessagesCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Nachrichten" },
    title: "Nachrichten",
    subtitle: "Direkter Kontakt mit Athleten, Trainern und Gyms",
    restricted: {
      title: "Nachrichten eingeschränkt",
      body:
        "Bis die Freigabe der Erziehungsberechtigten vorliegt, können Erwachsene dir keine Nachrichten schicken und du kannst selbst keine Unterhaltung beginnen.",
    },
    empty: {
      title: "Du hast noch keine Nachrichten",
      description:
        "Du kannst eine Unterhaltung über das Profil einer Athletin oder eines Athleten oder über ein Sparring-Match starten.",
    },
    deletedUser: "Gelöschtes Konto",
    conversationStarted: "Unterhaltung gestartet",

    thread: {
      meta: { title: "Unterhaltung" },
      backAria: "Zurück zu den Nachrichten",
      minorNotice: "Unter 18 — Schutzregeln gelten",
      bannedNotice: "Das Konto dieser Person ist gesperrt. Es können keine neuen Nachrichten gesendet werden.",
      empty: "Noch keine Nachrichten. Schreib du die erste.",
    },

    composer: {
      placeholder: "Schreib deine Nachricht…",
      sendAria: "Senden",
      hint: "⌘/Strg + Enter zum Senden · Störende Nachrichten kannst du melden",
      messageButton: "Nachricht",
    },
  },

  en: {
    meta: { title: "Messages" },
    title: "Messages",
    subtitle: "Direct contact with athletes, coaches and gyms",
    restricted: {
      title: "Messaging restricted",
      body:
        "Until your guardian's consent arrives, adults cannot send you messages and you cannot start a conversation yourself.",
    },
    empty: {
      title: "You have no messages yet",
      description: "You can start a chat from an athlete's profile or from a sparring match.",
    },
    deletedUser: "Deleted account",
    conversationStarted: "Conversation started",

    thread: {
      meta: { title: "Conversation" },
      backAria: "Back to messages",
      minorNotice: "Under 18 — protection rules apply",
      bannedNotice: "This user's account is suspended. No new messages can be sent.",
      empty: "No messages yet. Be the first to write.",
    },

    composer: {
      placeholder: "Write your message…",
      sendAria: "Send",
      hint: "⌘/Ctrl + Enter to send · You can report abusive messages",
      messageButton: "Message",
    },
  },

  tr: {
    meta: { title: "Mesajlar" },
    title: "Mesajlar",
    subtitle: "Sporcular, antrenörler ve salonlarla doğrudan iletişim",
    restricted: {
      title: "Mesajlaşma kısıtlı",
      body: "Velinin onayı gelene kadar yetişkinler sana mesaj gönderemez ve sen de mesaj başlatamazsın.",
    },
    empty: {
      title: "Henüz mesajın yok",
      description: "Bir sporcunun profilinden ya da sparring eşleşmesinden sohbet başlatabilirsin.",
    },
    deletedUser: "Silinmiş kullanıcı",
    conversationStarted: "Sohbet başladı",

    thread: {
      meta: { title: "Sohbet" },
      backAria: "Mesajlara dön",
      minorNotice: "18 yaş altı — koruma kuralları geçerli",
      bannedNotice: "Bu kullanıcının hesabı askıya alınmış. Yeni mesaj gönderilemez.",
      empty: "Henüz mesaj yok. İlk mesajı sen yaz.",
    },

    composer: {
      placeholder: "Mesajını yaz…",
      sendAria: "Gönder",
      hint: "⌘/Ctrl + Enter ile gönder · Rahatsız edici mesajları bildirebilirsin",
      messageButton: "Mesaj",
    },
  },
};
