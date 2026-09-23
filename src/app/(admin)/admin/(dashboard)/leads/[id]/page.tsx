import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetLead } from "@/lib/queries";
import { requirePermission } from "@/lib/auth/dal";
import { SOURCE_LABEL, STAGE_LABEL, egp, fmtDate, isStage, timeAgo } from "@/lib/crm";
import { site } from "@/lib/site";
import { Card } from "@/components/admin/ui";
import { IcArrow, IcMail, IcPhone, IcWhats } from "@/components/admin/icons";
import StageControl from "@/components/admin/StageControl";
import LeadValueForm from "@/components/admin/LeadValueForm";
import LeadNoteForm from "@/components/admin/LeadNoteForm";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("leads:write");
  const { id } = await params;
  const lead = await adminGetLead(Number(id));
  if (!lead) notFound();

  const waText = encodeURIComponent(
    `مرحباً ${lead.name}، معك فريق مبيعات ${site.name} بخصوص طلبكم رقم ${lead.ref}.`,
  );
  const waPhone = lead.phone.replace(/[^0-9]/g, "").replace(/^0/, "20");

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/leads"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900"
      >
        <IcArrow className="h-4 w-4" />
        رجوع للقائمة
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-emerald-700 tabular-nums">{lead.ref}</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">{lead.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {SOURCE_LABEL[lead.source] ?? lead.source} · ورد {timeAgo(lead.createdAt)} ·{" "}
            {fmtDate(lead.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
          >
            <IcPhone className="h-4 w-4" />
            اتصال
          </a>
          <a
            href={`https://wa.me/${waPhone}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95"
          >
            <IcWhats className="h-4 w-4" />
            واتساب
          </a>
          {lead.email && (
            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent(`بخصوص طلبكم ${lead.ref} — ${site.name}`)}`}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-300"
            >
              <IcMail className="h-4 w-4" />
              بريد
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-4 font-black text-slate-900">مرحلة الطلب</h2>
            <StageControl leadId={lead.id} stage={lead.stage} />
          </Card>

          {lead.items.length > 0 && (
            <Card className="overflow-hidden">
              <h2 className="border-b border-slate-100 px-5 py-4 font-black text-slate-900">
                المنتجات المطلوبة
              </h2>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-2.5 text-right font-bold">المنتج</th>
                    <th className="px-5 py-2.5 text-right font-bold">العبوة</th>
                    <th className="px-5 py-2.5 text-left font-bold">الكمية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lead.items.map((it, i) => (
                    <tr key={`${it.slug}-${it.size}-${i}`}>
                      <td className="px-5 py-3">
                        <Link
                          href={`/products/${it.slug}`}
                          target="_blank"
                          className="font-bold text-slate-900 hover:text-emerald-700"
                        >
                          {it.name || it.slug}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{it.size}</td>
                      <td className="px-5 py-3 text-left font-bold tabular-nums">{it.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {lead.message && (
            <Card className="p-5">
              <h2 className="mb-3 font-black text-slate-900">رسالة العميل</h2>
              <p className="leading-relaxed whitespace-pre-wrap text-slate-700">{lead.message}</p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-4 font-black text-slate-900">سجل المتابعة</h2>
            <LeadNoteForm leadId={lead.id} />
            {lead.notes.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">لا توجد متابعات بعد.</p>
            ) : (
              <ol className="mt-5 space-y-3 border-r-2 border-slate-100 pr-4">
                {lead.notes.map((n) => (
                  <li key={n.id} className="relative">
                    <span
                      className={`absolute -right-[22px] top-2 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                        n.kind === "stage" ? "bg-sky-500" : "bg-slate-300"
                      }`}
                    />
                    <p className="text-sm text-slate-700">{n.body}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {n.authorName || "النظام"} · {timeAgo(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 font-black text-slate-900">بيانات العميل</h2>
            <dl className="space-y-3 text-sm">
              <Row label="الهاتف" value={lead.phone} ltr />
              <Row label="البريد" value={lead.email} ltr />
              <Row label="الشركة / المزرعة" value={lead.company} />
              <Row label="المحافظة" value={lead.governorate} />
              <Row label="صفة العميل" value={lead.customerType} />
              <Row
                label="المرحلة الحالية"
                value={isStage(lead.stage) ? STAGE_LABEL[lead.stage] : lead.stage}
              />
              <Row label="آخر تحديث" value={timeAgo(lead.updatedAt)} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 font-black text-slate-900">قيمة الصفقة التقديرية</h2>
            <p className="mb-4 text-xs text-slate-500">
              تدخل في حساب خط الأنابيب بلوحة النظرة العامة.
            </p>
            <p className="mb-3 text-2xl font-black text-emerald-600 tabular-nums">
              {egp(lead.valueMinor)} <span className="text-sm font-bold text-slate-400">ج.م</span>
            </p>
            <LeadValueForm leadId={lead.id} value={lead.valueMinor} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value?: string | null; ltr?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2.5 last:border-0">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-left font-semibold text-slate-900" dir={ltr ? "ltr" : undefined}>
        {value || "—"}
      </dd>
    </div>
  );
}
