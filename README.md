# LandonOS: Performance Research Cockpit

An AI-guided research training cockpit for "Landon" that teaches and structures
responsible compliance/business research, with built-in human-review guardrails.
The UI is themed as a luxury performance-car cockpit (deep black/graphite,
carbon-fiber texture, performance-red accents, chrome dividers, gauge-style
instruments).

> **Status: migration-ready prototype.** This is a high-fidelity, **frontend-only**
> prototype. All data is stored in the browser (`localStorage`). There is **no
> backend, no database, and no live integrations**. It is **not** production-ready —
> the target is GitHub → Cursor → AWS/server, with access protection added during
> the server phase. See [`CURSOR-HANDOFF.md`](./CURSOR-HANDOFF.md) and
> [`MIGRATION-CHECKLIST.md`](./MIGRATION-CHECKLIST.md).

## Repository layout

This is a **pnpm monorepo**. The LandonOS app is one artifact inside it:

```
artifacts/landonos/      ← THE APP (React + Vite + TypeScript, frontend-only)
artifacts/api-server/    ← unused scaffold (NOT used by LandonOS)
artifacts/mockup-sandbox/← design/prototyping tool (NOT shipped with LandonOS)
lib/                     ← shared workspace libraries (LandonOS uses none at runtime)
scripts/                 ← build-time generators (e.g. the user-guide PDF)
```

For a clean migration you only need `artifacts/landonos` plus the workspace
root files (`package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`,
`tsconfig*.json`). The other artifacts can be ignored or removed during the
Cursor/server phase.

## Requirements

- Node.js 20+
- **pnpm** (the repo enforces pnpm — `npm install` is intentionally blocked by a
  `preinstall` guard). Install with `corepack enable` or `npm i -g pnpm`.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/landonos run dev       # dev server (PORT defaults to 5000)
```

Then open the printed local URL.

## Build & preview

```bash
pnpm --filter @workspace/landonos run typecheck  # TypeScript check
pnpm --filter @workspace/landonos run build       # production build
pnpm --filter @workspace/landonos run serve       # preview the built app
```

Build output: `artifacts/landonos/dist/public` (static files — host behind any
static server / reverse proxy).

### Configuration

The app builds and runs with **no env file**. Optional overrides (see
[`.env.example`](./.env.example)): `PORT` (default `5000`), `BASE_PATH`
(default `/`), `NODE_ENV`.

## What is prototype/demo (honest labeling)

- **Data**: browser-local only (`localStorage` key `landonos_data_v1`). It is
  **not** shared across users or devices and does not sync to any server. Export/
  import/reset live in **Settings → Data**.
- **"AI" features** (Tuning Bay prompt coach, RoseOS Co-Driver chat, guided
  generation): **simulated**, template-based transformations — no live model calls.
- **Company Brain Sync**, **Source Garage** source checks, and dashboard gauges:
  driven by local seed/sample data, not real verification or live systems.
- A few personal-page actions (e.g. account email/password, time-off requests)
  are intentional **placeholders** that show a confirmation toast only.

## Not connected yet

No authentication, no database, no API, and **no** Zoho / WorkDrive / CRM /
Supabase / OpenAI / email / SMS integrations. Adding any of those is a later
Cursor/server task — see the handoff docs.

## Safety notes

- AI output is **draft only** until source-checked and human-reviewed.
- Official sources are preferred; unknown sources are flagged.
- Compliance/business conclusions require human review; nothing is auto-recorded
  as a company decision.
- No real secrets are stored in this repo. Never commit a real `.env`.
