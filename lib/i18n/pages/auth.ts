import type { Locale } from "@/lib/i18n/config";

/**
 * `/giris`, `/kayit` ve kimlik düzeninin metinleri.
 *
 * Form metinleri de burada durur ve `components/auth-forms.tsx` istemci
 * bileşenine prop olarak geçirilir: sözlük yalnızca her sayfada gereken
 * ortak metinleri taşır, yalnızca iki sayfada kullanılan alan etiketleri
 * istemci paketini şişirmez.
 *
 * `accept` alanı, üç bağlantılı onay cümlesini parça parça tutar; cümle
 * dizilimi dile göre değiştiği için (Türkçede bağlantılar önde, Almanca ve
 * İngilizcede fiil önde) metin tek bir dizede tutulamaz.
 */

export type LoginFormCopy = {
  email: string;
  emailPlaceholder: string;
  password: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  genericError: string;
};

export type RegisterFormCopy = {
  name: string;
  username: string;
  usernameHint: string;
  email: string;
  password: string;
  passwordHint: string;
  showPassword: string;
  hidePassword: string;
  birthDate: string;
  birthDateHint: string;
  city: string;
  minorTitle: string;
  minorBody: string;
  guardianEmail: string;
  role: string;
  roleAthlete: string;
  roleCoach: string;
  roleGymOwner: string;
  roleOrganizer: string;
  roleFan: string;
  betaCode: string;
  betaCodeHint: string;
  accept: {
    lead: string;
    terms: string;
    mid1: string;
    privacy: string;
    mid2: string;
    rules: string;
    tail: string;
  };
  submit: string;
  genericError: string;
};

type Copy = {
  layout: { home: string; privacy: string; terms: string; imprint: string };
  login: {
    meta: { title: string; description: string };
    title: string;
    subtitle: string;
    noAccount: string;
    joinFree: string;
    form: LoginFormCopy;
  };
  register: {
    meta: { title: string; description: string };
    title: string;
    subtitle: string;
    haveAccount: string;
    login: string;
    form: RegisterFormCopy;
  };
};

export const authCopy: Record<Locale, Copy> = {
  de: {
    layout: { home: "Startseite", privacy: "Datenschutz", terms: "AGB", imprint: "Impressum" },
    login: {
      meta: { title: "Anmelden", description: "Melde dich bei deinem FIGHTNET-Konto an." },
      title: "Willkommen zurück",
      subtitle: "Mach da weiter, wo du im Training aufgehört hast.",
      noAccount: "Noch kein Konto?",
      joinFree: "Kostenlos beitreten",
      form: {
        email: "E-Mail",
        emailPlaceholder: "name@beispiel.de",
        password: "Passwort",
        showPassword: "Passwort anzeigen",
        hidePassword: "Passwort verbergen",
        submit: "Anmelden",
        genericError: "Es ist ein Fehler aufgetreten",
      },
    },
    register: {
      meta: {
        title: "Registrieren",
        description: "Tritt FIGHTNET kostenlos bei und erstelle ein verifiziertes Kämpferprofil.",
      },
      title: "Tritt FIGHTNET bei",
      subtitle: "Erstelle dein Profil, halte dein Training fest, finde Sparringpartner.",
      haveAccount: "Schon Mitglied?",
      login: "Anmelden",
      form: {
        name: "Vor- und Nachname",
        username: "Benutzername",
        usernameHint: "fightnet.app/@benutzername",
        email: "E-Mail",
        password: "Passwort",
        passwordHint: "Mindestens 8 Zeichen, ein Buchstabe und eine Ziffer",
        showPassword: "Passwort anzeigen",
        hidePassword: "Passwort verbergen",
        birthDate: "Geburtsdatum",
        birthDateHint: "Für die Altersprüfung",
        city: "Stadt",
        minorTitle: "Mitgliedschaft unter 18 Jahren",
        minorBody:
          "Zu deiner Sicherheit ist die Freigabe eines Erziehungsberechtigten nötig. Wir senden eine Bestätigungs-E-Mail an deine Eltern. Nicht verifizierte Erwachsene können dir keine Nachrichten schreiben.",
        guardianEmail: "E-Mail der Erziehungsberechtigten",
        role: "Wer bist du?",
        roleAthlete: "Athlet",
        roleCoach: "Trainer",
        roleGymOwner: "Gym-Betreiber",
        roleOrganizer: "Veranstalter",
        roleFan: "Fan",
        betaCode: "Beta-Zugangscode",
        betaCodeHint: "Falls vorhanden — schaltet die Gründungsmitglied-Vorteile frei",
        accept: {
          lead: "Ich habe die ",
          terms: "Allgemeinen Geschäftsbedingungen",
          mid1: ", die ",
          privacy: "Datenschutzerklärung",
          mid2: " und die ",
          rules: "Community-Richtlinien",
          tail: " gelesen und akzeptiere sie.",
        },
        submit: "Konto erstellen",
        genericError: "Es ist ein Fehler aufgetreten",
      },
    },
  },

  en: {
    layout: { home: "Home page", privacy: "Privacy", terms: "Terms", imprint: "Imprint" },
    login: {
      meta: { title: "Log in", description: "Log in to your FIGHTNET account." },
      title: "Welcome back",
      subtitle: "Pick up your training where you left off.",
      noAccount: "No account yet?",
      joinFree: "Join for free",
      form: {
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Password",
        showPassword: "Show password",
        hidePassword: "Hide password",
        submit: "Log in",
        genericError: "Something went wrong",
      },
    },
    register: {
      meta: {
        title: "Sign up",
        description: "Join FIGHTNET for free and create a verified fighter profile.",
      },
      title: "Join FIGHTNET",
      subtitle: "Create your profile, log your training, find a sparring partner.",
      haveAccount: "Already a member?",
      login: "Log in",
      form: {
        name: "Full name",
        username: "Username",
        usernameHint: "fightnet.app/@username",
        email: "Email",
        password: "Password",
        passwordHint: "At least 8 characters, one letter and one digit",
        showPassword: "Show password",
        hidePassword: "Hide password",
        birthDate: "Date of birth",
        birthDateHint: "For age verification",
        city: "City",
        minorTitle: "Membership under the age of 18",
        minorBody:
          "For your safety we need consent from a parent or guardian. We will send them a confirmation email. Unverified adults cannot message you.",
        guardianEmail: "Parent or guardian email",
        role: "Who are you?",
        roleAthlete: "Athlete",
        roleCoach: "Coach",
        roleGymOwner: "Gym owner",
        roleOrganizer: "Organizer",
        roleFan: "Fan",
        betaCode: "Beta access code",
        betaCodeHint: "If you have one — it unlocks the Founding Member benefits",
        accept: {
          lead: "I have read and accept the ",
          terms: "Terms of Use",
          mid1: ", the ",
          privacy: "Privacy Policy",
          mid2: " and the ",
          rules: "Community Guidelines",
          tail: ".",
        },
        submit: "Create account",
        genericError: "Something went wrong",
      },
    },
  },

  tr: {
    layout: { home: "Ana sayfa", privacy: "Gizlilik", terms: "Şartlar", imprint: "Künye" },
    login: {
      meta: { title: "Giriş Yap", description: "FIGHTNET hesabına giriş yap." },
      title: "Tekrar hoş geldin",
      subtitle: "Antrenmanına kaldığın yerden devam et.",
      noAccount: "Hesabın yok mu?",
      joinFree: "Ücretsiz katıl",
      form: {
        email: "E-posta",
        emailPlaceholder: "ornek@eposta.com",
        password: "Şifre",
        showPassword: "Şifreyi göster",
        hidePassword: "Şifreyi gizle",
        submit: "Giriş Yap",
        genericError: "Bir hata oluştu",
      },
    },
    register: {
      meta: {
        title: "Kayıt Ol",
        description: "FIGHTNET'e ücretsiz katıl. Doğrulanmış dövüşçü profili oluştur.",
      },
      title: "FIGHTNET'e katıl",
      subtitle: "Profilini oluştur, antrenmanlarını kaydet, sparring partneri bul.",
      haveAccount: "Zaten üye misin?",
      login: "Giriş yap",
      form: {
        name: "Ad Soyad",
        username: "Kullanıcı adı",
        usernameHint: "fightnet.app/@kullaniciadi",
        email: "E-posta",
        password: "Şifre",
        passwordHint: "En az 8 karakter, bir harf ve bir rakam",
        showPassword: "Şifreyi göster",
        hidePassword: "Şifreyi gizle",
        birthDate: "Doğum tarihi",
        birthDateHint: "Yaş doğrulaması için",
        city: "Şehir",
        minorTitle: "18 yaş altı üyelik",
        minorBody:
          "Güvenliğin için ebeveyn onayı gerekiyor. Ebeveynine onay e-postası göndereceğiz. Doğrulanmamış yetişkinler sana mesaj gönderemez.",
        guardianEmail: "Ebeveyn e-postası",
        role: "Sen kimsin?",
        roleAthlete: "Sporcu",
        roleCoach: "Antrenör",
        roleGymOwner: "Salon İşletmecisi",
        roleOrganizer: "Organizatör",
        roleFan: "Hayran",
        betaCode: "Beta erişim kodu",
        betaCodeHint: "Varsa — Kurucu ayrıcalıkları açar",
        accept: {
          lead: "",
          terms: "Kullanım şartlarını",
          mid1: ", ",
          privacy: "gizlilik politikasını",
          mid2: " ve ",
          rules: "topluluk kurallarını",
          tail: " okudum, kabul ediyorum.",
        },
        submit: "Hesap Oluştur",
        genericError: "Bir hata oluştu",
      },
    },
  },
};
