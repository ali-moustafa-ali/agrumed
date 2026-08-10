"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { getProduct } from "@/lib/products";
import ProductImage from "./ProductImage";

export default function QuoteSummary() {
  const { lines, remove, count } = useCart();

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6">
      <h3 className="flex items-center justify-between font-extrabold text-ink-900">
        منتجات الطلب
        <span className="nums rounded-full bg-brand-50 px-2.5 py-0.5 text-sm text-brand-700">
          {count}
        </span>
      </h3>

      {lines.length === 0 ? (
        <div className="mt-5 text-center">
          <p className="text-sm text-ink-500">لم تُضف منتجات بعد.</p>
          <Link
            href="/products"
            className="mt-3 inline-block rounded-full border-2 border-brand-600 px-5 py-2 text-sm font-extrabold text-brand-700 hover:bg-brand-50"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-sand-200">
          {lines.map((l) => {
            const p = getProduct(l.slug);
            if (!p) return null;
            return (
              <li key={`${l.slug}-${l.size}`} className="flex items-center gap-3 py-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-sand-200">
                  <ProductImage product={p} sizes="56px" className="p-1" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-bold text-ink-900">{p.name}</p>
                  <p className="text-xs text-ink-500">
                    {l.size} × <span className="nums">{l.qty}</span>
                  </p>
                </div>
                <button
                  onClick={() => remove(l.slug, l.size)}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  حذف
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
