"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/actions/auth";
import { can, ROLE_LABEL, type Role } from "@/lib/permissions";
import { IcBox, IcClose, IcGrid, IcLog, IcMenu, IcOut, IcTag, IcUsers } from "./icons";

type NavItem = { href: string; label: string; icon: typeof IcGrid; permission?: string };

const NAV: NavItem[] = [
  { href: "/admin", label: "نظرة عامة", icon: IcGrid },
  { href: "/admin/leads", label: "العملاء والطلبات", icon: IcUsers, permission: "leads:write" },
  { href: "/admin/products", label: "المنتجات", icon: IcBox, permission: "products:write" },
  { href: "/admin/categories", label: "الأقسام", icon: IcTag, permission: "categories:write" },
  { href: "/admin/activity", label: "سجل النشاط", icon: IcLog },
];

export default function Shell({
  user,
  newLeads,
  children,
}: {
  user: { name: string; role: string };
  newLeads: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => !n.permission || can(user.role, n.permission));

  const roleLabel = ROLE_LABEL[user.role as Role] ?? user.role;

  const nav = (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
              active
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <item.icon className="h-[18px] w-[18px]" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/admin/leads" && newLeads > 0 && (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-black text-slate-900 tabular-nums">
                {newLeads}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* الشريط الجانبي — سطح المكتب */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-slate-900 p-4 lg:flex">
        <div>
          <Link href="/admin" className="mb-6 flex items-center gap-2.5 px-2 pt-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/25">
              AG
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black text-white">أجروميد</span>
              <span className="block text-[11px] text-slate-400">لوحة التحكم</span>
            </span>
          </Link>
          {nav}
        </div>
        <Footer user={user} roleLabel={roleLabel} />
      </aside>

      {/* الشريط العلوي — الجوال */}
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-slate-900 px-4 py-3 lg:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-white hover:bg-white/10"
          aria-label="القائمة"
        >
          {open ? <IcClose /> : <IcMenu />}
        </button>
        <span className="font-black text-white">أجروميد</span>
        {newLeads > 0 && (
          <span className="mr-auto rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-black text-slate-900 tabular-nums">
            {newLeads} جديد
          </span>
        )}
      </div>
      {open && (
        <div className="sticky top-[52px] z-30 bg-slate-900 px-4 pb-4 lg:hidden">
          {nav}
          <div className="mt-4">
            <Footer user={user} roleLabel={roleLabel} />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 bg-slate-100">{children}</main>
    </div>
  );
}

function Footer({ user, roleLabel }: { user: { name: string }; roleLabel: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="truncate text-sm font-bold text-white">{user.name}</p>
      <p className="mb-3 text-[11px] text-slate-400">{roleLabel}</p>
      <div className="flex gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-center text-[11px] font-bold text-slate-200 hover:bg-white/20"
        >
          عرض الموقع
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-200 hover:bg-rose-500/80 hover:text-white"
          >
            <IcOut className="h-3.5 w-3.5" />
            خروج
          </button>
        </form>
      </div>
    </div>
  );
}
