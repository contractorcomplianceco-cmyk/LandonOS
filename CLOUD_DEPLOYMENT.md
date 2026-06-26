# Deployment docs (LandonOS / CCA Command Center)

Internal app only — **https://landon.cagteam.net**

| Document | Purpose |
|----------|---------|
| [docs/deploy-live-app.md](./docs/deploy-live-app.md) | PM2 `landonos-api`, Docker Postgres, env vars, API routes |
| [docs/deploy-nginx-landonos.md](./docs/deploy-nginx-landonos.md) | nginx HTTPS, `/api` proxy, static SPA sync |
| [ecosystem.landonos.config.cjs](./ecosystem.landonos.config.cjs) | Canonical PM2 config |

Do not commit `.env` — copy from `.env.example` on the server.
