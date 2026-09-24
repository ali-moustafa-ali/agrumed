import "server-only";

/**
 * حدّ معدل في ذاكرة العملية.
 *
 * ملاحظة أمنية: عنوان IP لا يُقرأ إلا من آخر قيمة في x-forwarded-for.
 * Traefik هو الوسيط الوحيد أمام التطبيق ويُلحِق عنوان المتصل الحقيقي في
 * نهاية الترويسة، فأي قيمة يرسلها المتصفح تسبقه ولا تُستخدم. قراءة أول
 * قيمة — أو أي ترويسة يتحكم بها العميل مثل cf-connecting-ip — تجعل تجاوز
 * الحدّ سطراً واحداً.
 */
type Bucket = { n: number; reset: number };
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 20_000;

export function clientIp(request: Request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    const last = parts.at(-1);
    if (last) return last;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function hit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
    if (buckets.size > MAX_KEYS) buckets.clear();
  }
  const rec = buckets.get(key);
  if (!rec || now > rec.reset) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }
  rec.n += 1;
  return {
    limited: rec.n > limit,
    retryAfter: Math.max(1, Math.ceil((rec.reset - now) / 1000)),
  };
}

export function reset(key: string) {
  buckets.delete(key);
}

/** صيغة بريد معقولة — يمنع استخدام النقطة كمُرحِّل بريد مفتوح. */
export function isEmail(v: string) {
  return /^[^\s@,;<>"]{1,64}@[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(v);
}
