#!/usr/bin/env bash
#
# deploy.sh — update the bocustoguitars site on the Hostinger VPS.
#
# Mirrors the Bocusto Luthier deploy script: run it from the source checkout at
# $SRC, never from inside $DEPLOY.
#
#   ssh root@srv1775777.hstgr.cloud
#   /opt/bocusto-guitars-src/deploy.sh            # build, deploy, restart
#   /opt/bocusto-guitars-src/deploy.sh --dry-run  # show what would change
#
# What it does NOT touch:
#   - backend/.env              the only copy of the production secrets
#   - anything under /var/www/bocustotonewood   the Luthier site
#   - the bocusto_luthier database

set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
DEPLOY="/var/www/bocustoguitars"
WEB="$DEPLOY/frontend"
API="$DEPLOY/backend"
PM2_APP="guitars-backend"
PORT=5100
BACKUP_DIR="/root/deploy-backups"
KEEP_BACKUPS=5

DRY_RUN=""
[ "${1:-}" = "--dry-run" ] && DRY_RUN="--dry-run"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mXX  %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run as root (pm2 and $DEPLOY are owned by root)"
[ -d "$DEPLOY" ]     || die "$DEPLOY does not exist — run scripts/bootstrap-vps.sh first"
[ -f "$API/.env" ]   || die "$API/.env is missing — the backend will not boot without it"

for cmd in node npm rsync pm2 curl tar; do
  command -v "$cmd" >/dev/null || die "missing command: $cmd"
done

# --- 1. back up what is live ------------------------------------------------

say "Backing up the live site"
mkdir -p "$BACKUP_DIR"
BACKUP="$BACKUP_DIR/guitars-$(date +%F-%H%M%S).tar.gz"
if [ -n "$DRY_RUN" ]; then
  echo "(dry run) would write $BACKUP"
else
  tar czf "$BACKUP" -C /var/www bocustoguitars
  echo "    $BACKUP"
  ls -1t "$BACKUP_DIR"/guitars-*.tar.gz 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f
fi

# --- 2. frontend ------------------------------------------------------------

say "Building the frontend"
cd "$SRC/frontend"
npm ci
npm run build
rsync -a --delete $DRY_RUN "$SRC/frontend/dist/" "$WEB/"
# nginx serves these as www-data; rsync preserves whatever mode the build left.
# Written as an if, not `[ ] && cmd`: under `set -e` a false test at the end of
# a list aborts the script, which would break --dry-run.
if [ -z "$DRY_RUN" ]; then chmod -R a+rX "$WEB"; fi

# --- 3. backend -------------------------------------------------------------

say "Updating the backend"
rsync -a --delete $DRY_RUN --exclude node_modules --exclude .env "$SRC/backend/" "$API/"

if [ -z "$DRY_RUN" ]; then
  cd "$API"
  npm ci --omit=dev

  # Additive, idempotent: new tables only, nothing dropped.
  if [ -f "$API/schema.sql" ]; then
    say "Applying schema.sql (CREATE IF NOT EXISTS only)"
    DB_USER="$(grep -E '^DB_USER=' "$API/.env" | head -1 | cut -d= -f2-)"
    DB_PASSWORD="$(grep -E '^DB_PASSWORD=' "$API/.env" | head -1 | cut -d= -f2-)"
    if [ -n "$DB_PASSWORD" ]; then
      mysql -u "$DB_USER" -p"$DB_PASSWORD" < "$API/schema.sql"
    else
      mysql -u "$DB_USER" < "$API/schema.sql"
    fi
  fi

  say "Restarting $PM2_APP"
  pm2 restart "$PM2_APP" --update-env
  pm2 save
fi

# --- 4. verify --------------------------------------------------------------

if [ -z "$DRY_RUN" ]; then
  say "Health check"
  sleep 3
  HEALTH="$(curl -fsS "http://127.0.0.1:$PORT/api/health" || true)"
  if [ -z "$HEALTH" ]; then
    warn "backend did not answer — rolling back is: tar xzf $BACKUP -C /var/www"
    die "deploy finished but the API is down (pm2 logs $PM2_APP)"
  fi
  echo "    $HEALTH"
  case "$HEALTH" in
    *'"sharedUsers":{"status":"ok"'*) : ;;
    *) warn "bocustotonewood.com administrators cannot sign in — see DEPLOYMENT.md" ;;
  esac
fi

say "Done"
