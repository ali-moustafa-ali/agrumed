import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "../globals.css";

const arabic = Cairo({ subsets: ["arabic", "latin"], variable: "--font-arabic", display: "swap" });

export const metadata: Metadata = {
  title: { default: "لوحة التحكم | أجروميد", template: "%s | لوحة التحكم" },
  robots: { index: false, follow: false },
};

/** تخطيط جذري مستقل للوحة التحكم — لا يرث هيدر المتجر ولا فوتره. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={arabic.variable}>
      <body className="bg-slate-100 font-sans text-slate-800 antialiased">{children}</body>
    </html>
  );
}
