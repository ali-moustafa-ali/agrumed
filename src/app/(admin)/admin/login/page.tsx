import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="grid min-h-screen place-items-center bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-3xl font-black text-emerald-300 ring-1 ring-white/15">
            AG
          </div>
          <h1 className="text-2xl font-black text-white">لوحة تحكم أجروميد</h1>
          <p className="mt-1.5 text-sm text-slate-400">سجّل الدخول للمتابعة</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-2xl shadow-black/30">
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          الدخول مقصور على فريق الشركة. كل محاولة دخول تُسجَّل.
        </p>
      </div>
    </div>
  );
}
