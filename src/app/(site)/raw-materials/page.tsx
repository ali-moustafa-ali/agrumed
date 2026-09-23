import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ProductBrowser from "@/components/ProductBrowser";
import { IconCheck, IconShield, IconTruck, IconFlask } from "@/components/icons";
import { getPublishedProducts } from "@/lib/queries";
import { toProduct } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "الخامات الزراعية",
  description:
    "توريد واستيراد الخامات الزراعية عالية النقاء لمصانع الأسمدة والموزعين، بشهادات تحليل معتمدة لكل شحنة.",
};

const points = [
  {
    icon: IconShield,
    title: "شهادة تحليل لكل شحنة",
    desc: "كل دفعة واردة تخضع للفحص المعملي قبل الإفراج عنها للعملاء.",
  },
  {
    icon: IconFlask,
    title: "نقاء صناعي عالٍ",
    desc: "خامات خالية من الشوائب والمعادن الثقيلة ومناسبة لشبكات الري الحديث.",
  },
  {
    icon: IconTruck,
    title: "توريد بالكميات",
    desc: "من العبوة الواحدة إلى الحاويات الكاملة، مع مرونة في جدولة التسليم.",
  },
];

export const dynamic = "force-dynamic";

export default async function RawMaterialsPage() {
  const rows = await getPublishedProducts();
  const rawMaterials = rows.filter((p) => p.categorySlug === "raw").map(toProduct);
  return (
    <>
      <PageHeader
        eyebrow="التجارة والتوريد"
        title="الخامات الزراعية"
        desc="نستورد ونورّد الخامات الأولية عالية النقاء لمصانع الأسمدة والمخصبات والموزعين في مصر والمنطقة."
        image="/brand/field-grass.jpg"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/raw-materials", label: "الخامات" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12 grid gap-5 sm:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="rounded-2xl border border-sand-200 bg-white p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <p.icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-ink-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-2xl border border-gold-500/40 bg-gold-500/10 p-5">
          <p className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-700">
            <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
            <span>
              القائمة أدناه نموذج مبدئي للخامات الأكثر طلباً. تُحدَّث حسب قوائم الاستيراد الفعلية —
              لطلب خامة غير مدرجة، تواصل مع قسم التوريد مباشرة.
            </span>
          </p>
        </div>

        <ProductBrowser products={rawMaterials} initialCategory="raw" lockCategory />
      </div>
    </>
  );
}
