/**
 * تطبيق ترحيلات قاعدة البيانات عند إقلاع الحاوية.
 *
 * مكتوب بـSQL خام ولا يعتمد إلا على حزمة postgres، لأن حل وحدات ESM داخل
 * حزمة Next المستقلة لا يتعامل مع المسارات الفرعية لـdrizzle-orm.
 * يحافظ على نفس دفتر حسابات drizzle (drizzle.__drizzle_migrations)
 * فيبقى متوافقاً مع drizzle-kit إن استُخدم محلياً.
 */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL غير مضبوط");
  process.exit(1);
}

const dir = path.resolve("./drizzle");
const sql = postgres(url, { max: 1, connect_timeout: 15 });

try {
  const journal = JSON.parse(await readFile(path.join(dir, "meta/_journal.json"), "utf8"));
  const files = new Set(await readdir(dir));

  await sql.unsafe(`create schema if not exists drizzle`);
  await sql.unsafe(`
    create table if not exists drizzle.__drizzle_migrations (
      id serial primary key,
      hash text not null,
      created_at bigint
    )`);

  const done = new Set(
    (await sql`select hash from drizzle.__drizzle_migrations`).map((r) => r.hash),
  );

  let applied = 0;
  for (const entry of journal.entries.sort((a, b) => a.idx - b.idx)) {
    const file = `${entry.tag}.sql`;
    if (!files.has(file)) throw new Error(`ملف الترحيل مفقود: ${file}`);

    const body = await readFile(path.join(dir, file), "utf8");
    const hash = createHash("sha256").update(body).digest("hex");
    if (done.has(hash)) continue;

    // كل ترحيل في معاملة واحدة: إما يُطبَّق كاملاً أو لا شيء
    await sql.begin(async (tx) => {
      for (const stmt of body.split("--> statement-breakpoint")) {
        const s = stmt.trim();
        if (s) await tx.unsafe(s);
      }
      await tx`insert into drizzle.__drizzle_migrations (hash, created_at)
               values (${hash}, ${entry.when})`;
    });
    console.log(`  ✓ ${entry.tag}`);
    applied++;
  }

  console.log(applied ? `✓ طُبّق ${applied} ترحيل` : "✓ قاعدة البيانات محدّثة");
} catch (err) {
  console.error("✗ فشل الترحيل:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await sql.end();
}
