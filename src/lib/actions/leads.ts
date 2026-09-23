"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLog, leadNotes, leads } from "@/db/schema";
import type { LeadItem } from "@/db/schema";
import { requirePermission } from "@/lib/auth/dal";
import { isStage, STAGE_LABEL } from "@/lib/crm";

export type FormState = { error?: string; ok?: string };

/** يولّد رقماً مرجعياً قصيراً للعميل المحتمل. */
function makeRef() {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `AGM-${n}`;
}

/** إنشاء عميل محتمل من نماذج الموقع — تُستدعى من نقطة /api/leads. */
export async function createLead(input: {
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  governorate?: string | null;
  customerType?: string | null;
  message?: string | null;
  source?: string;
  items?: LeadItem[];
}) {
  let ref = makeRef();
  for (let i = 0; i < 5; i++) {
    const [clash] = await db.select({ id: leads.id }).from(leads).where(eq(leads.ref, ref)).limit(1);
    if (!clash) break;
    ref = makeRef();
  }

  const [row] = await db
    .insert(leads)
    .values({
      ref,
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      company: input.company ?? null,
      governorate: input.governorate ?? null,
      customerType: input.customerType ?? null,
      message: input.message ?? null,
      source: input.source === "quote" ? "quote" : "contact",
      items: input.items ?? [],
    })
    .returning({ id: leads.id, ref: leads.ref });

  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  return row;
}

export async function setLeadStage(id: number, stage: string) {
  const user = await requirePermission("leads:write");
  if (!isStage(stage)) throw new Error("مرحلة غير معروفة");

  const [before] = await db.select({ stage: leads.stage }).from(leads).where(eq(leads.id, id)).limit(1);
  await db.update(leads).set({ stage, updatedAt: new Date() }).where(eq(leads.id, id));

  await db.insert(leadNotes).values({
    leadId: id,
    authorId: user.id,
    authorName: user.name,
    kind: "stage",
    body: `نُقل من «${(before && isStage(before.stage) ? STAGE_LABEL[before.stage] : before?.stage) ?? "—"}» إلى «${STAGE_LABEL[stage]}»`,
  });
  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: "stage",
    entity: "lead",
    entityId: String(id),
    detail: stage,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function setLeadValue(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission("leads:write");
  const id = Number(formData.get("id"));
  const raw = String(formData.get("value") ?? "").trim();
  const valueMinor = raw === "" ? null : Math.round(Number(raw) * 100);
  if (valueMinor !== null && (!Number.isFinite(valueMinor) || valueMinor < 0)) {
    return { error: "القيمة غير صالحة." };
  }

  await db.update(leads).set({ valueMinor, updatedAt: new Date() }).where(eq(leads.id, id));
  await db.insert(auditLog).values({
    actorId: user.id,
    actorName: user.name,
    action: "value",
    entity: "lead",
    entityId: String(id),
    detail: raw,
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${id}`);
  return { ok: "تم تحديث القيمة." };
}

export async function addLeadNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission("leads:write");
  const id = Number(formData.get("id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "اكتب نص المتابعة." };

  await db.insert(leadNotes).values({
    leadId: id,
    authorId: user.id,
    authorName: user.name,
    kind: "note",
    body,
  });
  await db.update(leads).set({ updatedAt: new Date() }).where(eq(leads.id, id));

  revalidatePath(`/admin/leads/${id}`);
  return { ok: "تمت إضافة المتابعة." };
}

