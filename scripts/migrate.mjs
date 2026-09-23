/**
 * تطبيق ترحيلات قاعدة البيانات عند إقلاع الحاوية.
 * يستخدم مُرحِّل drizzle-orm (JavaScript خالص) فلا يحتاج drizzle-kit ولا esbuild
 * داخل صورة التشغيل.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL غير مضبوط — تخطّي الترحيل");
  process.exit(1);
}

const client = postgres(url, { max: 1, connect_timeout: 15 });

try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("✓ الترحيلات مطبّقة");
} catch (err) {
  console.error("✗ فشل الترحيل:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
