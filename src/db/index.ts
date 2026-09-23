import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL غير مضبوط");

// في التطوير يعيد Next تحميل الوحدات، فنحتفظ باتصال واحد على globalThis
const globalForDb = globalThis as unknown as { __pg?: ReturnType<typeof postgres> };

const client =
  globalForDb.__pg ??
  postgres(url, {
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__pg = client;

export const db = drizzle(client, { schema });
export { schema };
