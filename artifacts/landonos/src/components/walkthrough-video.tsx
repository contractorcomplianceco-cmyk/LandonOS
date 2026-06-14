import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  RotateCcw,
  Sparkles,
  Target,
  Compass,
  ShieldCheck,
  FileCheck2,
  Trophy,
  Wallet,
  Rocket,
  Award,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useHelp } from "@/hooks/use-help";
import themeUrl from "@assets/generated_audio/landonos_walkthrough_theme.mp3";
import ccaCrest from "@assets/cca-crest-inset_1781446966845.png";

interface Scene {
  id: string;
  duration: number;
}

const SCENES: Scene[] = [
  { id: "intro", duration: 4200 },
  { id: "tagline", duration: 3600 },
  { id: "plan", duration: 4400 },
  { id: "verify", duration: 4400 },
  { id: "level", duration: 4800 },
  { id: "outro", duration: 4400 },
];

const TOTAL = SCENES.reduce((s, sc) => s + sc.duration, 0);

const spring = { type: "spring" as const, stiffness: 220, damping: 18 };

function CountUp({ to, suffix = "", active }: { to: number; suffix?: string; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) {
      setN(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, active]);
  return (
    <span className="tabular-nums">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

function FeatureChip({ icon: Icon, label, color, delay }: { icon: LucideIcon; label: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay }}
      className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur"
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </span>
      <span className="whitespace-nowrap text-sm font-semibold text-white md:text-base">{label}</span>
    </motion.div>
  );
}

function SceneShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
    >
      {children}
    </motion.div>
  );
}

function Word({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 40, rotateX: -60 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ ...spring, delay }}
      className="inline-block"
    >
      {children}
    </motion.span>
  );
}

function renderScene(id: string) {
  switch (id) {
    case "intro":
      return (
        <SceneShell>
          <motion.img
            src={ccaCrest}
            alt="CCA crest"
            initial={{ opacity: 0, scale: 0.3, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="mb-6 h-24 w-24 object-contain drop-shadow-[0_8px_24px_rgba(56,189,248,0.5)] md:h-28 md:w-28"
          />
          <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
            <Word delay={0.25}>Landon</Word>
            <Word delay={0.38}>
              <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">OS</span>
            </Word>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-3 text-lg font-medium uppercase tracking-[0.3em] text-blue-200/80 md:text-xl"
          >
            Research Command Center
          </motion.p>
        </SceneShell>
      );
    case "tagline":
      return (
        <SceneShell>
          <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
            <Word delay={0.05}>AI&nbsp;speed.</Word>{" "}
            <Word delay={0.2}>
              <span className="bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">Human&nbsp;trust.</span>
            </Word>{" "}
            <Word delay={0.38}>Always.</Word>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-5 max-w-2xl text-base text-blue-100/80 md:text-xl"
          >
            Every insight is source-checked and human-reviewed before it counts.
          </motion.p>
        </SceneShell>
      );
    case "plan":
      return (
        <SceneShell>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="mb-7 text-3xl font-black tracking-tight text-white md:text-5xl"
          >
            Plan research <span className="text-sky-300">smarter</span>
          </motion.div>
          <div className="flex max-w-3xl flex-wrap items-center justify-center gap-3">
            <FeatureChip icon={Target} label="Guided Builder" color="bg-blue-500" delay={0.15} />
            <FeatureChip icon={Sparkles} label="AI Prompt Coach" color="bg-indigo-500" delay={0.3} />
            <FeatureChip icon={Compass} label="Research GPS" color="bg-sky-500" delay={0.45} />
          </div>
        </SceneShell>
      );
    case "verify":
      return (
        <SceneShell>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="mb-7 text-3xl font-black tracking-tight text-white md:text-5xl"
          >
            Verify <span className="text-emerald-300">everything</span>
          </motion.div>
          <div className="flex max-w-3xl flex-wrap items-center justify-center gap-3">
            <FeatureChip icon={ShieldCheck} label="Source Vault" color="bg-teal-500" delay={0.15} />
            <FeatureChip icon={FileCheck2} label="Report Readiness" color="bg-emerald-500" delay={0.3} />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-200"
          >
            <ShieldCheck className="h-4 w-4" /> Draft until reviewed — no auto-decisions
          </motion.div>
        </SceneShell>
      );
    case "level":
      return (
        <SceneShell>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="mb-2 text-3xl font-black tracking-tight text-white md:text-5xl"
          >
            Level up your <span className="text-sky-300">career</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 text-5xl font-black text-white md:text-7xl"
          >
            <span className="bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent">
              <CountUp to={1250} active suffix=" pts" />
            </span>
          </motion.div>
          <div className="flex max-w-3xl flex-wrap items-center justify-center gap-3">
            <FeatureChip icon={Award} label="Rewards" color="bg-blue-500" delay={0.2} />
            <FeatureChip icon={Wallet} label="Bonus Tracker" color="bg-sky-500" delay={0.35} />
            <FeatureChip icon={Rocket} label="Team Lead Track" color="bg-indigo-500" delay={0.5} />
            <FeatureChip icon={Trophy} label="Leaderboard" color="bg-teal-500" delay={0.65} />
          </div>
        </SceneShell>
      );
    case "outro":
      return (
        <SceneShell>
          <motion.img
            src={ccaCrest}
            alt="CCA crest"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="mb-5 h-16 w-16 object-contain drop-shadow-[0_8px_24px_rgba(56,189,248,0.5)]"
          />
          <h2 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            <Word delay={0.15}>Let's</Word> <Word delay={0.28}>get</Word>{" "}
            <Word delay={0.41}>
              <span className="bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">to work.</span>
            </Word>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-lg text-blue-100/80"
          >
            Your research command center is ready, Landon.
          </motion.p>
        </SceneShell>
      );
    default:
      return null;
  }
}

export function WalkthroughVideo() {
  const { videoOpen, closeVideo } = useHelp();
  return <WalkthroughVideoInner open={videoOpen} onClose={closeVideo} />;
}

function WalkthroughVideoInner({ open, onClose }: { open: boolean; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);

  const sceneIndex = (() => {
    let acc = 0;
    for (let i = 0; i < SCENES.length; i++) {
      acc += SCENES[i].duration;
      if (elapsed < acc) return i;
    }
    return SCENES.length - 1;
  })();

  const loop = (now: number) => {
    const e = pausedAtRef.current + (now - startRef.current);
    if (e >= TOTAL) {
      setElapsed(TOTAL);
      setPlaying(false);
      setEnded(true);
      if (audioRef.current) audioRef.current.pause();
      return;
    }
    setElapsed(e);
    rafRef.current = requestAnimationFrame(loop);
  };

  const begin = (fromStart: boolean) => {
    // Guard against concurrent loops: cancel any in-flight frame first.
    cancelAnimationFrame(rafRef.current);
    if (fromStart) {
      pausedAtRef.current = 0;
      setElapsed(0);
      setEnded(false);
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
    startRef.current = performance.now();
    setPlaying(true);
    if (audioRef.current) {
      audioRef.current.muted = muted;
      void audioRef.current.play().catch(() => {});
    }
    rafRef.current = requestAnimationFrame(loop);
  };

  const pause = () => {
    pausedAtRef.current = elapsed;
    setPlaying(false);
    cancelAnimationFrame(rafRef.current);
    if (audioRef.current) audioRef.current.pause();
  };

  // Start / stop with the modal lifecycle.
  useEffect(() => {
    if (open) {
      begin(true);
    } else {
      cancelAnimationFrame(rafRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlaying(false);
      setEnded(false);
      setElapsed(0);
      pausedAtRef.current = 0;
    }
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape to close + move focus into the dialog when it opens.
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const focusId = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusId);
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  const togglePlay = () => {
    if (ended) {
      begin(true);
      return;
    }
    if (playing) pause();
    else begin(false);
  };

  const progress = Math.min(100, (elapsed / TOTAL) * 100);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <audio ref={audioRef} src={themeUrl} preload="auto" />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="LandonOS walkthrough video"
            className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
            <motion.div
              aria-hidden
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 25%, rgba(56,189,248,0.35), transparent 45%)",
                  "radial-gradient(circle at 80% 70%, rgba(99,102,241,0.4), transparent 45%)",
                  "radial-gradient(circle at 30% 80%, rgba(45,212,191,0.3), transparent 45%)",
                  "radial-gradient(circle at 20% 25%, rgba(56,189,248,0.35), transparent 45%)",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            {/* Floating particles */}
            {PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute rounded-full bg-sky-300/30"
                style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
                animate={{ y: [0, -28, 0], opacity: [0.15, 0.6, 0.15] }}
                transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
              />
            ))}

            {/* Scenes */}
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <React.Fragment key={SCENES[sceneIndex].id}>
                  {renderScene(SCENES[sceneIndex].id)}
                </React.Fragment>
              </AnimatePresence>
            </div>

            {/* Ended overlay */}
            <AnimatePresence>
              {ended && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-950/70 backdrop-blur-sm"
                >
                  <button
                    onClick={() => begin(true)}
                    className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
                  >
                    <RotateCcw className="h-4 w-4" /> Replay
                  </button>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
                  >
                    Enter LandonOS <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-3">
              <div className="rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
                Walkthrough
              </div>
              <button
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Close walkthrough"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur transition-colors hover:bg-black/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Controls */}
            <div className="absolute inset-x-0 bottom-0 z-30 p-3">
              <div
                className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  aria-label={playing ? "Pause" : "Play"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  {ended ? (
                    <RotateCcw className="h-4 w-4" />
                  ) : playing ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 translate-x-[1px] fill-white" />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <div className="ml-auto rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white/80 backdrop-blur">
                  {fmtTime(elapsed)} / {fmtTime(TOTAL)}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

const PARTICLES = [
  { left: "12%", top: "30%", size: 6, dur: 5, delay: 0 },
  { left: "85%", top: "20%", size: 8, dur: 6, delay: 0.6 },
  { left: "70%", top: "75%", size: 5, dur: 4.5, delay: 1.1 },
  { left: "25%", top: "78%", size: 7, dur: 5.5, delay: 0.3 },
  { left: "50%", top: "15%", size: 4, dur: 4, delay: 0.9 },
  { left: "90%", top: "55%", size: 6, dur: 6.5, delay: 1.4 },
  { left: "8%", top: "60%", size: 5, dur: 5.2, delay: 0.5 },
  { left: "60%", top: "40%", size: 4, dur: 4.8, delay: 1.7 },
];
