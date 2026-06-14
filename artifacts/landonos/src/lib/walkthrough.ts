export interface TourStep {
  route: string;
  title: string;
  narration: string;
}

export interface PageHelpContent {
  title: string;
  body: string;
  tip?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: "/",
    title: "Welcome to the Command Center",
    narration:
      "This is your research cockpit. The cards at the top give you live counts of open requests, blocked items, reports in progress, and completed handoffs, so you always know where things stand.",
  },
  {
    route: "/guided-research-builder",
    title: "Start with the Research Builder",
    narration:
      "Always begin here. Define what decision the research supports, which sources are required, and what not to assume. Getting the question right before involving the AI is what keeps the work disciplined.",
  },
  {
    route: "/prompt-coach",
    title: "Sharpen your ask with the Prompt Coach",
    narration:
      "Turn a rough question into a precise, source-locked prompt. Remember, anything the AI produces is a draft only until you verify it against real sources and a human reviews it.",
  },
  {
    route: "/research-gps",
    title: "Follow the Research GPS",
    narration:
      "The GPS walks you through the full workflow, from understanding the question to handoff. Each step shows whether it is complete, in progress, needs help, or not started.",
  },
  {
    route: "/source-vault",
    title: "Capture evidence in the Source Vault",
    narration:
      "Store every source here and rate its quality. Official sources carry weight, while AI drafts and unknown sources are flagged so they are never mistaken for verified facts.",
  },
  {
    route: "/report-builder",
    title: "Assemble findings in the Report Builder",
    narration:
      "Draft a leadership-ready report with an objective, executive summary, findings, risks, and a recommendation. The readiness score warns you when sources are missing or open questions remain.",
  },
  {
    route: "/blocked",
    title: "Raise issues early in Blocked Help",
    narration:
      "If you are stuck, route it here instead of spinning your wheels. Flag what you tried and who should help, with an urgency level so the right person can step in quickly.",
  },
  {
    route: "/roseos-chat",
    title: "Get guidance from RoseOS Chat",
    narration:
      "RoseOS is your research mentor. It asks clarifying questions and suggests next steps, but final company decisions and client-facing guidance always require human review.",
  },
  {
    route: "/handoff",
    title: "Submit work through Handoff",
    narration:
      "When research is ready, package it for Rose, Carmen, or Gregg. Research is not complete until source quality and open questions are resolved and a reviewer signs off.",
  },
  {
    route: "/company-brain",
    title: "Query and update RoseOS",
    narration:
      "RoseOS is the company's brain. Ask it what's on record, or propose updates to the decision log, requirements registry, or automation registry. These are suggestions only. Nothing is recorded without human approval.",
  },
  {
    route: "/brainstorming",
    title: "Explore ideas in the Brainstorming Studio",
    narration:
      "Capture opportunities, risks, and automation ideas, then convert the strong ones into research requests or leadership questions.",
  },
  {
    route: "/training-academy",
    title: "Build skills in the Training Academy",
    narration:
      "Work through lessons on using AI responsibly, verifying sources, and writing executive summaries. Completing lessons earns points toward your next level.",
  },
  {
    route: "/reward-center",
    title: "Track progress in the Reward Center",
    narration:
      "Your points and badges reflect real research skill, from Source Finder upward. This is how you see your growth as a research analyst over time.",
  },
  {
    route: "/settings",
    title: "Make it yours in Settings",
    narration:
      "Adjust your profile, manage lists, tune reward values, and export or import your data. That completes the tour. You can replay it anytime from the play button in the top bar.",
  },
];

export const PAGE_HELP: Record<string, PageHelpContent> = {
  "/": {
    title: "Your research cockpit",
    body: "The top cards show live counts; below are today's priorities and any sources that still need human review. Use the quick actions to jump straight into common tasks.",
    tip: "Compliance reminder: AI output is a draft only until source-checked and human-reviewed.",
  },
  "/guided-research-builder": {
    title: "Start the research correctly",
    body: "Define the decision this supports, the required sources, and what not to assume before involving AI. A clear, scoped question is what keeps the rest of the workflow disciplined.",
    tip: "Mark requests that need human review before their results are used.",
  },
  "/prompt-coach": {
    title: "Turn rough questions into disciplined prompts",
    body: "Add context and source locks, then use the actions to make the prompt specific or executive-ready. Copy the improved prompt into your AI tool of choice.",
    tip: "Anything the AI returns is a draft until verified against real sources and reviewed by a human.",
  },
  "/research-gps": {
    title: "Navigate the full workflow",
    body: "Pick an active mission, then move through each step. Set a step to Complete, In Progress, or Needs Help to keep your progress and the dashboard counts accurate.",
  },
  "/report-builder": {
    title: "Build a leadership-ready report",
    body: "Fill in the objective, summary, findings, risks, and recommendation, and attach your sources. The readiness score flags missing official sources and open questions.",
    tip: "Reports stay drafts until a reviewer marks them approved.",
  },
  "/source-vault": {
    title: "Keep your evidence verified",
    body: "Add each source with a type and quality rating. Official and internal records are trusted; AI drafts and unknown sources are flagged so they are never cited as verified fact.",
    tip: "Watch the risk banner if a request relies only on AI-draft or unknown sources.",
  },
  "/blocked": {
    title: "Raise issues early",
    body: "Log what you are stuck on, what you have tried, and who should help, with an urgency level. Routing a blocker early is better than spinning your wheels.",
  },
  "/roseos-chat": {
    title: "Your research mentor",
    body: "Use the quick modes to get help understanding a topic, building a plan, or checking sources. RoseOS asks clarifying questions to guide your thinking.",
    tip: "Final company decisions and client-facing guidance always require human review.",
  },
  "/handoff": {
    title: "Submit work for review",
    body: "Summarize what you found, what is still unknown, and your recommended action, then route it to the right reviewer. Flag if it affects a company decision or client-facing process.",
    tip: "Research is not complete until source quality and open questions are resolved.",
  },
  "/brainstorming": {
    title: "Capture and convert ideas",
    body: "Use the idea starters to surface opportunities, risks, and automation ideas, then convert the strongest into research requests or leadership questions.",
  },
  "/reward-center": {
    title: "Track your skill progression",
    body: "Points and badges reflect real research milestones, from Source Finder upward. The roadmap shows what each level represents.",
  },
  "/training-academy": {
    title: "Build your research skills",
    body: "Work through each lesson and its checklist. Marking a lesson complete earns points; reopening it removes them, so progress always reflects real work.",
  },
  "/company-brain": {
    title: "RoseOS: ask first, suggest, don't auto-record",
    body: "RoseOS is the company's brain. Ask it what's on record, then draft proposed updates to core records. These remain suggestions until a human approves them — nothing is recorded automatically.",
    tip: "This guardrail keeps company decisions under human control.",
  },
  "/settings": {
    title: "Configure your cockpit",
    body: "Update your profile, manage the lists used across the app, tune reward values, and export or import your data. Importing replaces your current data after validation.",
  },
};
