---
name: DESIGN subagent build gotchas
description: Failure modes seen when delegating multi-file UI builds to parallel DESIGN subagents, and how to recover.
---

When fanning out a large build across parallel DESIGN subagents (each owning disjoint page files), two recurring failure modes:

1. **A subagent reports success but its files do not exist on disk.** One group's pages were simply missing despite a confident completion summary. Always list the expected files and run a typecheck after subagents finish; re-launch the group for any missing files.

2. **Stray backslash escapes in template literals.** Subagents sometimes emit `\`` (backslash + backtick) and `\${` inside `.ts/.tsx`, which TS reports as "Invalid character" / "Unterminated template literal". Fix in bulk: `perl -i -pe 's/\\\`/\`/g; s/\\\$\{/\${/g' <files>` then re-typecheck.

**Why:** These are silent — typecheck and a screenshot of each route are the only reliable verification. The orchestrating agent should wire routes itself and keep subagents off shared files (App.tsx, types, store, layout, index.css) to avoid collisions.

**How to apply:** After any parallel subagent build: (1) verify each promised file exists, (2) run the package typecheck, (3) screenshot key routes for runtime errors, (4) only then restart the workflow / present.
