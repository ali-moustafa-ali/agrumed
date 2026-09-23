#!/bin/sh
# نقطة دخول الحاوية: ترحيل قاعدة البيانات ثم تشغيل الخادم.
set -e
echo "› تطبيق الترحيلات"
node scripts/migrate.mjs
echo "› تشغيل الخادم"
exec node server.js
