import type { Metadata } from "next";
import ProductBrowser from "@/components/ProductBrowser";
import PageHeader from "@/components/PageHeader";
import { getCategories, getPublishedProducts } from "@/lib/queries";
import { toProduct } from "@/lib/catalog";
import type { CategoryId } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المنتجات",
  description: "محفظة منتجات أجروميد: أسمدة سائلة وذوابة ومعلقة وخامات زراعية عالية النقاء.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat, q } = await searchParams;
  const [rows, cats] = await Promise.all([getPublishedProducts(), getCategories()]);
  const valid = cats.some((c) => c.slug === cat);

  return (
    <>
      <PageHeader
        eyebrow="محفظة منتجاتنا"
        title="المنتجات"
        desc="تركيبات مدروسة لكل مرحلة من مراحل نمو المحصول — سائلة، ذوابة، معلقة، وخامات."
        image="/brand/soil-hands.jpg"
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <ProductBrowser
          products={rows.map(toProduct)}
          initialCategory={valid ? (cat as CategoryId) : "all"}
          initialQuery={q ?? ""}
        />
      </div>
    </>
  );
}
