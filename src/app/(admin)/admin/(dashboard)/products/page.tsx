import Link from "next/link";
import { adminListProducts, getCategories } from "@/lib/queries";
import { requirePermission } from "@/lib/auth/dal";
import { egp } from "@/lib/crm";
import { Card, Empty, PageHead } from "@/components/admin/ui";
import { IcPlus, IcSearch } from "@/components/admin/icons";
import PublishToggle from "@/components/admin/PublishToggle";

export const metadata = { title: "المنتجات" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; status?: string; ok?: string }>;
}) {
  await requirePermission("products:write");
  const sp = await searchParams;
  const [rows, cats] = await Promise.all([
    adminListProducts({
      q: sp.q,
      category: sp.cat,
      status: (sp.status as "all" | "published" | "draft") ?? "all",
    }),
    getCategories(),
  ]);

  const catName = new Map(cats.map((c) => [c.slug, c.name]));
  const tabs = [{ id: "all", label: "الكل" }, ...cats.map((c) => ({ id: c.slug, label: c.name }))];
  const active = sp.cat ?? "all";

  const href = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    if (sp.q) p.set("q", sp.q);
    if (sp.cat) p.set("cat", sp.cat);
    if (sp.status) p.set("status", sp.status);
    for (const [k, v] of Object.entries(over)) {
      if (v === "all") p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `/admin/products?${s}` : "/admin/products";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead
        title="المنتجات"
        sub={`${rows.length} منتج`}
        action={
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <IcPlus className="h-4 w-4" />
            منتج جديد
          </Link>
        }
      />

      {sp.ok === "deleted" && (
        <p className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          تم حذف المنتج.
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={href({ cat: t.id })}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                active === t.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { id: "all", label: "الكل" },
            { id: "published", label: "منشور" },
            { id: "draft", label: "مسودّة" },
          ].map((s) => (
            <Link
              key={s.id}
              href={href({ status: s.id })}
              className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                (sp.status ?? "all") === s.id
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-200"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <form className="mr-auto" action="/admin/products">
          {sp.cat && <input type="hidden" name="cat" value={sp.cat} />}
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 focus-within:border-emerald-500">
            <IcSearch className="h-4 w-4 text-slate-400" />
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="ابحث بالاسم أو المعرّف…"
              className="w-52 bg-transparent text-sm outline-none"
            />
          </div>
        </form>
      </div>

      {rows.length === 0 ? (
        <Empty title="لا توجد منتجات مطابقة" hint="جرّب بحثاً أو قسماً مختلفاً." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-right font-bold">المنتج</th>
                  <th className="px-4 py-3 text-right font-bold">القسم</th>
                  <th className="px-4 py-3 text-right font-bold">NPK</th>
                  <th className="px-4 py-3 text-right font-bold">العبوات</th>
                  <th className="px-4 py-3 text-left font-bold">السعر</th>
                  <th className="px-4 py-3 text-center font-bold">منشور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}`} className="block">
                        <span className="block font-bold text-slate-900">{p.name}</span>
                        <span className="block text-xs text-slate-400" dir="ltr">
                          {p.slug}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {catName.get(p.categorySlug) ?? p.categorySlug}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{p.npk || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.sizes.join("، ") || "—"}</td>
                    <td className="px-4 py-3 text-left font-bold tabular-nums text-slate-900">
                      {p.priceMinor === null ? (
                        <span className="text-xs font-semibold text-slate-400">عند الطلب</span>
                      ) : (
                        egp(p.priceMinor)
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PublishToggle id={p.id} published={p.published} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
