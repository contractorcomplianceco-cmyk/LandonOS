import {
  LayoutDashboard,
  Target,
  Compass,
  Database,
  FileText,
  BrainCircuit,
  Award,
  type LucideIcon,
} from "lucide-react";

export interface OnboardingSection {
  id: string;
  route: string;
  title: string;
  /** One-line description shown in the UI. */
  blurb: string;
  /** Narration text (matches the recorded TTS clip). */
  narration: string;
  icon: LucideIcon;
  /** Audio file name in public/onboarding. */
  audio: string;
}

export const ONBOARDING_SECTIONS: OnboardingSection[] = [
  {
    id: "command-center",
    route: "/",
    title: "Command Center",
    blurb:
      "Your daily cockpit — live counts of open requests, blocked items, reports in progress, and completed handoffs.",
    narration:
      "Welcome to LandonOS. Your Command Center is the daily cockpit, showing live counts of open requests, blocked items, reports in progress, and completed handoffs.",
    icon: LayoutDashboard,
    audio: "welcome-1.mp3",
  },
  {
    id: "research-builder",
    route: "/guided-research-builder",
    title: "Research Builder",
    blurb:
      "Scope every project first: the decision it supports, the sources it requires, and what you should never assume.",
    narration:
      "Every project starts in the Research Builder, where you define the decision the work supports, the sources it requires, and what you should never assume.",
    icon: Target,
    audio: "welcome-2.mp3",
  },
  {
    id: "research-gps",
    route: "/research-gps",
    title: "Research GPS",
    blurb:
      "A guided ten-step workflow that takes you from understanding the question all the way to a clean handoff.",
    narration:
      "The Research GPS guides you through a ten step workflow, from understanding the question all the way to a clean handoff.",
    icon: Compass,
    audio: "welcome-3.mp3",
  },
  {
    id: "source-vault",
    route: "/source-vault",
    title: "Source Vault",
    blurb:
      "Capture and rate every source — official records are trusted, while AI drafts and unknown sources are flagged.",
    narration:
      "In the Source Vault you capture and rate every source, so official records are trusted while AI drafts and unknown sources are clearly flagged.",
    icon: Database,
    audio: "welcome-4.mp3",
  },
  {
    id: "report-builder",
    route: "/report-builder",
    title: "Report Builder",
    blurb:
      "Assemble a leadership-ready report; the readiness score warns you whenever sources or answers are still missing.",
    narration:
      "The Report Builder assembles a leadership ready report, and its readiness score warns you whenever sources or answers are still missing.",
    icon: FileText,
    audio: "welcome-5.mp3",
  },
  {
    id: "roseos",
    route: "/company-brain",
    title: "RoseOS",
    blurb:
      "The company brain — ask what's on record and propose updates that stay drafts until a human approves them.",
    narration:
      "RoseOS is the company brain. Ask it what is on record, and propose updates that stay drafts until a human reviews and approves them.",
    icon: BrainCircuit,
    audio: "welcome-6.mp3",
  },
  {
    id: "growth-rewards",
    route: "/reward-center",
    title: "Growth & Rewards",
    blurb:
      "Turn real research skill into points and badges, and watch your career progress over time.",
    narration:
      "As you work, the Reward Center turns real research skill into points and badges, so you can watch your career grow over time.",
    icon: Award,
    audio: "welcome-7.mp3",
  },
];

export const ONBOARDING_MUSIC = "welcome-music.mp3";

/** Resolve an asset under public/onboarding, respecting the app base path. */
export function onboardingAsset(name: string): string {
  return `${import.meta.env.BASE_URL}onboarding/${name}`;
}

export const USER_GUIDE_PDF = onboardingAsset("landonos-user-guide.pdf");
