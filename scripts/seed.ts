/**
 * تهيئة قاعدة البيانات: ينشئ المستخدم الإداري الأول ويرحّل الكتالوج
 * من src/lib/products.ts إلى قاعدة البيانات. آمن للتشغيل المتكرر.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { adminUsers, categories, products } from "../src/db/schema";
import { allProducts, categories as seedCategories } from "../src/lib/products";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL غير مضبوط");

const client = postgres(url, { max: 1 });
const db = drizzle(client);

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME ?? "مدير النظام";

  if (!email || !password) {
    console.log("• تخطّي إنشاء المستخدم الإداري (ADMIN_EMAIL/ADMIN_PASSWORD غير مضبوطين)");
    return;
  }
  if (password.length < 10) {
    throw new Error("ADMIN_PASSWORD يجب أن يكون 10 أحرف على الأقل");
  }

  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (existing) {
    console.log(`• المستخدم الإداري موجود بالفعل: ${email}`);
    return;
  }

  await db.insert(adminUsers).values({
    email,
    name,
    passwordHash: await bcrypt.hash(password, 12),
    role: "owner",
  });
  console.log(`✓ أُنشئ المستخدم الإداري: ${email}`);
}

async function seedCatalog() {
  for (const [i, c] of seedCategories.entries()) {
    await db
      .insert(categories)
      .values({
        slug: c.id,
        name: c.name,
        nameEn: c.nameEn,
        short: c.short,
        description: c.description,
        image: c.image,
        sort: i,
      })
      .onConflictDoNothing({ target: categories.slug });
  }
  console.log(`✓ الأقسام: ${seedCategories.length}`);

  let inserted = 0;
  for (const [i, p] of allProducts.entries()) {
    const res = await db
      .insert(products)
      .values({
        slug: p.slug,
        name: p.name,
        nameEn: p.nameEn,
        categorySlug: p.category,
        npk: p.npk ?? null,
        tagline: p.tagline,
        priceMinor: p.price === null ? null : Math.round(p.price * 100),
        unit: p.unit ?? null,
        origin: p.origin ?? null,
        sizes: p.sizes,
        composition: p.composition,
        features: p.features,
        usage: p.usage,
        image: p.category === "raw" ? null : `/products/${p.slug}.jpg`,
        featured: Boolean(p.featured),
        published: true,
        sort: i,
      })
      .onConflictDoNothing({ target: products.slug })
      .returning({ id: products.id });
    if (res.length) inserted++;
  }
  console.log(`✓ المنتجات: ${inserted} مضاف / ${allProducts.length} إجمالي`);
}

async function main() {
  await seedAdmin();
  await seedCatalog();
  await client.end();
  console.log("تمت التهيئة.");
}

main().catch(async (err) => {
  console.error("فشلت التهيئة:", err);
  await client.end();
  process.exit(1);
});
