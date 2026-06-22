import { useEffect, useState } from "react";

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

/**
 * Synthesize a short sports-car throttle blip with the Web Audio API.
 * No audio asset required — keeps the app fully frontend-only.
 */
let lastRevAt = 0;

export function playRev(): void {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const tNow = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (tNow - lastRevAt < 70) return;
  lastRevAt = tNow;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const end = now + 0.7;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(0.22, now + 0.05);
  master.gain.linearRampToValueAtTime(0.17, now + 0.22);
  master.gain.exponentialRampToValueAtTime(0.0001, end);
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 6;
  filter.frequency.setValueAtTime(360, now);
  filter.frequency.exponentialRampToValueAtTime(2200, now + 0.16);
  filter.frequency.exponentialRampToValueAtTime(680, end);
  filter.connect(master);

  const oscs: OscillatorNode[] = [];
  const addOsc = (type: OscillatorType, mult: number, detune: number) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(65 * mult, now);
    osc.frequency.exponentialRampToValueAtTime(255 * mult, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(95 * mult, end);
    osc.connect(filter);
    osc.start(now);
    osc.stop(end + 0.02);
    oscs.push(osc);
  };

  addOsc("sawtooth", 1, 0);
  addOsc("sawtooth", 1, 14);
  addOsc("square", 0.5, -7);

  window.setTimeout(() => {
    try {
      master.disconnect();
      filter.disconnect();
      oscs.forEach((o) => o.disconnect());
    } catch {
      /* nodes already torn down */
    }
  }, 900);
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
