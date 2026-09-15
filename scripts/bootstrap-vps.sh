#!/usr/bin/env bash
#
# bootstrap-vps.sh — first-time setup of bocustoguitars on the Hostinger VPS
# that already serves bocustotonewood.com.
#
# Run ONCE as root, from the uploaded source directory:
#
#   ssh root@srv1775777.hstgr.cloud
#   cd /opt/bocusto-guitars-src
#   ./scripts/bootstrap-vps.sh yourdomain.com
#
# Afterwards use ./deploy.sh for every update.
#
# It never touches the Luthier site: different directories, different pm2 app,
# different port, and a separate MySQL database. The only thing it reads from
# the Luthier install is JWT_SECRET, so one admin login works on both.

set -euo pipefail

DOMAIN="${1:-}"
[ -n "$DOMAIN" ] || { echo "usage: $0 <domain>   e.g. $0 bocustoguitars.com" >&2; exit 1; }

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY="/var/www/bocustoguitars"
WEB="$DEPLOY/frontend"
API="$DEPLOY/backend"
PM2_APP="guitars-backend"
PORT=5100
LUTHIER_ENV="/var/www/bocustotonewood/backend/.env"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mXX  %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run as root"
for cmd in node npm rsync pm2 mysql nginx curl; do
  command -v "$cmd" >/dev/null || die "missing command: $cmd"
done

# --- 1. database ------------------------------------------------------------
# schema.sql only CREATEs IF NOT EXISTS, so re-running is harmless and
# bocusto_luthier is never referenced.

say "Creating the bocusto_guitars database"
read -rsp "MySQL root password (blank if none): " MYSQL_PW; echo
if [ -n "$MYSQL_PW" ]; then
  mysql -u root -p"$MYSQL_PW" < "$SRC/backend/schema.sql"
else
  mysql -u root < "$SRC/backend/schema.sql"
fi

# --- 2. backend -------------------------------------------------------------

say "Installing the backend to $API"
mkdir -p "$API" "$WEB"
rsync -a --delete --exclude node_modules --exclude .env "$SRC/backend/" "$API/"
cd "$API"
npm ci --omit=dev

if [ -f "$API/.env" ]; then
  warn "$API/.env already exists — leaving it untouched"
else
  say "Writing $API/.env"

  # Reuse the Luthier JWT_SECRET so one administrator login covers both sites.
  JWT_SECRET=""
  if [ -f "$LUTHIER_ENV" ]; then
    JWT_SECRET="$(grep -E '^JWT_SECRET=' "$LUTHIER_ENV" | head -1 | cut -d= -f2-)"
  fi
  if [ -z "$JWT_SECRET" ]; then
    warn "Could not read JWT_SECRET from $LUTHIER_ENV — generating a NEW one."
    warn "Passwords will still work, but a session will not carry between the two admin panels."
    JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")"
  else
    echo "    reusing the Bocusto Luthier JWT_SECRET"
  fi

  # Same credentials the Luthier backend uses, so the cross-database read of
  # bocusto_luthier.users is already permitted.
  DB_USER="$(grep -E '^DB_USER=' "$LUTHIER_ENV" 2>/dev/null | head -1 | cut -d= -f2- || true)"
  DB_PASSWORD="$(grep -E '^DB_PASSWORD=' "$LUTHIER_ENV" 2>/dev/null | head -1 | cut -d= -f2- || true)"
  DB_USER="${DB_USER:-root}"
  DB_PASSWORD="${DB_PASSWORD:-$MYSQL_PW}"

  umask 077
  cat > "$API/.env" <<EOF
PORT=$PORT
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=bocusto_guitars
SHARED_USERS_DB=bocusto_luthier
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
EOF
  chmod 600 "$API/.env"
fi

# --- 3. frontend ------------------------------------------------------------

say "Building the frontend"
cd "$SRC/frontend"
npm ci
npm run build
rsync -a --delete "$SRC/frontend/dist/" "$WEB/"

# --- 4. pm2 -----------------------------------------------------------------

say "Starting $PM2_APP on port $PORT"
cd "$API"
pm2 delete "$PM2_APP" >/dev/null 2>&1 || true
pm2 start src/server.js --name "$PM2_APP"
pm2 save

sleep 3
HEALTH="$(curl -fsS "http://127.0.0.1:$PORT/api/health" || true)"
[ -n "$HEALTH" ] || die "backend did not answer on port $PORT — check: pm2 logs $PM2_APP"
echo "    $HEALTH"
case "$HEALTH" in
  *'"sharedUsers":{"status":"ok"'*)
    echo "    shared administrator logins are readable" ;;
  *)
    warn "The backend cannot read bocusto_luthier.users, so the bocustotonewood.com"
    warn "administrators will NOT be able to sign in. Grant access and restart:"
    warn "  GRANT SELECT ON bocusto_luthier.users TO '$DB_USER'@'localhost'; FLUSH PRIVILEGES;"
    warn "  pm2 restart $PM2_APP" ;;
esac

# --- 5. nginx ---------------------------------------------------------------

SITE="/etc/nginx/sites-available/bocustoguitars"
if [ -f "$SITE" ]; then
  warn "$SITE already exists — leaving it untouched"
else
  say "Writing $SITE for $DOMAIN"
  cat > "$SITE" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $WEB;
    index index.html;
    client_max_body_size 1M;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Client-side routing: /about, /models, /admin all serve index.html.
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:$PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
  ln -sf "$SITE" /etc/nginx/sites-enabled/bocustoguitars
fi

nginx -t || die "nginx config test failed — the running site was not reloaded"
systemctl reload nginx

say "Done"
cat <<EOF

  Site      http://$DOMAIN
  Admin     http://$DOMAIN/admin
  Backend   pm2 app "$PM2_APP" on 127.0.0.1:$PORT
  Logs      pm2 logs $PM2_APP

  Sign in with any bocustotonewood.com administrator account.

  Next:
    1. Point the $DOMAIN DNS A record at this server, if you have not already.
    2. certbot --nginx -d $DOMAIN -d www.$DOMAIN
    3. Use ./deploy.sh for future updates.
EOF
