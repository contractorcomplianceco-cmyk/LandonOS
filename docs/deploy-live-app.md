# LandonOS — live app deployment

Internal Command Center at **https://landon.cagteam.net**.

| Layer | How it runs in production |
|-------|---------------------------|
| **SPA** | nginx serves `artifacts/landonos/dist/public` → `/var/www/landonos` |
| **API** | PM2 process **`landonos-api`** on port **3001** (`ecosystem.landonos.config.cjs`) |
| **Postgres** | Docker Compose **`postgres`** service only (port 5432) |
| **HTTPS** | Certbot + nginx (see [deploy-nginx-landonos.md](./deploy-nginx-landonos.md)) |

The SPA syncs workspace data to Postgres via `/api` when the api-server is up.
Users sign in with email/password; each account can own multiple workspaces.

Without the api-server, the SPA falls back to **local-only** mode (browser storage).

---

## Production stack (landon.cagteam.net)

```bash
cd /path/to/landonos
cp .env.example .env
# Edit .env — set DATABASE_URL, NODE_ENV=production, optional API_KEY

pnpm install
docker compose up -d postgres
pnpm run db:push
pnpm run build

export DATABASE_URL='postgres://USER:PASSWORD@127.0.0.1:5432/landonos'
pm2 start ecosystem.landonos.config.cjs
pm2 save
pm2 startup   # run the command it prints once

sudo rsync -a --delete artifacts/landonos/dist/public/ /var/www/landonos/
sudo nginx -t && sudo systemctl reload nginx
```

nginx config, HTTPS, and cache headers: [deploy-nginx-landonos.md](./deploy-nginx-landonos.md).

Health checks (local API — no nginx auth):

```bash
curl -s http://127.0.0.1:3001/api/healthz
curl -s http://127.0.0.1:3001/health
```

Over HTTPS, live nginx requires Basic Auth — see [operations-runbook.md](./operations-runbook.md#4-health-checks).

---

## Local development

```bash
docker compose up -d postgres
# Use dev credentials from docker-compose.yml defaults in DATABASE_URL for local only
DATABASE_URL=postgres://landonos:landonos@127.0.0.1:5432/landonos pnpm run db:push

DATABASE_URL=postgres://landonos:landonos@127.0.0.1:5432/landonos PORT=3001 pnpm run start:api

pnpm run dev
```

1. Open the app → redirected to `/login` when API is up  
2. Register or sign in → default workspace **My Cockpit** is created  
3. Header shows **Live · &lt;workspace name&gt;** when synced  

---

## Required environment variables (live)

Set on the server (`.env` + export before `pm2 start`, or `pm2 start` with env already loaded).
See [`.env.example`](../.env.example) — placeholders only in git.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | **Yes** | Postgres connection (Docker on localhost:5432) |
| `PORT` | **Yes** | API listen port (`3001`; nginx proxies `/api` here) |
| `NODE_ENV` | **Yes** | Set `production` on VPS (secure session cookies) |
| `API_KEY` | No | Extra write protection when no session cookie |
| `VITE_API_KEY` | No | Same key, baked into SPA at build time |
| `VITE_API_BASE_URL` | No | Empty = same-origin `/api` via nginx |
| `VITE_APP_ENV` | No | `production` label in UI |

Deprecated: `WORKSPACE_ID` — per-user workspaces use cookies `landonos_session` / `landonos_workspace`.

---

## Docker Compose notes

- **`postgres`** — used in production (data volume `landonos_pg`).
- **`api`** service in `docker-compose.yml` — optional alternative to PM2; **live uses PM2**, not Compose API.

---

## nginx (SPA + API)

See [deploy-nginx-landonos.md](./deploy-nginx-landonos.md).

- `/` → static files from `/var/www/landonos`
- `/api/` → proxy to `http://127.0.0.1:3001` (include `Cookie` + `X-Forwarded-Proto`)
- `/health` → proxy to API for monitoring
- SPA fallback: `try_files $uri $uri/ /index.html`

---

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Load-balancer health (DB status) |
| GET | `/api/healthz` | Same health JSON under `/api` |
| POST | `/api/auth/register` | Create account + default workspace |
| POST | `/api/auth/login` | Sign in (session cookie) |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/me` | Current user + workspaces |
| GET | `/api/workspaces` | List owned workspaces |
| POST | `/api/workspaces` | Create workspace |
| POST | `/api/workspaces/:id/activate` | Set active workspace cookie |
| DELETE | `/api/workspaces/:id` | Delete workspace |
| GET | `/api/workspace` | Load active workspace data |
| PUT | `/api/workspace` | Save active workspace data |
| DELETE | `/api/workspace` | Reset active workspace data |

---

## Smoke tests (live)

1. `curl -su 'USER:PASS' https://landon.cagteam.net/api/healthz` → `"database":"connected"` (or local: `curl -s http://127.0.0.1:3001/api/healthz`)
2. Register at `/login` → cockpit with **Live · My Cockpit**
3. Create research request → refresh → data persists
4. Settings → Workspaces → second workspace → isolated data
5. Sign out → `/login`; sign in again → same data
6. Stop `landonos-api` → app shows **Local only**

---

## Deploy index

- **[operations-runbook.md](./operations-runbook.md)** — backup, restore, health checks, deploy sequence, reboot startup
- **This file** — architecture, env vars, PM2 + Postgres
- **[deploy-nginx-landonos.md](./deploy-nginx-landonos.md)** — nginx, HTTPS, static sync
- **[ecosystem.landonos.config.cjs](../ecosystem.landonos.config.cjs)** — PM2 process `landonos-api`
