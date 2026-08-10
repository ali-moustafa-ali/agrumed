"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { useCart } from "./CartProvider";
import QuoteDrawer from "./QuoteDrawer";
import { IconCart, IconClose, IconMail, IconMenu, IconPhone, IconSearch } from "./icons";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => setMenuOpen(false), [pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
  }

  return (
    <>
      <div className="bg-brand-800 text-brand-100 text-xs sm:text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <p className="hidden sm:block">{site.slogan}</p>
          <div className="flex items-center gap-5">
            <a href={`tel:${site.phoneDial}`} className="flex items-center gap-1.5 hover:text-white">
              <IconPhone className="h-4 w-4" />
              <span className="nums">{site.phone}</span>
            </a>
            <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 hover:text-white sm:flex">
              <IconMail className="h-4 w-4" />
              {site.email}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-brand-800 hover:bg-brand-50 lg:hidden"
            aria-label="القائمة"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/brand/logo.png"
              alt={site.legalName}
              width={176}
              height={149}
              priority
              className="h-11 w-auto sm:h-14"
            />
          </Link>

          <nav className="mr-4 hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3.5 py-2 text-[15px] font-semibold transition ${
                    active ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-sand-100 hover:text-brand-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={submitSearch} className="mr-auto hidden max-w-xs flex-1 md:block">
            <div className="flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3.5 py-2 focus-within:border-brand-400">
              <IconSearch className="h-4 w-4 text-ink-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن منتج أو عنصر…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink-500"
              />
            </div>
          </form>

          <button
            onClick={open}
            className="relative mr-auto flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 md:mr-0"
          >
            <IconCart className="h-4 w-4" />
            <span className="hidden sm:inline">طلب عرض سعر</span>
            {count > 0 && (
              <span className="nums absolute -top-1.5 -left-1.5 grid h-5 w-5 place-items-center rounded-full bg-gold-500 text-[11px] font-extrabold text-brand-900">
                {count}
              </span>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-sand-200 bg-white px-4 py-3 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 font-semibold text-ink-700 hover:bg-sand-100"
              >
                {item.label}
              </Link>
            ))}
            <form onSubmit={submitSearch} className="mt-2 flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3.5 py-2">
              <IconSearch className="h-4 w-4 text-ink-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن منتج…"
                className="w-full bg-transparent text-sm outline-none"
              />
            </form>
          </nav>
        )}
        <div className="leaf-divider h-1" />
      </header>

      <QuoteDrawer />
    </>
  );
}
