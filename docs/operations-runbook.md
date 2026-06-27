# LandonOS — operations runbook

Internal Command Center at **https://landon.cagteam.net**.

Canonical day-to-day ops reference: startup, health, backup/restore, deploy.
Architecture and env vars: [deploy-live-app.md](./deploy-live-app.md). nginx/HTTPS: [deploy-nginx-landonos.md](./deploy-nginx-landonos.md).

---

## Live stack (verified)

| Component | Value |
|-----------|-------|
| Repo path | `/home/ubuntu/projects/landonos` |
| Git remote | `git@github.com:contractorcomplianceco-cmyk/LandonOS.git` (SSH key `~/.ssh/landonos-cursor`) |
| PM2 process | **`landonos-api`** (`ecosystem.landonos.config.cjs`) |
| API port | **3001** (localhost) |
| Postgres container | **`landonos-postgres-1`** (`postgres:16-alpine`, healthy) |
| Compose file | `/home/ubuntu/projects/landonos/docker-compose.yml` — service **`postgres`** only in production |
| Postgres port | **5432** → host `127.0.0.1:5432` |
| Data volume | **`landonos_landonos_pg`** |
| SPA web root | **`/var/www/landonos`** |
| nginx site | **`/etc/nginx/sites-available/landonos`** → `sites-enabled/landonos` |
| HTTPS | Let's Encrypt — `/etc/letsencrypt/live/landon.cagteam.net/` |
| HTTP Basic Auth | **Temporarily disabled** 2026-06-26 for Rose Review Mode — revert by 2026-07-04T12:00:00Z. Backup: `/etc/nginx/sites-available/landonos.bak-2026-06-26`. Credentials file: `/etc/nginx/.htpasswd-landonos` |

Production uses **PM2 for the API**, not the Compose `api` service.

---

## 1. PM2 startup and reboot persistence

### Current state

| Check | Result |
|-------|--------|
| `pm2 save` | **Done** — `/home/ubuntu/.pm2/dump.pm2` lists `landonos-api` |
| systemd unit | **`pm2-ubuntu.service`** at `/etc/systemd/system/pm2-ubuntu.service` |
| `systemctl is-enabled pm2-ubuntu` | **`enabled`** |
| Unit action on boot | `ExecStart=.../pm2 resurrect` (restores saved process list) |

**Reboot persistence: configured (yes).** After reboot, systemd should resurrect `landonos-api` from the saved dump, including `DATABASE_URL` stored in the dump.

The unit may show `inactive (dead)` while PM2 was started manually in an interactive session; that does not mean startup is missing — only that the service is not the current parent of the running daemon.

### Verify after reboot

```bash
pm2 list
curl -s http://127.0.0.1:3001/api/healthz
# expect: {"status":"ok","database":"connected"}
```

### If `landonos-api` is missing after reboot

```bash
cd /home/ubuntu/projects/landonos

# Set real credentials (match server .env — never commit)
export DATABASE_URL='postgres://USER:PASSWORD@127.0.0.1:5432/landonos'
export NODE_ENV=production
export PORT=3001

pm2 start ecosystem.landonos.config.cjs
pm2 save
```

Ensure Postgres is up first:

```bash
cd /home/ubuntu/projects/landonos
docker compose up -d postgres
```

### One-time PM2 startup setup (new host)

If `pm2-ubuntu.service` does not exist:

```bash
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# Run the sudo command pm2 prints, then:
pm2 save
```

---

## 2. Postgres backup

Back up the **`landonos`** database from the running Compose Postgres container.

### One-off backup

```bash
BACKUP_DIR=/home/ubuntu/backups/landonos
mkdir -p "$BACKUP_DIR"

cd /home/ubuntu/projects/landonos
docker compose exec -T postgres \
  pg_dump -U landonos -d landonos --no-owner --clean \
  | gzip > "$BACKUP_DIR/landonos-$(date +%Y%m%d-%H%M%S).sql.gz"
```

Equivalent using the container name directly:

```bash
docker exec landonos-postgres-1 \
  pg_dump -U landonos -d landonos --no-owner --clean \
  | gzip > "$BACKUP_DIR/landonos-$(date +%Y%m%d-%H%M%S).sql.gz"
```

### Cron-friendly one-liner

Add to crontab (`crontab -e`), e.g. daily at 02:15 UTC:

```cron
15 2 * * * mkdir -p /home/ubuntu/backups/landonos && docker exec landonos-postgres-1 pg_dump -U landonos -d landonos --no-owner --clean | gzip > /home/ubuntu/backups/landonos/landonos-$(date +\%Y\%m\%d-\%H\%M\%S).sql.gz
```

### Output path and retention

- **Suggested path:** `/home/ubuntu/backups/landonos/landonos-YYYYMMDD-HHMMSS.sql.gz`
- **Retention:** keep at least 7 daily and 4 weekly copies; prune older files manually or with a find job, e.g. delete `.sql.gz` older than 30 days:

```bash
find /home/ubuntu/backups/landonos -name 'landonos-*.sql.gz' -mtime +30 -delete
```

Do not store backups only on the same disk as the Postgres volume without off-site copy.

---

## 3. Restore from backup (procedure only — do not run casually)

**Warning:** restore overwrites existing data. Schedule downtime, take a fresh backup first, and test on a non-production clone when possible.

1. Stop the API so nothing writes during restore:

   ```bash
   pm2 stop landonos-api
   ```

2. Restore into the running Postgres container (replace `BACKUP_FILE`):

   ```bash
   BACKUP_FILE=/home/ubuntu/backups/landonos/landonos-20260626-021500.sql.gz
   gunzip -c "$BACKUP_FILE" | docker exec -i landonos-postgres-1 psql -U landonos -d landonos
   ```

   For a full replace on an empty database, you may drop and recreate first (destructive — only when intentional):

   ```bash
   docker exec -i landonos-postgres-1 psql -U landonos -d postgres -c 'DROP DATABASE IF EXISTS landonos; CREATE DATABASE landonos OWNER landonos;'
   gunzip -c "$BACKUP_FILE" | docker exec -i landonos-postgres-1 psql -U landonos -d landonos
   ```

3. Restart API and verify:

   ```bash
   pm2 start landonos-api
   curl -s http://127.0.0.1:3001/api/healthz
   ```

---

## 4. Health checks

### API (direct — no nginx auth)

```bash
curl -s http://127.0.0.1:3001/health
curl -s http://127.0.0.1:3001/api/healthz
# expect: {"status":"ok","database":"connected"}
```

### Through nginx (HTTPS + Basic Auth)

Live nginx requires HTTP Basic Auth on all routes. Use credentials from `/etc/nginx/.htpasswd-landonos`:

```bash
curl -su 'USERNAME:PASSWORD' https://landon.cagteam.net/api/healthz
```

Without credentials, HTTPS health returns **401 Authorization Required** (expected).

**Note:** Live nginx does **not** proxy `/health` to the API (only `/api/`). External monitors should use **`/api/healthz`** with Basic Auth, or probe **`http://127.0.0.1:3001/health`** locally.

### Process and container status

```bash
pm2 list
pm2 show landonos-api

docker ps --filter name=landonos-postgres
# or
cd /home/ubuntu/projects/landonos && docker compose ps postgres
```

### nginx (read-only)

```bash
sudo nginx -t
systemctl status nginx
```

---

## 5. Deploy / update sequence

Standard update on the VPS after changes are pushed to GitHub.

### A. Commit and push (workstation or VPS)

```bash
cd /path/to/landonos
git add …
git commit -m "feat: …"
git push origin main
```

Repo uses SSH deploy key **`~/.ssh/landonos-cursor`** → `git@github.com:contractorcomplianceco-cmyk/LandonOS.git`.

### B. Pull, build, and publish on server

```bash
cd /home/ubuntu/projects/landonos
git pull origin main
pnpm install

# SPA (always for UI changes)
pnpm run build
sudo rsync -a --delete artifacts/landonos/dist/public/ /var/www/landonos/
sudo chown -R www-data:www-data /var/www/landonos

# API (when backend changed)
pnpm run build:api
pm2 restart landonos-api

# Schema changes (when migrations needed)
# export DATABASE_URL=…  # if not already in PM2 env
pnpm run db:push
```

### C. Post-deploy verification

```bash
pm2 list
curl -s http://127.0.0.1:3001/api/healthz
curl -su 'USERNAME:PASSWORD' https://landon.cagteam.net/api/healthz
```

Reload nginx **only** when nginx config changed:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### First-time / cold start (reference)

```bash
cd /home/ubuntu/projects/landonos
cp .env.example .env   # edit DATABASE_URL, NODE_ENV=production
docker compose up -d postgres
pnpm run db:push
pnpm run build
export DATABASE_URL='postgres://USER:PASSWORD@127.0.0.1:5432/landonos'
pm2 start ecosystem.landonos.config.cjs
pm2 save
sudo rsync -a --delete artifacts/landonos/dist/public/ /var/www/landonos/
```

Full nginx/SSL steps: [deploy-nginx-landonos.md](./deploy-nginx-landonos.md).

---

## 6. Safety constraints

- **Do not** run destructive ops casually: `docker compose down -v`, `pm2 delete`, `rm -rf` on volumes/backups.
- **Do not** reload nginx without `nginx -t` when changing config.
- Postgres data lives in Docker volume **`landonos_landonos_pg`** — deleting the volume is irreversible.
- Never commit `.env` or backup files containing credentials.

---

## 7. Rose Review Mode (temporary auth bypass)

**Active:** 2026-06-26 through **2026-07-04T12:00:00Z** (auto-expires via build-time env).

Allows Command Center to open LandonOS without nginx Basic Auth or email/password login. Login routes and auth code remain; destructive reset is disabled in the SPA during review mode. Admin passcode on Race Control is unchanged.

### What is disabled

| Layer | Status |
|-------|--------|
| nginx `auth_basic` on `landon.cagteam.net` | Commented out (backup: `landonos.bak-2026-06-26`) |
| SPA `AuthGate` | Bypassed when `VITE_CCA_REVIEW_MODE=true` and not expired |
| Settings reset | Disabled in UI during review mode |

### Env vars (PM2 + SPA build)

| Variable | Where | Value (tonight) |
|----------|-------|-----------------|
| `CCA_REVIEW_MODE` | PM2 `landonos-api` | `true` |
| `CCA_REVIEW_MODE_EXPIRES_AT` | PM2 `landonos-api` | `2026-07-04T12:00:00Z` |
| `VITE_CCA_REVIEW_MODE` | SPA build | `true` |
| `VITE_CCA_REVIEW_MODE_EXPIRES_AT` | SPA build | `2026-07-04T12:00:00Z` |

SPA build example:

```bash
VITE_CCA_REVIEW_MODE=true VITE_CCA_REVIEW_MODE_EXPIRES_AT=2026-07-04T12:00:00Z pnpm run build:app
```

### Revert after 2026-07-04T12:00:00Z (or manually)

```bash
# 1. Restore nginx Basic Auth
sudo cp /etc/nginx/sites-available/landonos.bak-2026-06-26 /etc/nginx/sites-available/landonos
# Or uncomment auth_basic lines in /etc/nginx/sites-available/landonos:
#   auth_basic "LandonOS Internal";
#   auth_basic_user_file /etc/nginx/.htpasswd-landonos;
sudo nginx -t && sudo systemctl reload nginx

# 2. Rebuild SPA without review-mode flags
cd /home/ubuntu/projects/landonos
pnpm run build:app
sudo rsync -a --delete artifacts/landonos/dist/public/ /var/www/landonos/
sudo chown -R www-data:www-data /var/www/landonos

# 3. Remove PM2 review-mode env — edit ecosystem.landonos.config.cjs (remove CCA_REVIEW_MODE lines), then:
export DATABASE_URL='postgres://USER:PASSWORD@127.0.0.1:5432/landonos'  # use live credentials
cd /home/ubuntu/projects/landonos
pm2 delete landonos-api
pm2 start ecosystem.landonos.config.cjs
pm2 save

# 4. Verify auth is back
curl -s -o /dev/null -w '%{http_code}\n' https://landon.cagteam.net/api/healthz   # expect 401 without -u
curl -su 'USER:PASS' -s -o /dev/null -w '%{http_code}\n' https://landon.cagteam.net/api/healthz  # expect 200
# Browser: https://landon.cagteam.net should show login when not signed in
```

After revert, remove `CCA_REVIEW_MODE` lines from `ecosystem.landonos.config.cjs` and commit.

---

## Quick reference

| Task | Command |
|------|---------|
| API health (local) | `curl -s http://127.0.0.1:3001/api/healthz` |
| PM2 status | `pm2 list` |
| Restart API | `pm2 restart landonos-api` |
| Postgres status | `docker ps --filter name=landonos-postgres` |
| Start Postgres | `cd /home/ubuntu/projects/landonos && docker compose up -d postgres` |
| Backup DB | See [§2 Postgres backup](#2-postgres-backup) |
| Deploy SPA | `pnpm run build && sudo rsync -a --delete artifacts/landonos/dist/public/ /var/www/landonos/` |
