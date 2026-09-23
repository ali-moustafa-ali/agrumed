import { asc } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";
import { can, ROLE_LABEL, type Role } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import { mailConfigured } from "@/lib/mail";
import { fmtDate } from "@/lib/crm";
import { Card, PageHead } from "@/components/admin/ui";
import PasswordForm from "@/components/admin/PasswordForm";
import MailSettingsForm from "@/components/admin/MailSettingsForm";
import UsersPanel from "@/components/admin/UsersPanel";

export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const user = await requireUser();
  const isOwner = can(user.role, "users:write");

  const [cfg, users] = await Promise.all([
    getSettings(),
    isOwner
      ? db
          .select({
            id: adminUsers.id,
            name: adminUsers.name,
            email: adminUsers.email,
            role: adminUsers.role,
            active: adminUsers.active,
            lastLoginAt: adminUsers.lastLoginAt,
          })
          .from(adminUsers)
          .orderBy(asc(adminUsers.id))
      : Promise.resolve([]),
  ]);

  const smtpOn = mailConfigured();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead title="الإعدادات" sub="حسابك، والمستخدمون، وإشعارات البريد" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-black text-slate-900">تغيير كلمة المرور</h2>
          <p className="mt-1 mb-4 text-xs text-slate-500">
            الحساب: <span className="font-semibold text-slate-700">{user.email}</span> ·{" "}
            {ROLE_LABEL[user.role as Role] ?? user.role}
          </p>
          <PasswordForm />
        </Card>

        <Card className="p-5">
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 className="font-black text-slate-900">إشعارات البريد</h2>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ${
                smtpOn
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200"
              }`}
            >
              {smtpOn ? "SMTP مضبوط" : "SMTP غير مضبوط"}
            </span>
          </div>
          {!smtpOn && (
            <p className="mt-2 mb-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              لم تُضبط بيانات خادم البريد بعد، فلن تُرسل أي رسائل. تُضاف المتغيرات{" "}
              <code className="rounded bg-white px-1">SMTP_HOST</code>،{" "}
              <code className="rounded bg-white px-1">SMTP_USER</code>،{" "}
              <code className="rounded bg-white px-1">SMTP_PASS</code> من لوحة Coolify. الطلبات
              نفسها تُحفظ وتظهر هنا بشكل طبيعي في كل الأحوال.
            </p>
          )}
          <MailSettingsForm settings={cfg} canTest={smtpOn} defaultTestTo={user.email} />
        </Card>
      </div>

      {isOwner && (
        <Card className="mt-5 overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-black text-slate-900">المستخدمون</h2>
            <p className="mt-1 text-xs text-slate-500">
              المبيعات ترى العملاء والطلبات فقط، ومحرّر المحتوى يرى المنتجات والأقسام فقط.
            </p>
          </div>
          <UsersPanel
            users={users.map((u) => ({
              ...u,
              lastLogin: u.lastLoginAt ? fmtDate(u.lastLoginAt) : null,
            }))}
            currentUserId={user.id}
          />
        </Card>
      )}
    </div>
  );
}
