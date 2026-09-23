import "server-only";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

type JournalEntry = { idx: number; tag: string; when: number };
type Journal = { entries: JournalEntry[] };

/**
 * يطبّق ملفات الترحيل بـSQL خام، ويحافظ على نفس دفتر حسابات drizzle
 * (drizzle.__drizzle_migrations) ليبقى متوافقاً مع drizzle-kit محلياً.
 */
export async function runMigrations() {
  const dir = path.join(process.cwd(), "drizzle");
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, connect_timeout: 15 });

  try {
    const journal = JSON.parse(
      await readFile(path.join(dir, "meta/_journal.json"), "utf8"),
    ) as Journal;
    const files = new Set(await readdir(dir));

    await sql.unsafe("create schema if not exists drizzle");
    await sql.unsafe(`
      create table if not exists drizzle.__drizzle_migrations (
        id serial primary key,
        hash text not null,
        created_at bigint
      )`);

    const done = new Set(
      (await sql`select hash from drizzle.__drizzle_migrations`).map((r) => r.hash as string),
    );

    let applied = 0;
    for (const entry of [...journal.entries].sort((a, b) => a.idx - b.idx)) {
      const file = `${entry.tag}.sql`;
      if (!files.has(file)) throw new Error(`ملف الترحيل مفقود: ${file}`);

      const body = await readFile(path.join(dir, file), "utf8");
      const hash = createHash("sha256").update(body).digest("hex");
      if (done.has(hash)) continue;

      // كل ترحيل في معاملة واحدة: يُطبَّق كاملاً أو لا يُطبَّق
      await sql.begin(async (tx) => {
        for (const stmt of body.split("--> statement-breakpoint")) {
          const s = stmt.trim();
          if (s) await tx.unsafe(s);
        }
        await tx`insert into drizzle.__drizzle_migrations (hash, created_at)
                 values (${hash}, ${entry.when})`;
      });
      console.log(`  ✓ ترحيل: ${entry.tag}`);
      applied++;
    }

    console.log(applied ? `✓ طُبّق ${applied} ترحيل` : "✓ قاعدة البيانات محدّثة");
  } finally {
    await sql.end();
  }
}
