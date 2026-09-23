import Link from "next/link";

export function PageHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${className}`}>{children}</div>
  );
}

export function Stat({
  label,
  value,
  hint,
  trend,
  tone = "slate",
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: number | null;
  tone?: "slate" | "emerald" | "amber" | "sky";
  href?: string;
}) {
  const tones = {
    slate: "text-slate-900",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    sky: "text-sky-600",
  } as const;

  const body = (
    <>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black tabular-nums ${tones[tone]}`}>{value}</p>
      <div className="mt-1.5 flex items-center gap-2">
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
        {trend !== null && trend !== undefined && Number.isFinite(trend) && (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
              trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </>
  );

  const cls =
    "block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300";
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
      <p className="font-bold text-slate-700">{title}</p>
      {hint && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
