"use client";

import { useTransition } from "react";
import { setLeadStage } from "@/lib/actions/leads";
import { LEAD_STAGES, STAGE_LABEL, type LeadStage } from "@/lib/crm";

export default function StageControl({ leadId, stage }: { leadId: number; stage: string }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {LEAD_STAGES.map((s: LeadStage) => {
        const active = s === stage;
        return (
          <button
            key={s}
            type="button"
            disabled={pending || active}
            onClick={() => start(() => void setLeadStage(leadId, s))}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-default ${
              active
                ? s === "won"
                  ? "bg-emerald-600 text-white"
                  : s === "lost"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 disabled:opacity-50"
            }`}
          >
            {STAGE_LABEL[s]}
          </button>
        );
      })}
    </div>
  );
}
