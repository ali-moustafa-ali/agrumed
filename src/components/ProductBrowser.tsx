"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { categories } from "@/lib/products";
import type { CategoryId, Product } from "@/lib/types";
import { IconSearch } from "./icons";

type SortKey = "default" | "name" | "npk";

export default function ProductBrowser({
  products,
  initialCategory = "all",
  initialQuery = "",
  lockCategory = false,
}: {
  products: Product[];
  initialCategory?: CategoryId | "all";
  initialQuery?: string;
  lockCategory?: boolean;
}) {
  const [cat, setCat] = useState<CategoryId | "all">(initialCategory);
  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("default");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.nameEn.toLowerCase().includes(needle) ||
        p.tagline.toLowerCase().includes(needle) ||
        (p.npk ?? "").includes(needle) ||
        p.composition.some((c) => c.label.toLowerCase().includes(needle)) ||
        p.features.some((f) => f.toLowerCase().includes(needle))
      );
    });

    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ar"));
    if (sort === "npk")
      list = [...list].sort((a, b) => Number(Boolean(b.npk)) - Number(Boolean(a.npk)));

    return list;
  }, [products, cat, q, sort]);

  const tabs: { id: CategoryId | "all"; label: string }[] = [
    { id: "all", label: "كل المنتجات" },
    ...categories.map((c) => ({ id: c.id as CategoryId, label: c.name })),
  ];

  return (
    <>
      <div className="sticky top-[76px] z-30 -mx-4 mb-8 border-y border-sand-200 bg-white/95 px-4 py-3 backdrop-blur sm:top-[84px]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {!lockCategory && (
            <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCat(t.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                    cat === t.id
                      ? "bg-brand-600 text-white"
                      : "bg-sand-100 text-ink-700 hover:bg-sand-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-1 items-center gap-2 lg:mr-auto lg:max-w-md">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3.5 py-2 focus-within:border-brand-400">
              <IconSearch className="h-4 w-4 text-ink-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث بالاسم أو العنصر…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink-500"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-sand-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink-700 outline-none"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="name">الاسم (أ – ي)</option>
              <option value="npk">تركيبات NPK أولاً</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mb-5 text-sm text-ink-500">
        عدد النتائج: <span className="nums font-extrabold text-ink-900">{shown.length}</span> منتج
      </p>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-200 py-20 text-center">
          <p className="font-bold text-ink-700">لا توجد نتائج مطابقة</p>
          <p className="mt-1 text-sm text-ink-500">جرّب كلمة بحث أخرى أو اختر قسماً مختلفاً.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
