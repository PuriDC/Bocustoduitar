#!/usr/bin/env bash
#
# harden-vps.sh — close the ports that should never have been reachable from
# the internet on the Hostinger VPS.
#
#   ssh root@srv1775777.hstgr.cloud
#   cd /opt/bocusto-guitars-src && git pull
#   ./scripts/harden-vps.sh --dry-run    # show what would change, touch nothing
#   ./scripts/harden-vps.sh
#
# What it closes:
#   3306  MySQL          — answers a handshake to the whole internet today
#   5000  Luthier API    — bypasses nginx and TLS
#   5100  Guitars API    — same
#
# What stays open: 22 (SSH), 80 and 443 (both sites).
#
# Loopback is never filtered, so nginx keeps reaching both backends on
# 127.0.0.1 and both backends keep reaching MySQL on localhost. Nothing about
# the running sites changes.
#
# LOCKOUT SAFETY: the SSH port is allowed and verified present in the rule set
# BEFORE the firewall is switched on, and the script refuses to continue if it
# cannot confirm that.

set -euo pipefail

DRY_RUN=""
[ "${1:-}" = "--dry-run" ] && DRY_RUN="yes"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mXX  %s\033[0m\n' "$*" >&2; exit 1; }
run()  { if [ -n "$DRY_RUN" ]; then printf '   (dry run) %s\n' "$*"; else "$@"; fi; }

[ "$(id -u)" -eq 0 ] || die "run as root"
command -v ufw >/dev/null || die "ufw is not installed. Install it first:  apt update && apt install -y ufw"

# --- work out which port sshd actually listens on ---------------------------
# Hardcoding 22 would lock us out of a server that moved SSH elsewhere.

SSH_PORTS="$(grep -oP '^\s*Port\s+\K[0-9]+' /etc/ssh/sshd_config 2>/dev/null | sort -u || true)"
[ -n "$SSH_PORTS" ] || SSH_PORTS=22
say "SSH is configured on port(s): $(echo "$SSH_PORTS" | tr '\n' ' ')"

# Also keep whatever port this very session came in on, if we can see it.
CURRENT_SSH_PORT="$(echo "${SSH_CONNECTION:-}" | awk '{print $4}')"
if [ -n "$CURRENT_SSH_PORT" ] && ! echo "$SSH_PORTS" | grep -qx "$CURRENT_SSH_PORT"; then
  warn "this session arrived on port $CURRENT_SSH_PORT — allowing that too"
  SSH_PORTS="$SSH_PORTS
$CURRENT_SSH_PORT"
fi

say "Ports currently listening on a public address"
ss -lntp 2>/dev/null | awk 'NR==1 || $4 ~ /0\.0\.0\.0:|\*:|\[::\]:/' || true

# --- 1. allow what must stay reachable --------------------------------------

say "Allowing SSH, HTTP and HTTPS"
for p in $SSH_PORTS; do
  run ufw allow "$p"/tcp comment 'SSH'
done
run ufw allow 80/tcp comment 'HTTP'
run ufw allow 443/tcp comment 'HTTPS'

# --- 2. verify SSH really is in the rule set before switching on ------------

if [ -z "$DRY_RUN" ]; then
  for p in $SSH_PORTS; do
    ufw status | grep -qE "(^|[[:space:]])$p/tcp" \
      || die "SSH port $p is not in the ufw rule set — refusing to enable the firewall"
  done
  echo "    SSH rule confirmed present"
fi

# --- 3. deny the three exposed services -------------------------------------
# `ufw default deny incoming` already covers them; these explicit rules make
# the intent visible in `ufw status` and survive a later default change.

say "Denying MySQL and both Node backends from outside"
run ufw deny 3306/tcp comment 'MySQL - localhost only'
run ufw deny 5000/tcp comment 'Luthier API - behind nginx'
run ufw deny 5100/tcp comment 'Guitars API - behind nginx'

say "Setting default policy"
run ufw default deny incoming
run ufw default allow outgoing

say "Enabling the firewall"
run ufw --force enable

# --- 4. prove nothing local broke -------------------------------------------

if [ -z "$DRY_RUN" ]; then
  say "Rule set"
  ufw status verbose

  say "Checking the sites still work from the server itself"
  for url in "http://127.0.0.1:5100/api/health" "http://127.0.0.1:5000/api/products"; do
    if curl -fsS -o /dev/null -m 10 "$url"; then
      echo "    OK   $url"
    else
      warn "no answer from $url — check with: pm2 status"
    fi
  done

  for host in bocustoguitar.com bocustotonewood.com; do
    code="$(curl -s -o /dev/null -w '%{http_code}' -m 15 "https://$host/" || echo 000)"
    echo "    https://$host -> $code"
    [ "$code" = "200" ] || warn "$host did not answer 200 — investigate before logging out"
  done

  cat <<'EOF'

  Done. Verify from your own machine that the ports are now closed:

      Test-NetConnection 187.127.99.8 -Port 3306   # expect: failed
      Test-NetConnection 187.127.99.8 -Port 5100   # expect: failed
      Test-NetConnection 187.127.99.8 -Port 443    # expect: succeeded

  KEEP THIS SSH SESSION OPEN until you have confirmed you can open a second
  one. If SSH is ever locked out, Hostinger's browser console can still reach
  the machine and `ufw disable` undoes everything here.

  Still worth doing separately (both need a MySQL restart, so a short outage):
    - bind-address = 127.0.0.1 in /etc/mysql/mysql.conf.d/mysqld.cnf
    - check Hostinger's own panel firewall, which sits in front of ufw
EOF
fi
