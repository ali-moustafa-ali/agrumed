#!/usr/bin/env bash
# إعادة نشر موقع أجروميد على الخادم — يُشغَّل على السيرفر مباشرة:
#   ssh root@187.77.67.160 'bash /root/agromeed/deploy.sh'
set -euo pipefail

APP=agromeed-app
DIR=/root/agromeed
DOMAIN=arg.aligm.cloud
REPO=https://github.com/ali-moustafa-ali/agrumed.git

if [ -d "$DIR/.git" ]; then
  cd "$DIR"
  git fetch --all -q
  git reset --hard origin/main -q
else
  git clone -q "$REPO" "$DIR"
  cd "$DIR"
fi

echo "› building $(git log --oneline -1)"
docker build -q -t "${APP}:latest" .

docker rm -f "$APP" >/dev/null 2>&1 || true

docker run -d --name "$APP" --restart unless-stopped --network coolify \
  -e NODE_ENV=production \
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
echo "› https://${DOMAIN}"
