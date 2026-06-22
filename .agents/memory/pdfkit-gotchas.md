---
name: pdfkit generation gotchas
description: Two pdfkit traps that produce broken covers and trailing blank pages
---

# pdfkit (PDF generation) gotchas

## Trailing blank pages from footers
Drawing footer text in the footer zone (e.g. `height - 40`) places it **below** the
page's bottom margin. pdfkit treats writing past the bottom margin as overflow and
**auto-inserts a fresh page** — once per page you footer, so an N-page doc balloons to
~2N pages with N trailing blanks.

**Fix:** in the footer loop, save and zero the bottom margin around the draw:
`const saved = doc.page.margins.bottom; doc.page.margins.bottom = 0; /* draw */; doc.page.margins.bottom = saved;`
(Do it per page after `switchToPage(i)`, since `doc.page` changes.)

**How to verify:** check `pdfinfo file.pdf | grep Pages` equals expected; tiny (~2KB)
rendered pages from `pdftoppm` are blanks.

## Cover dividers crossing the title
A fixed-fraction Y (e.g. `height * 0.34`) for an accent rule will cut through a large
title once the title wraps to 2 lines. Don't hard-code the divider Y under a wrapping
heading.

**Fix:** flow the cover with a measured cursor — after each `.text()` read `doc.y` and
place the next element (and the divider) relative to it, so the rule is always below the
title regardless of how many lines it wraps to.

**How to apply:** these bit the LandonOS user-guide generator
(`scripts/src/generate-user-guide.ts`). Render pages with `pdftoppm -png` and eyeball
the cover + count pages after any change to that script.
