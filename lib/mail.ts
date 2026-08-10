import "server-only";
import prisma from "./prisma";

/**
 * Tek çıkışlı e-posta katmanı.
 *
 * Sağlayıcı bağımsızdır: `RESEND_API_KEY` tanımlıysa Resend üzerinden
 * gönderilir, değilse gönderim denemesi denetim kaydına yazılır ve konsola
 * düşer. Böylece geliştirme ve Beta 0 aşamasında (henüz sağlayıcı seçilmemişken)
 * ebeveyn onayı gibi akışlar admin panelinden elle tamamlanabilir.
 */

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.MAIL_FROM ?? "FIGHTNET <noreply@fightnet.app>";

export const mailConfigured = Boolean(RESEND_KEY);

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Denetim kaydında görünen etiket: GUARDIAN_CONSENT, WAITLIST_INVITE … */
  kind: string;
  meta?: Record<string, unknown>;
}

export async function sendMail(input: MailInput): Promise<boolean> {
  let delivered = false;
  let error: string | null = null;

  if (RESEND_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });
      delivered = res.ok;
      if (!res.ok) error = `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300);
    } catch (e) {
      error = e instanceof Error ? e.message : "bilinmeyen hata";
    }
  } else if (process.env.NODE_ENV !== "production") {
    console.info(`[mail:${input.kind}] → ${input.to}\n${input.subject}\n${input.text}\n`);
  }

  // Gönderim denemesi her hâlükârda izlenebilir olmalı (§11.4 kullanıcı hakları)
  prisma.auditLog
    .create({
      data: {
        action: `MAIL_${input.kind}`,
        targetType: "EMAIL",
        targetId: input.to,
        meta: { subject: input.subject, delivered, provider: RESEND_KEY ? "resend" : "none", error, ...input.meta } as never,
      },
    })
    .catch(() => {});

  return delivered;
}

/** Basit, markaya uygun e-posta kabuğu — harici CSS yok, istemci uyumlu */
export function mailLayout(title: string, bodyHtml: string, cta?: { url: string; label: string }): string {
  return `<!doctype html><html lang="tr"><body style="margin:0;background:#f6f6f7;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#17181d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e3e6">
<tr><td style="background:linear-gradient(135deg,#f83b3b,#bd1414);padding:20px 24px">
<span style="color:#fff;font-weight:900;font-size:20px;letter-spacing:-.5px">FIGHTNET</span>
</td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 12px;font-size:20px;font-weight:800">${title}</h1>
${bodyHtml}
${
  cta
    ? `<p style="margin:24px 0 0"><a href="${cta.url}" style="display:inline-block;background:#e11d1d;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:12px">${cta.label}</a></p>
<p style="margin:16px 0 0;font-size:12px;color:#6f727e;word-break:break-all">Bağlantı çalışmazsa: ${cta.url}</p>`
    : ""
}
</td></tr>
<tr><td style="padding:16px 24px;background:#f6f6f7;font-size:12px;color:#6f727e">
FIGHTNET — DACH'ın bağımsız dövüş sporu platformu · Federasyondan bağımsız
</td></tr>
</table></td></tr></table></body></html>`;
}
