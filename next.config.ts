import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إخراج مستقل لتشغيل الموقع داخل حاوية Docker خفيفة
  output: "standalone",
  // شعار التطوير يتعارض مع زر واتساب أثناء عرض الموقع على العميل
  devIndicators: false,
};

export default nextConfig;
