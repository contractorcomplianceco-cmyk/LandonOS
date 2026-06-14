import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  FileText,
  GraduationCap,
  Video,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { OnboardingScene } from "@/components/onboarding-scenes";
import { PageHeader } from "@/components/page-header";
import {
  ONBOARDING_SECTIONS,
  ONBOARDING_MUSIC,
  USER_GUIDE_PDF,
  onboardingAsset,
} from "@/lib/onboarding";

type Mode = "video" | "guided";

const SECTIONS = ONBOARDING_SECTIONS;
const LAST = SECTIONS.length - 1;

// Static drifting particles for the player backdrop (no random re-renders).
const PARTICLES = [
  { left: "12%", top: "22%", size: 6, dur: 5.5, delay: 0 },
  { left: "82%", top: "18%", size: 4, dur: 6.5, delay: 0.6 },
  { left: "68%", top: "70%", size: 8, dur: 7, delay: 1.2 },
  { left: "26%", top: "78%", size: 5, dur: 6, delay: 0.3 },
  { left: "48%", top: "12%", size: 4, dur: 5, delay: 1.6 },
  { left: "90%", top: "52%", size: 6, dur: 7.5, delay: 0.9 },
  { left: "6%", top: "54%", size: 5, dur: 6.8, delay: 1.9 },
  { left: "40%", top: "88%", size: 4, dur: 5.8, delay: 0.4 },
];

export default function Welcome() {
  const { toast } = useToast();
  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const [mode, setMode] = useState<Mode>("video");
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [segProgress, setSegProgress] = useState(0);

  const clearNarrationHandlers = (n: HTMLAudioElement) => {
    n.ontimeupdate = null;
    n.onended = null;
    n.onerror = null;
  };

  // Single source of truth for tearing down all audio: clears handlers,
  // pauses, and resets both narration and music. Used on unmount, on error,
  // and whenever the user switches modes so audio can never leak.
  const stopAllAudio = useCallback(() => {
    const n = narrationRef.current;
    const m = musicRef.current;
    if (n) {
      clearNarrationHandlers(n);
      n.pause();
      try {
        n.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    if (m) {
      m.pause();
      try {
        m.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Tear down audio when the page unmounts.
  useEffect(() => stopAllAudio, [stopAllAudio]);

  const playSection = useCallback(
    (i: number) => {
      const n = narrationRef.current;
      const m = musicRef.current;
      if (!n) return;
      clearNarrationHandlers(n);
      setCurrent(i);
      setStarted(true);
      setCompleted(false);
      setSegProgress(0);
      setPlaying(true);

      n.src = onboardingAsset(SECTIONS[i].audio);
      n.currentTime = 0;
      n.muted = muted;
      n.ontimeupdate = () => {
        if (n.duration > 0) setSegProgress(n.currentTime / n.duration);
      };
      n.onended = () => {
        setSegProgress(1);
        if (i < LAST) {
          playSection(i + 1);
        } else {
          setPlaying(false);
          setCompleted(true);
          if (m) m.pause();
        }
      };
      n.onerror = () => {
        stopAllAudio();
        setPlaying(false);
        toast({
          title: "Playback issue",
          description:
            "The narration couldn't be loaded. Try again, or switch to the Guided Tour.",
          variant: "destructive",
        });
      };
      const np = n.play();
      if (np && typeof np.catch === "function") np.catch(() => {});

      if (m) {
        m.loop = true;
        m.muted = muted;
        m.volume = 0.3;
        if (m.paused) {
          const mp = m.play();
          if (mp && typeof mp.catch === "function") mp.catch(() => {});
        }
      }
    },
    [muted, stopAllAudio, toast]
  );

  const pauseVideo = () => {
    const n = narrationRef.current;
    const m = musicRef.current;
    if (n) n.pause();
    if (m) m.pause();
    setPlaying(false);
  };

  const resumeVideo = () => {
    const n = narrationRef.current;
    const m = musicRef.current;
    if (n) {
      const p = n.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
    if (m) {
      const p = m.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
    setPlaying(true);
  };

  const togglePlay = () => {
    if (playing) {
      pauseVideo();
    } else if (!started || completed) {
      playSection(0);
    } else {
      resumeVideo();
    }
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (narrationRef.current) narrationRef.current.muted = next;
      if (musicRef.current) musicRef.current.muted = next;
      return next;
    });
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    // Switching modes must always stop audio first.
    stopAllAudio();
    setMode(next);
    setCurrent(0);
    setStarted(false);
    setPlaying(false);
    setCompleted(false);
    setSegProgress(0);
  };

  // Guided (no-audio) stepping.
  const guidedNext = () => {
    if (current < LAST) setCurrent((c) => c + 1);
  };
  const guidedBack = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };
  const guidedRestart = () => setCurrent(0);

  const jumpTo = (i: number) => {
    if (mode === "video") {
      playSection(i);
    } else {
      setCurrent(i);
    }
  };

  const segFill = (i: number) => {
    if (mode === "guided") return i <= current ? 1 : 0;
    if (completed) return 1;
    if (i < current) return 1;
    if (i === current) return started ? segProgress : 0;
    return 0;
  };

  const section = SECTIONS[current];

  return (
    <div className="space-y-6">
      <audio ref={narrationRef} preload="auto" className="hidden" />
      <audio ref={musicRef} src={onboardingAsset(ONBOARDING_MUSIC)} preload="auto" className="hidden" />

      <PageHeader
        icon={Sparkles}
        eyebrow="Welcome & Onboarding"
        title="Welcome to LandonOS"
        subtitle="Get oriented three ways — watch the narrated tour, step through the guided walkthrough at your own pace, or download the written user guide."
        action={
          <a
            href={USER_GUIDE_PDF}
            download
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition-colors hover:bg-blue-50"
          >
            <Download className="h-4 w-4" />
            User Guide (PDF)
          </a>
        }
      />

      {/* Mode toggle */}
      <div className="flex flex-col items-center gap-2">
        <div
          role="group"
          aria-label="Onboarding mode"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1"
        >
          <button
            type="button"
            aria-pressed={mode === "video"}
            onClick={() => switchMode("video")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              mode === "video"
                ? "bg-blue-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Video className="h-4 w-4" />
            Narrated Video
          </button>
          <button
            type="button"
            aria-pressed={mode === "guided"}
            onClick={() => switchMode("guided")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              mode === "guided"
                ? "bg-blue-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GraduationCap className="h-4 w-4" />
            Guided Tour
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === "video"
            ? "Sit back — narrated audio walks you through each area."
            : "Go at your own pace — step through each area, no audio."}
        </p>
      </div>

      {/* Player */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
        <div className="relative aspect-video w-full">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.22),transparent_50%)]" />
          {/* Pulsing accent glow for energy */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_82%,rgba(37,99,235,0.22),transparent_55%)]"
            animate={{ opacity: [0.45, 0.95, 0.45] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Drifting energy particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute rounded-full bg-sky-400/40 blur-[1px]"
                style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
                animate={{ y: [0, -22, 0], opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              />
            ))}
          </div>

          {/* Scene (keyed so it re-mounts and replays on every change) */}
          <AnimatePresence mode="wait">
            <div key={`${mode}-${current}`} className="absolute inset-0">
              <OnboardingScene id={section.id} />
            </div>
          </AnimatePresence>

          {/* Chapter/step label */}
          <div className="absolute left-4 top-4 z-20 rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
            {mode === "video" ? "Chapter" : "Step"} {current + 1} / {SECTIONS.length}
          </div>

          {/* Video start overlay */}
          {mode === "video" && !started && !completed && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-slate-950/55 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => playSection(0)}
                aria-label="Start narrated tour"
                className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.6)] ring-4 ring-blue-400/30 transition-transform hover:scale-105"
              >
                <Play className="h-8 w-8 translate-x-[2px] fill-white" />
              </button>
              <div className="text-center">
                <div className="text-lg font-bold text-white">Start the narrated tour</div>
                <div className="text-sm text-blue-100/75">
                  {SECTIONS.length} chapters with audio narration and music
                </div>
              </div>
            </div>
          )}

          {/* Video complete overlay */}
          {mode === "video" && completed && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-slate-950/65 backdrop-blur-sm">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40">
                <CheckCircle2 className="h-9 w-9 text-emerald-300" />
              </span>
              <div className="text-center">
                <div className="text-lg font-bold text-white">You're all set</div>
                <div className="text-sm text-blue-100/75">That's the full tour of LandonOS.</div>
              </div>
              <button
                type="button"
                onClick={() => playSection(0)}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
              >
                <RotateCcw className="h-4 w-4" /> Replay
              </button>
            </div>
          )}

          {/* Caption */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent px-4 pb-16 pt-10">
            <div className="text-base font-bold text-white md:text-lg">{section.title}</div>
            <div className="mt-0.5 line-clamp-2 max-w-2xl text-xs text-blue-100/75 md:text-sm">
              {section.blurb}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-3">
          {/* Segmented progress */}
          <div className="mb-3 flex items-center gap-1.5">
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-[width] duration-150"
                  style={{ width: `${segFill(i) * 100}%` }}
                />
              </div>
            ))}
          </div>

          {mode === "video" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500"
              >
                {playing ? (
                  <Pause className="h-4 w-4" />
                ) : completed ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 translate-x-[1px] fill-white" />
                )}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <span className="ml-auto text-xs font-medium text-blue-100/70">
                Chapter {current + 1} of {SECTIONS.length}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={guidedBack}
                disabled={current === 0}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              {current < LAST ? (
                <button
                  type="button"
                  onClick={guidedNext}
                  className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={guidedRestart}
                  className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                >
                  <RotateCcw className="h-4 w-4" /> Restart
                </button>
              )}
              <span className="ml-auto text-xs font-medium text-blue-100/70">
                Step {current + 1} of {SECTIONS.length}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Chapter / Step list */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {mode === "video" ? "Chapters" : "Steps"}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s, i) => {
            const isActive = i === current;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpTo(i)}
                aria-current={isActive}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                  isActive
                    ? "border-blue-500/60 bg-blue-50 shadow-sm ring-1 ring-blue-500/30 dark:bg-blue-950/40"
                    : "border-border bg-card hover:border-blue-500/40 hover:shadow-sm"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                    {mode === "video" ? "Chapter" : "Step"} {i + 1}
                  </div>
                  <div className="truncate text-sm font-semibold text-foreground">{s.title}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{s.blurb}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* User-guide card */}
      <section className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 ring-1 ring-blue-600/20 dark:text-sky-400">
            <FileText className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-base font-bold text-foreground">LandonOS User Guide</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              A written reference covering every area of the platform — a branded cover plus one
              page per section, ready to print or share with your team.
            </p>
          </div>
        </div>
        <a
          href={USER_GUIDE_PDF}
          download
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-500"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      </section>
    </div>
  );
}
