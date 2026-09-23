"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLog, categories, products } from "@/db/schema";
import { requirePermission } from "@/lib/auth/dal";
import type { SpecRow } from "@/lib/types";

export type FormState = { error?: string; ok?: string };

/** يحدّث صفحات الواجهة المتأثرة بتعديل الكتالوج. */
function refreshStorefront(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/raw-materials");
  if (slug) revalidatePath(`/products/${slug}`);
}

function parsePairs(raw: string): SpecRow[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.lastIndexOf("|");
      if (i === -1) return { label: line, value: "" };
      return { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
    });
}

function parseList(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseCsv(raw: string): string[] {
  return raw
    .split(/[,،\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 110);
}

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();

  return {
    name,
    slug: slugify(slugRaw || name),
    nameEn: String(formData.get("nameEn") ?? "").trim(),
    categorySlug: String(formData.get("categorySlug") ?? "").trim(),
    npk: String(formData.get("npk") ?? "").trim() || null,
    tagline: String(formData.get("tagline") ?? "").trim(),
    origin: String(formData.get("origin") ?? "").trim() || null,
    // السعر يُخزَّن بالقرش
    priceMinor: priceRaw === "" ? null : Math.round(Number(priceRaw) * 100),
    sizes: parseCsv(String(formData.get("sizes") ?? "")),
    composition: parsePairs(String(formData.get("composition") ?? "")),
    features: parseList(String(formData.get("features") ?? "")),
    usage: parsePairs(String(formData.get("usage") ?? "")),
    image: String(formData.get("image") ?? "").trim() || null,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sort: Number(formData.get("sort") ?? 0) || 0,
  };
}

function validate(v: ReturnType<typeof readForm>): string | null {
  if (!v.name) return "اسم المنتج مطلوب.";
  if (!v.slug) return "المعرّف (slug) مطلوب.";
  if (!v.categorySlug) return "اختر القسم.";
  if (v.priceMinor !== null && (!Number.isFinite(v.priceMinor) || v.priceMinor < 0)) {
    return "السعر غير صالح.";
  }
  return null;
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission("products:write");
  const v = readForm(formData);
  const bad = validate(v);
  if (bad) return { error: bad };

  const [dupe] = await db.select({ id: products.id }).from(products).where(eq(products.slug, v.slug)).limit(1);
  if (dupe) return { error: "يوجد منتج آخر بنفس المعرّف (slug)." };

  const [row] = await db.insert(products).values(v).returning({ id: products.id, slug: products.slug });
  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: "create",
    entity: "product",
    entityId: String(row.id),
    detail: v.name,
  });

  refreshStorefront(row.slug);
  redirect(`/admin/products/${row.id}?ok=created`);
}

export async function updateProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission("products:write");
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return { error: "معرّف المنتج غير صالح." };

  const v = readForm(formData);
  const bad = validate(v);
  if (bad) return { error: bad };

  const [dupe] = await db.select({ id: products.id }).from(products).where(eq(products.slug, v.slug)).limit(1);
  if (dupe && dupe.id !== id) return { error: "يوجد منتج آخر بنفس المعرّف (slug)." };

  const [before] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, id)).limit(1);

  await db.update(products).set({ ...v, updatedAt: new Date() }).where(eq(products.id, id));
  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: "update",
    entity: "product",
    entityId: String(id),
    detail: v.name,
  });

  refreshStorefront(v.slug);
  if (before?.slug && before.slug !== v.slug) revalidatePath(`/products/${before.slug}`);
  return { ok: "تم حفظ التعديلات." };
}

export async function toggleProductPublished(id: number, next: boolean) {
  const user = await requirePermission("products:write");
  const [row] = await db
    .update(products)
    .set({ published: next, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning({ slug: products.slug, name: products.name });

  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: next ? "publish" : "unpublish",
    entity: "product",
    entityId: String(id),
    detail: row?.name,
  });
  refreshStorefront(row?.slug);
}

export async function deleteProduct(id: number) {
  const user = await requirePermission("products:write");
  const [row] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning({ slug: products.slug, name: products.name });

  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: "delete",
    entity: "product",
    entityId: String(id),
    detail: row?.name,
  });
  refreshStorefront(row?.slug);
  redirect("/admin/products?ok=deleted");
}

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission("categories:write");
  const id = Number(formData.get("id"));
  const values = {
    slug: slugify(String(formData.get("slug") ?? "")),
    name: String(formData.get("name") ?? "").trim(),
    nameEn: String(formData.get("nameEn") ?? "").trim(),
    short: String(formData.get("short") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim() || null,
    sort: Number(formData.get("sort") ?? 0) || 0,
  };
  if (!values.name || !values.slug) return { error: "الاسم والمعرّف مطلوبان." };

  if (Number.isFinite(id) && id > 0) {
    await db.update(categories).set(values).where(eq(categories.id, id));
  } else {
    await db.insert(categories).values(values);
  }

  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: id > 0 ? "update" : "create",
    entity: "category",
    entityId: String(id || values.slug),
    detail: values.name,
  });

  refreshStorefront();
  revalidatePath("/admin/categories");
  return { ok: "تم الحفظ." };
}
