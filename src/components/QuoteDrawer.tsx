"use client";

import Link from "next/link";
import CartThumb from "./CartThumb";
import { useCart } from "./CartProvider";
import { IconClose, IconCart } from "./icons";

export default function QuoteDrawer() {
  const { lines, isOpen, close, remove, setQty, count } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        aria-label="إغلاق"
        onClick={close}
        className="flex-1 bg-ink-900/40 backdrop-blur-[2px]"
      />
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-brand-800">
            <IconCart className="h-5 w-5" />
            قائمة طلب عرض السعر
            {count > 0 && <span className="nums text-ink-500">({count})</span>}
          </h2>
          <button onClick={close} className="rounded-lg p-2 hover:bg-sand-100" aria-label="إغلاق">
            <IconClose />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
              <IconCart className="h-7 w-7" />
            </div>
            <p className="font-semibold text-ink-700">لم تُضف أي منتجات بعد</p>
            <p className="text-sm text-ink-500">
              أضف المنتجات التي تهمك ثم أرسل طلبك ليصلك عرض سعر رسمي من فريق المبيعات.
            </p>
            <Link
              href="/products"
              onClick={close}
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-sand-200 overflow-y-auto px-5">
              {lines.map((line) => {
                return (
                  <li key={`${line.slug}-${line.size}`} className="flex gap-3 py-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-sand-200 bg-white">
                      <CartThumb line={line} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-ink-900">{line.name}</p>
                      <p className="text-xs text-ink-500">{line.size}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-sand-200">
                          <button
                            onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                            className="px-2.5 py-1 text-lg leading-none text-ink-700 hover:bg-sand-100"
                          >
                            −
                          </button>
                          <span className="nums w-8 text-center text-sm font-bold">{line.qty}</span>
                          <button
                            onClick={() => setQty(line.slug, line.size, line.qty + 1)}
                            className="px-2.5 py-1 text-lg leading-none text-ink-700 hover:bg-sand-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => remove(line.slug, line.size)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <footer className="border-t border-sand-200 p-5">
              <p className="mb-3 rounded-xl bg-sand-100 p-3 text-xs leading-relaxed text-ink-700">
                الأسعار تُحدَّد حسب الكمية وجهة التوريد. أرسل الطلب ويتواصل معك فريق المبيعات خلال
                يوم عمل واحد بعرض سعر رسمي.
              </p>
              <Link
                href="/quote"
                onClick={close}
                className="block rounded-xl bg-brand-600 py-3.5 text-center font-extrabold text-white transition hover:bg-brand-700"
              >
                إتمام طلب عرض السعر
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
