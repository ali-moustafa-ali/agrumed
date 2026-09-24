import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { site } from "@/lib/site";

const arabic = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

// الفوتر يقرأ الأقسام من قاعدة البيانات، فلا تُولَّد صفحات المتجر وقت البناء
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description:
    "أجروميد للتنمية الزراعية والصناعية — تصنيع وتجارة الأسمدة والمخصبات الزراعية وعناصر تغذية النبات، وتوريد الخامات الزراعية عالية النقاء.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={arabic.variable}>
      <body className="font-sans antialiased">
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppFab />
        </CartProvider>
      </body>
    </html>
  );
}
