#!/usr/bin/env bash
# استرجاع نسخة احتياطية.  الاستخدام: bash restore.sh /root/agromeed/backups/agromeed_....sql.gz
set -euo pipefail
FILE="${1:?مسار ملف النسخة الاحتياطية مطلوب}"
DB=agromeed-db
. /root/agromeed/db.env

echo "سيُستبدل محتوى قاعدة البيانات الحالية بالكامل من: $FILE"
read -rp "اكتب 'نعم' للمتابعة: " ok
[ "$ok" = "نعم" ] || { echo "أُلغيت العملية."; exit 1; }

gunzip -c "$FILE" | docker exec -i "$DB" psql -U agromeed -d agromeed
echo "✓ تم الاسترجاع"
