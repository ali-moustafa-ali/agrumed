import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/queries";
import { toCategory } from "@/lib/catalog";
import { nav, site } from "@/lib/site";
import { IconMail, IconPhone, IconPin } from "./icons";

export default async function Footer() {
  const categories = (await getCategories()).map(toCategory);
  return (
    <footer className="mt-24 bg-brand-800 text-brand-100">
      <div className="leaf-divider h-1.5" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded-2xl bg-white p-3">
            <Image src="/brand/logo.png" alt={site.legalName} width={160} height={135} className="h-16 w-auto" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-brand-200">
            {site.legalName} — كيان مصري رائد ومتخصص في ابتكار وتصنيع وتجارة الأسمدة والمخصبات
            الزراعية ومنتجات تغذية النبات المتطورة.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-extrabold text-white">روابط سريعة</h3>
          <ul className="space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-brand-200 transition hover:text-gold-400">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/quote" className="text-brand-200 transition hover:text-gold-400">
                طلب عرض سعر
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-extrabold text-white">أقسام المنتجات</h3>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/products?cat=${c.id}`}
                  className="text-brand-200 transition hover:text-gold-400"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-extrabold text-white">تواصل معنا</h3>
          <ul className="space-y-3.5 text-sm">
            <li className="flex gap-2.5">
              <IconPin className="h-5 w-5 shrink-0 text-gold-400" />
              <span>
                <span className="block font-semibold text-white">المقر الرئيسي</span>
                {site.hq}
              </span>
            </li>
            <li className="flex gap-2.5">
              <IconPin className="h-5 w-5 shrink-0 text-gold-400" />
              <span>
                <span className="block font-semibold text-white">المصنع</span>
                {site.factory}
              </span>
            </li>
            <li className="flex gap-2.5">
              <IconPhone className="h-5 w-5 shrink-0 text-gold-400" />
              <a href={`tel:${site.phoneDial}`} className="nums hover:text-gold-400">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <IconMail className="h-5 w-5 shrink-0 text-gold-400" />
              <a href={`mailto:${site.email}`} className="hover:text-gold-400">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-700">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-brand-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <span className="nums">{new Date().getFullYear()}</span> {site.legalName} — جميع الحقوق
            محفوظة.
          </p>
          <p className="nums">سجل تجاري / بطاقة ضريبية: {site.taxId}</p>
        </div>
      </div>
    </footer>
  );
}
