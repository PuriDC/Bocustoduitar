# Bocusto Guitars — deploying beside Bocusto Luthier

The Luthier site runs on the Hostinger VPS `srv1775777.hstgr.cloud` as **nginx +
pm2**, not Docker:

| | Bocusto Luthier (live) | Bocusto Guitars (this site) |
|---|---|---|
| Domain | bocustotonewood.com | the new domain |
| Frontend | `/var/www/bocustotonewood/frontend` (nginx root) | `/var/www/bocustoguitars/frontend` |
| Backend | pm2 app `tonewood-backend`, port 5000 | pm2 app `guitars-backend`, port 5100 |
| Database | MySQL on the same host, `bocustotonewood` | same MySQL, `bocusto_guitars` |

`docker-compose.yml` in this repo is for **local development only**. Production
follows the steps below.

---

## Using the same admin accounts as bocustotonewood.com

The three administrators registered at bocustotonewood.com (`@Developer`,
`@auttapol99`, `@admin`) live in `bocustotonewood.users` on the VPS. This site
signs people in against that table directly — no copying, no second password.

The login checks, in order:

1. `bocusto_guitars.users` — accounts belonging only to this site
2. `bocustotonewood.users` — the shared administrators, when `SHARED_USERS_DB` is set

Either a username or an email address is accepted, and the comparison is
case-insensitive, so `Developer`, `developer` and `p@gmail.com` all resolve to
the same account. Only `role = 'admin'` may sign in; ordinary customer accounts
are refused with 403.

**Three things must be true for it to work:**

1. **Same MySQL server.** `DB_HOST` must point at the instance that holds
   `bocustotonewood` — on the VPS that is `localhost`. A local Docker MySQL has
   its own, different copy of the accounts.

2. **Read access to the shared table.** If the backend connects as a
   least-privilege MySQL user rather than `root`, grant it explicitly:

   ```sql
   GRANT SELECT ON bocustotonewood.users TO 'bocusto_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

   `GET /api/health/details` reports whether this worked. It needs an
   administrator token — the public `/api/health` deliberately says nothing
   beyond `{"status":"ok"}`, so a passer-by cannot read off the database state
   or count the administrator accounts:

   ```json
   { "sharedUsers": { "status": "ok", "database": "bocustotonewood", "admins": 3 } }
   ```

   The bootstrap and deploy scripts print the same information on the server,
   where no token is needed.

   `"status": "unreachable"` means the grant is missing — logins would otherwise
   fail with a misleading "incorrect username or password".

3. **The same `JWT_SECRET` as the Luthier backend** (`/var/www/bocustotonewood/backend/.env`).
   Copy the value across verbatim. Without it each site issues tokens the other
   rejects: the password still works, but a session does not carry over.

---

## First deployment

```bash
ssh root@srv1775777.hstgr.cloud

# 1. Database — creates bocusto_guitars, leaves bocusto_luthier untouched.
mysql -u root -p < /opt/bocusto-guitars-src/backend/schema.sql

# 2. Backend
mkdir -p /var/www/bocustoguitars
rsync -a --delete /opt/bocusto-guitars-src/backend/ /var/www/bocustoguitars/backend/
cd /var/www/bocustoguitars/backend
npm ci --omit=dev
cp .env.example .env    # then edit — see below
pm2 start src/server.js --name guitars-backend
pm2 save

# 3. Frontend
cd /opt/bocusto-guitars-src/frontend
npm ci && npm run build
rsync -a --delete dist/ /var/www/bocustoguitars/frontend/
```

`/var/www/bocustoguitars/backend/.env`:

```ini
PORT=5100
DB_HOST=localhost
DB_PORT=3306
DB_USER=<same user the Luthier backend uses, or one with access to both>
DB_PASSWORD=<...>
DB_NAME=bocusto_guitars

SHARED_USERS_DB=bocustotonewood

# Copy verbatim from /var/www/bocustotonewood/backend/.env
JWT_SECRET=<the Luthier backend's JWT_SECRET>
JWT_EXPIRES_IN=24h
```

Verify before opening the domain:

```bash
curl -s http://127.0.0.1:5100/api/health
# expect: "database":"connected" and "sharedUsers":{"status":"ok","admins":3}
```

## nginx

A separate server block for the new domain; the Luthier one is untouched.

```nginx
server {
    server_name bocustoguitars.com;   # the new domain

    root /var/www/bocustoguitars/frontend;
    index index.html;
    client_max_body_size 1M;

    # Client-side routing — /about, /models, /admin all serve index.html.
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5100/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then `certbot --nginx -d bocustoguitars.com` and `nginx -t && systemctl reload nginx`.

## Updating later

```bash
cd /opt/bocusto-guitars-src && git pull
cd frontend && npm ci && npm run build && rsync -a --delete dist/ /var/www/bocustoguitars/frontend/
cd ../backend && rsync -a --delete --exclude .env --exclude node_modules --exclude uploads . /var/www/bocustoguitars/backend/
cd /var/www/bocustoguitars/backend && npm ci --omit=dev && pm2 restart guitars-backend
```

`.env` is excluded because it is the only copy of the production secrets, and
`uploads/` because it holds images an administrator added that exist nowhere
else — without the exclusion `--delete` would erase them on every deploy.

In practice use `./deploy.sh`, which does all of the above plus a file and
database backup, and checks the site afterwards.

## Server maintenance

| Script | What it does |
|---|---|
| `scripts/harden-vps.sh` | closes 3306, 5000 and 5100 at the firewall, verifying the SSH rule first |
| `scripts/update-nginx.sh` | adds the security headers, `/uploads/` and a real robots.txt to the live config without disturbing certbot's SSL |
| `scripts/mysql-localhost.sh` | binds MySQL to loopback (restarts MySQL — brief outage) |
| `scripts/system-update.sh` | applies Ubuntu updates and refuses to reboot unless pm2 will restart the sites |

Each takes `--dry-run` (or `--check`) first.

## Site-only administrators

Anyone in `bocustotonewood.users` with `role = 'admin'` can already sign in. To
add an account that belongs to this site alone (a useful break-glass login if
the Luthier database is ever moved):

```bash
cd /var/www/bocustoguitars/backend
node src/scripts/createAdmin.js <username> <email> <password> "<Full Name>"
```
