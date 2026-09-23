import { getCategories } from "@/lib/queries";
import { requirePermission } from "@/lib/auth/dal";
import { PageHead } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "منتج جديد" };

export default async function NewProductPage() {
  await requirePermission("products:write");
  const cats = await getCategories();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead title="منتج جديد" sub="أضف منتجاً للكتالوج — يظهر على الموقع فور نشره" />
      <ProductForm categories={cats.map((c) => ({ slug: c.slug, name: c.name }))} />
    </div>
  );
}
