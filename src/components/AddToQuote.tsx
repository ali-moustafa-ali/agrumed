"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { IconCart, IconCheck } from "./icons";

export default function AddToQuote({
  product,
  variant = "full",
}: {
  product: Product;
  variant?: "full" | "compact";
}) {
  const { add } = useCart();
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  function handleAdd() {
    add(product.slug, size, qty);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleAdd}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-600 bg-white py-2.5 text-sm font-bold text-brand-700 transition hover:bg-brand-600 hover:text-white"
      >
        {done ? <IconCheck className="h-4 w-4" /> : <IconCart className="h-4 w-4" />}
        {done ? "تمت الإضافة" : "أضف لطلب السعر"}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-bold text-ink-700">العبوة المطلوبة</p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                size === s
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-sand-200 text-ink-700 hover:border-brand-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm font-bold text-ink-700">الكمية</p>
        <div className="flex items-center rounded-xl border border-sand-200">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3.5 py-2 text-xl leading-none text-ink-700 hover:bg-sand-100"
          >
            −
          </button>
          <span className="nums w-10 text-center font-extrabold">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-3.5 py-2 text-xl leading-none text-ink-700 hover:bg-sand-100"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-4 font-extrabold text-white transition hover:bg-brand-700"
      >
        {done ? <IconCheck /> : <IconCart />}
        {done ? "تمت الإضافة لطلب السعر" : "أضف لطلب عرض السعر"}
      </button>
    </div>
  );
}
