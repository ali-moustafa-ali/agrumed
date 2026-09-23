"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProduct, updateProduct, type FormState } from "@/lib/actions/products";
import type { Product } from "@/db/schema";
import type { SpecRow } from "@/lib/types";
import DeleteProductButton from "./DeleteProductButton";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500";
const area = `${input} font-mono text-[13px] leading-relaxed`;

function pairsToText(rows: SpecRow[]) {
  return rows.map((r) => `${r.label} | ${r.value}`).join("\n");
}

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: { slug: string; name: string }[];
}) {
  const isEdit = Boolean(product);
  const [state, action, pending] = useActionState<FormState, FormData>(
    isEdit ? updateProduct : createProduct,
    {},
  );

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-3">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-5 lg:col-span-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-black text-slate-900">البيانات الأساسية</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم المنتج" required>
              <input name="name" required defaultValue={product?.name} className={input} />
            </Field>
            <Field label="الاسم بالإنجليزية">
              <input name="nameEn" defaultValue={product?.nameEn ?? ""} dir="ltr" className={input} />
            </Field>
            <Field label="المعرّف (slug)" hint="يظهر في رابط المنتج — اتركه فارغاً ليُولَّد تلقائياً">
              <input name="slug" defaultValue={product?.slug} dir="ltr" className={input} />
            </Field>
            <Field label="القسم" required>
              <select name="categorySlug" defaultValue={product?.categorySlug} required className={input}>
                <option value="">اختر القسم…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="تركيبة NPK" hint="مثال: 20-20-20">
              <input name="npk" defaultValue={product?.npk ?? ""} dir="ltr" className={input} />
            </Field>
            <Field label="المنشأ">
              <input name="origin" defaultValue={product?.origin ?? ""} className={input} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="الوصف المختصر" hint="سطر واحد يظهر تحت اسم المنتج">
              <textarea name="tagline" rows={2} defaultValue={product?.tagline} className={input} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 font-black text-slate-900">التركيب</h2>
          <p className="mb-3 text-xs text-slate-500">
            سطر لكل عنصر بالصيغة: <code className="rounded bg-slate-100 px-1.5 py-0.5">العنصر | النسبة</code>
          </p>
          <textarea
            name="composition"
            rows={7}
            defaultValue={product ? pairsToText(product.composition) : ""}
            placeholder={"النيتروجين (N) | 20.0\nالفوسفات (P₂O₅) | 20.0"}
            className={area}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 font-black text-slate-900">مميزات المنتج</h2>
          <p className="mb-3 text-xs text-slate-500">ميزة في كل سطر.</p>
          <textarea
            name="features"
            rows={7}
            defaultValue={product?.features.join("\n") ?? ""}
            className={area}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 font-black text-slate-900">معدلات الاستخدام</h2>
          <p className="mb-3 text-xs text-slate-500">
            سطر لكل معدل بالصيغة: <code className="rounded bg-slate-100 px-1.5 py-0.5">النوع | المعدل</code>
          </p>
          <textarea
            name="usage"
            rows={4}
            defaultValue={product ? pairsToText(product.usage) : ""}
            placeholder={"رش ورقي | 1000 سم³ / 400 لتر ماء\nتسميد عبر الري | 2 لتر / فدان"}
            className={area}
          />
        </section>
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-black text-slate-900">النشر</h2>
          <label className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              name="published"
              defaultChecked={product?.published ?? true}
              className="h-4 w-4 accent-emerald-600"
            />
            منشور على الموقع
          </label>
          <label className="mb-4 flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="h-4 w-4 accent-emerald-600"
            />
            إبراز في الصفحة الرئيسية
          </label>
          <Field label="ترتيب العرض" hint="الأقل يظهر أولاً">
            <input
              name="sort"
              type="number"
              defaultValue={product?.sort ?? 0}
              className={`${input} tabular-nums`}
            />
          </Field>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-black text-slate-900">التسعير والعبوات</h2>
          <Field label="السعر بالجنيه" hint="اتركه فارغاً ليظهر «السعر عند الطلب»">
            <input
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={product?.priceMinor === null || product?.priceMinor === undefined ? "" : product.priceMinor / 100}
              className={`${input} tabular-nums`}
            />
          </Field>
          <div className="mt-4">
            <Field label="العبوات" hint="افصل بينها بفاصلة">
              <input
                name="sizes"
                defaultValue={product?.sizes.join("، ") ?? ""}
                placeholder="500 مل، 1 لتر، 5 لتر"
                className={input}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-black text-slate-900">الصورة</h2>
          <Field label="مسار الصورة" hint="مثال: /products/gromo-extra.jpg">
            <input name="image" defaultValue={product?.image ?? ""} dir="ltr" className={input} />
          </Field>
          {product?.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.image}
              alt={product.name}
              className="mt-3 h-36 w-full rounded-xl border border-slate-200 object-contain p-2"
            />
          )}
        </section>

        <div className="sticky bottom-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
          {state.error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {state.error}
            </p>
          )}
          {state.ok && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {state.ok}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-emerald-600 py-3 font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? "جارٍ الحفظ…" : isEdit ? "حفظ التعديلات" : "إضافة المنتج"}
          </button>
          <div className="flex gap-2">
            <Link
              href="/admin/products"
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-bold text-slate-600 hover:border-slate-300"
            >
              إلغاء
            </Link>
            {product && (
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-bold text-slate-600 hover:border-slate-300"
              >
                معاينة
              </Link>
            )}
          </div>
          {product && <DeleteProductButton id={product.id} name={product.name} />}
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
