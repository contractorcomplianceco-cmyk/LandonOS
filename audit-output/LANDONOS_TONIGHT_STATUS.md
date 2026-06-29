# LandonOS — Tonight Status Note

**Date:** 2026-06-29 UTC  
**Audience:** Rose, Carmen, Landon  
**Server:** Command Center `3.129.68.79` (`i-02bba85de3f0a433f`, us-east-2b)

---

## Production snapshot

| Item | Status |
|------|--------|
| **Live URL** | https://landon.cagteam.net |
| **Hosting** | Command Center (permanent internal app home) |
| **DNS** | Cutover **complete** — `landon.cagteam.net` → `3.129.68.79` |
| **HTTPS** | **Complete** (TLS active) |
| **API** | PM2 `landonos-api` on port **8084** — online |
| **Health** | `GET /api/healthz` → `{"status":"ok","database":"connected"}` |
| **Rose Review Mode** | Active through **2026-07-04T12:00:00Z** — no login wall |
| **Workspace sync** | Review session bootstrap + GET/PUT `/api/workspace` working |
| **Secure cookies** | **Confirmed** — `HttpOnly; Secure; SameSite=Lax` on `landonos_session` and `landonos_workspace` (`COOKIE_SECURE=true` in PM2) |
| **Command Center registry** | `landon-os` wired in internal app registry, department center, Landon staff cockpit, demo guide |
| **Staging rollback** | Old standalone host **`3.138.233.148` retained** — **do not delete or terminate yet** |

### Key paths (Command Center)

| Resource | Path |
|----------|------|
| App source | `/home/ubuntu/projects/landonos` |
| SPA (nginx) | `/var/www/landonos` |
| PM2 config | `/home/ubuntu/projects/landonos/ecosystem.landonos.config.cjs` |
| nginx vhost | `/etc/nginx/sites-available/landon.cagteam.net` |
| Postgres DB | `landonos` (native PostgreSQL 16) |
| Migration backup | `/home/ubuntu/backups/landonos-migration-20260628/` |

---

## Fully working tonight

- **Public access** — HTTPS at `https://landon.cagteam.net`; DNS points to Command Center
- **SPA** — All main routes load (dashboard, research tools, settings, etc.)
- **API health** — Database connected
- **Rose Review access** — No nginx Basic Auth, no email/password gate during review window; review session auto-bootstraps for live sync
- **Live workspace persistence** — Create/edit research data; debounced save to Postgres; sync chip shows Live workspace
- **Secure sessions** — Cookies set correctly over HTTPS
- **Command Center navigation** — LandonOS listed as **Performance Research Cockpit**; open link from registry and Landon staff workspace
- **Research workflow data** — Requests, sources, reports, handoffs, blockers, ideas, brain suggestions, announcements (workspace-local) CRUD in live mode
- **Training / rewards (local)** — Lesson completion and point tracking within workspace
- **Honest UI labels** — Template/simulated features marked with scope notices (not live AI, not official Company Brain, etc.)

---

## Simulated, template, or manual (not production integrations)

| Feature | Reality tonight |
|---------|-----------------|
| **RoseOS Co-Driver** | Local **template** responses — not live AI unless separately approved |
| **Prompt Coach / Research Engine generators** | **Template** string generators |
| **Company Brain Sync** | **Suggestions only** in workspace — does not write official Company Brain records |
| **Company Brain chat (Ask RoseOS)** | **Keyword search** over local suggestions — not an LLM |
| **Source Garage** | **Manual** source tracking — no automated URL/registry verification |
| **Leaderboard** | **Sample names** + your points from workspace — not company-wide shared standings |
| **Garage Rewards / announcements** | **Workspace-local** blob — not backed by shared company tables yet |
| **Bonus Tracker / Benefits / Employee Profile / Team Lead Track** | **HR preview** layouts with sample data |
| **Zoho** | Not wired |
| **OpenAI** | `VITE_OPENAI_API_KEY` not used for live calls |

---

## What Rose should review tomorrow

1. **Open from Command Center** — Internal Tools / Landon staff workspace → **LandonOS — Performance Research Cockpit**
2. **Rose Review banner** — Confirm temporary access messaging and expiry date are acceptable
3. **Core research path** — Welcome → Performance Cockpit → Research Engine → Source Garage → Brief Builder → Finish Line Handoff
4. **Live sync** — Make a small edit, refresh browser, confirm data persists (sync chip shows **Live**)
5. **Template honesty** — RoseOS Co-Driver and Prompt Coach show **template mode** notices; confirm messaging is clear enough for staff
6. **Company Brain** — Confirm “suggestions only” guardrails are visible; nothing should imply auto-recording to official brain
7. **Source Garage** — Confirm “manual tracking, not automated verification” is understood
8. **Race Control (announcements)** — Editor mode is a workspace toggle (no passcode); confirm publishing behavior is acceptable for review
9. **What not to demo as real** — Leaderboard standings, HR/benefits screens, bonus tracker
10. **Command Center registry entry** — Verify app name, URL, owners, and risk/rollback notes read correctly

---

## Before retiring staging (`3.138.233.148`)

**Do not stop or terminate the old instance until all gates pass.**

1. **Verification window** — DNS on Command Center stable for agreed period (recommend ≥7 days) with no Sev-1/Sev-2 LandonOS incidents
2. **Workflow sign-off** — Rose + Landon accept Command Center as sole production home
3. **Backups** — Fresh Postgres dump on Command Center; staging migration bundle preserved off-instance
4. **Rollback plan acknowledged** — Fast rollback = revert DNS to `3.138.233.148` only while staging instance/EBS still exists
5. **SSH cleanup** — Remove temporary migration SG rule (`22` from `3.129.68.79/32`) and migration pubkey from staging `authorized_keys`
6. **Optional snapshot** — AMI or EBS snapshot of staging before stop
7. **Stop first** — Instance **stop** (not terminate); cool-down ≥14 days recommended
8. **Terminate last** — Only after **written Rose + Carmen approval**

Full checklist: `audit-output/STAGING_RETIREMENT_CHECKLIST.md`

---

## After Rose review window (2026-07-04)

Planned follow-ups (not blocking tonight):

- Transition from Rose Review Mode to **Command Center as access layer** (remove temporary review bypass)
- Set `COOKIE_SECURE` / session policy per permanent auth design
- certbot/TLS already in place — no action needed unless cert renewal
- Decide timeline for staging retirement per checklist above

---

## Rollback (if needed)

1. Revert `landon.cagteam.net` A record to **`3.138.233.148`**
2. Wait for DNS propagation
3. Staging serves last known stack until Command Center issue is resolved

**Staging must remain available until retirement gates pass.**

---

*No infrastructure changes were made while authoring this note.*
