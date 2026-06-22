---
name: Web Speech narration reliability
description: Why browser speechSynthesis produces "no audio at all" and how to make it reliable
---

# Web Speech (speechSynthesis) narration reliability

Browser `speechSynthesis` runs in the **end user's browser** (voices come from their
OS/browser, not the server), so it cannot be verified by Playwright/automated tests —
it makes no capturable sound in CI. Verify the invocation logic, not the audio.

Three pitfalls cause "narrator can't be heard at all", especially in Chrome:

1. **cancel() immediately before speak()** — a known race that silently drops the
   utterance. Add a small delay (~60ms) between `cancel()` and `speak()`.
2. **Voices load asynchronously** — `getVoices()` is empty until the `voiceschanged`
   event fires. Speaking before voices exist can no-op. Wait for `voiceschanged`
   (with a `setTimeout` fallback, since some browsers never fire it).
3. **Long single utterance is truncated** — Chrome silently cuts speech after ~15s.
   Split text into sentences and speak them one at a time through a cancellable chain
   (a module-level token, bumped on cancel/new-speak, guards the `onend` continuation).

**Why:** LandonOS guided tour (`src/lib/speech.ts`, used by `guided-tour.tsx`) had no
audio because it did `cancel()` then `speak()` on one long string with no voice wait.

**How to apply:** Prefer pre-generated TTS mp3 files (like the Welcome page) when the
media-generation TTS tool is available — most reliable. If TTS generation is blocked
(e.g. the media-generation voice/TTS tool returns `401 invalid_api_key`), fall back to
the robust Web Speech helper above, which actually plays.
