#!/usr/bin/env bash
#
# bootstrap-vps.sh โ€” first-time setup of bocustoguitars on the Hostinger VPS
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

# Reads KEY=value from an env file, tolerating quotes and CRLF.
env_get() { grep -E "^$1=" "$2" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\r' | sed -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'\$/\1/"; }

say "Connecting to MySQL"

# Prefer the credentials the Luthier backend already uses: they are known to
# work, and they are the same account that must later read bocusto_luthier.users
# for shared administrator logins. Asking for the root password is the fallback.
DB_USER=""
DB_PASSWORD=""
SHARED_DB=""
if [ -f "$LUTHIER_ENV" ]; then
  DB_USER="$(env_get DB_USER "$LUTHIER_ENV")"
  DB_PASSWORD="$(env_get DB_PASSWORD "$LUTHIER_ENV")"
  # The Luthier database is not assumed to be called "bocusto_luthier" โ€” take
  # the real name from its own configuration.
  SHARED_DB="$(env_get DB_NAME "$LUTHIER_ENV")"
  [ -n "$DB_USER" ] && echo "    using DB_USER=$DB_USER from $LUTHIER_ENV"
  [ -n "$SHARED_DB" ] && echo "    shared administrator accounts live in $SHARED_DB"
fi
SHARED_DB="${SHARED_DB:-bocusto_luthier}"

# MYSQL_PWD keeps the password out of the process list and off the screen.
mysql_run() {
  if [ -n "$DB_PASSWORD" ]; then MYSQL_PWD="$DB_PASSWORD" mysql -u "$DB_USER" "$@"
  else mysql -u "$DB_USER" "$@"; fi
}

if [ -z "$DB_USER" ] || ! mysql_run -e 'SELECT 1' >/dev/null 2>&1; then
  [ -n "$DB_USER" ] && warn "those credentials were rejected โ€” enter another account"
  read -rp  "MySQL user [root]: " DB_USER; DB_USER="${DB_USER:-root}"
  read -rsp "MySQL password for $DB_USER (blank if none): " DB_PASSWORD; echo
  mysql_run -e 'SELECT 1' >/dev/null 2>&1 || die "cannot connect to MySQL as '$DB_USER'"
fi

say "Creating the bocusto_guitars database"
if ! mysql_run < "$SRC/backend/schema.sql"; then
  die "'$DB_USER' cannot create the database. As a MySQL administrator, run:

    CREATE DATABASE IF NOT EXISTS bocusto_guitars
      DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    GRANT ALL PRIVILEGES ON bocusto_guitars.* TO '$DB_USER'@'localhost';
    GRANT SELECT ON $SHARED_DB.users TO '$DB_USER'@'localhost';
    FLUSH PRIVILEGES;

  then run this script again."
fi

# --- 2. backend -------------------------------------------------------------

say "Installing the backend to $API"
mkdir -p "$API" "$WEB"
rsync -a --delete --exclude node_modules --exclude .env "$SRC/backend/" "$API/"
cd "$API"
npm ci --omit=dev

if [ -f "$API/.env" ]; then
  warn "$API/.env already exists โ€” leaving it untouched"
else
  say "Writing $API/.env"

  # Reuse the Luthier JWT_SECRET so one administrator login covers both sites.
  JWT_SECRET=""
  if [ -f "$LUTHIER_ENV" ]; then
    JWT_SECRET="$(env_get JWT_SECRET "$LUTHIER_ENV")"
  fi
  if [ -z "$JWT_SECRET" ]; then
    warn "Could not read JWT_SECRET from $LUTHIER_ENV โ€” generating a NEW one."
    warn "Passwords will still work, but a session will not carry between the two admin panels."
    JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")"
  else
    echo "    reusing the Bocusto Luthier JWT_SECRET"
  fi

  # DB_USER / DB_PASSWORD were resolved and verified in step 1.
  # The restrictive umask is confined to this subshell: setting it for the rest
  # of the script would leave the built frontend unreadable by the nginx worker.
  (
    umask 077
    cat > "$API/.env" <<EOF
PORT=$PORT
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=bocusto_guitars
SHARED_USERS_DB=$SHARED_DB
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
EOF
  )
  chmod 600 "$API/.env"
fi

# --- 3. frontend ------------------------------------------------------------

say "Building the frontend"
cd "$SRC/frontend"
npm ci
npm run build
rsync -a --delete "$SRC/frontend/dist/" "$WEB/"
# nginx serves these as www-data, so they must be world-readable regardless of
# the umask npm happened to build under.
chmod -R a+rX "$WEB"

# --- 4. pm2 -----------------------------------------------------------------

say "Starting $PM2_APP on port $PORT"
cd "$API"
pm2 delete "$PM2_APP" >/dev/null 2>&1 || true
pm2 start src/server.js --name "$PM2_APP"
pm2 save

sleep 3
HEALTH="$(curl -fsS "http://127.0.0.1:$PORT/api/health" || true)"
[ -n "$HEALTH" ] || die "backend did not answer on port $PORT โ€” check: pm2 logs $PM2_APP"
echo "    $HEALTH"
case "$HEALTH" in
  *'"sharedUsers":{"status":"ok"'*)
    echo "    shared administrator logins are readable" ;;
  *)
    warn "The backend cannot read $SHARED_DB.users, so the bocustotonewood.com"
    warn "administrators will NOT be able to sign in. Grant access and restart:"
    warn "  GRANT SELECT ON $SHARED_DB.users TO '$DB_USER'@'localhost'; FLUSH PRIVILEGES;"
    warn "  pm2 restart $PM2_APP" ;;
esac

# --- 5. nginx ---------------------------------------------------------------

SITE="/etc/nginx/sites-available/bocustoguitars"
if [ -f "$SITE" ]; then
  warn "$SITE already exists โ€” leaving it untouched"
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
  chmod 644 "$SITE"
  ln -sf "$SITE" /etc/nginx/sites-enabled/bocustoguitars
fi

nginx -t || die "nginx config test failed โ€” the running site was not reloaded"
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
