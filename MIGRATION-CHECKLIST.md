# LandonOS — Migration Checklist

Status legend: ✅ done · ☐ to do (Cursor/server phase) · n/a not applicable

## Pre-migration (done in Replit)

- ✅ **Pre-migration audit complete** — see `CURSOR-HANDOFF.md`.
- ✅ **Secrets removed / not present** — repo references no real secrets or API
  keys. The only "secret" is a browser-only prototype admin passcode (not real
  security).
- ✅ **`.env.example` reviewed** — placeholders only; app runs with no `.env`.
- ✅ **`.env` gitignored** — added to `.gitignore`.
- ✅ **Build passes** — `pnpm --filter @workspace/landonos run build` succeeds
  **without** Replit env vars (`PORT`/`BASE_PATH`/`REPL_ID`).
- ✅ **Typecheck passes** — `pnpm --filter @workspace/landonos run typecheck`.
- ✅ **Assets verified** — all imported images/audio/PDF resolve in the build;
  no broken references.
- ✅ **Replit-only dependencies isolated** — Replit Vite plugins are now
  dynamically imported and gated behind `REPL_ID`; removable on extraction.
- ✅ **Vite config made portable** — `PORT`/`BASE_PATH` now default instead of
  throwing.
- ✅ **Unused workspace coupling removed** — dropped the unused
  `@workspace/api-client-react` dependency from the app.
- ✅ **LocalStorage / demo data labeled** — versioned key `landonos_data_v1`
  (legacy fallback); README + handoff clearly label it browser-local prototype
  data. Export/import/reset available in Settings → Data.
- ✅ **No live integrations connected** — no Zoho/CRM/WorkDrive/Supabase/OpenAI/
  auth.
- ✅ **No production data migrated** — there is no production database; nothing to
  migrate.

## Migration (Cursor / GitHub / AWS phase)

- ☐ **GitHub repo created** and code pushed.
- ☐ **AWS clone path planned** — `/home/ubuntu/projects/landonos`.
- ☐ **Decide extraction strategy** — keep monorepo vs. lift `artifacts/landonos`
  standalone (carry `@assets` files if standalone — see handoff).
- ☐ **Install & verify on server** — `pnpm install`, typecheck, build, preview.
- ☐ **Basic Auth before staging exposure** — required before exposing
  `landon.cagteam.net` or any private URL.
- ☐ **nginx / PM2 / SSL / DNS** — configure during the server phase (not on
  Replit). Static build → nginx with SPA fallback to `/index.html`.

## Explicitly NOT done (out of scope / needs approval)

- n/a Real authentication system (do not assume Replit Auth or Clerk).
- n/a Real database / server persistence.
- n/a Real AI, Company Brain, or source-verification integrations.
- n/a Connecting any live company system.

## Cursor next-step list

1. Push to GitHub; open in Cursor.
2. Clone to `/home/ubuntu/projects/landonos`; run install → typecheck → build →
   preview.
3. Add Basic Auth (nginx) before any staging exposure.
4. Configure nginx (static serve + SPA fallback), PM2 (only if a server process
   is later added), SSL, DNS for `landon.cagteam.net`.
5. Plan real auth + (if needed) backend/database as separate, approved tasks —
   preserve the human-review guardrails.
