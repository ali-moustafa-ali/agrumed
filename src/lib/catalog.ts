import "server-only";
import type { Product as DbProduct, Category as DbCategory } from "@/db/schema";
import type { Category, Product } from "@/lib/types";

/**
 * يحوّل صفوف قاعدة البيانات إلى الأشكال التي تستهلكها مكوّنات الواجهة،
 * حتى تبقى المكوّنات كما هي دون تعديل.
 */
export function toProduct(row: DbProduct): Product {
  return {
    slug: row.slug,
    name: row.name,
    nameEn: row.nameEn,
    category: row.categorySlug as Product["category"],
    npk: row.npk ?? undefined,
    tagline: row.tagline,
    price: row.priceMinor === null ? null : row.priceMinor / 100,
    unit: row.unit ?? undefined,
    sizes: row.sizes,
    composition: row.composition,
    features: row.features,
    usage: row.usage,
    image: row.image ?? undefined,
    featured: row.featured,
    origin: row.origin ?? undefined,
  };
}

export function toCategory(row: DbCategory): Category {
  return {
    id: row.slug as Category["id"],
    name: row.name,
    nameEn: row.nameEn,
    short: row.short,
    description: row.description,
    image: row.image ?? "",
  };
}
