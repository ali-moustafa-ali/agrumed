import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import LeadForm from "@/components/LeadForm";
import QuoteSummary from "@/components/QuoteSummary";
import { IconCheck, IconMail, IconPhone } from "@/components/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "طلب عرض سعر",
  description: "أرسل قائمة منتجاتك ويصلك عرض سعر رسمي من فريق مبيعات أجروميد خلال يوم عمل.",
};

const steps = [
  "تختار المنتجات والعبوات التي تحتاجها",
  "ترسل بياناتك وملاحظاتك على الطلب",
  "يتواصل معك مندوب المبيعات بعرض سعر رسمي",
];

export default function QuotePage() {
  return (
    <>
      <PageHeader
        eyebrow="خدمة العملاء"
        title="طلب عرض سعر"
        desc="أسعارنا تُحدَّد حسب الكمية وجهة التوريد — أرسل طلبك ويصلك عرض رسمي خلال يوم عمل واحد."
        image="/brand/field-grass.jpg"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/quote", label: "طلب عرض سعر" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="mb-5 text-2xl font-black text-ink-900">بيانات طلب عرض السعر</h2>
            <LeadForm mode="quote" />
          </div>

          <aside className="space-y-6 lg:col-span-2">
            <QuoteSummary />

            <div className="rounded-2xl border border-sand-200 bg-sand-50 p-6">
              <h3 className="font-extrabold text-ink-900">كيف تتم العملية؟</h3>
              <ol className="mt-4 space-y-3">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 text-sm text-ink-700">
                    <span className="nums grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-sand-200 p-6">
              <h3 className="font-extrabold text-ink-900">تفضل التواصل المباشر؟</h3>
              <div className="mt-4 space-y-3 text-sm">
                <a
                  href={`tel:${site.phoneDial}`}
                  className="flex items-center gap-2.5 font-bold text-brand-700 hover:underline"
                >
                  <IconPhone className="h-4 w-4" />
                  <span className="nums">{site.phone}</span>
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-2.5 font-bold text-brand-700 hover:underline"
                >
                  <IconMail className="h-4 w-4" />
                  {site.email}
                </a>
                <p className="flex items-start gap-2.5 text-ink-500">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {site.hours}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
