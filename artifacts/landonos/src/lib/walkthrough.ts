export interface TourStep {
  route: string;
  title: string;
  narration: string;
}

export interface PageHelpSection {
  heading: string;
  detail: string;
}

export interface PageHelpContent {
  title: string;
  body: string;
  tip?: string;
  /** Step-by-step guide shown in the pop-up help dialog. */
  sections?: PageHelpSection[];
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: "/",
    title: "Welcome to the Performance Cockpit",
    narration:
      "This is your performance cockpit. The instrument cluster up top reads out source quality, report readiness, and research velocity, while the live tiles show open requests, blocked items, reports in progress, and completed handoffs, so you always know where things stand.",
  },
  {
    route: "/guided-research-builder",
    title: "Start in the Research Engine",
    narration:
      "Always begin here. Define what decision the research supports, which sources are required, and what not to assume. Getting the question right before involving the AI is what keeps the work disciplined.",
  },
  {
    route: "/prompt-coach",
    title: "Tune your ask in the Tuning Bay",
    narration:
      "Turn a rough question into a precise, source-locked prompt. Remember, anything the AI produces is a draft only until you verify it against real sources and a human reviews it.",
  },
  {
    route: "/research-gps",
    title: "Follow the Track Map",
    narration:
      "The Track Map walks you through the full workflow, from understanding the question to handoff. Each step shows whether it is complete, in progress, needs help, or not started, with a progress gauge to keep you on the racing line.",
  },
  {
    route: "/source-vault",
    title: "Stock the Source Garage",
    narration:
      "Store every source here and rate its quality. Official sources carry weight, while AI drafts and unknown sources are flagged so they are never mistaken for verified facts.",
  },
  {
    route: "/report-builder",
    title: "Assemble findings in the Brief Builder",
    narration:
      "Draft a leadership-ready brief with an objective, executive summary, findings, risks, and a recommendation. The readiness score warns you when sources are missing or open questions remain.",
  },
  {
    route: "/blocked",
    title: "Pull into the Pit Stop early",
    narration:
      "If you are stuck, route it here instead of spinning your wheels. Flag what you tried and who should help, with an urgency level so the right person can step in quickly.",
  },
  {
    route: "/roseos-chat",
    title: "Ride with the RoseOS Co-Driver",
    narration:
      "RoseOS is your research co-driver. It asks clarifying questions and suggests next steps, but final company decisions and client-facing guidance always require human review.",
  },
  {
    route: "/handoff",
    title: "Cross the Finish Line Handoff",
    narration:
      "When research is ready, package it for Rose, Carmen, or Gregg. Research is not complete until source quality and open questions are resolved and a reviewer signs off.",
  },
  {
    route: "/company-brain",
    title: "Sync with the Company Brain",
    narration:
      "RoseOS is the company's brain. Ask it what's on record, or propose updates to the decision log, requirements registry, or automation registry. These are suggestions only. Nothing is recorded without human approval.",
  },
  {
    route: "/brainstorming",
    title: "Explore ideas in the Idea Garage",
    narration:
      "Capture opportunities, risks, and automation ideas, then convert the strong ones into research requests or leadership questions.",
  },
  {
    route: "/training-academy",
    title: "Build skills in Driver Training",
    narration:
      "Work through lessons on using AI responsibly, verifying sources, and writing executive summaries. Completing lessons earns points toward your next level.",
  },
  {
    route: "/reward-center",
    title: "Track progress in Garage Rewards",
    narration:
      "Your points and badges reflect real research skill, from Source Finder upward. The level gauge shows how close you are to your next milestone.",
  },
  {
    route: "/settings",
    title: "Tune your cockpit in Settings",
    narration:
      "Adjust your profile, manage lists, tune reward values, and export or import your data. That completes the tour. You can replay it anytime from the play button in the top bar.",
  },
];

export const PAGE_HELP: Record<string, PageHelpContent> = {
  "/": {
    title: "Performance Cockpit",
    body: "The instrument cluster reads source quality, report readiness, and research velocity; the tiles below show live counts, today's priorities, and any sources still awaiting human review. Use the quick actions to jump straight into common tasks.",
    tip: "Compliance reminder: AI output is a draft only until source-checked and human-reviewed.",
    sections: [
      {
        heading: "Read the gauges first",
        detail:
          "The four instruments give you an at-a-glance read on quality, readiness, velocity, and human-review risk before you dive into the details.",
      },
      {
        heading: "Work the priority list",
        detail:
          "Today's priorities and review alerts surface what needs you now. Clear blockers from the Pit Stop panel before they slow the whole run.",
      },
      {
        heading: "Launch from quick actions",
        detail:
          "Jump straight into the Research Engine, Track Map, or a new request without hunting through the sidebar.",
      },
    ],
  },
  "/guided-research-builder": {
    title: "Research Engine",
    body: "Define the decision this supports, the required sources, and what not to assume before involving AI. A clear, scoped question is what keeps the rest of the workflow disciplined.",
    tip: "Mark requests that need human review before their results are used.",
    sections: [
      {
        heading: "Scope the decision",
        detail:
          "State the real decision the research supports so the work stays aimed at something that matters.",
      },
      {
        heading: "Lock your sources",
        detail:
          "List the sources the work requires up front, and record what must never be assumed.",
      },
      {
        heading: "Flag for review",
        detail:
          "Mark requests that need human sign-off before their results are used anywhere.",
      },
    ],
  },
  "/prompt-coach": {
    title: "Tuning Bay",
    body: "Add context and source locks, then use the actions to make the prompt specific or executive-ready. Copy the improved prompt into your AI tool of choice.",
    tip: "Anything the AI returns is a draft until verified against real sources and reviewed by a human.",
    sections: [
      {
        heading: "Add context",
        detail:
          "Give the prompt the background and constraints it needs so the AI stays on the right track.",
      },
      {
        heading: "Lock the sources",
        detail:
          "Tell the AI which sources it may rely on, so the output can be traced back to real evidence.",
      },
      {
        heading: "Tune and copy",
        detail:
          "Use the actions to make the prompt specific or executive-ready, then copy it into your AI tool.",
      },
    ],
  },
  "/research-gps": {
    title: "Track Map",
    body: "Pick an active mission, then move through each step. Set a step to Complete, In Progress, or Needs Help to keep your progress gauge and the dashboard counts accurate.",
    sections: [
      {
        heading: "Pick a mission",
        detail: "Choose the active research run you want to drive through the workflow.",
      },
      {
        heading: "Drive each step",
        detail:
          "Move through the steps in order, marking each Complete, In Progress, or Needs Help.",
      },
      {
        heading: "Watch the progress gauge",
        detail:
          "Your step states drive the progress gauge and keep the cockpit counts accurate.",
      },
    ],
  },
  "/report-builder": {
    title: "Brief Builder",
    body: "Fill in the objective, summary, findings, risks, and recommendation, and attach your sources. The readiness score flags missing official sources and open questions.",
    tip: "Briefs stay drafts until a reviewer marks them approved.",
    sections: [
      {
        heading: "Build the brief",
        detail:
          "Capture the objective, executive summary, findings, risks, and a clear recommendation.",
      },
      {
        heading: "Back it with sources",
        detail: "Attach the sources that support each finding so nothing rests on assumption.",
      },
      {
        heading: "Mind the readiness score",
        detail:
          "The score warns you when official sources or answers are still missing before you share.",
      },
    ],
  },
  "/source-vault": {
    title: "Source Garage",
    body: "Add each source with a type and quality rating. Official and internal records are trusted; AI drafts and unknown sources are flagged so they are never cited as verified fact.",
    tip: "Watch the risk banner if a request relies only on AI-draft or unknown sources.",
    sections: [
      {
        heading: "Log every source",
        detail: "Capture each source with its type and a quality rating as you find it.",
      },
      {
        heading: "Trust the right tier",
        detail:
          "Official and internal records are trusted; AI drafts and unknown sources stay flagged.",
      },
      {
        heading: "Heed the risk banner",
        detail:
          "If a request leans only on unverified sources, the risk banner tells you to dig deeper.",
      },
    ],
  },
  "/blocked": {
    title: "Pit Stop",
    body: "Log what you are stuck on, what you have tried, and who should help, with an urgency level. Routing a blocker early is better than spinning your wheels.",
    sections: [
      {
        heading: "Describe the blocker",
        detail: "Say exactly what you are stuck on and what you have already tried.",
      },
      {
        heading: "Route to the right help",
        detail: "Name who should help and set an urgency level so it reaches the right person.",
      },
      {
        heading: "Pit early",
        detail: "Raising a blocker early beats losing time spinning your wheels.",
      },
    ],
  },
  "/roseos-chat": {
    title: "RoseOS Co-Driver",
    body: "Use the quick modes to get help understanding a topic, building a plan, or checking sources. RoseOS asks clarifying questions to guide your thinking.",
    tip: "Final company decisions and client-facing guidance always require human review.",
    sections: [
      {
        heading: "Pick a mode",
        detail: "Choose understand, plan, or source-check to point the co-driver at your goal.",
      },
      {
        heading: "Answer the questions",
        detail: "RoseOS asks clarifying questions to sharpen your thinking, not replace it.",
      },
      {
        heading: "Keep humans in the loop",
        detail:
          "Company decisions and client-facing guidance always go through human review.",
      },
    ],
  },
  "/handoff": {
    title: "Finish Line Handoff",
    body: "Summarize what you found, what is still unknown, and your recommended action, then route it to the right reviewer. Flag if it affects a company decision or client-facing process.",
    tip: "Research is not complete until source quality and open questions are resolved.",
    sections: [
      {
        heading: "Summarize the run",
        detail: "Capture what you found, what is still open, and your recommended action.",
      },
      {
        heading: "Route to a reviewer",
        detail: "Send it to Rose, Carmen, or Gregg, flagging any decision or client impact.",
      },
      {
        heading: "Confirm it is ready",
        detail:
          "Resolve source quality and open questions before you cross the finish line.",
      },
    ],
  },
  "/brainstorming": {
    title: "Idea Garage",
    body: "Use the idea starters to surface opportunities, risks, and automation ideas, then convert the strongest into research requests or leadership questions.",
    sections: [
      {
        heading: "Spin up ideas",
        detail: "Use the starters to capture opportunities, risks, and automation ideas.",
      },
      {
        heading: "Sort the strongest",
        detail: "Mark the ideas worth pursuing so the good ones do not get lost.",
      },
      {
        heading: "Convert to action",
        detail: "Turn the best into research requests or leadership questions.",
      },
    ],
  },
  "/reward-center": {
    title: "Garage Rewards",
    body: "Points and badges reflect real research milestones, from Source Finder upward. The level gauge shows how close you are to your next milestone.",
    sections: [
      {
        heading: "Read the level gauge",
        detail: "The gauge shows your progress toward the next level at a glance.",
      },
      {
        heading: "Earn through real work",
        detail: "Points come from genuine milestones, not busywork, so they mean something.",
      },
      {
        heading: "Follow the roadmap",
        detail: "The roadmap shows what each level represents on your way up.",
      },
    ],
  },
  "/training-academy": {
    title: "Driver Training",
    body: "Work through each lesson and its checklist. Marking a lesson complete earns points; reopening it removes them, so progress always reflects real work.",
    sections: [
      {
        heading: "Work the lessons",
        detail: "Move through each lesson and its checklist at your own pace.",
      },
      {
        heading: "Earn honest points",
        detail:
          "Completing a lesson earns points; reopening it removes them, so progress stays real.",
      },
      {
        heading: "Track your gauge",
        detail: "The training gauge shows how far through the academy you are.",
      },
    ],
  },
  "/company-brain": {
    title: "Company Brain Sync",
    body: "RoseOS is the company's brain. Ask it what's on record, then draft proposed updates to core records. These remain suggestions until a human approves them — nothing is recorded automatically.",
    tip: "This guardrail keeps company decisions under human control.",
    sections: [
      {
        heading: "Ask what's on record",
        detail:
          "Query the decision log, requirements registry, and automation registry first.",
      },
      {
        heading: "Draft a suggestion",
        detail: "Propose updates to core records as drafts, never as automatic changes.",
      },
      {
        heading: "Wait for approval",
        detail: "Nothing is recorded until a human reviews and approves it.",
      },
    ],
  },
  "/settings": {
    title: "Settings",
    body: "Update your profile, manage the lists used across the app, tune reward values, and export or import your data. Importing replaces your current data after validation.",
    sections: [
      {
        heading: "Tune your profile",
        detail: "Update your name, role, and the lists used across the cockpit.",
      },
      {
        heading: "Adjust rewards",
        detail: "Tune the reward values that drive points and levels.",
      },
      {
        heading: "Export or import",
        detail: "Back up your data, or import to replace it after validation.",
      },
    ],
  },
};
