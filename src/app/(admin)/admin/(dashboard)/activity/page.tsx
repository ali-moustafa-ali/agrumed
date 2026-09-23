import { desc } from "drizzle-orm";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";
import { fmtDate, timeAgo } from "@/lib/crm";
import { Card, Empty, PageHead } from "@/components/admin/ui";

export const metadata = { title: "سجل النشاط" };

export default async function ActivityPage() {
  await requireUser();
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(200);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead title="سجل النشاط" sub="كل تعديل إداري مسجَّل — للمراجعة والمساءلة" />
      {rows.length === 0 ? (
        <Empty title="لا يوجد نشاط بعد" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-right font-bold">المستخدم</th>
                  <th className="px-4 py-3 text-right font-bold">الإجراء</th>
                  <th className="px-4 py-3 text-right font-bold">العنصر</th>
                  <th className="px-4 py-3 text-right font-bold">التفاصيل</th>
                  <th className="px-4 py-3 text-left font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">{a.actorName || "النظام"}</td>
                    <td className="px-4 py-3 text-slate-600">{a.action}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {a.entity}
                      {a.entityId && <span className="text-slate-400"> #{a.entityId}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{a.detail || "—"}</td>
                    <td className="px-4 py-3 text-left text-xs whitespace-nowrap text-slate-400">
                      {timeAgo(a.createdAt)} · {fmtDate(a.createdAt)}
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
