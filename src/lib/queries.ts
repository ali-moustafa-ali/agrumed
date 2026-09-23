import "server-only";
import { and, asc, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLog, categories, leadNotes, leads, products } from "@/db/schema";

/* ───────────────────────── الكتالوج (الواجهة) ───────────────────────── */

export async function getPublishedProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.published, true))
    .orderBy(asc(products.sort), asc(products.id));
}

export async function getProductBySlug(slug: string) {
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return row ?? null;
}

export async function getAllProductSlugs() {
  return db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.published, true));
}

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.sort), asc(categories.id));
}

export async function getFeaturedProducts(limit = 8) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.published, true), eq(products.featured, true)))
    .orderBy(asc(products.sort), asc(products.id))
    .limit(limit);
}

/* ───────────────────────── الكتالوج (الإدارة) ───────────────────────── */

export async function adminListProducts(opts: {
  q?: string;
  category?: string;
  status?: "all" | "published" | "draft";
}) {
  const where = [];
  if (opts.q) {
    const term = `%${opts.q}%`;
    where.push(
      or(
        ilike(products.name, term),
        ilike(products.nameEn, term),
        ilike(products.slug, term),
        ilike(products.tagline, term),
      )!,
    );
  }
  if (opts.category && opts.category !== "all") {
    where.push(eq(products.categorySlug, opts.category));
  }
  if (opts.status === "published") where.push(eq(products.published, true));
  if (opts.status === "draft") where.push(eq(products.published, false));

  return db
    .select()
    .from(products)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(products.sort), desc(products.id));
}

export async function adminGetProduct(id: number) {
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return row ?? null;
}

/* ───────────────────────── العملاء المحتملون ───────────────────────── */

export async function adminListLeads(opts: { q?: string; stage?: string; source?: string }) {
  const where = [];
  if (opts.q) {
    const term = `%${opts.q}%`;
    where.push(
      or(
        ilike(leads.name, term),
        ilike(leads.phone, term),
        ilike(leads.company, term),
        ilike(leads.ref, term),
      )!,
    );
  }
  if (opts.stage && opts.stage !== "all") where.push(eq(leads.stage, opts.stage));
  if (opts.source && opts.source !== "all") where.push(eq(leads.source, opts.source));

  return db
    .select()
    .from(leads)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(300);
}

export async function adminGetLead(id: number) {
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!row) return null;
  const notes = await db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, id))
    .orderBy(desc(leadNotes.createdAt));
  return { ...row, notes };
}

/* ───────────────────────── مؤشرات لوحة التحكم ───────────────────────── */

export type Kpis = {
  leadsTotal: number;
  leadsNew: number;
  leads30d: number;
  leadsPrev30d: number;
  quoteRequests: number;
  wonCount: number;
  pipelineMinor: number;
  productsPublished: number;
  productsDraft: number;
  byStage: { stage: string; n: number }[];
  byGovernorate: { governorate: string; n: number }[];
  topProducts: { slug: string; name: string; n: number }[];
  daily: { day: string; n: number }[];
};

export async function getKpis(): Promise<Kpis> {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 864e5);
  const d60 = new Date(now.getTime() - 60 * 864e5);
  // sql الخام يحتاج نصاً مع cast صريح — تمرير كائن Date يفشل في postgres-js
  const t30 = sql`${d30.toISOString()}::timestamptz`;
  const t60 = sql`${d60.toISOString()}::timestamptz`;

  const [
    totals,
    stages,
    gov,
    daily,
    items,
    prod,
  ] = await Promise.all([
    db
      .select({
        total: count(),
        newCount: sql<number>`count(*) filter (where ${leads.stage} = 'new')::int`,
        last30: sql<number>`count(*) filter (where ${leads.createdAt} >= ${t30})::int`,
        prev30: sql<number>`count(*) filter (where ${leads.createdAt} >= ${t60} and ${leads.createdAt} < ${t30})::int`,
        quotes: sql<number>`count(*) filter (where ${leads.source} = 'quote')::int`,
        won: sql<number>`count(*) filter (where ${leads.stage} = 'won')::int`,
        pipeline: sql<number>`coalesce(sum(${leads.valueMinor}) filter (where ${leads.stage} not in ('won','lost')), 0)::int`,
      })
      .from(leads),
    db
      .select({ stage: leads.stage, n: count() })
      .from(leads)
      .groupBy(leads.stage),
    db
      .select({ governorate: sql<string>`coalesce(nullif(${leads.governorate}, ''), 'غير محدد')`, n: count() })
      .from(leads)
      .groupBy(sql`1`)
      .orderBy(desc(count()))
      .limit(8),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${leads.createdAt}), 'YYYY-MM-DD')`,
        n: count(),
      })
      .from(leads)
      .where(gte(leads.createdAt, d30))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db.execute(sql`
      select it->>'slug' as slug,
             coalesce(it->>'name', it->>'slug') as name,
             count(*)::int as n
      from ${leads}, jsonb_array_elements(${leads.items}) as it
      group by 1, 2
      order by n desc
      limit 8
    `),
    db
      .select({
        published: sql<number>`count(*) filter (where ${products.published})::int`,
        draft: sql<number>`count(*) filter (where not ${products.published})::int`,
      })
      .from(products),
  ]);

  const t = totals[0];
  return {
    leadsTotal: t?.total ?? 0,
    leadsNew: t?.newCount ?? 0,
    leads30d: t?.last30 ?? 0,
    leadsPrev30d: t?.prev30 ?? 0,
    quoteRequests: t?.quotes ?? 0,
    wonCount: t?.won ?? 0,
    pipelineMinor: t?.pipeline ?? 0,
    productsPublished: prod[0]?.published ?? 0,
    productsDraft: prod[0]?.draft ?? 0,
    byStage: stages.map((s) => ({ stage: s.stage, n: Number(s.n) })),
    byGovernorate: gov.map((g) => ({ governorate: g.governorate, n: Number(g.n) })),
    topProducts: (items as unknown as { slug: string; name: string; n: number }[]).map((r) => ({
      slug: r.slug,
      name: r.name,
      n: Number(r.n),
    })),
    // نملأ الأيام الفارغة هنا حتى لا يحسب المكوّن التاريخ أثناء العرض
    daily: (() => {
      const map = new Map(daily.map((d) => [d.day, Number(d.n)]));
      const out: { day: string; n: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const key = new Date(now.getTime() - i * 864e5).toISOString().slice(0, 10);
        out.push({ day: key, n: map.get(key) ?? 0 });
      }
      return out;
    })(),
  };
}

export async function getRecentLeads(limit = 8) {
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit);
}

export async function getRecentAudit(limit = 10) {
  return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}

