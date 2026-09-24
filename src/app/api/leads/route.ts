import { NextResponse } from "next/server";
import { after } from "next/server";
import { createLead } from "@/lib/actions/leads";
import { getPublishedProducts } from "@/lib/queries";
import { sendMail } from "@/lib/mail";
import { customerConfirmation, salesNotification, type LeadMailData } from "@/lib/mail-templates";
import { getSettings } from "@/lib/settings";
import { clientIp, hit, isEmail } from "@/lib/rate-limit";

const WINDOW = 10 * 60 * 1000;
const PER_IP = 6;
// سقف عام يحدّ الضرر حين يدور المهاجم بين عناوين كثيرة
const GLOBAL = 120;

function clean(v: unknown, max = 500) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const perIp = hit(`leads:${ip}`, PER_IP, WINDOW);
  const overall = hit("leads:all", GLOBAL, WINDOW);

  if (perIp.limited || overall.limited) {
    return NextResponse.json(
      { ok: false, error: "عدد كبير من المحاولات. برجاء المحاولة بعد قليل." },
      { status: 429, headers: { "Retry-After": String(perIp.retryAfter || overall.retryAfter) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح." }, { status: 400 });
  }

  // حقل فخ للبوتات — يُملأ آلياً فقط
  if (clean(body.website)) {
    return NextResponse.json({ ok: true, ref: "AGM-0000" });
  }

  const name = clean(body.name, 160);
  const phone = clean(body.phone, 40);
  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "الاسم مطلوب." }, { status: 400 });
  }
  if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
    return NextResponse.json({ ok: false, error: "رقم الهاتف غير صالح." }, { status: 400 });
  }

  // نتحقق من المنتجات مقابل الكتالوج فلا نثق بما يرسله المتصفح
  const raw = Array.isArray(body.items) ? body.items.slice(0, 60) : [];
  let items: { slug: string; name: string; size: string; qty: number }[] = [];
  if (raw.length) {
    const catalog = new Map((await getPublishedProducts()).map((p) => [p.slug, p]));
    items = raw.flatMap((r) => {
      const rec = r as Record<string, unknown>;
      const slug = clean(rec.slug, 120);
      const product = catalog.get(slug);
      if (!product) return [];
      const qty = Math.min(9999, Math.max(1, Math.floor(Number(rec.qty) || 1)));
      const size = clean(rec.size, 60);
      return [{
        slug,
        name: product.name,
        size: product.sizes.includes(size) ? size : (product.sizes[0] ?? ""),
        qty,
      }];
    });
  }

  const rawEmail = clean(body.email, 160);
  // بريد غير صالح لا يُستخدم مستقبِلاً — وإلا صار المسار مُرحِّل بريد مفتوح
  const email = rawEmail && isEmail(rawEmail) ? rawEmail : null;
  const source = clean(body.source) === "quote" ? "quote" : "contact";

  const lead = await createLead({
    name,
    phone,
    email,
    company: clean(body.company, 200) || null,
    governorate: clean(body.governorate, 80) || null,
    customerType: clean(body.type, 80) || null,
    message: clean(body.message, 4000) || null,
    source,
    items,
  });

  const mailData: LeadMailData = {
    ref: lead.ref,
    name,
    phone,
    email,
    company: clean(body.company, 200) || null,
    governorate: clean(body.governorate, 80) || null,
    customerType: clean(body.type, 80) || null,
    message: clean(body.message, 4000) || null,
    source,
    items,
  };

  // البريد يُرسل بعد الرد: العميل لا ينتظر SMTP، وفشل الإرسال لا يُفقد الطلب
  after(async () => {
    const cfg = await getSettings();
    if (cfg.notifySales && cfg.salesEmails.length) {
      const m = salesNotification(mailData);
      await sendMail({ to: cfg.salesEmails, subject: m.subject, html: m.html, replyTo: email ?? undefined });
    }
    if (cfg.notifyCustomer && email) {
      const m = customerConfirmation(mailData);
      await sendMail({ to: email, subject: m.subject, html: m.html });
    }
  });

  return NextResponse.json({ ok: true, ref: lead.ref });
}
