"use server";

import { revalidatePath } from "next/cache";
import { eq, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, auditLog } from "@/db/schema";
import { requirePermission, requireUser } from "@/lib/auth/dal";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { SETTING_KEYS, setSetting } from "@/lib/settings";
import { destroySession } from "@/lib/auth/session";
import { sendMail, verifyMail } from "@/lib/mail";

export type FormState = { error?: string; ok?: string };

const MIN_PASSWORD = 10;

/* ───────────────── كلمة المرور ───────────────── */

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current || !next) return { error: "املأ كل الحقول." };
  if (next.length < MIN_PASSWORD) {
    return { error: `كلمة المرور الجديدة يجب ألا تقل عن ${MIN_PASSWORD} أحرف.` };
  }
  if (next !== confirm) return { error: "كلمة المرور الجديدة وتأكيدها غير متطابقين." };
  if (next === current) return { error: "كلمة المرور الجديدة مطابقة للحالية." };

  const [row] = await db
    .select({ passwordHash: adminUsers.passwordHash })
    .from(adminUsers)
    .where(eq(adminUsers.id, user.id))
    .limit(1);
  if (!row || !(await verifyPassword(current, row.passwordHash))) {
    return { error: "كلمة المرور الحالية غير صحيحة." };
  }

  // إبطال كل الجلسات القائمة: توكن مسروق لا ينفع بعد تغيير كلمة المرور
  await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(next), sessionsValidFrom: new Date() })
    .where(eq(adminUsers.id, user.id));

  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: "password",
    entity: "admin_user",
    entityId: String(user.id),
  });

  return { ok: "تم تغيير كلمة المرور. ستحتاج لاستخدامها في الدخول القادم." };
}

/* ───────────────── المستخدمون ───────────────── */

export async function createUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requirePermission("users:write");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "sales");
  const password = String(formData.get("password") ?? "");

  if (!email.includes("@")) return { error: "بريد إلكتروني غير صالح." };
  if (!name) return { error: "الاسم مطلوب." };
  if (!["owner", "sales", "editor"].includes(role)) return { error: "دور غير معروف." };
  if (password.length < MIN_PASSWORD) {
    return { error: `كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD} أحرف.` };
  }

  const [clash] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);
  if (clash) return { error: "يوجد مستخدم بنفس البريد." };

  await db.insert(adminUsers).values({
    email,
    name,
    role,
    passwordHash: await hashPassword(password),
  });
  await db.insert(auditLog).values({
    actorId: actor.id,
    actorName: actor.name,
    action: "create",
    entity: "admin_user",
    detail: `${name} (${role})`,
  });

  revalidatePath("/admin/settings");
  return { ok: `أُضيف المستخدم ${name}.` };
}

export async function setUserActive(id: number, active: boolean) {
  const actor = await requirePermission("users:write");
  if (id === actor.id) throw new Error("لا يمكنك تعطيل حسابك بنفسك");

  // لا نسمح بتعطيل آخر مالك نشط، وإلا يُقفل النظام على الجميع
  if (!active) {
    const owners = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(and(eq(adminUsers.role, "owner"), eq(adminUsers.active, true), ne(adminUsers.id, id)));
    const [target] = await db
      .select({ role: adminUsers.role })
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);
    if (target?.role === "owner" && owners.length === 0) {
      throw new Error("لا يمكن تعطيل آخر مستخدم بصلاحية كاملة");
    }
  }

  await db
    .update(adminUsers)
    .set(active ? { active } : { active, sessionsValidFrom: new Date() })
    .where(eq(adminUsers.id, id));
  await db.insert(auditLog).values({
    actorId: actor.id,
    actorName: actor.name,
    action: active ? "enable" : "disable",
    entity: "admin_user",
    entityId: String(id),
  });
  revalidatePath("/admin/settings");
}

export async function resetUserPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requirePermission("users:write");
  const id = Number(formData.get("id"));
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    return { error: `كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD} أحرف.` };
  }

  await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(password), sessionsValidFrom: new Date() })
    .where(eq(adminUsers.id, id));
  await db.insert(auditLog).values({
    actorId: actor.id,
    actorName: actor.name,
    action: "password-reset",
    entity: "admin_user",
    entityId: String(id),
  });

  revalidatePath("/admin/settings");
  return { ok: "تم تعيين كلمة مرور جديدة." };
}

/* ───────────────── إعدادات البريد ───────────────── */

export async function saveMailSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requirePermission("settings:write");
  const raw = String(formData.get("salesEmails") ?? "");
  const list = raw
    .split(/[,\s;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const bad = list.find((e) => !e.includes("@") || e.length < 5);
  if (bad) return { error: `بريد غير صالح: ${bad}` };

  await setSetting(SETTING_KEYS.salesEmails, list.join(", "));
  await setSetting(SETTING_KEYS.notifySales, formData.get("notifySales") === "on" ? "1" : "0");
  await setSetting(SETTING_KEYS.notifyCustomer, formData.get("notifyCustomer") === "on" ? "1" : "0");

  await db.insert(auditLog).values({
    actorId: actor.id,
    actorName: actor.name,
    action: "update",
    entity: "settings",
    detail: "إعدادات البريد",
  });

  revalidatePath("/admin/settings");
  return { ok: "تم حفظ الإعدادات." };
}

export async function sendTestEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requirePermission("settings:write");
  const to = String(formData.get("to") ?? "").trim();
  if (!to.includes("@")) return { error: "أدخل بريداً صالحاً للاختبار." };

  const check = await verifyMail();
  if (!check.ok) return { error: `تعذّر الاتصال بخادم البريد: ${check.error}` };

  const res = await sendMail({
    to,
    subject: "رسالة اختبار من موقع أجروميد",
    html: `<div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;padding:20px">
      <h2 style="color:#1e7a34;margin:0 0 8px">إعدادات البريد تعمل ✓</h2>
      <p style="color:#374151;line-height:1.8;margin:0">
        هذه رسالة اختبار أرسلها ${actor.name} من لوحة تحكم أجروميد.
        وصولها يعني أن إشعارات الطلبات ورسائل تأكيد العملاء ستُرسل بنجاح.
      </p></div>`,
  });

  return res.sent ? { ok: `أُرسلت رسالة اختبار إلى ${to}.` } : { error: res.reason ?? "فشل الإرسال." };
}

/* ───────────────── تسجيل الخروج من كل الأجهزة ───────────────── */

/** يُنهي كل الجلسات على كل الأجهزة، لا جلسة هذا المتصفح وحدها. */
export async function logoutEverywhere() {
  const user = await requireUser();
  await db
    .update(adminUsers)
    .set({ sessionsValidFrom: new Date() })
    .where(eq(adminUsers.id, user.id));
  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: "logout-all",
    entity: "admin_user",
    entityId: String(user.id),
  });
  await destroySession();
}
