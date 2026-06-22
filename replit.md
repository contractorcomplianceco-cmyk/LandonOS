# LandonOS: Performance Research Cockpit

A standalone, frontend-only web app: an AI-guided research training cockpit for "Landon" that teaches and structures responsible compliance/business research, with built-in human-review guardrails. All data lives in the browser (localStorage) and survives refresh — there is no backend.

Visual theme: a luxury fast-car cockpit — deep black/graphite foundation, carbon-fiber texture, performance-RED hero accent, chrome/silver borders, and circular gauge instruments. Module names use cockpit metaphors (see Product). The theme is token-driven (dark via `:root` tokens — there is NO `.dark` class toggled, so `dark:` variant classes do NOT apply; style the base classes instead).

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
- `src/components/stat-card.tsx` — shared `ACCENT` color map (red/blue/indigo/teal/sky/rose/emerald/slate — all static Tailwind class sets, dark-readable) + `StatCard` component; single source of truth for colored metric tiles across all pages. `red` is the hero/alert accent.
- `src/components/gauge.tsx` — luxury performance instrument gauge: layered SVG with a chrome bezel (linearGradient), graphite radial face, fine 40-tick ring (majors every 25%, reached ticks colored by tone), 270° track groove + tone progress arc (linearGradient) with a soft blurred glow + glowing white/accent tip, and a subtle glass sheen ellipse; the whole instrument has a drop-shadow for depth. Props: `value` 0-100, `label`, `sublabel`, `tone` red/steel/emerald/amber, `size` (default 148), `thickness`, `className`, `showValue`, `valueSuffix`. Center value is always high-contrast white (`text-slate-50`); tone shows in the arc, ticks, tip, and sublabel. Unique gradient/filter IDs via `useId()` (colons stripped) so multiple gauges on one page don't collide. The `amber` tone is a rose-red caution (still red-family, never orange) used for the Human Review Risk gauge. Used on: the Performance Cockpit dashboard instrument cluster (4 gauges: Source Quality, Report Readiness, Research Velocity, Human Review Risk), Garage Rewards (Level Progress), Driver Training (Training Progress), and Track Map (Research Progress).
- Shared page primitives (use these for every page — do not hand-roll hero banners, toolbars, empty states, or delete dialogs):
  - `src/components/page-header.tsx` — `PageHeader` hero banner (props: `icon?` (LucideIcon, optional), `eyebrow` (ReactNode — pass a string, or a node like the dashboard's live-status ping dot), `title`, `subtitle?`, `action?`, `stats?: {label,value,icon?}[]`, `statsClassName?`). Canonical page hero used by EVERY page's hero banner (do not hand-roll the gradient banner). For 3-KPI pages pass `statsClassName="grid grid-cols-3 gap-3 shrink-0"`, for 2-stat pages `statsClassName="grid grid-cols-2 gap-3 shrink-0"`, default is a responsive 2/4-col grid. Stat values render at `text-2xl font-bold`; wrap a small/text value in `<span className="text-sm">…</span>`. Exception: `employee-account.tsx` keeps a bespoke profile hero (avatar/initials slot PageHeader doesn't support).
  - `src/components/toolbar.tsx` — `Toolbar` search/filter row
  - `src/components/empty-state.tsx` — `EmptyState` zero-data placeholder
  - `src/components/confirm-delete-dialog.tsx` — `ConfirmDeleteDialog` guarded destructive-action confirm. Every list with a delete MUST guard it with this. Standard pattern: `deletingId`/`isDeleteDialogOpen` state + `requestDelete(id)` (opens dialog) + `handleConfirmDelete()` (calls the real `handleDelete(deletingId)`, closes dialog, resets state). Archive is a non-destructive status change and stays on the status Select, never on the trash icon.
- `src/hooks/use-store.tsx` — the localStorage store. `useStore()` → `{ data, updateData, resetData }`; storage key `landonos_data`
- `src/pages/welcome.tsx` (/welcome) — Welcome/Onboarding page; top sidebar item (above Command Center). Three ways to learn: (1) Narrated Video mode — per-section TTS narration + looping music bed, start/replay overlay, play/pause, mute, segmented progress driven by real playback time, auto-advance, complete state; (2) Guided Tour mode — same scenes, no audio, Back/Next + Restart; (3) downloadable PDF user guide. Single `stopAllAudio` helper (clears handlers, pauses, resets both `<audio>` refs) is called on unmount, on error, and on mode switch; all `play()` promises are `.catch`-guarded; `onended` auto-advance uses the invocation-local index (no stale state); a toast fires on narration load failure.
- `src/lib/onboarding.ts` — `ONBOARDING_SECTIONS` (7 featured areas: Command Center, Research Builder, Research GPS, Source Vault, Report Builder, RoseOS, Growth & Rewards), `ONBOARDING_MUSIC`, `USER_GUIDE_PDF`, and `onboardingAsset(name)` (resolves `${BASE_URL}onboarding/<file>`)
- `src/components/onboarding-scenes.tsx` — `OnboardingScene({ id })`: one keyed framer-motion scene per onboarding section (remounts/replays on every chapter/step/mode change). Tuned energetic: a snappy overshooting `pop` spring for entrances plus looping accent motion (pulsing kicker ring, bobbing tile icons, twinkling stars). The Welcome player backdrop adds a pulsing accent glow + drifting `PARTICLES` (static array in `welcome.tsx`); music bed plays low (volume 0.12) so the narrator stays clearly audible over it.
- `public/onboarding/` — generated assets served at `${BASE_URL}onboarding/`: `welcome-1..7.mp3` (TTS narration, Mack Narrator voice), `welcome-music.mp3` (upbeat/energetic instrumental bed), `landonos-user-guide.pdf`
- `src/lib/walkthrough.ts` — `TOUR_STEPS` (narrated guided-tour steps) + `PAGE_HELP` (per-route help prompt content), all titled with cockpit module names. `PageHelpContent` carries an optional `sections: PageHelpSection[]` (`{heading, detail}`) — 2-3 numbered guide steps per route, surfaced by the pop-up guide.
- `src/hooks/use-help.tsx` — `HelpProvider` + `useHelp()`; controls persistent help hints (storage key `landonos_help_hints`, default on), guided-tour state, walkthrough-video modal state (`videoOpen`/`openVideo`/`closeVideo`), and the contextual help-popup modal state (`guideOpen`/`openGuide`/`closeGuide`)
- `src/components/guided-tour.tsx` — narrated walkthrough overlay (Web Speech API via `src/lib/speech.ts`), launched from the topbar play button
- `src/lib/speech.ts` — robust Web Speech narration helper (`speakText`/`cancelSpeech`/`isSpeechSupported`). Waits for `voiceschanged` before speaking, delays ~60ms after `cancel()` to dodge the Chrome cancel/speak race, picks an en-US voice, and speaks one sentence at a time through a cancellable token chain so long narration isn't silently truncated (~15s Chrome cutoff). Used by the guided tour; `use-help.tsx` imports `cancelSpeech` for tour teardown.
- `src/components/help-popup.tsx` — contextual `HelpPopup` Dialog keyed by current route: shows that page's PAGE_HELP title, body, numbered `sections`, and tip, plus two actions ("Narrated walkthrough" → guided tour, "Watch the Hype Reel" → video). Opened by the topbar BookOpen button (`openGuide()`) and the "Open the full guide" link in `page-help.tsx`; rendered once in `layout.tsx`.
- `src/components/walkthrough-video.tsx` — full-screen cinematic "Hype Reel" video modal (framer-motion), on the luxury cockpit palette (graphite/black bg, performance-red radial-gradient + red particles + red crest glow — NO indigo/teal). 7 self-running animated scenes (intro, tagline, cockpit, plan, verify, level, outro; ~27s) on a `performance.now()` rAF timeline; the `cockpit` scene reuses `<Gauge>` (Source Quality/steel, Report Readiness/emerald, Research Velocity/red) and the chips use cockpit module names. `CountUp`, background music (`@assets/generated_audio/landonos_walkthrough_theme.mp3`), play/pause/mute/progress/replay controls, Escape + click-outside to close, dialog a11y semantics. Launched from the sidebar "Watch the Hype Reel" thumbnail card and the help popup (`openVideo()`). Separate from the narrated Web Speech tour.
- `src/components/page-help.tsx` — persistent on-screen help card, rendered once in the layout and keyed by current route; links to the full pop-up guide (`openGuide()`) and the narrated walkthrough
- `src/components/layout.tsx` — sidebar + responsive mobile drawer nav. `NAV_SECTIONS` groups routes under labeled headers (Overview, Research, Collaborate, Growth & Rewards, Workspace), rendered by `SidebarNav`; `SidebarNav` opens with a "Watch the Hype Reel" video thumbnail card (`openVideo()`); topbar play button (start narrated walkthrough) + help toggle + profile DropdownMenu (My Account, Employee Profile, My Benefits, Settings, Sign Out)
- `src/pages/bonus-tracker.tsx` (/bonus-tracker), `src/pages/team-lead-track.tsx` (/team-lead-track), `src/pages/leaderboard.tsx` (/leaderboard) — Growth & Rewards pages; mock data, no store mutations (leaderboard reads `rewardState.points` for the current user only)
- `src/pages/account.tsx` (/account), `src/pages/employee-account.tsx` (/employee-account), `src/pages/benefits.tsx` (/benefits) — personal pages reached only from the profile dropdown (not in the sidebar nav); realistic mock data, no store mutations
- `src/App.tsx` — route wiring; `src/pages/*` — one file per module

## Generators (not shipped in the app)

- `pnpm --filter @workspace/scripts run guide:landonos` — regenerates `artifacts/landonos/public/onboarding/landonos-user-guide.pdf` from `scripts/src/generate-user-guide.ts` (pdfkit; branded cover + one page per section + page-number footers). `pdfkit`/`@types/pdfkit` live in `@workspace/scripts` devDeps only — never add them to the landonos runtime.
- Onboarding audio (`public/onboarding/welcome-*.mp3`) was produced with the media-generation TTS/music tools; re-run those tools if narration copy in `src/lib/onboarding.ts` changes (keep the clip text in sync with `narration`).

## Architecture decisions

- Frontend-only by design: no OpenAPI/codegen/DB. All mutations go through `updateData((prev) => next)` with immutable updates.
- "AI" features (prompt coach, RoseOS chat, guided-builder generation) are template-based transformations, not live model calls.
- Reward points are awarded symmetrically (completing a lesson adds points; reopening it removes them) so the toggle can't be farmed.
- Settings import validates the full `AppData` shape before replacing the store.

## Product

17 modules, grouped in the sidebar under labeled sections (Overview, Research, Collaborate, Growth & Rewards, Workspace). The cockpit display name is shown first, with the underlying module/route in parentheses (only display labels changed in the facelift — routes are unchanged): Performance Cockpit (Command Center dashboard, `/`), Research Engine (Guided Research Builder), Tuning Bay (AI Prompt Coach), Track Map (Research GPS 10-step workflow), Brief Builder (Report Builder — readiness score + warnings), Source Garage (Source Vault — official/AI-draft/unknown flagging), Pit Stop (Blocked/Need Help), RoseOS Co-Driver (RoseOS Chat mentor), Finish Line Handoff (Completed Handoff), Idea Garage (Brainstorming Studio), Garage Rewards (Reward Center), Driver Training (Training Academy), Bonus Tracker (incentive earnings — informational, managed by Finance/Payroll), Team Lead Track (leadership competency progression toward promotion, manager sign-off), Leaderboard (gamified team standings), Company Brain Sync (RoseOS company brain — record-query chat + reviewed update suggestions; route `/company-brain`), and Settings. Plus three personal pages reachable only from the header profile dropdown (not the sidebar): My Account (`/account` — sign-in/security, preferences, notifications), Employee Profile (`/employee-account` — read-only employment record; compensation/payroll/tax gated to HR/Payroll), My Benefits (`/benefits` — time-off, insurance, retirement/perks; changes managed by HR/Payroll). Compliance guardrail throughout: AI output is draft only until source-checked and human-reviewed; company decisions are never auto-recorded.

## User preferences

- Visual identity: luxury fast-car cockpit — deep black/graphite foundation, carbon-fiber texture, performance-RED hero/primary/alert accent, chrome/silver-steel borders, circular gauge instruments, executive typography, subtle shadows, professional status badges. Palette mapping: RED = hero/primary/alert; sky = steel/info; slate = silver/neutral; emerald = ok.
- Avoid: purple/violet/fuchsia, yellow/amber/orange/gold branding, beige/tan/brown palettes, decorative blobs, childish/cartoon racing visuals, emojis, red backgrounds behind long body text, low-contrast text on dark surfaces, clutter, lorem ipsum.

## Gotchas

- Always run `pnpm --filter @workspace/landonos run typecheck` after edits; do not run `pnpm dev` at the repo root.
- The shadcn `Progress` component accepts only `value`/`className` (no `indicatorClassName`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure and conventions
