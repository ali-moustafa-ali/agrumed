"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createUser,
  resetUserPassword,
  setUserActive,
  type FormState,
} from "@/lib/actions/settings";
import { ROLE_LABEL, type Role } from "@/lib/permissions";
import { IcPlus } from "./icons";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLogin: string | null;
};

export default function UsersPanel({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: number;
}) {
  const [adding, setAdding] = useState(false);
  const [resetFor, setResetFor] = useState<number | null>(null);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 text-right font-bold">المستخدم</th>
              <th className="px-5 py-3 text-right font-bold">الدور</th>
              <th className="px-5 py-3 text-right font-bold">آخر دخول</th>
              <th className="px-5 py-3 text-left font-bold">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isSelf={u.id === currentUserId}
                onReset={() => setResetFor(resetFor === u.id ? null : u.id)}
                resetOpen={resetFor === u.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 p-5">
        {adding ? (
          <NewUserForm onDone={() => setAdding(false)} />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <IcPlus className="h-4 w-4" />
            إضافة مستخدم
          </button>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  onReset,
  resetOpen,
}: {
  user: User;
  isSelf: boolean;
  onReset: () => void;
  resetOpen: boolean;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [state, action, saving] = useActionState<FormState, FormData>(resetUserPassword, {});

  return (
    <>
      <tr className={user.active ? "" : "bg-slate-50/60"}>
        <td className="px-5 py-3">
          <span className="block font-bold text-slate-900">
            {user.name}
            {isSelf && <span className="mr-1.5 text-xs font-normal text-slate-400">(أنت)</span>}
          </span>
          <span className="block text-xs text-slate-500" dir="ltr">
            {user.email}
          </span>
        </td>
        <td className="px-5 py-3 text-slate-600">{ROLE_LABEL[user.role as Role] ?? user.role}</td>
        <td className="px-5 py-3 text-xs text-slate-500">{user.lastLogin ?? "لم يسجّل بعد"}</td>
        <td className="px-5 py-3 text-left">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              كلمة مرور
            </button>
            {!isSelf && (
              <button
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    setErr(null);
                    try {
                      await setUserActive(user.id, !user.active);
                    } catch (e) {
                      setErr(e instanceof Error ? e.message : "تعذّر التغيير");
                    }
                  })
                }
                className={`rounded-md px-2 py-1 text-[11px] font-bold ring-1 transition disabled:opacity-50 ${
                  user.active
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200"
                    : "bg-slate-100 text-slate-500 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {user.active ? "نشط" : "معطّل"}
              </button>
            )}
            {isSelf && (
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                نشط
              </span>
            )}
          </div>
          {err && <p className="mt-1 text-[11px] font-semibold text-rose-600">{err}</p>}
        </td>
      </tr>
      {resetOpen && (
        <tr>
          <td colSpan={4} className="bg-slate-50 px-5 py-4">
            <form action={action} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={user.id} />
              <input
                name="password"
                type="text"
                minLength={10}
                required
                placeholder={`كلمة مرور جديدة لـ${user.name} — 10 أحرف على الأقل`}
                dir="ltr"
                className={`${input} max-w-sm`}
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "…" : "تعيين"}
              </button>
              {state.error && <span className="text-xs font-semibold text-rose-600">{state.error}</span>}
              {state.ok && <span className="text-xs font-semibold text-emerald-600">{state.ok}</span>}
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

function NewUserForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createUser, {});

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="الاسم" className={input} />
        <input name="email" type="email" required placeholder="البريد الإلكتروني" dir="ltr" className={input} />
        <select name="role" defaultValue="sales" className={input}>
          <option value="sales">مبيعات — العملاء والطلبات</option>
          <option value="editor">محرّر محتوى — المنتجات والأقسام</option>
          <option value="owner">صلاحية كاملة</option>
        </select>
        <input
          name="password"
          type="text"
          minLength={10}
          required
          placeholder="كلمة المرور — 10 أحرف على الأقل"
          dir="ltr"
          className={input}
        />
      </div>
      {state.error && <p className="text-sm font-semibold text-rose-600">{state.error}</p>}
      {state.ok && <p className="text-sm font-semibold text-emerald-600">{state.ok}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "جارٍ الإضافة…" : "إضافة"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
