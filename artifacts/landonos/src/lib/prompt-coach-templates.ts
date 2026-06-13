export function generatePromptImprovement(action: string, prompt: string, context: any) {
  const base = prompt || "[Empty Prompt]";
  
  switch (action) {
    case "improve":
      return {
        improved: `Act as a senior analyst. Analyze the following topic: "${base}". Provide a structured breakdown including verified facts, risks, and strategic implications for ${context.reviewer || 'leadership'}. Only use ${context.requiredSources || 'official'} sources.`,
        why: "Adds persona, structure, intended audience, and strict source constraints."
      };
    case "specific":
      return {
        improved: `Please provide exact metrics, historical comparables, and specific regulatory citations regarding: "${base}". Limit the scope to the past 24 months and focus purely on ${context.type || 'relevant'} factors.`,
        why: "Narrows the time horizon and demands concrete data points rather than general summaries."
      };
    case "sources":
      return {
        improved: `Research "${base}". You MUST base all conclusions strictly on ${context.requiredSources || 'primary regulatory text or official vendor documentation'}. Do not include anecdotal evidence or unverified forum claims.`,
        why: "Creates a hard boundary against hallucination and low-quality information."
      };
    case "executive":
      return {
        improved: `Draft an executive brief regarding "${base}". Lead with the recommended decision for ${context.intendedOutput || 'the pending strategy'}. Support the recommendation with 3 bulleted facts derived from ${context.requiredSources || 'verified sources'}. Conclude with 2 actionable next steps.`,
        why: "Formats the output for executive consumption: bottom-line up front, brief, and actionable."
      };
    case "questions":
      return {
        improved: `Before answering about "${base}", ask me 3 clarifying questions to ensure you understand the exact business context and constraints.`,
        why: "Forces the AI to seek context rather than guessing intent."
      };
    case "assumptions":
      return {
        improved: `Review my premise: "${base}". Identify any hidden assumptions, logical leaps, or potential biases in this premise. Play devil's advocate and explain how this premise might be flawed.`,
        why: "Uses the AI to pressure-test thinking before conducting the actual research."
      };
    case "outline":
      return {
        improved: `Create a report outline for "${base}" intended as ${context.intendedOutput || 'a final report'}. Provide section headers and a 1-sentence description of what should go in each section.`,
        why: "Helps structure the work before drafting the actual content."
      };
    default:
      return { improved: base, why: "No changes applied." };
  }
}
