#!/usr/bin/env bash
#
# system-update.sh — apply the pending Ubuntu updates and make the reboot safe.
#
#   ssh root@srv1775777.hstgr.cloud
#   cd /opt/bocusto-guitars-src && git pull
#   ./scripts/system-update.sh --check    # report only, change nothing
#   ./scripts/system-update.sh            # upgrade, then tell you to reboot
#   ./scripts/system-update.sh --reboot   # upgrade and reboot straight away
#
# The reboot is the dangerous part. pm2 only restarts applications on boot if
# its systemd unit was installed, and without it a reboot takes BOTH sites down
# until someone logs in and starts them by hand. This refuses to reboot until
# that unit exists.

set -euo pipefail

MODE="${1:-upgrade}"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mXX  %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run as root"

# --- 1. will the sites come back on their own? ------------------------------

say "Checking that pm2 is set to start on boot"
PM2_UNIT_OK=""
if systemctl list-unit-files 2>/dev/null | grep -qE '^pm2-root\.service'; then
  if systemctl is-enabled pm2-root >/dev/null 2>&1; then
    echo "    pm2-root.service is installed and enabled"
    PM2_UNIT_OK="yes"
  else
    warn "pm2-root.service exists but is NOT enabled"
  fi
else
  warn "pm2 has no systemd unit — the sites would NOT come back after a reboot"
fi

if [ -z "$PM2_UNIT_OK" ]; then
  if [ "$MODE" = "--check" ]; then
    warn "fix it with:  pm2 startup systemd -u root --hp /root   (then run the command it prints)"
  else
    say "Installing the pm2 startup unit"
    pm2 startup systemd -u root --hp /root
    systemctl enable pm2-root >/dev/null 2>&1 || true
    if systemctl is-enabled pm2-root >/dev/null 2>&1; then
      echo "    pm2-root.service enabled"
      PM2_UNIT_OK="yes"
    else
      warn "could not enable pm2-root automatically — run the command pm2 printed above"
    fi
  fi
fi

say "Saving the current pm2 process list"
pm2 save || warn "pm2 save failed — the apps may not be restored on boot"
pm2 list

# --- 2. what is pending -----------------------------------------------------

say "Pending updates"
apt-get update -qq
apt list --upgradable 2>/dev/null | tail -n +2 | head -50 || true
echo "    total: $(apt list --upgradable 2>/dev/null | tail -n +2 | wc -l)"

if [ -f /var/run/reboot-required ]; then
  warn "a reboot is already pending: $(cat /var/run/reboot-required.pkgs 2>/dev/null | tr '\n' ' ')"
fi

if [ "$MODE" = "--check" ]; then
  say "Check only — nothing was changed"
  exit 0
fi

# --- 3. upgrade -------------------------------------------------------------

say "Upgrading"
# noninteractive so a package never blocks on a config-file prompt; keep the
# existing config where a package ships a new one.
DEBIAN_FRONTEND=noninteractive apt-get -y \
  -o Dpkg::Options::=--force-confdef \
  -o Dpkg::Options::=--force-confold \
  upgrade

DEBIAN_FRONTEND=noninteractive apt-get -y autoremove

say "Checking both sites survived the upgrade"
for url in "http://127.0.0.1:5100/api/health" "http://127.0.0.1:5000/api/products"; do
  if curl -fsS -o /dev/null -m 10 "$url"; then echo "    OK   $url"; else warn "no answer from $url"; fi
done
for host in bocustoguitar.com bocustotonewood.com; do
  echo "    https://$host -> $(curl -s -o /dev/null -w '%{http_code}' -m 15 "https://$host/" || echo 000)"
done

# --- 4. reboot --------------------------------------------------------------

if [ ! -f /var/run/reboot-required ]; then
  say "No reboot required"
  exit 0
fi

if [ "$MODE" = "--reboot" ]; then
  [ -n "$PM2_UNIT_OK" ] || die "refusing to reboot: pm2 is not set to start on boot, both sites would stay down"
  say "Rebooting in 10 seconds — Ctrl+C to cancel"
  sleep 10
  reboot
else
  cat <<EOF

  A reboot is required to finish (kernel or libc was updated).

  Before rebooting, confirm pm2 will bring the sites back:
      systemctl is-enabled pm2-root     # should print: enabled
      pm2 save

  Then:
      reboot

  Afterwards check both sites and, if they are down:
      pm2 resurrect

EOF
fi
