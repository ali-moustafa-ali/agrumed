import Link from "next/link";
import type { Product } from "@/lib/types";
import { getCategory } from "@/lib/products";
import ProductImage from "./ProductImage";
import AddToQuote from "./AddToQuote";

export default function ProductCard({ product }: { product: Product }) {
  const cat = getCategory(product.category);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-white">
        <ProductImage product={product} className="p-4 transition group-hover:scale-105" />
        {product.npk && (
          <span className="nums absolute top-3 right-3 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-extrabold text-white">
            {product.npk}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <span className="text-[11px] font-bold text-gold-600">{cat?.name}</span>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 text-[17px] font-extrabold leading-snug text-ink-900 transition group-hover:text-brand-700">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500">{product.tagline}</p>

        {product.price !== null && (
          <p className="mt-2 text-lg font-black text-brand-700">
            <span className="nums">{product.price.toLocaleString("en-US")}</span>{" "}
            <span className="text-xs font-bold text-ink-500">ج.م</span>
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.sizes.map((s) => (
            <span
              key={s}
              className="rounded-md bg-sand-100 px-2 py-0.5 text-[11px] font-semibold text-ink-700"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <AddToQuote product={product} variant="compact" />
        </div>
      </div>
    </article>
  );
}
