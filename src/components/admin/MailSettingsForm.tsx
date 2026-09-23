"use client";

import { useActionState } from "react";
import { saveMailSettings, sendTestEmail, type FormState } from "@/lib/actions/settings";
import type { AppSettings } from "@/lib/settings";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500";

export default function MailSettingsForm({
  settings,
  canTest,
  defaultTestTo,
}: {
  settings: AppSettings;
  canTest: boolean;
  defaultTestTo: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveMailSettings, {});
  const [test, testAction, testing] = useActionState<FormState, FormData>(sendTestEmail, {});

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">
            بريد فريق المبيعات
          </span>
          <input
            name="salesEmails"
            defaultValue={settings.salesEmails.join(", ")}
            placeholder="sales@agromeed.com, info@agromeed.com"
            dir="ltr"
            className={input}
          />
          <span className="mt-1 block text-xs text-slate-400">
            افصل بين أكثر من بريد بفاصلة — يصلهم إشعار فور ورود أي طلب
          </span>
        </label>

        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="notifySales"
            defaultChecked={settings.notifySales}
            className="h-4 w-4 accent-emerald-600"
          />
          إرسال إشعار للمبيعات عند ورود طلب
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="notifyCustomer"
            defaultChecked={settings.notifyCustomer}
            className="h-4 w-4 accent-emerald-600"
          />
          إرسال تأكيد للعميل برقم طلبه
        </label>

        {state.error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700">
            {state.ok}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-slate-900 py-3 font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
        </button>
      </form>

      <form action={testAction} className="border-t border-slate-100 pt-4">
        <span className="mb-1.5 block text-sm font-bold text-slate-700">إرسال رسالة اختبار</span>
        <div className="flex gap-2">
          <input name="to" defaultValue={defaultTestTo} dir="ltr" className={input} />
          <button
            type="submit"
            disabled={testing || !canTest}
            title={canTest ? undefined : "اضبط SMTP أولاً"}
            className="shrink-0 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-slate-400 disabled:opacity-50"
          >
            {testing ? "…" : "إرسال"}
          </button>
        </div>
        {test.error && <p className="mt-2 text-xs font-semibold text-rose-600">{test.error}</p>}
        {test.ok && <p className="mt-2 text-xs font-semibold text-emerald-600">{test.ok}</p>}
      </form>
    </div>
  );
}
