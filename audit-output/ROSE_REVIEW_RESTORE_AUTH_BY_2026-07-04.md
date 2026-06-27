# Rose Review Mode — Restore Auth By 2026-07-04T12:00:00Z

**Review window:** `CCA_REVIEW_MODE=true` through **2026-07-04T12:00:00Z**  
**Executed:** 2026-06-27 on server `ip-172-31-33-189` (public IP `3.138.233.148`)

---

## Apps opened for Rose review

| App | URL | Server | Rose Review Ready |
|-----|-----|--------|-------------------|
| LandonOS | https://landon.cagteam.net | 3.138.233.148 | Yes — deployed this session |
| JestinaOS | https://jestina.cagteam.net | 3.129.68.79 | Yes — live bundle already has 2026-07-04 expiry |
| TonyOS | https://tony.cagteam.net | 3.129.68.79 | Yes — live bundle already has 2026-07-04 expiry |
| TaraOS | https://tara.cagteam.net | 3.129.68.79 | Yes — live bundle already has 2026-07-04 expiry |

## Not in Rose review scope / blocked

| App | URL | Status | Notes |
|-----|-----|--------|-------|
| Business Services | https://business-services.cagteam.net | Needs Review | On 3.129.68.79; SSH timed out — no nginx changes from this server |
| Sales Training | https://salestraining.cagteam.net | Open Tool (static 200) | No Rose review mode; static site |
| Research Hub | https://research.cagteam.net | Needs Review | Redirects to `/login` (Clerk); not Landon/Chloe |
| Chloe Hub | — | **Not found** | No repo, nginx vhost, or URL in workspace |
| JestinaOS repo | — | **Clone failed** | `jestinaos-command-center` not accessible with deploy key |

---

## Nginx backup path

```
/root/nginx-backups/rose-review-week-20260627-154900/
├── sites-available/
└── sites-enabled/
```

## Domains with Basic Auth disabled (approved only)

| Domain | Changed this session | Comment in config |
|--------|---------------------|-------------------|
| landon.cagteam.net | Updated expiry comment | `# TEMP ROSE REVIEW MODE — Basic Auth disabled for Rose review, restore after 2026-07-04T12:00:00Z` |
| jestina.cagteam.net | No (remote server) | Already returning HTTP 200 without 401 |
| tony.cagteam.net | No (remote server) | Already returning HTTP 200 without 401 |
| tara.cagteam.net | No (remote server) | Already returning HTTP 200 without 401 |

**Not changed:** business-services, salestraining, research, command.cagteam.net, public website, landing, client portal, payment, upload, thank-you pages.

---

## PM2 restarted

| Process | Server | Action |
|---------|--------|--------|
| `landonos-api` | 3.138.233.148 | `pm2 restart landonos-api --update-env` with `CCA_REVIEW_MODE=true`, `CCA_REVIEW_MODE_EXPIRES_AT=2026-07-04T12:00:00Z` |

No PM2 processes on this server for Tony/Tara/Jestina.

---

## Repos changed (source only — no `.env` committed)

| Repo | Path | Changes |
|------|------|---------|
| LandonOS | `/home/ubuntu/projects/landonos` | `ecosystem.landonos.config.cjs`, `.env.example`, `docs/operations-runbook.md` |
| TonyOS | `/home/ubuntu/projects/tonyos` | `.env.example` expiry updated |
| TaraOS | `/home/ubuntu/projects/taraos` | `.env.example` added with review mode vars |

---

## Env vars (reference — no secrets)

### Vite / SPA build
```
VITE_CCA_REVIEW_MODE=true
VITE_CCA_REVIEW_MODE_EXPIRES_AT=2026-07-04T12:00:00Z
```

### PM2 / API (LandonOS)
```
CCA_REVIEW_MODE=true
CCA_REVIEW_MODE_EXPIRES_AT=2026-07-04T12:00:00Z
```

### Next.js (if applicable)
```
NEXT_PUBLIC_CCA_REVIEW_MODE=true
NEXT_PUBLIC_CCA_REVIEW_MODE_EXPIRES_AT=2026-07-04T12:00:00Z
```

---

## Restore steps (after 2026-07-04T12:00:00Z)

### 1. LandonOS — nginx Basic Auth

```bash
sudo cp /root/nginx-backups/rose-review-week-20260627-154900/sites-available/landonos /etc/nginx/sites-available/landonos
# Or uncomment auth_basic lines and remove TEMP ROSE REVIEW comment
sudo nginx -t && sudo systemctl reload nginx
```

Credentials file (unchanged): `/etc/nginx/.htpasswd-landonos`

### 2. LandonOS — SPA rebuild without review mode

```bash
cd /home/ubuntu/projects/landonos
pnpm run build:app   # without VITE_CCA_REVIEW_MODE vars
sudo rsync -a --delete artifacts/landonos/dist/public/ /var/www/landonos/
sudo chown -R www-data:www-data /var/www/landonos
```

### 3. LandonOS — PM2

Remove `CCA_REVIEW_MODE` and `CCA_REVIEW_MODE_EXPIRES_AT` from `ecosystem.landonos.config.cjs`, then:

```bash
cd /home/ubuntu/projects/landonos
pm2 restart landonos-api --update-env
pm2 save
```

### 4. Remote server (3.129.68.79) — Jestina/Tony/Tara

Requires SSH access (currently blocked from 3.138.233.148):

- Re-enable nginx `auth_basic` on jestina, tony, tara vhosts
- Rebuild SPAs without `VITE_CCA_REVIEW_MODE` flags
- Redeploy static assets to respective `/var/www/*` paths

### 5. Verify auth restored

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://landon.cagteam.net/          # expect 401
curl -s -o /dev/null -w '%{http_code}\n' https://landon.cagteam.net/api/healthz # expect 401 without credentials
```

Browser: login gate should appear when not authenticated.

---

## Verification (2026-06-27)

| URL | HTTP | 401? | Review expiry in JS |
|-----|------|------|---------------------|
| https://landon.cagteam.net | 200 | No | 2026-07-04T12:00:00Z |
| https://jestina.cagteam.net | 200 | No | 2026-07-04T12:00:00Z |
| https://tony.cagteam.net | 200 | No | 2026-07-04T12:00:00Z |
| https://tara.cagteam.net | 200 | No | 2026-07-04T12:00:00Z |
| https://business-services.cagteam.net | 200 | No | N/A |
| https://salestraining.cagteam.net | 200 | No | N/A |
| https://research.cagteam.net | 307→login | App login | N/A |

No passwords or credential file contents are stored in this document.
