import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "agromeed_session";

/**
 * فحص مبدئي (optimistic) لمسارات لوحة التحكم — الفحص الفعلي يتم في طبقة
 * الوصول للبيانات (src/lib/auth/dal.ts) قرب مصدر البيانات نفسه.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const token = request.cookies.get(COOKIE)?.value;

  let valid = false;
  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET), {
        algorithms: ["HS256"],
      });
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (!valid && !isLogin) {
    const url = new URL("/admin/login", request.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (valid && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
