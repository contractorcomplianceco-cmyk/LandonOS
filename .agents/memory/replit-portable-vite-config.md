---
name: Portable Vite config for off-Replit migration
description: How to make a Replit Vite artifact build/run outside Replit without breaking the Replit workflow
---

# Making a Replit Vite artifact portable

Replit Vite scaffolds often (a) **throw** if `PORT`/`BASE_PATH` env vars are
missing and (b) statically import `@replit/*` Vite plugins. Both break a plain
`vite build`/`preview` run off Replit.

**The fix (preserves Replit behavior):**
- Default the env vars instead of throwing: `process.env.PORT ?? "5000"`,
  `process.env.BASE_PATH ?? "/"`. The Replit workflow still supplies real values.
- Gate every `@replit/*` plugin behind `process.env.REPL_ID !== undefined` and
  load it via dynamic `await import(...)` inside the plugins array, not a static
  top-level import. On Replit `REPL_ID` is set so they still load; off Replit
  they never load. (cartographer/dev-banner are usually already gated this way;
  runtime-error-modal often is NOT — fix it too.)

**Why:** these two assumptions are the most common off-Replit build blockers;
defaulting + REPL_ID-gating fixes both with zero change to the Replit dev/preview
experience.

**How to apply:** any "prepare app to leave Replit" / portability task on a
Vite artifact. Verify with a standalone build:
`env -u PORT -u BASE_PATH -u REPL_ID NODE_ENV=production pnpm --filter <pkg> run build`.

**Related portability gotchas:**
- An `@assets` alias usually points at repo-root `attached_assets/` (outside the
  app dir). Extracting a single artifact breaks those imports — copy the files or
  relocate under `src/assets`.
- localStorage prototypes: introduce a versioned key (`<app>_data_v1`) with a
  one-time fallback read of the legacy unversioned key so existing browser data
  migrates forward without loss.
- Frontend-only apps sometimes carry an unused `@workspace/api-client-*`
  workspace dep — removing it (then `pnpm install`) cleans up phantom backend
  coupling.
