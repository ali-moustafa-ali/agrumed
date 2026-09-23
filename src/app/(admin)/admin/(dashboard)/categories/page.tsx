import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getCategories } from "@/lib/queries";
import { requirePermission } from "@/lib/auth/dal";
import { Card, PageHead } from "@/components/admin/ui";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata = { title: "الأقسام" };

export default async function CategoriesPage() {
  await requirePermission("categories:write");
  const cats = await getCategories();
  const counts = await db
    .select({ slug: products.categorySlug, n: count() })
    .from(products)
    .where(eq(products.published, true))
    .groupBy(products.categorySlug);
  const byCat = new Map(counts.map((c) => [c.slug, Number(c.n)]));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead title="الأقسام" sub="أقسام الكتالوج كما تظهر في الموقع" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cats.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-black text-slate-900">{c.name}</h2>
                  <p className="text-xs text-slate-400" dir="ltr">
                    /{c.slug}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 tabular-nums">
                  {byCat.get(c.slug) ?? 0} منتج
                </span>
              </div>
              <CategoryForm category={c} />
            </Card>
          ))}
        </div>
        <Card className="h-fit p-5">
          <h2 className="mb-4 font-black text-slate-900">إضافة قسم</h2>
          <CategoryForm />
        </Card>
      </div>
    </div>
  );
}
