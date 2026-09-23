import Link from "next/link";
import { adminListLeads } from "@/lib/queries";
import { requirePermission } from "@/lib/auth/dal";
import { LEAD_STAGES, SOURCE_LABEL, STAGE_LABEL, STAGE_TONE, egp, isStage, timeAgo } from "@/lib/crm";
import { Card, Empty, PageHead } from "@/components/admin/ui";
import { IcSearch } from "@/components/admin/icons";

export const metadata = { title: "العملاء والطلبات" };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string; source?: string }>;
}) {
  await requirePermission("leads:write");
  const sp = await searchParams;
  const rows = await adminListLeads({ q: sp.q, stage: sp.stage, source: sp.source });

  const stageTabs = [{ id: "all", label: "الكل" }, ...LEAD_STAGES.map((s) => ({ id: s, label: STAGE_LABEL[s] }))];
  const active = sp.stage ?? "all";

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    if (sp.q) p.set("q", sp.q);
    if (sp.source) p.set("source", sp.source);
    if (sp.stage) p.set("stage", sp.stage);
    for (const [k, v] of Object.entries(over)) {
      if (v === "all") p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `/admin/leads?${s}` : "/admin/leads";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead
        title="العملاء والطلبات"
        sub={`${rows.length} سجل — كل من تواصل عبر الموقع أو طلب عرض سعر`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
          {stageTabs.map((t) => (
            <Link
              key={t.id}
              href={qs({ stage: t.id })}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                active === t.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <form className="mr-auto flex items-center gap-2" action="/admin/leads">
          {sp.stage && <input type="hidden" name="stage" value={sp.stage} />}
          {sp.source && <input type="hidden" name="source" value={sp.source} />}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 focus-within:border-emerald-500">
            <IcSearch className="h-4 w-4 text-slate-400" />
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="ابحث بالاسم أو الهاتف أو الرقم المرجعي…"
              className="w-56 bg-transparent text-sm outline-none"
            />
          </div>
        </form>
      </div>

      {rows.length === 0 ? (
        <Empty
          title="لا توجد نتائج"
          hint="جرّب مرشّحاً مختلفاً، أو انتظر أول طلب من الموقع."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-right font-bold">المرجع</th>
                  <th className="px-4 py-3 text-right font-bold">العميل</th>
                  <th className="px-4 py-3 text-right font-bold">المحافظة</th>
                  <th className="px-4 py-3 text-right font-bold">المصدر</th>
                  <th className="px-4 py-3 text-right font-bold">المرحلة</th>
                  <th className="px-4 py-3 text-left font-bold">القيمة</th>
                  <th className="px-4 py-3 text-left font-bold">الورود</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((l) => (
                  <tr key={l.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="font-bold text-emerald-700 tabular-nums hover:underline"
                      >
                        {l.ref}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${l.id}`} className="block">
                        <span className="block font-bold text-slate-900">{l.name}</span>
                        <span className="block text-xs text-slate-500" dir="ltr">
                          {l.phone}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{l.governorate || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">
                        {SOURCE_LABEL[l.source] ?? l.source}
                        {l.items.length > 0 && (
                          <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-bold tabular-nums">
                            {l.items.length}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ${
                          isStage(l.stage) ? STAGE_TONE[l.stage] : "bg-slate-50 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {isStage(l.stage) ? STAGE_LABEL[l.stage] : l.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left font-bold text-slate-900 tabular-nums">
                      {egp(l.valueMinor)}
                    </td>
                    <td className="px-4 py-3 text-left text-xs whitespace-nowrap text-slate-400">
                      {timeAgo(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
