#!/usr/bin/env bash
#
# mysql-localhost.sh — stop MySQL listening on the public interface.
#
#   ssh root@srv1775777.hstgr.cloud
#   cd /opt/bocusto-guitars-src && git pull
#   ./scripts/mysql-localhost.sh --dry-run
#   ./scripts/mysql-localhost.sh
#
# The firewall already blocks 3306, so this is defence in depth: if ufw is ever
# disabled, flushed, or the machine is rebuilt without it, MySQL should still
# refuse connections from outside rather than answer a handshake to the
# internet the way it did before.
#
# BRIEF OUTAGE: MySQL is restarted, so both sites will fail their database
# calls for a few seconds. Run it at a quiet moment.
#
# Nothing else changes: both backends connect over localhost already.

set -euo pipefail

DRY_RUN=""
[ "${1:-}" = "--dry-run" ] && DRY_RUN="yes"

CONF="/etc/mysql/mysql.conf.d/mysqld.cnf"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mXX  %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run as root"
[ -f "$CONF" ] || die "$CONF not found — is this the distribution MySQL package?"

say "How MySQL is listening now"
ss -lntp 2>/dev/null | awk 'NR==1 || /:3306/' || true

CURRENT="$(grep -E '^[[:space:]]*bind-address' "$CONF" | head -1 || true)"
echo "    config says: ${CURRENT:-<no bind-address line>}"

if printf '%s' "$CURRENT" | grep -qE '127\.0\.0\.1'; then
  say "Already bound to loopback — nothing to do"
  exit 0
fi

# --- make sure the databases are reachable over localhost first -------------
# If some service depends on the public address, this is the moment to find
# out, not after the restart.

say "Checking that a localhost connection works before changing anything"
if ! mysqladmin ping -h 127.0.0.1 --silent 2>/dev/null; then
  warn "mysqladmin could not ping 127.0.0.1 without credentials"
  warn "that is normal on a password-protected server; continuing"
fi

if [ -n "$DRY_RUN" ]; then
  say "Dry run — would set bind-address = 127.0.0.1 in $CONF and restart mysql"
  exit 0
fi

BACKUP="$CONF.bak-$(date +%F-%H%M%S)"
cp -a "$CONF" "$BACKUP"
say "Backed up to $BACKUP"

if grep -qE '^[[:space:]]*#?[[:space:]]*bind-address' "$CONF"; then
  sed -i -E 's/^[[:space:]]*#?[[:space:]]*bind-address.*/bind-address = 127.0.0.1/' "$CONF"
else
  # Append inside the [mysqld] section.
  sed -i '/^\[mysqld\]/a bind-address = 127.0.0.1' "$CONF"
fi

# MySQL 8 has a second knob; leaving it on would still publish the X Protocol.
if grep -qE '^[[:space:]]*#?[[:space:]]*mysqlx-bind-address' "$CONF"; then
  sed -i -E 's/^[[:space:]]*#?[[:space:]]*mysqlx-bind-address.*/mysqlx-bind-address = 127.0.0.1/' "$CONF"
fi

echo "    now: $(grep -E '^[[:space:]]*bind-address' "$CONF")"

say "Restarting MySQL"
if ! systemctl restart mysql; then
  warn "restart failed — restoring $BACKUP"
  cp -a "$BACKUP" "$CONF"
  systemctl restart mysql || die "MySQL will not start even after the rollback — check: journalctl -u mysql -n 50"
  die "configuration rolled back, MySQL is running again"
fi

sleep 4

say "How MySQL is listening now"
ss -lntp 2>/dev/null | awk 'NR==1 || /:3306/' || true

say "Checking both sites still reach their databases"
for url in "http://127.0.0.1:5100/api/health" "http://127.0.0.1:5000/api/products"; do
  if curl -fsS -o /dev/null -m 10 "$url"; then echo "    OK   $url"; else warn "no answer from $url"; fi
done

for host in bocustoguitar.com bocustotonewood.com; do
  echo "    https://$host -> $(curl -s -o /dev/null -w '%{http_code}' -m 15 "https://$host/" || echo 000)"
done

cat <<EOF

  Done. If anything looks wrong, restore with:

      cp -a $BACKUP $CONF && systemctl restart mysql

  A remote database client can still reach the server through an SSH tunnel:

      ssh -L 3307:127.0.0.1:3306 root@srv1775777.hstgr.cloud
      # then point the client at 127.0.0.1:3307

EOF
