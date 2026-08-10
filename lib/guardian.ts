import "server-only";
import { randomBytes } from "node:crypto";
import prisma from "./prisma";
import { sendMail, mailLayout } from "./mail";
import { absoluteUrl } from "./utils";

/**
 * §11.1 Kapı 1 — Çocuk koruması.
 *
 * 18 yaş altı üyeler platformda olabilir, ancak veli onayı gelene kadar
 * hesap kısıtlıdır: yetişkinlerle doğrudan iletişim, sparring eşleşmesi ve
 * müsabaka kaydı kapalıdır. Bu bir lansman engelleyicisidir, dilek değildir.
 */

const TOKEN_TTL_DAYS = 14;

/** Reşit olmayan kullanıcı, veli onayı gerektiren işlemleri yapamaz */
export function isRestrictedMinor(u: { isMinor: boolean; guardianConsent: boolean }): boolean {
  return u.isMinor && !u.guardianConsent;
}

/**
 * §11.1 — "Doğrulanmamış kullanıcılardan reşit olmayanlara DM yok" ve
 * "Yetişkinlerle doğrudan iletişim izin olmadan yok".
 *
 * @returns null → izin var; string → kullanıcıya gösterilecek gerekçe
 */
export function messageBlockReason(
  sender: { id: string; isMinor: boolean; guardianConsent: boolean; verification: string; role: string },
  recipient: { id: string; isMinor: boolean; guardianConsent: boolean },
): string | null {
  if (sender.id === recipient.id) return "Kendine mesaj gönderemezsin.";

  // Moderasyon ekibi her zaman ulaşabilir (güvenlik ihbarı akışı)
  if (sender.role === "ADMIN" || sender.role === "MODERATOR") return null;

  if (recipient.isMinor) {
    if (sender.verification === "LEVEL_0") {
      return "18 yaş altı üyelere yalnızca kimliği doğrulanmış kullanıcılar mesaj gönderebilir.";
    }
    if (!sender.isMinor && !recipient.guardianConsent) {
      return "Bu üye 18 yaşın altında ve velisinin onayı henüz alınmadı. Yetişkinler onay olmadan mesaj gönderemez.";
    }
  }

  if (isRestrictedMinor(sender)) {
    return "Hesabın 18 yaş altı olarak işaretli. Mesajlaşmayı açmak için velinin onayı gerekiyor.";
  }

  return null;
}

/**
 * Veliye onay bağlantısı gönderir ve tek kullanımlık jetonu kaydeder.
 * Aynı kullanıcı için tekrar çağrılırsa önceki jeton geçersizleşir.
 */
export async function requestGuardianConsent(userId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, isMinor: true, guardianEmail: true, guardianConsent: true },
  });

  if (!user) return { ok: false, error: "Kullanıcı bulunamadı" };
  if (!user.isMinor) return { ok: false, error: "Bu hesap için veli onayı gerekmiyor" };
  if (user.guardianConsent) return { ok: false, error: "Veli onayı zaten alınmış" };
  if (!user.guardianEmail) return { ok: false, error: "Önce veli e-posta adresini kaydet" };

  const token = randomBytes(32).toString("base64url");
  await prisma.user.update({
    where: { id: userId },
    data: {
      guardianToken: token,
      guardianTokenExp: new Date(Date.now() + TOKEN_TTL_DAYS * 864e5),
    },
  });

  const url = absoluteUrl(`/ebeveyn-onayi?token=${token}`);
  await sendMail({
    to: user.guardianEmail,
    kind: "GUARDIAN_CONSENT",
    subject: `${user.name} için veli onayı — FIGHTNET`,
    text:
      `${user.name} FIGHTNET'te bir hesap oluşturdu ve sizi velisi olarak belirtti.\n\n` +
      `FIGHTNET, Almanya, Avusturya ve İsviçre'deki dövüş sporcuları için bir platformdur.\n` +
      `Onayınız gelene kadar hesap kısıtlıdır: yetişkinler mesaj gönderemez, sparring eşleşmesi ve müsabaka kaydı kapalıdır.\n\n` +
      `Onaylamak için: ${url}\n\nBağlantı ${TOKEN_TTL_DAYS} gün geçerlidir. Bu talebi tanımıyorsanız bu e-postayı yok sayabilirsiniz.`,
    html: mailLayout(
      `${user.name} için veli onayı`,
      `<p style="margin:0 0 12px;line-height:1.6">${user.name}, FIGHTNET'te bir hesap oluşturdu ve sizi velisi olarak belirtti.</p>
<p style="margin:0 0 12px;line-height:1.6">FIGHTNET, DACH bölgesindeki dövüş sporcuları için bağımsız bir platformdur. <strong>Onayınız gelene kadar hesap kısıtlıdır:</strong> yetişkinler doğrudan mesaj gönderemez, sparring eşleşmesi ve müsabaka kaydı kapalıdır.</p>
<p style="margin:0;line-height:1.6;font-size:14px;color:#6f727e">Onayı istediğiniz zaman geri çekebilirsiniz — bunun için <a href="${absoluteUrl("/iletisim")}" style="color:#e11d1d">bize yazmanız</a> yeterli.</p>`,
      { url, label: "Onayı ver" },
    ),
    meta: { userId },
  });

  return { ok: true };
}

/** Onay bağlantısını doğrular ve hesabı serbest bırakır */
export async function confirmGuardianConsent(token: string): Promise<{ ok: boolean; name?: string; error?: string }> {
  if (!token || token.length < 20) return { ok: false, error: "Geçersiz bağlantı" };

  const user = await prisma.user.findFirst({
    where: { guardianToken: token },
    select: { id: true, name: true, guardianTokenExp: true, guardianConsent: true },
  });

  if (!user) return { ok: false, error: "Bu bağlantı geçersiz veya daha önce kullanılmış." };
  if (user.guardianConsent) return { ok: true, name: user.name };
  if (!user.guardianTokenExp || user.guardianTokenExp < new Date()) {
    return { ok: false, error: "Bağlantının süresi dolmuş. Üye panelinden yeni bir onay bağlantısı istenebilir." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      guardianConsent: true,
      guardianConsentAt: new Date(),
      guardianToken: null,
      guardianTokenExp: null,
    },
  });

  await prisma.auditLog
    .create({
      data: { userId: user.id, action: "GUARDIAN_CONSENT_GRANTED", targetType: "USER", targetId: user.id },
    })
    .catch(() => {});

  return { ok: true, name: user.name };
}
