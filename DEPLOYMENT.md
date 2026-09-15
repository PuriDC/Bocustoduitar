# Bocusto Guitars — deploying beside Bocusto Luthier

The Luthier site runs on the Hostinger VPS `srv1775777.hstgr.cloud` as **nginx +
pm2**, not Docker:

| | Bocusto Luthier (live) | Bocusto Guitars (this site) |
|---|---|---|
| Domain | bocustotonewood.com | the new domain |
| Frontend | `/var/www/bocustotonewood/frontend` (nginx root) | `/var/www/bocustoguitars/frontend` |
| Backend | pm2 app `tonewood-backend`, port 5000 | pm2 app `guitars-backend`, port 5100 |
| Database | MySQL on the same host, `bocusto_luthier` | same MySQL, `bocusto_guitars` |

`docker-compose.yml` in this repo is for **local development only**. Production
follows the steps below.

---

## Using the same admin accounts as bocustotonewood.com

The three administrators registered at bocustotonewood.com (`@Developer`,
`@auttapol99`, `@admin`) live in `bocusto_luthier.users` on the VPS. This site
signs people in against that table directly — no copying, no second password.

The login checks, in order:

1. `bocusto_guitars.users` — accounts belonging only to this site
2. `bocusto_luthier.users` — the shared administrators, when `SHARED_USERS_DB` is set

Either a username or an email address is accepted, and the comparison is
case-insensitive, so `Developer`, `developer` and `p@gmail.com` all resolve to
the same account. Only `role = 'admin'` may sign in; ordinary customer accounts
are refused with 403.

**Three things must be true for it to work:**

1. **Same MySQL server.** `DB_HOST` must point at the instance that holds
   `bocusto_luthier` — on the VPS that is `localhost`. A local Docker MySQL has
   its own, different copy of the accounts.

2. **Read access to the shared table.** If the backend connects as a
   least-privilege MySQL user rather than `root`, grant it explicitly:

   ```sql
   GRANT SELECT ON bocusto_luthier.users TO 'bocusto_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

   `GET /api/health` reports whether this worked:

   ```json
   { "sharedUsers": { "status": "ok", "database": "bocusto_luthier", "admins": 3 } }
   ```

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

SHARED_USERS_DB=bocusto_luthier

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
cd ../backend && rsync -a --delete --exclude .env --exclude node_modules . /var/www/bocustoguitars/backend/
cd /var/www/bocustoguitars/backend && npm ci --omit=dev && pm2 restart guitars-backend
```

`.env` is deliberately excluded — it is the only copy of the production secrets.

## Site-only administrators

Anyone in `bocusto_luthier.users` with `role = 'admin'` can already sign in. To
add an account that belongs to this site alone (a useful break-glass login if
the Luthier database is ever moved):

```bash
cd /var/www/bocustoguitars/backend
node src/scripts/createAdmin.js <username> <email> <password> "<Full Name>"
```
