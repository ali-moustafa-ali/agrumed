import Link from "next/link";
import { getKpis, getRecentAudit, getRecentLeads } from "@/lib/queries";
import { requireUser } from "@/lib/auth/dal";
import { STAGE_LABEL, STAGE_TONE, egp, isStage, timeAgo } from "@/lib/crm";
import { Card, Empty, PageHead, Stat } from "@/components/admin/ui";
import { IcArrow } from "@/components/admin/icons";
import LeadsTrend from "@/components/admin/LeadsTrend";

export const metadata = { title: "نظرة عامة" };

export default async function AdminHome() {
  const user = await requireUser();
  const [k, recent, audit] = await Promise.all([getKpis(), getRecentLeads(7), getRecentAudit(8)]);

  const trend =
    k.leadsPrev30d > 0
      ? Math.round(((k.leads30d - k.leadsPrev30d) / k.leadsPrev30d) * 100)
      : null;

  const conversion = k.leadsTotal > 0 ? Math.round((k.wonCount / k.leadsTotal) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead
        title={`أهلاً، ${user.name.split(" ")[0]}`}
        sub="ملخص نشاط المتجر وخط المبيعات"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="عملاء جدد لم يُتواصل معهم"
          value={k.leadsNew}
          hint="بانتظار المتابعة"
          tone={k.leadsNew > 0 ? "amber" : "slate"}
          href="/admin/leads?stage=new"
        />
        <Stat
          label="طلبات آخر 30 يوماً"
          value={k.leads30d}
          hint={`مقابل ${k.leadsPrev30d} في الثلاثين السابقة`}
          trend={trend}
          href="/admin/leads"
        />
        <Stat
          label="طلبات عروض الأسعار"
          value={k.quoteRequests}
          hint={`من إجمالي ${k.leadsTotal} طلب`}
          tone="sky"
          href="/admin/leads?source=quote"
        />
        <Stat
          label="قيمة خط الأنابيب"
          value={egp(k.pipelineMinor)}
          hint={`ج.م · معدل التحويل ${conversion}%`}
          tone="emerald"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-1 font-black text-slate-900">الطلبات الواردة</h2>
          <p className="mb-5 text-xs text-slate-500">آخر 30 يوماً</p>
          <LeadsTrend days={k.daily} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-black text-slate-900">خط المبيعات</h2>
          {k.leadsTotal === 0 ? (
            <p className="text-sm text-slate-500">لا توجد بيانات بعد.</p>
          ) : (
            <ul className="space-y-3">
              {(["new", "contacted", "quoted", "won", "lost"] as const).map((stage) => {
                const n = k.byStage.find((s) => s.stage === stage)?.n ?? 0;
                const pct = k.leadsTotal ? Math.round((n / k.leadsTotal) * 100) : 0;
                return (
                  <li key={stage}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{STAGE_LABEL[stage]}</span>
                      <span className="tabular-nums text-slate-500">
                        {n} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          stage === "won"
                            ? "bg-emerald-500"
                            : stage === "lost"
                              ? "bg-rose-400"
                              : "bg-sky-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-black text-slate-900">أحدث الطلبات</h2>
            <Link
              href="/admin/leads"
              className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:underline"
            >
              عرض الكل
              <IcArrow className="h-4 w-4" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <Empty
              title="لا توجد طلبات بعد"
              hint="سيظهر هنا كل من يملأ نموذج تواصل أو يطلب عرض سعر من الموقع."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">{l.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {l.company || l.customerType || "—"} · {l.governorate || "—"}
                      </p>
                    </div>
                    {l.items.length > 0 && (
                      <span className="hidden rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 tabular-nums sm:inline">
                        {l.items.length} منتج
                      </span>
                    )}
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ${
                        isStage(l.stage) ? STAGE_TONE[l.stage] : "bg-slate-50 text-slate-600 ring-slate-200"
                      }`}
                    >
                      {isStage(l.stage) ? STAGE_LABEL[l.stage] : l.stage}
                    </span>
                    <span className="hidden w-24 shrink-0 text-left text-xs text-slate-400 sm:block">
                      {timeAgo(l.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 font-black text-slate-900">الأكثر طلباً</h2>
            {k.topProducts.length === 0 ? (
              <p className="text-sm text-slate-500">لا توجد منتجات مطلوبة بعد.</p>
            ) : (
              <ol className="space-y-2.5">
                {k.topProducts.map((p, i) => (
                  <li key={p.slug} className="flex items-center gap-3 text-sm">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-[11px] font-black text-slate-500 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-slate-700">{p.name}</span>
                    <span className="font-bold text-slate-900 tabular-nums">{p.n}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-black text-slate-900">الكتالوج</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">منشور</dt>
                <dd className="font-bold text-slate-900 tabular-nums">{k.productsPublished}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">مسودّة</dt>
                <dd className="font-bold text-slate-900 tabular-nums">{k.productsDraft}</dd>
              </div>
            </dl>
            <Link
              href="/admin/products"
              className="mt-4 block rounded-xl bg-slate-900 py-2.5 text-center text-sm font-bold text-white hover:bg-slate-800"
            >
              إدارة المنتجات
            </Link>
          </Card>
        </div>
      </div>

      {audit.length > 0 && (
        <Card className="mt-6 p-5">
          <h2 className="mb-4 font-black text-slate-900">آخر النشاط</h2>
          <ul className="space-y-2.5 text-sm">
            {audit.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline gap-x-2 text-slate-600">
                <span className="font-bold text-slate-900">{a.actorName || "النظام"}</span>
                <span>{describe(a.action, a.entity)}</span>
                {a.detail && <span className="text-slate-500">«{a.detail}»</span>}
                <span className="mr-auto text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function describe(action: string, entity: string) {
  const e =
    entity === "product" ? "منتجاً" : entity === "category" ? "قسماً" : entity === "lead" ? "طلباً" : "";
  switch (action) {
    case "login":
      return "سجّل الدخول";
    case "create":
      return `أضاف ${e}`;
    case "update":
      return `عدّل ${e}`;
    case "delete":
      return `حذف ${e}`;
    case "publish":
      return `نشر ${e}`;
    case "unpublish":
      return `أخفى ${e}`;
    case "stage":
      return "غيّر مرحلة طلب";
    case "value":
      return "حدّث قيمة صفقة";
    default:
      return action;
  }
}
