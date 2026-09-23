import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * الاتصال يُنشأ عند أول استعلام فعلي لا عند استيراد الوحدة، حتى ينجح البناء
 * في بيئات لا تصل فيها أداة البناء إلى قاعدة البيانات (مثل BuildKit).
 */
const globalForDb = globalThis as unknown as {
  __pg?: ReturnType<typeof postgres>;
  __db?: ReturnType<typeof drizzle<typeof schema>>;
};

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL غير مضبوط");

  const client =
    globalForDb.__pg ??
    postgres(url, {
      max: process.env.NODE_ENV === "production" ? 10 : 3,
      idle_timeout: 20,
      connect_timeout: 10,
    });

  if (process.env.NODE_ENV !== "production") globalForDb.__pg = client;
  return drizzle(client, { schema });
}

function getDb() {
  if (!globalForDb.__db) globalForDb.__db = connect();
  return globalForDb.__db;
}

type Db = ReturnType<typeof drizzle<typeof schema>>;

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});

export { schema };
