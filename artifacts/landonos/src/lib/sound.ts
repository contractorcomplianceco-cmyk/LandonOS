import { useEffect, useState } from "react";
import revUrl from "@/assets/v8-rev.mp3";

const STORAGE_KEY = "landonos_sound";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) !== "off";
}

const listeners = new Set<(enabled: boolean) => void>();

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  }
  listeners.forEach((fn) => fn(enabled));
}

// The real recording is a NASCAR startup + rev (~13s). We only want a punchy
// rev blip on a click, so the bundled `revUrl` asset is a pre-trimmed ~1.9s rev
// segment. We decode it once into an AudioBuffer and fire a fresh BufferSource
// per click so rapid clicks can overlap cleanly without restarting one another.
let revBuffer: AudioBuffer | null = null;
let decoding: Promise<AudioBuffer | null> | null = null;

function loadRevBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (revBuffer) return Promise.resolve(revBuffer);
  if (!decoding) {
    decoding = fetch(revUrl)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buf) => {
        revBuffer = buf;
        return buf;
      })
      .catch(() => {
        decoding = null; // allow a later retry
        return null;
      });
  }
  return decoding;
}

let lastRevAt = 0;

function startRev(ctx: AudioContext, buffer: AudioBuffer): void {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = 0.9;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
  src.onended = () => {
    try {
      src.disconnect();
      gain.disconnect();
    } catch {
      /* already torn down */
    }
  };
}

/**
 * Play the V8 stock-car rev on a click. Uses the real bundled engine recording
 * (the trimmed NASCAR rev at `src/assets/v8-rev.mp3`) rather than synthesis.
 * Frontend-only — the audio ships with the app, no backend or asset server.
 */
export function playRev(): void {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const tNow = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (tNow - lastRevAt < 90) return;
  lastRevAt = tNow;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  if (revBuffer) {
    startRev(ctx, revBuffer);
    return;
  }
  // first use(s): decode, then play once ready (only if it decodes promptly so a
  // long-past click doesn't fire a surprise rev)
  const requestedAt = tNow;
  loadRevBuffer(ctx).then((buf) => {
    if (!buf || !isSoundEnabled()) return;
    const elapsed = (typeof performance !== "undefined" ? performance.now() : Date.now()) - requestedAt;
    if (elapsed < 1500) startRev(ctx, buf);
  });
}

/** Warm the decode cache so the first click is instant. */
export function preloadRev(): void {
  const ctx = getCtx();
  if (ctx) loadRevBuffer(ctx);
}

export function useSoundEnabled(): boolean {
  const [enabled, setEnabled] = useState(isSoundEnabled);
  useEffect(() => {
    listeners.add(setEnabled);
    return () => {
      listeners.delete(setEnabled);
    };
  }, []);
  return enabled;
}
