import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories, featuredProducts } from "@/lib/products";
import { advantages, sectors, site } from "@/lib/site";
import {
  IconArrow,
  IconCheck,
  IconDrop,
  IconFlask,
  IconLeaf,
  IconShield,
  IconSupport,
  IconTruck,
} from "@/components/icons";

const catIcons = {
  liquid: IconDrop,
  soluble: IconFlask,
  suspension: IconLeaf,
  raw: IconTruck,
} as const;

const advIcons = [IconShield, IconFlask, IconCheck, IconDrop, IconShield, IconSupport];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sand-50">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-700">
              <IconLeaf className="h-4 w-4" />
              تقنية إسبانية متطورة · أيدٍ مصرية خبيرة
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.25] text-ink-900 sm:text-5xl">
              نبتكر حلولاً زراعية <span className="text-brand-600">مستدامة</span>
              <br />
              لنمو أفضل و<span className="text-gold-500">إنتاج أعلى</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-700">
              أسمدة سائلة وذوابة ومعلقة عالية النقاء، وخامات زراعية مستوردة — تُصنَّع بخطوط إنتاج
              مؤتمتة بالكامل وتُفحص معملياً قبل خروجها من المصنع.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-extrabold text-white transition hover:bg-brand-700"
              >
                تصفح المنتجات
                <IconArrow className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="rounded-full border-2 border-brand-600 px-7 py-3.5 font-extrabold text-brand-700 transition hover:bg-brand-50"
              >
                تحدث مع مهندس زراعي
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-sand-200 pt-6">
              {[
                { k: "+33", v: "منتج في الكتالوج" },
                { k: "100%", v: "ذوبانية في الماء" },
                { k: "6", v: "قطاعات زراعية مخدومة" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="nums text-2xl font-black text-brand-600">{s.k}</dt>
                  <dd className="mt-1 text-xs font-semibold text-ink-500">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-3xl lg:aspect-square">
            <Image
              src="/brand/planting.jpg"
              alt="زراعة مستدامة مع أجروميد"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 backdrop-blur sm:inset-x-6 sm:bottom-6">
              <p className="font-extrabold text-brand-700">{site.slogan}</p>
              <p className="mt-1 text-sm text-ink-500">
                مصنعنا بالمنطقة الصناعية — المنيا الجديدة، بخطوط إنتاج وآليات تعبئة ذكية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHead
          eyebrow="محفظة منتجاتنا"
          title="أقسام المنتجات"
          desc="اختر القسم المناسب لبرنامجك السمادي — كل منتج مصمم لمرحلة نمو محددة."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = catIcons[c.id];
            return (
              <Link
                key={c.id}
                href={`/products?cat=${c.id}`}
                className="group relative overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-ink-900">{c.name}</h3>
                <p className="mt-0.5 text-xs font-bold tracking-wide text-gold-600 uppercase">
                  {c.nameEn}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{c.short}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  استعرض القسم
                  <IconArrow className="h-4 w-4 transition group-hover:-translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-sand-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead
            eyebrow="الأكثر طلباً"
            title="منتجات مختارة"
            desc="تركيبات أساسية تغطي مراحل التأسيس والتزهير والعقد والتلوين."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-8 py-3.5 font-extrabold text-brand-700 transition hover:bg-brand-600 hover:text-white"
            >
              عرض كل المنتجات
              <IconArrow className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHead
          eyebrow="ميزتنا التنافسية"
          title="لماذا أجروميد؟"
          desc="لا نبيع مجرد منتج، بل نؤسس لعلاقات عمل طويلة الأجل مبنية على القيمة المضافة."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a, i) => {
            const Icon = advIcons[i % advIcons.length];
            return (
              <div
                key={a.title}
                className="rounded-2xl border border-sand-200 bg-white p-6 transition hover:border-brand-200 hover:shadow-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold-500/15 text-gold-600">
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-ink-900">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{a.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sectors */}
      <section className="relative overflow-hidden bg-brand-800 py-16 text-white">
        <Image
          src="/brand/field-grass.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-extrabold tracking-widest text-gold-400 uppercase">
              قطاعات الأعمال
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">من نخدم؟</h2>
            <p className="mt-3 text-brand-100">
              نخدم كل حلقات المنظومة الزراعية — من المزارع الفردي إلى شركات الاستصلاح ومزارع التصدير.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition hover:bg-white/15"
              >
                <h3 className="flex items-center gap-2 text-lg font-extrabold">
                  <IconLeaf className="h-5 w-5 text-gold-400" />
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-100">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid overflow-hidden rounded-3xl border border-sand-200 lg:grid-cols-2">
          <div className="bg-sand-50 p-8 sm:p-12">
            <h2 className="text-3xl font-black leading-tight text-ink-900">
              نبني برنامجك السمادي
              <br />
              <span className="text-brand-600">بناءً على تحليل تربتك ومياهك</span>
            </h2>
            <p className="mt-4 leading-relaxed text-ink-700">
              مهندسونا الاستشاريون يزورون المزرعة، يحللون التربة والمياه، ويضعون برنامجاً متكاملاً
              لكل محصول طوال الموسم — مع متابعة ميدانية دورية.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "تركيبات خاصة (Private Label) لحساب الشركات",
                "توريد خامات مستوردة بشهادات تحليل معتمدة",
                "دعم فني ميداني وحل المشكلات في الحقل فوراً",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm font-semibold text-ink-700">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-extrabold text-white transition hover:bg-brand-700"
            >
              اطلب زيارة فنية
              <IconArrow className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-64">
            <Image
              src="/brand/seedbed.jpg"
              alt="شتلات زراعية"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="text-sm font-extrabold tracking-widest text-gold-600 uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black text-ink-900 sm:text-4xl">{title}</h2>
      {desc && <p className="mt-3 leading-relaxed text-ink-500">{desc}</p>}
    </div>
  );
}
