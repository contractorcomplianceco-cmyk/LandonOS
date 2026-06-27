# LandonOS — nginx deployment (landon.cagteam.net)

Production: **HTTPS** nginx serves the SPA; **`/api`** and **`/health`** proxy to PM2 **`landonos-api`** on `127.0.0.1:3001`.

Stack overview: [deploy-live-app.md](./deploy-live-app.md).

## Build output

From the repo root:

```bash
pnpm install
pnpm --filter @workspace/landonos run build
```

Static files:

```
artifacts/landonos/dist/public
```

Sync to the web root:

```bash
sudo rsync -a --delete artifacts/landonos/dist/public/ /var/www/landonos/
sudo chown -R www-data:www-data /var/www/landonos
```

Confirm `onboarding/` (MP3s, PDF) is present under the web root after sync.

---

## Example server block (HTTPS)

Certbot usually adds the `listen 443 ssl` lines. This is the full intended shape:

```nginx
server {
    listen 443 ssl http2;
    server_name landon.cagteam.net;

    # ssl_certificate / ssl_certificate_key — managed by Certbot

    root /var/www/landonos;
    index index.html;

    # SPA shell — do not cache (fresh deploys + auth)
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        try_files $uri =404;
    }

    location = /manifest.webmanifest {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        try_files $uri =404;
    }

    location = /sw.js {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        try_files $uri =404;
    }

    # API — never cache; forward cookies for session auth
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
        add_header Cache-Control "no-store, no-cache, must-revalidate, private" always;
    }

    location = /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "no-store" always;
    }

    # Hashed Vite assets — safe to cache
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location /icons/ {
        expires 7d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name landon.cagteam.net;
    return 301 https://$host$request_uri;
}
```

`try_files $uri $uri/ /index.html` ensures client routes (`/settings`, `/login`, etc.) load the app.

---

## HTTP Basic Auth (live)

Production **`/etc/nginx/sites-available/landonos`** enables Basic Auth at the **server** level (all routes, including `/api/`). Credentials file: `/etc/nginx/.htpasswd-landonos`.

Health checks over HTTPS require `-u user:pass`. Local checks bypass nginx:

```bash
curl -s http://127.0.0.1:3001/api/healthz
curl -su 'USER:PASS' https://landon.cagteam.net/api/healthz
```

See [operations-runbook.md](./operations-runbook.md) for full health and ops procedures.

---

## Optional: HTTP Basic Auth (staging-only pattern)

```nginx
location / {
    auth_basic "LandonOS Internal";
    auth_basic_user_file /etc/nginx/.htpasswd-landonos;
    try_files $uri $uri/ /index.html;
}
```

```bash
sudo htpasswd -c /etc/nginx/.htpasswd-landonos <username>
```

---

## SSL (Certbot)

```bash
sudo certbot --nginx -d landon.cagteam.net
sudo certbot renew --dry-run
```

Re-test SPA routes and `/api/healthz` over HTTPS after enabling SSL.

---

## Deploy steps (summary)

Full sequence (git pull, API restart, backup): [operations-runbook.md](./operations-runbook.md#5-deploy--update-sequence).

1. `pnpm run build` and rsync `dist/public` → `/var/www/landonos`.
2. Ensure PM2 **`landonos-api`** is running (`ecosystem.landonos.config.cjs`).
3. Apply nginx config; `sudo nginx -t && sudo systemctl reload nginx`.
4. Verify health (Basic Auth on live): `curl -su 'USER:PASS' https://landon.cagteam.net/api/healthz`.
