import Image from "next/image";
import type { Product } from "@/lib/types";
import { IconFlask } from "./icons";

/** منتجات الكتالوج لها صور مستخرجة؛ الخامات تُعرض ببلاطة رمزية حتى تصل صورها */
export default function ProductImage({
  product,
  sizes = "(max-width: 768px) 50vw, 300px",
  className = "",
  priority = false,
}: {
  product: Product;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (product.category === "raw") {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-br from-brand-50 to-sand-100 ${className}`}
      >
        <IconFlask className="h-10 w-10 text-brand-500" />
        <span className="px-4 text-center text-sm font-bold text-brand-700">{product.name}</span>
        {product.origin && (
          <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-ink-500">
            {product.origin}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={`/products/${product.slug}.jpg`}
      alt={product.name}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
