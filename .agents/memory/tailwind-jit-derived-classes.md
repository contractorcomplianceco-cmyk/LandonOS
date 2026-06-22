---
name: Tailwind JIT derived classes
description: Why string-deriving Tailwind class names (e.g. .replace) breaks styling, and the static-map fix
---

# Tailwind JIT only sees class strings that appear literally in source

Do NOT build Tailwind class names at runtime by transforming another string,
e.g. `accent.borderT.replace("border-t-", "border-l-")`. The result is a valid
class string at runtime (`border-l-red-500`) but Tailwind's JIT scans source
files statically — it never emits CSS for a class name that does not appear
verbatim somewhere — so the style silently disappears in production builds.

**Why:** type/typecheck passes and dev may even look fine if the class happens to
exist elsewhere, so this slips through review. A code review caught it.

**How to apply:** add every variant you need as a complete static literal. In
LandonOS the `ACCENT` map in `src/components/stat-card.tsx` carries paired fields
(`borderT` + `borderL`, etc.); pick the field you need instead of string-munging
one into another.
