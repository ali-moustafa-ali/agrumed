import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import LeadForm from "@/components/LeadForm";
import { IconMail, IconPhone, IconPin, IconWhatsApp } from "@/components/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "تواصل مع فريق أجروميد — مبيعات، دعم فني ميداني، وتوريد الخامات.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="تواصل معنا"
        title="نحن في انتظارك"
        desc="سواء كنت مزارعاً أو موزعاً أو مصنعاً — فريقنا جاهز للرد على استفسارك ووضع الحل المناسب."
        image="/brand/soil-hands.jpg"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/contact", label: "تواصل معنا" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="mb-5 text-2xl font-black text-ink-900">أرسل لنا رسالة</h2>
            <LeadForm mode="contact" />
          </div>

          <aside className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl bg-brand-800 p-6 text-white">
              <h3 className="text-lg font-extrabold">بيانات التواصل</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3">
                  <IconPin className="h-5 w-5 shrink-0 text-gold-400" />
                  <span>
                    <span className="block font-bold">المقر الرئيسي</span>
                    <span className="text-brand-100">{site.hq}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <IconPin className="h-5 w-5 shrink-0 text-gold-400" />
                  <span>
                    <span className="block font-bold">المصنع</span>
                    <span className="text-brand-100">{site.factory}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <IconPhone className="h-5 w-5 shrink-0 text-gold-400" />
                  <a href={`tel:${site.phoneDial}`} className="nums font-bold hover:text-gold-400">
                    {site.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <IconMail className="h-5 w-5 shrink-0 text-gold-400" />
                  <a href={`mailto:${site.email}`} className="font-bold hover:text-gold-400">
                    {site.email}
                  </a>
                </li>
              </ul>
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-extrabold text-white transition hover:brightness-95"
              >
                <IconWhatsApp className="h-5 w-5" />
                محادثة واتساب
              </a>
            </div>

            <div className="rounded-2xl border border-sand-200 p-6">
              <h3 className="font-extrabold text-ink-900">مواعيد العمل</h3>
              <p className="mt-2 text-sm text-ink-500">{site.hours}</p>
              <p className="nums mt-4 border-t border-sand-200 pt-4 text-xs text-ink-500">
                بطاقة ضريبية / سجل تجاري: {site.taxId}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
