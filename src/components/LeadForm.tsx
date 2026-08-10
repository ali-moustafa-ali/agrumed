"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { getProduct } from "@/lib/products";
import { IconCheck } from "./icons";

const field =
  "w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500";

export type LeadFormMode = "contact" | "quote";

/**
 * نموذج التقاط بيانات العميل (Lead).
 * واجهة فقط — جاهز للربط لاحقاً بنظام الـ CRM عبر نقطة نهاية واحدة.
 */
export default function LeadForm({ mode = "contact" }: { mode?: LeadFormMode }) {
  const { lines, clear } = useCart();
  const [sent, setSent] = useState(false);
  const [ref, setRef] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const payload = {
      ...data,
      source: mode,
      items: lines.map((l) => ({ ...l, name: getProduct(l.slug)?.name })),
    };
    // نقطة الربط المستقبلية مع الـ CRM
    console.info("[AGROMEED lead]", payload);
    setRef(`AGM-${String(Math.floor(Math.random() * 9000) + 1000)}`);
    setSent(true);
    if (mode === "quote") clear();
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white">
          <IconCheck className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-xl font-black text-brand-800">تم استلام طلبك بنجاح</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          رقم الطلب المرجعي: <span className="nums font-extrabold">{ref}</span>
          <br />
          سيتواصل معك فريق المبيعات خلال يوم عمل واحد.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-5 rounded-full border-2 border-brand-600 px-6 py-2.5 text-sm font-extrabold text-brand-700 hover:bg-white"
        >
          إرسال طلب آخر
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink-700">الاسم بالكامل *</label>
          <input name="name" required className={field} placeholder="محمد أحمد" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink-700">رقم الهاتف *</label>
          <input
            name="phone"
            required
            inputMode="tel"
            className={field}
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink-700">البريد الإلكتروني</label>
          <input name="email" type="email" className={field} placeholder="you@company.com" dir="ltr" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink-700">اسم الشركة / المزرعة</label>
          <input name="company" className={field} placeholder="مزرعة النيل" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink-700">المحافظة</label>
          <input name="governorate" className={field} placeholder="البحر الأحمر" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink-700">صفة العميل</label>
          <select name="type" className={field} defaultValue="مزارع">
            <option>مزارع</option>
            <option>موزع / تاجر</option>
            <option>شركة استصلاح زراعي</option>
            <option>مصنع أسمدة (خامات)</option>
            <option>تصنيع للغير (Private Label)</option>
            <option>أخرى</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-ink-700">
          {mode === "quote" ? "ملاحظات على الطلب" : "رسالتك"}
        </label>
        <textarea
          name="message"
          rows={4}
          className={field}
          placeholder={
            mode === "quote"
              ? "المحصول، المساحة، الكميات التقديرية، موعد التوريد المطلوب…"
              : "اكتب استفسارك أو تفاصيل مشكلة الحقل…"
          }
        />
      </div>

      {mode === "quote" && lines.length > 0 && (
        <div className="rounded-xl bg-sand-50 p-4 text-sm">
          <p className="mb-2 font-bold text-ink-700">
            المنتجات المرفقة بالطلب (<span className="nums">{lines.length}</span>)
          </p>
          <ul className="space-y-1 text-ink-500">
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}`}>
                • {getProduct(l.slug)?.name} — {l.size} × <span className="nums">{l.qty}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-500">
        <input type="checkbox" required className="mt-0.5 accent-brand-600" />
        أوافق على أن يتواصل معي فريق أجروميد بخصوص هذا الطلب.
      </label>

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 py-4 font-extrabold text-white transition hover:bg-brand-700"
      >
        {mode === "quote" ? "إرسال طلب عرض السعر" : "إرسال الرسالة"}
      </button>
    </form>
  );
}
