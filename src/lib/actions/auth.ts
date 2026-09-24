"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, auditLog } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { hit, reset } from "@/lib/rate-limit";

const ATTEMPT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export type LoginState = { error?: string };

// تجزئة ثابتة لكلمة لا تُستخدم — تُبقي زمن الرد واحداً مهما كان البريد
const DUMMY_HASH = "$2b$12$WJ3f0aQ0yG5nL1pO2rS3uO7qYvC8kD9eF0gH1iJ2kL3mN4oP5qR6S";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) return { error: "من فضلك أدخل البريد وكلمة المرور." };

  // سقف لمحاولات الدخول — بدونه الحساب الإداري مفتوح للتخمين الآلي
  const gate = hit(`login:${email}`, MAX_ATTEMPTS, ATTEMPT_WINDOW);
  if (gate.limited) {
    return {
      error: `محاولات كثيرة فاشلة. حاول بعد ${Math.ceil(gate.retryAfter / 60)} دقيقة.`,
    };
  }

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  // نفس الرسالة في كل الحالات حتى لا نكشف أي بريد مسجّل
  const generic = { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };

  // نُنفّذ المقارنة دائماً — حتى على تجزئة وهمية — فلا يكشف الفارق الزمني
  // أي البُرد مسجّل
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const ok = await verifyPassword(password, hash);

  if (!user || !user.active || !ok) {
    await db.insert(auditLog).values({
      actorId: user?.id ?? null,
      actorName: email,
      action: "login-failed",
      entity: "admin_user",
      detail: user ? (user.active ? "كلمة مرور خاطئة" : "حساب معطّل") : "بريد غير مسجّل",
    });
    return generic;
  }

  reset(`login:${email}`);

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
