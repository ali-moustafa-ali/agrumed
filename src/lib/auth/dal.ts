import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { readSessionCookie } from "./session";
import { can } from "@/lib/permissions";

/**
 * طبقة الوصول للبيانات — كل استعلام أو إجراء إداري يمر من هنا.
 * الفحص يتم قرب مصدر البيانات لا في الـ proxy وحده.
 */
export const getCurrentUser = cache(async () => {
  const session = await readSessionCookie();
  if (!session) return null;

  const [user] = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      active: adminUsers.active,
      sessionsValidFrom: adminUsers.sessionsValidFrom,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.userId))
    .limit(1);

  if (!user || !user.active) return null;

  // جلسة صدرت قبل آخر تغيير لكلمة المرور لم تعد صالحة
  if (user.sessionsValidFrom) {
    const cutoff = Math.floor(user.sessionsValidFrom.getTime() / 1000);
    if (session.issuedAt < cutoff) return null;
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
});

/** يوقف التنفيذ ويحوّل لصفحة الدخول إن لم تكن هناك جلسة صالحة. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** يمنع تنفيذ إجراء لا يملك المستخدم صلاحيته. */
export async function requirePermission(permission: string) {
  const user = await requireUser();
  if (!can(user.role, permission)) {
    throw new Error("ليس لديك صلاحية لتنفيذ هذا الإجراء");
  }
  return user;
}
