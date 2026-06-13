import { ResearchType } from "./types";

export function generateResearchPlan(data: any) {
  return [
    `1. Initial Scope Review: Understand the core decision (${data.decisionSupported || "general guidance"}) and its implications.`,
    `2. Source Gathering: Locate ${data.requiredSources || "relevant authoritative sources"}.`,
    `3. Fact Extraction: Pull verified data, noting specifically what not to assume: ${data.whatNotToAssume || "None specified"}.`,
    `4. Synthesis: Compare findings against existing knowledge (${data.whatWeKnow || "None specified"}).`,
    `5. Reporting: Draft executive summary targeting completion criteria: ${data.completionCriteria || "Comprehensive review"}.`
  ];
}

export function generateSourceChecklist(data: any) {
  return [
    "Verify primary regulator or official text",
    "Check internal company records and previous decisions",
    "Identify industry standard baselines",
    "Flag any AI or unknown sources for strict review"
  ];
}

export function generateAiPrompt(data: any) {
  return `Act as an expert executive research analyst. I need to understand: "${data.whatTryingToFindOut}".
The decision this supports is: "${data.decisionSupported}".
Please provide a structured breakdown. Rely strictly on: ${data.requiredSources}.
Do not assume: ${data.whatNotToAssume}.
Ensure the output focuses on actionable insights for ${data.reviewer}.`;
}

export function generateFollowUpQuestions(data: any) {
  return [
    "What specific regulatory bodies have jurisdiction over this matter?",
    "Are there any pending changes to the rules we should anticipate?",
    "How have our competitors approached this constraint historically?"
  ];
}

export function generateReportOutline(data: any) {
  return [
    "Executive Summary",
    "Core Decision Matrix",
    "Verified Facts & Sources",
    "Identified Risks",
    "Strategic Opportunities",
    "Next Steps"
  ];
}

export function recommendReviewer(data: any) {
  if (data.type === "Compliance" || data.priority === "Executive") return "Rose";
  if (data.type === "Business" || data.type === "Market") return "Carmen";
  return data.reviewer || "Gregg";
}
