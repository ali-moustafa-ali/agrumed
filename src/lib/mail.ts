import "server-only";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * إرسال البريد التشغيلي عبر SMTP.
 * الإعدادات كلها من متغيرات البيئة، وإن لم تُضبط يُسجَّل البريد في اللوجز
 * بدل أن يفشل الطلب — فلا يتعطّل استقبال العملاء بسبب إعداد بريد ناقص.
 */

let cached: Transporter | null = null;

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transport() {
  if (cached) return cached;
  const port = Number(process.env.SMTP_PORT ?? 465);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 يستخدم SSL مباشرةً، و587 يبدأ عادياً ثم يرقّي إلى TLS
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return cached;
}

export type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendMail(mail: Mail) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";
  const to = Array.isArray(mail.to) ? mail.to.filter(Boolean) : [mail.to].filter(Boolean);
  if (to.length === 0) return { sent: false, reason: "لا يوجد مستقبِل" };

  if (!mailConfigured()) {
    console.warn(`[بريد غير مُفعَّل] إلى ${to.join(", ")} — ${mail.subject}`);
    return { sent: false, reason: "SMTP غير مضبوط" };
  }

  try {
    await transport().sendMail({
      from: `"أجروميد" <${from}>`,
      to: to.join(", "),
      subject: mail.subject,
      html: mail.html,
      replyTo: mail.replyTo,
    });
    return { sent: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[فشل إرسال بريد] ${mail.subject}: ${reason}`);
    return { sent: false, reason };
  }
}

/** يتحقق من أن بيانات SMTP صحيحة فعلاً — يُستخدم في شاشة الإعدادات. */
export async function verifyMail() {
  if (!mailConfigured()) return { ok: false, error: "SMTP غير مضبوط في متغيرات البيئة" };
  try {
    await transport().verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
