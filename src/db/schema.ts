import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { SpecRow } from "@/lib/types";

/* ───────────────────────── المستخدمون ───────────────────────── */

export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 160 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    // owner: صلاحية كاملة | sales: العملاء فقط | editor: المحتوى فقط
    role: varchar("role", { length: 20 }).notNull().default("sales"),
    active: boolean("active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("admin_users_email_idx").on(t.email)],
);

/* ───────────────────────── الكتالوج ───────────────────────── */

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    nameEn: varchar("name_en", { length: 160 }).notNull().default(""),
    short: text("short").notNull().default(""),
    description: text("description").notNull().default(""),
    image: text("image"),
    sort: integer("sort").notNull().default(0),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    nameEn: varchar("name_en", { length: 200 }).notNull().default(""),
    categorySlug: varchar("category_slug", { length: 80 }).notNull(),
    npk: varchar("npk", { length: 40 }),
    tagline: text("tagline").notNull().default(""),
    /** بالقرش لتفادي أخطاء الفاصلة العائمة — null تعني «السعر عند الطلب» */
    priceMinor: integer("price_minor"),
    unit: varchar("unit", { length: 40 }),
    origin: varchar("origin", { length: 120 }),
    sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
    composition: jsonb("composition").$type<SpecRow[]>().notNull().default([]),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    usage: jsonb("usage").$type<SpecRow[]>().notNull().default([]),
    image: text("image"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(true),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.categorySlug),
    index("products_published_idx").on(t.published),
  ],
);

/* ───────────────────────── العملاء المحتملون (CRM) ───────────────────────── */

export type LeadItem = {
  slug: string;
  name: string;
  size: string;
  qty: number;
};

export const LEAD_STAGES = ["new", "contacted", "quoted", "won", "lost"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    ref: varchar("ref", { length: 20 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    email: varchar("email", { length: 160 }),
    company: varchar("company", { length: 200 }),
    governorate: varchar("governorate", { length: 80 }),
    customerType: varchar("customer_type", { length: 80 }),
    message: text("message"),
    /** contact | quote */
    source: varchar("source", { length: 20 }).notNull().default("contact"),
    items: jsonb("items").$type<LeadItem[]>().notNull().default([]),
    stage: varchar("stage", { length: 20 }).notNull().default("new"),
    /** قيمة الصفقة التقديرية بالقرش */
    valueMinor: integer("value_minor"),
    assignedTo: integer("assigned_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("leads_ref_idx").on(t.ref),
    index("leads_stage_idx").on(t.stage),
    index("leads_created_idx").on(t.createdAt),
  ],
);

/** سجل المتابعة لكل عميل محتمل */
export const leadNotes = pgTable(
  "lead_notes",
  {
    id: serial("id").primaryKey(),
    leadId: integer("lead_id").notNull(),
    authorId: integer("author_id"),
    authorName: varchar("author_name", { length: 120 }).notNull().default(""),
    /** note | stage | assign */
    kind: varchar("kind", { length: 20 }).notNull().default("note"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lead_notes_lead_idx").on(t.leadId)],
);

/** سجل تدقيق لكل تعديل إداري */
export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    actorId: integer("actor_id"),
    actorName: varchar("actor_name", { length: 120 }).notNull().default(""),
    action: varchar("action", { length: 60 }).notNull(),
    entity: varchar("entity", { length: 60 }).notNull(),
    entityId: varchar("entity_id", { length: 60 }),
    detail: text("detail"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

/** إعدادات تشغيلية يحرّرها المدير من اللوحة */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type LeadNote = typeof leadNotes.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type Setting = typeof settings.$inferSelect;
