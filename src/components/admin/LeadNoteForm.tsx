"use client";

import { useActionState, useEffect, useRef } from "react";
import { addLeadNote, type FormState } from "@/lib/actions/leads";

export default function LeadNoteForm({ leadId }: { leadId: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addLeadNote, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="id" value={leadId} />
      <textarea
        name="body"
        rows={2}
        placeholder="سجّل ما دار في المكالمة أو الزيارة…"
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ…" : "إضافة متابعة"}
        </button>
        {state.error && <span className="text-xs font-semibold text-rose-600">{state.error}</span>}
      </div>
    </form>
  );
}
