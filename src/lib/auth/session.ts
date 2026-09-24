import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "agromeed_session";
const MAX_AGE = 60 * 60 * 24 * 7; // أسبوع

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET غير مضبوط أو قصير جداً");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: number;
  name: string;
  role: string;
};

export type VerifiedSession = SessionPayload & { issuedAt: number };

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
}

export async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "number") return null;
    return {
      userId: payload.userId,
      name: String(payload.name ?? ""),
      role: String(payload.role ?? "sales"),
      issuedAt: typeof payload.iat === "number" ? payload.iat : 0,
    } satisfies VerifiedSession;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function readSessionCookie() {
  const store = await cookies();
  return decrypt(store.get(COOKIE)?.value);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export const SESSION_COOKIE = COOKIE;
