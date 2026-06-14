# LandonOS Research Command Center

A standalone, frontend-only web app: an AI-guided research training cockpit for "Landon" that teaches and structures responsible compliance/business research, with built-in human-review guardrails. All data lives in the browser (localStorage) and survives refresh — there is no backend.

## Run & Operate

- `pnpm --filter @workspace/landonos run dev` — run the app (port provided by workflow)
- `pnpm --filter @workspace/landonos run typecheck` — typecheck the app
- The app runs via the `artifacts/landonos: web` workflow; restart it to apply config changes
- No backend, no database, no env vars required

## Stack

- React + Vite + TypeScript (artifact at `artifacts/landonos`)
- Routing: wouter (base = `import.meta.env.BASE_URL`)
- UI: shadcn/ui (`src/components/ui`), lucide-react icons, sonner/radix toasts
- State: React context over `localStorage` (no server, no API hooks, no codegen)

## Where things live

- `src/lib/types.ts` — the full data model (source of truth for all entities)
- `src/lib/default-data.ts` — seeded sample data + exported constants (`RESEARCH_TYPES`, `SOURCE_TYPES`, `GPS_STEPS`)
- `src/lib/rewards.ts` — level thresholds + progress helpers (`LEVELS`, `levelForPoints`, `levelProgress`)
- `src/components/stat-card.tsx` — shared `ACCENT` color map (blue/indigo/teal/sky/rose/emerald/slate — all static Tailwind class sets) + `StatCard` component; single source of truth for colored metric tiles across all pages
- `src/hooks/use-store.tsx` — the localStorage store. `useStore()` → `{ data, updateData, resetData }`; storage key `landonos_data`
- `src/lib/walkthrough.ts` — `TOUR_STEPS` (narrated guided-tour steps) + `PAGE_HELP` (per-route help prompt content)
- `src/hooks/use-help.tsx` — `HelpProvider` + `useHelp()`; controls persistent help hints (storage key `landonos_help_hints`, default on) and guided-tour state
- `src/components/guided-tour.tsx` — narrated walkthrough overlay (Web Speech API), launched from the topbar play button
- `src/components/page-help.tsx` — persistent on-screen help card, rendered once in the layout and keyed by current route
- `src/components/layout.tsx` — sidebar + responsive mobile drawer nav. `NAV_SECTIONS` groups routes under labeled headers (Overview, Research, Collaborate, Growth & Rewards, Workspace), rendered by `SidebarNav`; topbar play button (start walkthrough) + help toggle + profile DropdownMenu (My Account, Employee Profile, My Benefits, Settings, Sign Out)
- `src/pages/bonus-tracker.tsx` (/bonus-tracker), `src/pages/team-lead-track.tsx` (/team-lead-track), `src/pages/leaderboard.tsx` (/leaderboard) — Growth & Rewards pages; mock data, no store mutations (leaderboard reads `rewardState.points` for the current user only)
- `src/pages/account.tsx` (/account), `src/pages/employee-account.tsx` (/employee-account), `src/pages/benefits.tsx` (/benefits) — personal pages reached only from the profile dropdown (not in the sidebar nav); realistic mock data, no store mutations
- `src/App.tsx` — route wiring; `src/pages/*` — one file per module

## Architecture decisions

- Frontend-only by design: no OpenAPI/codegen/DB. All mutations go through `updateData((prev) => next)` with immutable updates.
- "AI" features (prompt coach, RoseOS chat, guided-builder generation) are template-based transformations, not live model calls.
- Reward points are awarded symmetrically (completing a lesson adds points; reopening it removes them) so the toggle can't be farmed.
- Settings import validates the full `AppData` shape before replacing the store.

## Product

17 modules, grouped in the sidebar under labeled sections (Overview, Research, Collaborate, Growth & Rewards, Workspace): Command Center dashboard, Guided Research Builder, AI Prompt Coach, Research GPS (10-step workflow), Report Builder (readiness score + warnings), Source Vault (official/AI-draft/unknown flagging), Blocked/Need Help, RoseOS Chat (mentor), Completed Handoff, Brainstorming Studio, Reward Center, Training Academy, Bonus Tracker (incentive earnings — informational, managed by Finance/Payroll), Team Lead Track (leadership competency progression toward promotion, manager sign-off), Leaderboard (gamified team standings), RoseOS (the company brain — record-query chat + reviewed update suggestions; route `/company-brain`), and Settings. Plus three personal pages reachable only from the header profile dropdown (not the sidebar): My Account (`/account` — sign-in/security, preferences, notifications), Employee Profile (`/employee-account` — read-only employment record; compensation/payroll/tax gated to HR/Payroll), My Benefits (`/benefits` — time-off, insurance, retirement/perks; changes managed by HR/Payroll). Compliance guardrail throughout: AI output is draft only until source-checked and human-reviewed; company decisions are never auto-recorded.

## User preferences

- Visual identity: dark navy/rich blue foundation, white work surfaces, silver/steel borders, electric blue primary actions, executive typography, subtle shadows, professional status badges.
- Avoid: yellow/beige/tan/brown/orange palettes, purple SaaS gradients, decorative blobs, student visuals, clutter, lorem ipsum, emojis.

## Gotchas

- Always run `pnpm --filter @workspace/landonos run typecheck` after edits; do not run `pnpm dev` at the repo root.
- The shadcn `Progress` component accepts only `value`/`className` (no `indicatorClassName`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure and conventions
