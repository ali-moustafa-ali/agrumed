"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, auditLog } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) return { error: "من فضلك أدخل البريد وكلمة المرور." };

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  // نفس الرسالة في كل الحالات حتى لا نكشف أي بريد مسجّل
  const generic = { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  if (!user || !user.active) return generic;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return generic;

  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: "login",
    entity: "admin_user",
    entityId: String(user.id),
  });

  await createSession({ userId: user.id, name: user.name, role: user.role });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
