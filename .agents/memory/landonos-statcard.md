---
name: LandonOS StatCard value sizing
description: Constraint on what to pass as StatCard `value` so it doesn't collide with the icon
---

# StatCard value must stay short

`StatCard` (artifacts/landonos/src/components/stat-card.tsx) renders `value` at `text-4xl` in a flex row beside a fixed 48px icon tile. Long word-values (e.g. "Candidate") overflow and visually collide with the icon.

**Rule:** pass short/numeric values — counts, percentages, currency, short labels like "3 of 4", "Q4 2026". Put any longer descriptor in `hint`.

**Why:** the value column has no truncation for oversized single words; a 9+ char word at text-4xl overruns the icon.

**How to apply:** when adding StatCards, keep `value` to ~6 chars; move detail to `hint`.
