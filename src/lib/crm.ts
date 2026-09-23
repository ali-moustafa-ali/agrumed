import { LEAD_STAGES, type LeadStage } from "@/db/schema";

export const STAGE_LABEL: Record<LeadStage, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  quoted: "أُرسل عرض سعر",
  won: "تم التعاقد",
  lost: "خسارة",
};

/** ألوان المراحل — نسق واحد يُستخدم في الجدول واللوحة معاً. */
export const STAGE_TONE: Record<LeadStage, string> = {
  new: "bg-sky-50 text-sky-700 ring-sky-200",
  contacted: "bg-amber-50 text-amber-700 ring-amber-200",
  quoted: "bg-violet-50 text-violet-700 ring-violet-200",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  lost: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const SOURCE_LABEL: Record<string, string> = {
  contact: "نموذج تواصل",
  quote: "طلب عرض سعر",
};

export { LEAD_STAGES };
export type { LeadStage };

export function isStage(v: string): v is LeadStage {
  return (LEAD_STAGES as readonly string[]).includes(v);
}

/** تنسيق مبلغ مخزَّن بالقرش إلى جنيه. */
export function egp(minor: number | null | undefined) {
  if (minor === null || minor === undefined) return "—";
  return (minor / 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return "الآن";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  const months = Math.floor(days / 30);
  if (months < 12) return `منذ ${months} شهر`;
  return `منذ ${Math.floor(months / 12)} سنة`;
}

export function fmtDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}
