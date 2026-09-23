"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/lib/actions/products";
import { IcTrash } from "./icons";

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
      >
        <IcTrash className="h-4 w-4" />
        حذف المنتج
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
      <p className="mb-3 text-sm font-semibold text-rose-800">
        سيُحذف «{name}» نهائياً ويختفي من الموقع. لا يمكن التراجع.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => void deleteProduct(id))}
          className="flex-1 rounded-lg bg-rose-600 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? "جارٍ الحذف…" : "تأكيد الحذف"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-lg bg-white py-2 text-sm font-bold text-slate-600"
        >
          تراجع
        </button>
      </div>
    </div>
  );
}
