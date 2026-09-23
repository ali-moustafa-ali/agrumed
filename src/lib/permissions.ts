/** صلاحيات الأدوار — وحدة مشتركة بين الخادم والعميل (بلا server-only). */
export type Role = "owner" | "sales" | "editor";

export const ROLE_LABEL: Record<Role, string> = {
  owner: "صلاحية كاملة",
  sales: "مبيعات",
  editor: "محرّر محتوى",
};

const CAN: Record<string, Role[]> = {
  "products:write": ["owner", "editor"],
  "categories:write": ["owner", "editor"],
  "leads:write": ["owner", "sales"],
  "users:write": ["owner"],
  "settings:write": ["owner"],
};

export function can(role: string, permission: string) {
  const allowed = CAN[permission];
  return allowed ? allowed.includes(role as Role) : false;
}
