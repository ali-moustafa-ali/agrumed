import Image from "next/image";
import Link from "next/link";

export default function PageHeader({
  eyebrow,
  title,
  desc,
  image = "/brand/soil-hands.jpg",
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  image?: string;
  breadcrumbs?: { href: string; label: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-brand-800 text-white">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-25" priority />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
        {breadcrumbs && (
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-brand-100">
            {breadcrumbs.map((b, i) => (
              <span key={b.href} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-brand-300">/</span>}
                <Link href={b.href} className="transition hover:text-gold-400">
                  {b.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <p className="text-sm font-extrabold tracking-widest text-gold-400 uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1>
        {desc && <p className="mt-3 max-w-2xl leading-relaxed text-brand-100">{desc}</p>}
      </div>
      <div className="leaf-divider absolute inset-x-0 bottom-0 h-1.5" />
    </section>
  );
}
