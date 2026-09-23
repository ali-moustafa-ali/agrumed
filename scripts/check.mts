import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const rows = await sql`select ref, name, source, stage, governorate, jsonb_array_length(items) as items from leads order by id desc`;
console.table(rows);
const q = await sql`select items from leads where source = 'quote' order by id desc limit 1`;
console.log("المنتجات المرفقة:", JSON.stringify(q[0]?.items, null, 1));
const bots = await sql`select count(*)::int as n from leads where name = 'bot'`;
console.log("سجلات البوت (المفروض 0):", bots[0].n);
await sql.end();
