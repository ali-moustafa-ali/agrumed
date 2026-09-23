#!/usr/bin/env bash
# نشر موقع أجروميد كاملاً (المتجر + لوحة التحكم + قاعدة البيانات).
#   ssh root@187.77.67.160 'bash /root/agromeed/deploy.sh'
set -euo pipefail

APP=agromeed-app
DB=agromeed-db
DIR=/root/agromeed
DOMAIN=arg.aligm.cloud
REPO=https://github.com/ali-moustafa-ali/agrumed.git
ENVF="$DIR/db.env"

[ -f "$ENVF" ] || { echo "✗ ملف الإعدادات $ENVF مفقود"; exit 1; }
. "$ENVF"
DATABASE_URL="postgres://agromeed:${POSTGRES_PASSWORD}@${DB}:5432/agromeed"

if [ -d "$DIR/repo/.git" ]; then
  cd "$DIR/repo" && git fetch --all -q && git reset --hard origin/main -q
else
  git clone -q "$REPO" "$DIR/repo" && cd "$DIR/repo"
fi
echo "› البناء من $(git log --oneline -1)"

# قاعدة البيانات يجب أن تكون جاهزة قبل البناء (الصفحات الثابتة تقرأ منها)
docker start "$DB" >/dev/null 2>&1 || true
for i in $(seq 1 40); do
  docker exec "$DB" pg_isready -U agromeed -d agromeed >/dev/null 2>&1 && break
  sleep 1
done

docker build -q \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --build-arg SESSION_SECRET="$SESSION_SECRET" \
  -t "${APP}:latest" .

echo "› تطبيق ترحيلات قاعدة البيانات"
docker run --rm --network coolify \
  -e DATABASE_URL="$DATABASE_URL" \
  -w /app "${APP}:latest" \
  node_modules/.bin/drizzle-kit migrate

docker rm -f "$APP" >/dev/null 2>&1 || true
docker run -d --name "$APP" --restart unless-stopped --network coolify \
  -e NODE_ENV=production \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SESSION_SECRET="$SESSION_SECRET" \
  --label "traefik.enable=true" \
  --label "traefik.http.middlewares.gzip.compress=true" \
  --label "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https" \
  --label "traefik.http.routers.http-0-${APP}.entryPoints=http" \
  --label "traefik.http.routers.http-0-${APP}.middlewares=redirect-to-https" \
  --label "traefik.http.routers.http-0-${APP}.rule=Host(\`${DOMAIN}\`) && PathPrefix(\`/\`)" \
  --label "traefik.http.routers.http-0-${APP}.service=http-0-${APP}" \
  --label "traefik.http.routers.https-0-${APP}.entryPoints=https" \
  --label "traefik.http.routers.https-0-${APP}.middlewares=gzip" \
  --label "traefik.http.routers.https-0-${APP}.rule=Host(\`${DOMAIN}\`) && PathPrefix(\`/\`)" \
  --label "traefik.http.routers.https-0-${APP}.service=https-0-${APP}" \
  --label "traefik.http.routers.https-0-${APP}.tls=true" \
  --label "traefik.http.routers.https-0-${APP}.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.http-0-${APP}.loadbalancer.server.port=3000" \
  --label "traefik.http.services.https-0-${APP}.loadbalancer.server.port=3000" \
  "${APP}:latest"

sleep 5
docker ps --filter "name=${APP}" --format "{{.Names}} → {{.Status}}"
echo "› https://${DOMAIN}  |  لوحة التحكم: https://${DOMAIN}/admin"
