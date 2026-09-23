"use client";

import { useActionState } from "react";
import { saveCategory, type FormState } from "@/lib/actions/products";
import type { Category } from "@/db/schema";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500";

export default function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategory, {});

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={category?.id ?? 0} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" defaultValue={category?.name} placeholder="اسم القسم" required className={input} />
        <input name="slug" defaultValue={category?.slug} placeholder="المعرّف" dir="ltr" required className={input} />
        <input name="nameEn" defaultValue={category?.nameEn} placeholder="الاسم بالإنجليزية" dir="ltr" className={input} />
        <input
          name="sort"
          type="number"
          defaultValue={category?.sort ?? 0}
          placeholder="الترتيب"
          className={`${input} tabular-nums`}
        />
      </div>
      <input name="short" defaultValue={category?.short} placeholder="وصف مختصر" className={input} />
      <textarea
        name="description"
        rows={2}
        defaultValue={category?.description}
        placeholder="الوصف الكامل"
        className={input}
      />
      <input name="image" defaultValue={category?.image ?? ""} placeholder="مسار الصورة" dir="ltr" className={input} />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ…" : category ? "حفظ" : "إضافة القسم"}
        </button>
        {state.error && <span className="text-xs font-semibold text-rose-600">{state.error}</span>}
        {state.ok && <span className="text-xs font-semibold text-emerald-600">{state.ok}</span>}
      </div>
    </form>
  );
}
