import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToQuote from "@/components/AddToQuote";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { IconCheck, IconLeaf, IconPhone } from "@/components/icons";
import { getCategories, getProductBySlug, getPublishedProducts } from "@/lib/queries";
import { toProduct } from "@/lib/catalog";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getProductBySlug(slug);
  if (!row) return { title: "منتج غير موجود" };
  return { title: row.name, description: row.tagline };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getProductBySlug(slug);
  if (!row || !row.published) notFound();

  const product = toProduct(row);
  const [cats, all] = await Promise.all([getCategories(), getPublishedProducts()]);
  const cat = cats.find((c) => c.slug === product.category);
  const related = all
    .filter((p) => p.categorySlug === product.category && p.slug !== product.slug)
    .slice(0, 4)
    .map(toProduct);

  return (
    <>
      <PageHeader
        eyebrow={cat?.name}
        title={product.name}
        desc={product.tagline}
        image="/brand/seedbed.jpg"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/products", label: "المنتجات" },
          { href: `/products?cat=${product.category}`, label: cat?.name ?? "" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* صورة المنتج */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-sand-200 bg-white">
              <ProductImage
                product={product}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="p-8"
                priority
              />
              {product.npk && (
                <span className="nums absolute top-5 right-5 rounded-full bg-brand-600 px-3.5 py-1.5 text-sm font-extrabold text-white">
                  NPK {product.npk}
                </span>
              )}
            </div>
          </div>

          {/* التفاصيل */}
          <div>
            <p className="text-sm font-bold tracking-wide text-gold-600 uppercase">
              {product.nameEn}
            </p>
            <h2 className="mt-1.5 text-3xl font-black text-ink-900">{product.name}</h2>
            <p className="mt-3 leading-relaxed text-ink-700">{product.tagline}</p>

            {product.origin && (
              <p className="mt-3 inline-block rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-ink-700">
                {product.origin}
              </p>
            )}

            <div className="mt-6 rounded-2xl border border-sand-200 bg-sand-50 p-5">
              <p className="text-sm font-bold text-ink-700">السعر</p>
              {product.price === null ? (
                <>
                  <p className="mt-1 text-xl font-black text-brand-700">السعر عند الطلب</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                    يُحدد السعر حسب الكمية وجهة التوريد. أضف المنتج لطلب عرض السعر أو اتصل بنا
                    مباشرة على{" "}
                    <a href={`tel:${site.phoneDial}`} className="nums font-bold text-brand-700">
                      {site.phone}
                    </a>
                    .
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-3xl font-black text-brand-700">
                    <span className="nums">{product.price.toLocaleString("en-US")}</span>{" "}
                    <span className="text-base font-bold text-ink-500">ج.م</span>
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                    السعر للعبوة الواحدة، غير شامل الشحن. تتوفر أسعار جملة حسب الكمية — اطلب عرض
                    سعر أو اتصل على{" "}
                    <a href={`tel:${site.phoneDial}`} className="nums font-bold text-brand-700">
                      {site.phone}
                    </a>
                    .
                  </p>
                </>
              )}
            </div>

            <div className="mt-6">
              <AddToQuote product={product} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <a
                href={`tel:${site.phoneDial}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-sand-200 py-3 font-bold text-ink-700 hover:border-brand-300"
              >
                <IconPhone className="h-4 w-4" />
                اتصل بالمبيعات
              </a>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 rounded-xl border border-sand-200 py-3 font-bold text-ink-700 hover:border-brand-300"
              >
                <IconLeaf className="h-4 w-4" />
                استشارة فنية
              </Link>
            </div>
          </div>
        </div>

        {/* التركيب / المميزات / معدلات الاستخدام */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-sand-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-brand-800">
              <span className="h-5 w-1.5 rounded-full bg-gold-500" />
              التركيب
            </h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-sand-200">
                {product.composition.map((row) => (
                  <tr key={row.label}>
                    <td className="py-2.5 font-semibold text-ink-700">{row.label}</td>
                    <td className="nums py-2.5 text-left font-extrabold text-brand-700">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border border-sand-200 bg-white p-6 lg:col-span-1">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-brand-800">
              <span className="h-5 w-1.5 rounded-full bg-gold-500" />
              مميزات المنتج
            </h3>
            <ul className="space-y-2.5">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-700">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-sand-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-brand-800">
                <span className="h-5 w-1.5 rounded-full bg-gold-500" />
                معدلات الاستخدام
              </h3>
              <dl className="space-y-3">
                {product.usage.map((u) => (
                  <div key={u.label} className="rounded-xl bg-sand-50 p-3.5">
                    <dt className="text-xs font-bold text-ink-500">{u.label}</dt>
                    <dd className="mt-1 font-extrabold text-ink-900">{u.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-brand-800">
                <span className="h-5 w-1.5 rounded-full bg-gold-500" />
                العبوات المتاحة
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <span
                    key={s}
                    className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-2 text-sm font-bold text-ink-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h3 className="mb-6 text-2xl font-black text-ink-900">منتجات ذات صلة</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
