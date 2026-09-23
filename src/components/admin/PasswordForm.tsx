"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type FormState } from "@/lib/actions/settings";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500";

export default function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-slate-700">كلمة المرور الحالية</span>
        <input name="current" type="password" required autoComplete="current-password" dir="ltr" className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-slate-700">كلمة المرور الجديدة</span>
        <input name="next" type="password" required minLength={10} autoComplete="new-password" dir="ltr" className={input} />
        <span className="mt-1 block text-xs text-slate-400">10 أحرف على الأقل</span>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-slate-700">تأكيد كلمة المرور</span>
        <input name="confirm" type="password" required minLength={10} autoComplete="new-password" dir="ltr" className={input} />
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
        {pending ? "جارٍ الحفظ…" : "تغيير كلمة المرور"}
      </button>
    </form>
  );
}
