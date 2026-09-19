#!/usr/bin/env bash
#
# update-nginx.sh — add the missing security headers, the /uploads/ location
# and a real robots.txt to the live bocustoguitars site.
#
#   ssh root@srv1775777.hstgr.cloud
#   cd /opt/bocusto-guitars-src && git pull
#   ./scripts/update-nginx.sh --dry-run
#   ./scripts/update-nginx.sh
#
# The live config is NOT rewritten. certbot edited it when it installed the
# certificate, and overwriting the file would take HTTPS down with it. Instead
# the additions go in their own snippet and a single `include` line is inserted
# into the existing server blocks.
#
# Safe to run more than once: the include is added only if it is missing, the
# previous config is backed up, and a failed `nginx -t` rolls everything back
# before anything is reloaded.

set -euo pipefail

DRY_RUN=""
[ "${1:-}" = "--dry-run" ] && DRY_RUN="yes"

SITE="/etc/nginx/sites-available/bocustoguitars"
SNIPPET="/etc/nginx/snippets/bocustoguitars-security.conf"
UPLOAD_DIR="/var/www/bocustoguitars/backend/uploads"
INCLUDE_LINE="    include snippets/bocustoguitars-security.conf;"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mXX  %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run as root"
[ -f "$SITE" ] || die "$SITE does not exist — run scripts/bootstrap-vps.sh first"
command -v nginx >/dev/null || die "nginx is not installed"

# --- 1. the snippet ---------------------------------------------------------

say "Writing $SNIPPET"
if [ -n "$DRY_RUN" ]; then
  echo "   (dry run) would write the snippet and create $UPLOAD_DIR"
else
  mkdir -p "$(dirname "$SNIPPET")" "$UPLOAD_DIR"
  chmod 755 "$UPLOAD_DIR"

  cat > "$SNIPPET" <<EOF
# Managed by bocustoguitars — scripts/update-nginx.sh. Edit there, not here.

# Site imagery is served from Google's CDN and the webfonts from Google Fonts,
# which is why img-src and style-src reach past 'self'.
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Keep the editor out of search results.
location = /admin {
    add_header X-Robots-Tag "noindex, nofollow" always;
    try_files /index.html =404;
}

location = /robots.txt {
    default_type text/plain;
    return 200 "User-agent: *\nDisallow: /admin\n";
}

# Images written by the upload endpoint. Filenames are content hashes, so they
# can be cached indefinitely.
location /uploads/ {
    alias $UPLOAD_DIR/;
    access_log off;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files \$uri =404;
}

# A missing file with an extension is a real 404; anything else is a
# client-side route. Without this, every typo answered 200 with the SPA —
# including /robots.txt.
location ~* \.(js|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|xml|json)\$ {
    try_files \$uri =404;
}
EOF
fi

# --- 2. include it from the existing server blocks --------------------------

if grep -qF "bocustoguitars-security.conf" "$SITE"; then
  say "The include is already present in $SITE"
else
  say "Inserting the include after each server_name in $SITE"
  if [ -n "$DRY_RUN" ]; then
    grep -n "server_name" "$SITE" | sed 's/^/   (dry run) would insert after line /'
  else
    BACKUP="$SITE.bak-$(date +%F-%H%M%S)"
    cp -a "$SITE" "$BACKUP"
    echo "    backup: $BACKUP"

    awk -v line="$INCLUDE_LINE" '
      { print }
      /^[[:space:]]*server_name/ { print line }
    ' "$BACKUP" > "$SITE"
  fi
fi

# --- 3. test, then reload ---------------------------------------------------

if [ -n "$DRY_RUN" ]; then
  say "Dry run complete — nothing was changed"
  exit 0
fi

say "Testing the configuration"
if ! nginx -t; then
  warn "config test failed — restoring the previous file"
  LATEST_BACKUP="$(ls -1t "$SITE".bak-* 2>/dev/null | head -1 || true)"
  [ -n "$LATEST_BACKUP" ] && cp -a "$LATEST_BACKUP" "$SITE"
  rm -f "$SNIPPET"
  nginx -t || warn "nginx is still unhappy — inspect $SITE by hand"
  die "nothing was reloaded; the running site is untouched"
fi

systemctl reload nginx

say "Verifying"
for host in bocustoguitar.com bocustotonewood.com; do
  code="$(curl -s -o /dev/null -w '%{http_code}' -m 15 "https://$host/" || echo 000)"
  echo "    https://$host -> $code"
done

echo "    robots.txt -> $(curl -s -m 10 https://bocustoguitar.com/robots.txt | head -1)"
echo "    missing asset -> $(curl -s -o /dev/null -w '%{http_code}' -m 10 https://bocustoguitar.com/nope.js)  (expect 404)"

cat <<'EOF'

  Check the headers from your own machine:

      curl -sI https://bocustoguitar.com/ | grep -iE 'content-security|strict-transport|permissions-policy'

EOF
