import { useEffect } from "react";
import { useLocation } from "wouter";
import { useHelp } from "@/hooks/use-help";
import { TOUR_STEPS } from "@/lib/walkthrough";
import { speakText, cancelSpeech } from "@/lib/speech";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Compass,
} from "lucide-react";

export function GuidedTour() {
  const {
    tourActive,
    stepIndex,
    endTour,
    nextStep,
    prevStep,
    narrationOn,
    toggleNarration,
  } = useHelp();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!tourActive) return;
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;

    navigate(step.route);

    if (narrationOn) {
      speakText(`${step.title}. ${step.narration}`);
    } else {
      cancelSpeech();
    }

    return () => {
      cancelSpeech();
    };
  }, [tourActive, stepIndex, narrationOn, navigate]);

  useEffect(() => {
    if (!tourActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") endTour();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tourActive, endTour]);

  if (!tourActive) return null;

  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;
  const pct = ((stepIndex + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end">
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Guided walkthrough"
        className="w-full max-w-md rounded-lg border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Guided Walkthrough
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleNarration}
              aria-label={narrationOn ? "Mute narration" : "Unmute narration"}
              title={narrationOn ? "Mute narration" : "Unmute narration"}
              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {narrationOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              onClick={endTour}
              aria-label="Close walkthrough"
              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Step {stepIndex + 1} of {TOUR_STEPS.length}
          </div>
          <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {step.narration}
          </p>
          <Progress value={pct} className="mt-4 h-1.5" />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            disabled={stepIndex === 0}
          >
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
          {isLast ? (
            <Button size="sm" onClick={endTour}>
              Finish
            </Button>
          ) : (
            <Button size="sm" onClick={nextStep}>
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
