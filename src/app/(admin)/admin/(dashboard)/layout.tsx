import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";
import Shell from "@/components/admin/Shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [row] = await db
    .select({ n: count() })
    .from(leads)
    .where(eq(leads.stage, "new"));

  return (
    <Shell user={{ name: user.name, role: user.role }} newLeads={Number(row?.n ?? 0)}>
      {children}
    </Shell>
  );
}
