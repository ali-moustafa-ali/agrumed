/**
 * يعمل مرة واحدة عند إقلاع خادم Next وقبل استقبال أي طلب.
 * نطبّق ترحيلات قاعدة البيانات هنا لأن Next يحزم هذا الملف مع تبعياته،
 * فلا نواجه مشاكل حل الوحدات التي تظهر مع سكربت خارجي داخل الحزمة المستقلة.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.DATABASE_URL) {
    console.warn("⚠ DATABASE_URL غير مضبوط — تخطّي الترحيلات");
    return;
  }

  const { runMigrations } = await import("@/lib/migrate");
  try {
    await runMigrations();
  } catch (err) {
    // لا نُسقط الخادم: الإسقاط يسبّب دورة إعادة تشغيل تخفي السبب،
    // والخطأ هنا ظاهر في اللوجز وسيظهر فوراً عند أول استعلام.
    console.error("✗ فشل تطبيق الترحيلات:", err instanceof Error ? err.message : err);
  }
}
