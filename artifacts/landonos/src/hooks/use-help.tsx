import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { TOUR_STEPS } from "@/lib/walkthrough";
import { cancelSpeech } from "@/lib/speech";

interface HelpContextType {
  hintsEnabled: boolean;
  toggleHints: () => void;
  disableHints: () => void;
  tourActive: boolean;
  startTour: () => void;
  endTour: () => void;
  stepIndex: number;
  nextStep: () => void;
  prevStep: () => void;
  narrationOn: boolean;
  toggleNarration: () => void;
  videoOpen: boolean;
  openVideo: () => void;
  closeVideo: () => void;
  guideOpen: boolean;
  openGuide: () => void;
  closeGuide: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);
const HINTS_KEY = "landonos_help_hints";

export function HelpProvider({ children }: { children: ReactNode }) {
  const [hintsEnabled, setHintsEnabled] = useState<boolean>(() => {
    try {
      const v = window.localStorage.getItem(HINTS_KEY);
      return v === null ? true : v === "true";
    } catch {
      return true;
    }
  });
  const [tourActive, setTourActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [narrationOn, setNarrationOn] = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(HINTS_KEY, String(hintsEnabled));
    } catch {
      /* ignore persistence errors */
    }
  }, [hintsEnabled]);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    setTourActive(false);
    cancelSpeech();
  }, []);

  const nextStep = useCallback(
    () => setStepIndex((i) => Math.min(i + 1, TOUR_STEPS.length - 1)),
    []
  );
  const prevStep = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);

  const toggleHints = useCallback(() => setHintsEnabled((v) => !v), []);
  const disableHints = useCallback(() => setHintsEnabled(false), []);
  const toggleNarration = useCallback(() => setNarrationOn((v) => !v), []);
  const openVideo = useCallback(() => setVideoOpen(true), []);
  const closeVideo = useCallback(() => setVideoOpen(false), []);
  const openGuide = useCallback(() => setGuideOpen(true), []);
  const closeGuide = useCallback(() => setGuideOpen(false), []);

  return (
    <HelpContext.Provider
      value={{
        hintsEnabled,
        toggleHints,
        disableHints,
        tourActive,
        startTour,
        endTour,
        stepIndex,
        nextStep,
        prevStep,
        narrationOn,
        toggleNarration,
        videoOpen,
        openVideo,
        closeVideo,
        guideOpen,
        openGuide,
        closeGuide,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error("useHelp must be used within a HelpProvider");
  return ctx;
}
