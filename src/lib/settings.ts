import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export const SETTING_KEYS = {
  salesEmails: "sales_notification_emails",
  notifySales: "notify_sales_enabled",
  notifyCustomer: "notify_customer_enabled",
} as const;

export type AppSettings = {
  salesEmails: string[];
  notifySales: boolean;
  notifyCustomer: boolean;
};

const DEFAULTS: AppSettings = {
  salesEmails: [],
  notifySales: true,
  notifyCustomer: true,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, Object.values(SETTING_KEYS)));
    const map = new Map(rows.map((r) => [r.key, r.value]));

    const raw = map.get(SETTING_KEYS.salesEmails) ?? "";
    return {
      salesEmails: raw
        .split(/[,\s;]+/)
        .map((s) => s.trim())
        .filter((s) => s.includes("@")),
      notifySales: (map.get(SETTING_KEYS.notifySales) ?? "1") === "1",
      notifyCustomer: (map.get(SETTING_KEYS.notifyCustomer) ?? "1") === "1",
    };
  } catch {
    return DEFAULTS;
  }
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}
