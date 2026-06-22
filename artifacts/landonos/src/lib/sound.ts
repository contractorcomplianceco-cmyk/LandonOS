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

let noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    const len = Math.floor(ctx.sampleRate * 1.2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
  }
  return noiseBuffer;
}

let distortionCurve: Float32Array<ArrayBuffer> | null = null;
function getDistortionCurve(): Float32Array<ArrayBuffer> {
  if (!distortionCurve) {
    const n = 1024;
    const curve = new Float32Array(new ArrayBuffer(n * 4));
    const k = 8;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = Math.tanh(k * x);
    }
    distortionCurve = curve;
  }
  return distortionCurve;
}

/**
 * Synthesize a short V8 stock-car throttle blip with the Web Audio API.
 * No audio asset required — keeps the app fully frontend-only.
 *
 * The note tracks the engine FIRING frequency (a V8 fires 4 times per crank
 * revolution) as RPM stabs up then falls back. Three ingredients give it the
 * V8 character a plain oscillator lacks: (1) sawtooth oscillators + a sub
 * octave run through a tanh WaveShaper for raspy exhaust grit, (2) a white-
 * noise roar amplitude-modulated by a pulse at the firing rate so you hear the
 * lumpy "blat-blat-blat" of the exhaust, and (3) a lowpass that opens as the
 * revs climb. Two engine voices are detuned for the cross-plane V8 lope.
 */
let lastRevAt = 0;

export function playRev(): void {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const tNow = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (tNow - lastRevAt < 90) return;
  lastRevAt = tNow;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const stab = now + 0.2; // throttle stabs up
  const end = now + 0.95; // settles back to idle

  // firing frequency = engine note: idle -> peak rev -> drop back toward idle
  const fIdle = 72;
  const fPeak = 300;
  const fSettle = 118;
  const setSweep = (p: AudioParam, mult: number) => {
    p.setValueAtTime(fIdle * mult, now);
    p.exponentialRampToValueAtTime(fPeak * mult, stab);
    p.exponentialRampToValueAtTime(fSettle * mult, end);
  };

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(0.26, now + 0.04);
  master.gain.linearRampToValueAtTime(0.2, stab);
  master.gain.exponentialRampToValueAtTime(0.0001, end);
  master.connect(ctx.destination);

  // raspy exhaust grit
  const shaper = ctx.createWaveShaper();
  shaper.curve = getDistortionCurve();
  shaper.oversample = "4x";

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 1.4;
  lp.frequency.setValueAtTime(520, now);
  lp.frequency.exponentialRampToValueAtTime(4600, stab);
  lp.frequency.exponentialRampToValueAtTime(1100, end);
  lp.connect(shaper);
  shaper.connect(master);

  const oscs: OscillatorNode[] = [];
  const addOsc = (type: OscillatorType, mult: number, detune: number, gain: number) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.detune.value = detune;
    setSweep(osc.frequency, mult);
    const g = ctx.createGain();
    g.gain.value = gain;
    osc.connect(g);
    g.connect(lp);
    osc.start(now);
    osc.stop(end + 0.04);
    oscs.push(osc);
  };

  // two engine voices, detuned for the cross-plane V8 lope, + a sub octave thump
  addOsc("sawtooth", 1, -8, 0.5);
  addOsc("sawtooth", 1, 11, 0.45);
  addOsc("triangle", 0.5, 0, 0.6);

  // exhaust roar: white noise gated by a pulse at the firing rate ("blat-blat")
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  noise.loop = true;

  const noiseBand = ctx.createBiquadFilter();
  noiseBand.type = "bandpass";
  noiseBand.Q.value = 0.8;
  noiseBand.frequency.setValueAtTime(700, now);
  noiseBand.frequency.exponentialRampToValueAtTime(2600, stab);
  noiseBand.frequency.exponentialRampToValueAtTime(900, end);

  const noiseGate = ctx.createGain();
  noiseGate.gain.value = 0.16;

  const amOsc = ctx.createOscillator();
  amOsc.type = "sawtooth";
  setSweep(amOsc.frequency, 1);
  const amDepth = ctx.createGain();
  amDepth.gain.value = 0.14;
  amOsc.connect(amDepth);
  amDepth.connect(noiseGate.gain); // modulate the roar at the firing rate

  noise.connect(noiseBand);
  noiseBand.connect(noiseGate);
  noiseGate.connect(lp);

  noise.start(now);
  noise.stop(end + 0.04);
  amOsc.start(now);
  amOsc.stop(end + 0.04);
  oscs.push(amOsc);

  window.setTimeout(() => {
    try {
      master.disconnect();
      shaper.disconnect();
      lp.disconnect();
      noiseBand.disconnect();
      noiseGate.disconnect();
      amDepth.disconnect();
      noise.disconnect();
      oscs.forEach((o) => o.disconnect());
    } catch {
      /* nodes already torn down */
    }
  }, 1200);
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
