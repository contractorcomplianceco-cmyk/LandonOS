# LandonOS — Cursor / Server Migration Handoff

> For Carmen. This document hands off **LandonOS: Performance Research Cockpit**
> from the Replit prototype environment to the GitHub → Cursor → AWS/server
> workflow. **Replit is not the final production home.** The app is
> *migration-ready*, not production-ready.

## App name

LandonOS: Performance Research Cockpit

## Current status

High-fidelity **frontend-only** prototype. Builds cleanly **outside Replit**.
Typecheck passes, production build passes, no console errors in normal use.
Target: portable static app, deployed to a private/staging server with access
protection added during the server phase.

## Stack at a glance

| Aspect | Value |
| --- | --- |
| Framework | React 19 + Vite 7 + TypeScript |
| Package manager | **pnpm** (monorepo; `npm`/`yarn` blocked by a `preinstall` guard) |
| App location | `artifacts/landonos` |
| Build output | `artifacts/landonos/dist/public` (static files) |
| Backend | **None** |
| Database | **None** |
| Auth | **None** |
| AI | **Simulated only** (template-based, no model calls) |
| Zoho / CRM / WorkDrive / Supabase / OpenAI | **None connected** |

## What works

- All 23 routes render real pages; sidebar/profile navigation is functional.
- Core modules are interactive and persist to `localStorage`:
  Performance Cockpit, Research Engine, Tuning Bay, Track Map, Brief Builder,
  Source Garage, Pit Stop, RoseOS Co-Driver, Finish Line Handoff, Idea Garage,
  Garage Rewards, Driver Training, Company Brain Sync, Race Control, Settings.
- Create/edit/delete flows (with guarded delete confirms), reward points,
  training progress, gauges, onboarding/welcome (narration + PDF guide),
  Settings **export / import / reset** of all app data.
- Click sound + global mute toggle; responsive layout (mobile/tablet/desktop).

## What is demo / prototype only

- **All data is browser-local** (`localStorage` key `landonos_data_v1`,
  versioned with a one-time fallback read of the legacy `landonos_data` key).
  Not shared across users/devices; no server sync.
- **"AI" is simulated**: Tuning Bay prompt coach and RoseOS Co-Driver chat use
  local templates + canned responses (RoseOS uses a `setTimeout` to mimic
  latency). No external model is called.
- **Company Brain Sync** edits only local state; suggestions are suggestions,
  never auto-recorded.
- **Source Garage** is local CRUD — there is no real source verification.
- A few personal-page actions are **toast-only placeholders** (account email/
  password change, benefits time-off / plan changes, employee-record correction,
  team-lead review request). These are intentional and clearly non-destructive.

## Commands (run from the repo root)

```bash
pnpm install                                      # install deps (pnpm required)
pnpm --filter @workspace/landonos run typecheck   # TypeScript check
pnpm --filter @workspace/landonos run build       # production build
pnpm --filter @workspace/landonos run serve       # preview the built app
pnpm --filter @workspace/landonos run dev         # dev server
```

> If you extract `artifacts/landonos` into its own standalone repo, you can also
> run plain `vite` commands (the scripts already call `vite`). In that case the
> `npm`/pnpm choice is yours, but keep the existing `vite.config.ts`.

## Expected build output

Static site at `artifacts/landonos/dist/public` (`index.html` + hashed
`assets/`). Serve it from any static host / nginx; SPA fallback should rewrite
unknown routes to `/index.html`.

## Required env vars (placeholders only)

The app builds/runs with **no env file**. Optional overrides (see `.env.example`):

| Var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | dev/preview server port |
| `BASE_PATH` | `/` | base path if served under a sub-route |
| `NODE_ENV` | `development` | standard Node env |

No `DATABASE_URL`, `OPENAI_API_KEY`, or auth secrets are used today. They appear
in `.env.example` only as clearly-labeled **future** placeholders.

## Backend / Database / Auth / AI / CRM

- **Backend**: none. (A separate `artifacts/api-server` scaffold exists in the
  monorepo but is **not used** by LandonOS.)
- **Database**: none. No Replit DB, Postgres, or Supabase.
- **Auth**: none. There is a browser-only "admin passcode" for the Race Control
  page (default `landon-admin`, stored in local data) — this is a **prototype UX
  gate, not real security**. Do **not** assume Replit Auth or Clerk for the
  future; pick the real auth system during the server phase.
- **AI**: simulated only.
- **Zoho / CRM / WorkDrive**: none.

## Known broken / missing items

- **None broken.** All referenced assets exist and resolve in the build
  (`src/assets/v8-rev.mp3`, `attached_assets/cca-crest-inset_*.png`,
  `attached_assets/generated_audio/landonos_walkthrough_theme.mp3`, and
  `public/onboarding/*`).
- **Missing by design** (future work): real auth, real database/persistence,
  real AI, real source verification, real Company Brain, multi-user sync.
- The main JS bundle is ~876 kB (gzip ~257 kB) — acceptable for staging; consider
  route-level code-splitting later (non-blocking).

## Replit-only assumptions (already isolated)

- `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`,
  `@replit/vite-plugin-dev-banner` are now **dynamically imported and gated
  behind `REPL_ID`** — they never load off Replit. They remain in
  `devDependencies` (harmless); you may remove them entirely during extraction.
- `vite.config.ts` previously **required** `PORT`/`BASE_PATH` and would throw
  without them — it now **defaults** them, so the app builds anywhere.
- `@assets` alias points at the repo-root `attached_assets/` folder. If you
  extract just `artifacts/landonos`, copy `attached_assets/cca-crest-inset_*.png`
  and `attached_assets/generated_audio/landonos_walkthrough_theme.mp3` along with
  it (or move them under `src/assets` and update the two imports in
  `layout.tsx` / `walkthrough-video.tsx`).

## Recommended next Cursor tasks

1. Create the GitHub repo and push; open in Cursor.
2. Decide extraction strategy: keep the monorepo, or lift `artifacts/landonos`
   into a standalone Vite app (carry the `@assets` files — see above).
3. Add **Basic Auth** (nginx) before any private/staging exposure.
4. Choose and implement the real auth system (not assumed to be Replit/Clerk).
5. Replace simulated AI / Company Brain / source checks with real services
   **only when explicitly approved** — keep the human-review guardrails intact.
6. If/when persistence is needed, design a backend + database and a localStorage
   → server migration (do not auto-migrate prototype data).

## Recommended future AWS path

`/home/ubuntu/projects/landonos`

## Possible future staging domain

`landon.cagteam.net` (only after Basic Auth / access protection is in place).

## ⚠️ Warning

Replit is **not** the final production home. Do not deploy from Replit as the
final solution, and do not connect live company systems (Zoho, WorkDrive, CRM,
Supabase, OpenAI, email, SMS) until explicitly approved. nginx / DNS / PM2 /
SSL / AWS configuration belongs to the Cursor/server phase — not Replit.
