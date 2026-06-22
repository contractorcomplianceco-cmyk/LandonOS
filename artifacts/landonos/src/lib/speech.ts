// Robust Web Speech narration helper.
//
// Browsers (Chrome especially) have several well-known speechSynthesis pitfalls
// that cause "no audio at all":
//   1. Calling cancel() immediately before speak() can drop the utterance.
//   2. getVoices() is empty until the async `voiceschanged` event fires.
//   3. A single long utterance is silently truncated after ~15s.
// We sidestep all three by waiting for voices, then speaking one short
// sentence at a time through a cancellable chain.

let currentToken = 0;

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

export function isSpeechSupported(): boolean {
  return synth() !== null;
}

export function cancelSpeech(): void {
  const s = synth();
  if (!s) return;
  currentToken += 1; // invalidate any in-flight chain
  s.cancel();
}

function pickVoice(s: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const voices = s.getVoices();
  if (!voices.length) return undefined;
  return (
    voices.find((v) => /en[-_]US/i.test(v.lang) && /natural|google|narrat|aria|jenny/i.test(v.name)) ||
    voices.find((v) => /en[-_]US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0]
  );
}

function withVoices(s: SpeechSynthesis, run: () => void): void {
  if (s.getVoices().length) {
    run();
    return;
  }
  let done = false;
  const fire = () => {
    if (done) return;
    done = true;
    s.removeEventListener("voiceschanged", fire);
    run();
  };
  s.addEventListener("voiceschanged", fire);
  // Some browsers never fire voiceschanged — fall back after a short wait.
  window.setTimeout(fire, 350);
}

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*/g);
  const cleaned = (parts ?? [text]).map((p) => p.trim()).filter(Boolean);
  return cleaned.length ? cleaned : [text];
}

/**
 * Speak `text` aloud. Cancels any current narration first. `onEnd` runs when the
 * full text finishes (not when interrupted by a newer call or cancelSpeech).
 */
export function speakText(text: string, onEnd?: () => void): void {
  const s = synth();
  if (!s) return;

  currentToken += 1;
  const token = currentToken;
  s.cancel();

  const sentences = splitSentences(text);

  const speakFrom = (index: number) => {
    if (token !== currentToken) return; // superseded or cancelled
    if (index >= sentences.length) {
      onEnd?.();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    utterance.rate = 0.98;
    utterance.pitch = 1;
    const voice = pickVoice(s);
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (token === currentToken) speakFrom(index + 1);
    };
    utterance.onerror = () => {
      // Interruptions (cancel/new speak) bump the token, so the guard below
      // stops the chain. For a transient single-sentence error on the current
      // run, keep going so one bad sentence doesn't mute the whole step.
      if (token === currentToken) speakFrom(index + 1);
    };
    s.speak(utterance);
  };

  // A tiny delay after cancel() avoids the Chrome cancel/speak race.
  window.setTimeout(() => withVoices(s, () => speakFrom(0)), 60);
}
