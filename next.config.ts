import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إخراج مستقل لتشغيل الموقع داخل حاوية Docker خفيفة
  output: "standalone",
  // شعار التطوير يتعارض مع زر واتساب أثناء عرض الموقع على العميل
  devIndicators: false,
  async rewrites() {
    return [
      // عرض السعر مستند مستقل بهويته الخاصة — يُقدَّم خارج تخطيط الموقع
      { source: "/price", destination: "/price/index.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/price",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
