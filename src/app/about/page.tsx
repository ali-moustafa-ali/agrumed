import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { IconArrow, IconCheck, IconLeaf } from "@/components/icons";
import { advantages, services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "عن الشركة",
  description:
    "شركة أجروميد للتنمية الزراعية والصناعية — رؤيتنا ورسالتنا وقيمنا وقطاعات أعمالنا وخدماتنا المتكاملة.",
};

const values = [
  { title: "الجودة والتميز", desc: "لا مساومة في معايير الإنتاج." },
  { title: "الابتكار والتطوير", desc: "البحث المستمر عن صيغ كيميائية وحيوية أفضل." },
  { title: "النزاهة والشفافية", desc: "وضوح تام في كافة تعاملاتنا ومكونات منتجاتنا." },
  { title: "الاستدامة البيئية", desc: "الحفاظ على الموارد الطبيعية وحماية التربة من الإجهاد." },
  { title: "شغف الخدمة", desc: "وضع العميل والمزارع في مقدمة أولوياتنا." },
];

const goals = [
  "ترسيخ مكانة «أجروميد» كعلامة تجارية مرجعية في قطاع المخصبات والأسمدة.",
  "صياغة شبكة توزيع وطنية قوية تغطي كافة محافظات مصر عبر وكلاء معتمدين.",
  "فتح قنوات تصديرية واعدة في الأسواق الأفريقية والعربية والشرق أوسطية.",
  "تكريس الاستثمار في البحث والتطوير (R&D) لابتكار معالجات نوعية للمشاكل الزراعية المستجدة.",
  "رعاية المزارع المصري من خلال ورش العمل وبرامج التسميد المخصصة والمتابعة المستمرة.",
  "بناء تحالفات استراتيجية طويلة الأجل مع كبرى الكيانات والمزارع التجارية لضمان توريد مستدام.",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="من نحن"
        title={site.legalName}
        desc={site.tagline}
        image="/brand/soil-hands.jpg"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/about", label: "عن الشركة" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-14">
        {/* نبذة */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black text-ink-900">نبذة عن الشركة</h2>
            <div className="mt-5 space-y-4 leading-loose text-ink-700">
              <p>
                تأسست شركة أجروميد للتنمية الزراعية والصناعية ككيان مصري رائد ومتخصص في ابتكار،
                تصنيع، وتجارة الأسمدة، المخصبات الزراعية، ومنتجات تغذية النبات المتطورة.
              </p>
              <p>
                يمثل مصنع الشركة في المنطقة الصناعية بمدينة المنيا الجديدة قفزة تكنولوجية في هذا
                القطاع؛ حيث تم تزويده بأحدث خطوط الإنتاج والآليات الذكية في المنطقة، ليشكل قاعدة
                صناعية ضخمة لإنتاج الأسمدة السائلة، المركبة، والمعلقة، بالإضافة إلى العناصر الصغرى
                المخلبية ومحسنات التربة.
              </p>
              <p>
                نعتمد على الدمج الذكي بين التقنيات الإسبانية المتطورة وبين الخبرة التطبيقية المصرية،
                بما يضمن خروج منتجات فريدة: بقاء كيميائي ثابت، سرعة ذوبان، وكفاءة امتصاص قصوى.
              </p>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-sand-50 p-5">
                <dt className="text-xs font-bold text-ink-500">المقر الرئيسي</dt>
                <dd className="mt-1 font-extrabold text-ink-900">{site.hq}</dd>
              </div>
              <div className="rounded-2xl bg-sand-50 p-5">
                <dt className="text-xs font-bold text-ink-500">المصنع</dt>
                <dd className="mt-1 font-extrabold text-ink-900">{site.factory}</dd>
              </div>
            </dl>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-3xl">
            <Image
              src="/brand/seedbed.jpg"
              alt="مصنع ومنتجات أجروميد"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>

        {/* الرؤية والرسالة */}
        <section className="mt-16 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl bg-brand-800 p-8 text-white">
            <h3 className="flex items-center gap-2 text-2xl font-black">
              <IconLeaf className="h-6 w-6 text-gold-400" />
              رؤيتنا
            </h3>
            <p className="mt-4 leading-loose text-brand-100">
              أن نتبوأ الصدارة كشريك موثوق وخيار أول في قطاع تصنيع الأسمدة والمخصبات الزراعية في مصر
              ومنطقة الشرق الأوسط وأفريقيا، وأن نقود قاطرة الابتكار الزراعي بما يدعم الأمن الغذائي
              ويرفع كفاءة وتنافسية المنتج الزراعي العربي في الأسواق العالمية.
            </p>
          </article>
          <article className="rounded-3xl border border-sand-200 bg-white p-8">
            <h3 className="flex items-center gap-2 text-2xl font-black text-ink-900">
              <IconLeaf className="h-6 w-6 text-brand-600" />
              رسالتنا
            </h3>
            <p className="mt-4 leading-loose text-ink-700">
              صناعة وتطوير مدخلات زراعية فائقة الجودة بالاعتماد على البحث العلمي وأحدث التقنيات
              العالمية، لتوفير حلول تغذية متكاملة تحمي التربة وتغذي النبات، بالتوازي مع تقديم دعم
              ميداني وإرشادي مستمر يضمن للمزارع والمستثمر أعلى عائد على الاستثمار.
            </p>
          </article>
        </section>

        {/* القيم */}
        <section className="mt-16">
          <h2 className="text-3xl font-black text-ink-900">قيمنا الجوهرية</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-sand-200 bg-white p-5">
                <h3 className="font-extrabold text-brand-700">{v.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* الأهداف */}
        <section className="mt-16 rounded-3xl bg-sand-50 p-8 sm:p-10">
          <h2 className="text-3xl font-black text-ink-900">الأهداف الاستراتيجية</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {goals.map((g) => (
              <li key={g} className="flex items-start gap-3 text-sm leading-relaxed text-ink-700">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {g}
              </li>
            ))}
          </ul>
        </section>

        {/* الخدمات */}
        <section className="mt-16">
          <h2 className="text-3xl font-black text-ink-900">خدماتنا المتكاملة</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-sand-200 bg-white p-6 transition hover:border-brand-200 hover:shadow-md"
              >
                <h3 className="text-lg font-extrabold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* الميزة التنافسية */}
        <section className="mt-16">
          <h2 className="text-3xl font-black text-ink-900">ميزتنا التنافسية</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-sand-200">
            <table className="w-full text-sm">
              <thead className="bg-brand-800 text-white">
                <tr>
                  <th className="px-5 py-3.5 text-right font-extrabold">الميزة</th>
                  <th className="px-5 py-3.5 text-right font-extrabold">العائد على العميل / المزارع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 bg-white">
                {advantages.map((a) => (
                  <tr key={a.title}>
                    <td className="px-5 py-4 font-extrabold text-brand-700">{a.title}</td>
                    <td className="px-5 py-4 text-ink-700">{a.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-14 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 font-extrabold text-white transition hover:bg-brand-700"
          >
            تصفح محفظة منتجاتنا
            <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
