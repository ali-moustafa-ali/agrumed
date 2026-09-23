import type { LeadItem } from "@/db/schema";
import { site } from "@/lib/site";

const BRAND = "#1e7a34";
const GOLD = "#f5b301";
const INK = "#10241a";
const MUTED = "#5b6773";
const RULE = "#e4e8ec";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f5f6f7;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid ${RULE};border-radius:14px;overflow:hidden;">
  <tr><td style="background:${BRAND};padding:20px 24px;">
    <div style="font-size:20px;font-weight:700;color:#fff;">${esc(site.name)}</div>
    <div style="font-size:12px;color:#bfe0c6;margin-top:3px;">${esc(site.legalName)}</div>
  </td></tr>
  <tr><td style="height:3px;background:${GOLD};"></td></tr>
  <tr><td style="padding:24px;">${body}</td></tr>
  <tr><td style="background:#fafbfb;border-top:1px solid ${RULE};padding:16px 24px;font-size:12px;color:${MUTED};">
    <div>${esc(site.legalName)}</div>
    <div style="margin-top:4px;">
      <span dir="ltr">${esc(site.phone)}</span> ·
      <a href="mailto:${esc(site.email)}" style="color:${BRAND};">${esc(site.email)}</a> ·
      <a href="https://agromeed.com" style="color:${BRAND};">agromeed.com</a>
    </div>
  </td></tr>
</table>
</body></html>`;
}

function itemsTable(items: LeadItem[]) {
  if (items.length === 0) return "";
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:9px 12px;border-bottom:1px solid ${RULE};">${esc(i.name || i.slug)}</td>
        <td style="padding:9px 12px;border-bottom:1px solid ${RULE};color:${MUTED};">${esc(i.size)}</td>
        <td style="padding:9px 12px;border-bottom:1px solid ${RULE};text-align:left;font-weight:700;">${i.qty}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="margin-top:8px;border:1px solid ${RULE};border-radius:8px;border-collapse:separate;border-spacing:0;font-size:14px;">
    <tr style="background:#fafbfb;">
      <th align="right" style="padding:9px 12px;font-size:12px;color:${MUTED};">المنتج</th>
      <th align="right" style="padding:9px 12px;font-size:12px;color:${MUTED};">العبوة</th>
      <th align="left" style="padding:9px 12px;font-size:12px;color:${MUTED};">الكمية</th>
    </tr>${rows}</table>`;
}

function row(label: string, value?: string | null, ltr = false) {
  if (!value) return "";
  return `<tr>
    <td style="padding:7px 0;color:${MUTED};font-size:14px;width:130px;">${esc(label)}</td>
    <td style="padding:7px 0;font-size:14px;font-weight:600;"${ltr ? ' dir="ltr"' : ""}>${esc(value)}</td>
  </tr>`;
}

export type LeadMailData = {
  ref: string;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  governorate?: string | null;
  customerType?: string | null;
  message?: string | null;
  source: string;
  items: LeadItem[];
};

/** إشعار لفريق المبيعات — الغرض منه أن يتصرّف المندوب فوراً. */
export function salesNotification(d: LeadMailData) {
  const kind = d.source === "quote" ? "طلب عرض سعر" : "رسالة تواصل";
  const wa = d.phone.replace(/[^0-9]/g, "").replace(/^0/, "20");

  const body = `
    <div style="font-size:12px;font-weight:700;color:${GOLD};letter-spacing:.04em;">${esc(kind)} جديد</div>
    <h1 style="margin:6px 0 2px;font-size:22px;">${esc(d.name)}</h1>
    <div style="font-size:13px;color:${MUTED};">رقم مرجعي: <strong>${esc(d.ref)}</strong></div>

    <table role="presentation" width="100%" style="margin-top:18px;border-top:1px solid ${RULE};">
      ${row("الهاتف", d.phone, true)}
      ${row("البريد", d.email, true)}
      ${row("الشركة / المزرعة", d.company)}
      ${row("المحافظة", d.governorate)}
      ${row("صفة العميل", d.customerType)}
    </table>

    ${
      d.message
        ? `<div style="margin-top:18px;">
             <div style="font-size:12px;color:${MUTED};margin-bottom:6px;">رسالة العميل</div>
             <div style="background:#fafbfb;border-right:3px solid ${BRAND};border-radius:0 8px 8px 0;padding:12px 14px;font-size:14px;line-height:1.7;">${esc(d.message).replace(/\n/g, "<br>")}</div>
           </div>`
        : ""
    }

    ${d.items.length ? `<div style="margin-top:18px;"><div style="font-size:12px;color:${MUTED};">المنتجات المطلوبة</div>${itemsTable(d.items)}</div>` : ""}

    <table role="presentation" style="margin-top:22px;" cellpadding="0" cellspacing="0"><tr>
      <td style="padding-left:8px;"><a href="tel:${esc(d.phone)}"
        style="display:inline-block;background:${INK};color:#fff;text-decoration:none;padding:11px 20px;border-radius:9px;font-size:14px;font-weight:700;">اتصال</a></td>
      <td style="padding-left:8px;"><a href="https://wa.me/${wa}"
        style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:11px 20px;border-radius:9px;font-size:14px;font-weight:700;">واتساب</a></td>
      <td><a href="https://agromeed.com/admin/leads"
        style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:11px 20px;border-radius:9px;font-size:14px;font-weight:700;">فتح في اللوحة</a></td>
    </tr></table>`;

  return {
    subject: `${kind} — ${d.name}${d.governorate ? ` (${d.governorate})` : ""} · ${d.ref}`,
    html: shell(`${kind} جديد`, body),
  };
}

/** تأكيد للعميل — يطمئنه أن الطلب وصل ويعطيه رقماً مرجعياً. */
export function customerConfirmation(d: LeadMailData) {
  const body = `
    <h1 style="margin:0 0 10px;font-size:21px;">شكراً لتواصلك معنا</h1>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.8;">
      أهلاً ${esc(d.name)}، استلمنا ${d.source === "quote" ? "طلب عرض السعر" : "رسالتك"} بنجاح.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.8;color:${MUTED}">
      سيتواصل معك فريق المبيعات خلال يوم عمل واحد على الرقم
      <span dir="ltr" style="font-weight:700;color:${INK};">${esc(d.phone)}</span>.
    </p>

    <div style="margin:20px 0;background:#f0f9f1;border:1px solid #bbe1c1;border-radius:10px;padding:14px 16px;">
      <div style="font-size:12px;color:${MUTED};">رقم طلبك المرجعي</div>
      <div style="font-size:24px;font-weight:700;color:${BRAND};margin-top:2px;letter-spacing:.02em;">${esc(d.ref)}</div>
      <div style="font-size:12px;color:${MUTED};margin-top:6px;">اذكر هذا الرقم عند التواصل معنا لمتابعة طلبك.</div>
    </div>

    ${d.items.length ? `<div><div style="font-size:12px;color:${MUTED};">ملخص طلبك</div>${itemsTable(d.items)}</div>` : ""}

    <p style="margin:20px 0 0;font-size:13px;color:${MUTED};line-height:1.8;">
      لو حابب تستعجل الرد، تقدر تتصل بنا مباشرةً على
      <a href="tel:${esc(site.phoneDial)}" dir="ltr" style="color:${BRAND};font-weight:700;">${esc(site.phone)}</a>
      خلال ${esc(site.hours)}.
    </p>`;

  return {
    subject: `استلمنا طلبك — ${d.ref} | ${site.name}`,
    html: shell("تأكيد استلام الطلب", body),
  };
}
