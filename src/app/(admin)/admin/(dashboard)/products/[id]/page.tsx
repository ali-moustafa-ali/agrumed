import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetProduct, getCategories } from "@/lib/queries";
import { requirePermission } from "@/lib/auth/dal";
import { PageHead } from "@/components/admin/ui";
import { IcArrow } from "@/components/admin/icons";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  await requirePermission("products:write");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [product, cats] = await Promise.all([adminGetProduct(Number(id)), getCategories()]);
  if (!product) notFound();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900"
      >
        <IcArrow className="h-4 w-4" />
        رجوع للمنتجات
      </Link>
      <PageHead title={product.name} sub={product.slug} />
      {sp.ok === "created" && (
        <p className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          تمت إضافة المنتج بنجاح.
        </p>
      )}
      <ProductForm product={product} categories={cats.map((c) => ({ slug: c.slug, name: c.name }))} />
    </div>
  );
}
