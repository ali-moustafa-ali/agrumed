"use client";

import { useOptimistic, useTransition } from "react";
import { toggleProductPublished } from "@/lib/actions/products";

export default function PublishToggle({ id, published }: { id: number; published: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(published);
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={optimistic ? "إخفاء المنتج" : "نشر المنتج"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleProductPublished(id, !optimistic);
        })
      }
      className={`relative h-6 w-11 rounded-full transition disabled:opacity-60 ${
        optimistic ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          optimistic ? "right-0.5" : "right-[22px]"
        }`}
      />
    </button>
  );
}
