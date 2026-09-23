"use client";

import { useActionState } from "react";
import { setLeadValue, type FormState } from "@/lib/actions/leads";

export default function LeadValueForm({
  leadId,
  value,
}: {
  leadId: number;
  value: number | null;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(setLeadValue, {});

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={leadId} />
      <div className="flex gap-2">
        <input
          name="value"
          type="number"
          min={0}
          step="1"
          defaultValue={value === null ? "" : value / 100}
          placeholder="القيمة بالجنيه"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm tabular-nums outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "…" : "حفظ"}
        </button>
      </div>
      {state.error && <p className="text-xs font-semibold text-rose-600">{state.error}</p>}
      {state.ok && <p className="text-xs font-semibold text-emerald-600">{state.ok}</p>}
    </form>
  );
}
