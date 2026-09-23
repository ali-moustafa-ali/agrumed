#!/usr/bin/env bash
# نسخة احتياطية يومية لقاعدة بيانات أجروميد مع احتفاظ متدرج.
set -euo pipefail

DB=agromeed-db
OUT=/root/agromeed/backups
KEEP_DAYS=14
. /root/agromeed/db.env

mkdir -p "$OUT"
STAMP=$(date +%Y-%m-%d_%H%M)
FILE="$OUT/agromeed_$STAMP.sql.gz"

docker exec "$DB" pg_dump -U agromeed -d agromeed --clean --if-exists | gzip > "$FILE"

# تحقق من أن الملف ليس فارغاً قبل حذف القديم
SIZE=$(stat -c%s "$FILE")
if [ "$SIZE" -lt 1000 ]; then
  echo "✗ النسخة الاحتياطية تبدو فارغة ($SIZE بايت) — لم يُحذف أي ملف قديم" >&2
  exit 1
fi

# احتفظ بنسخة أسبوعية كل يوم أحد
if [ "$(date +%u)" = "7" ]; then
  cp "$FILE" "$OUT/weekly_$(date +%Y-W%V).sql.gz"
fi

find "$OUT" -name 'agromeed_*.sql.gz' -mtime +$KEEP_DAYS -delete
find "$OUT" -name 'weekly_*.sql.gz' -mtime +120 -delete

echo "✓ $FILE ($(numfmt --to=iec "$SIZE"))"
