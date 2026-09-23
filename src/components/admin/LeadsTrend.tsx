/**
 * مخطط عمودي بسيط للطلبات اليومية — بلا مكتبات خارجية.
 * السلسلة تصل مكتملة من الخادم (بما فيها الأيام الصفرية).
 */
export default function LeadsTrend({ days }: { days: { day: string; n: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.n));
  const total = days.reduce((s, d) => s + d.n, 0);

  if (days.length === 0 || total === 0) {
    return (
      <div className="grid h-40 place-items-center rounded-xl bg-slate-50 text-sm text-slate-400">
        لا توجد طلبات في آخر 30 يوماً
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-40 items-end gap-[3px]" role="img" aria-label={`${total} طلب في آخر 30 يوماً`}>
        {days.map((d) => (
          <div key={d.day} className="group relative flex-1">
            <div
              className="w-full rounded-t-sm bg-emerald-500/80 transition group-hover:bg-emerald-600"
              style={{ height: `${Math.max(3, (d.n / max) * 150)}px` }}
            />
            <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-bold text-white group-hover:block">
              {d.n} · {new Date(d.day).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        <span>{new Date(days[0].day).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}</span>
        <span className="font-bold text-slate-600 tabular-nums">{total} طلب</span>
        <span>اليوم</span>
      </div>
    </div>
  );
}
