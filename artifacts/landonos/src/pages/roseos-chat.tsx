import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, MessageSquare, Send, User, Bot, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type ChatMode = 
  | "Help me understand this topic"
  | "Help me build a research plan"
  | "Help me check my sources"
  | "Help me write the report"
  | "Help me prepare a handoff"
  | "Help me brainstorm next steps"
  | "Help me improve my prompt"
  | "Help me identify risks";

const CHAT_MODES: ChatMode[] = [
  "Help me understand this topic",
  "Help me build a research plan",
  "Help me check my sources",
  "Help me write the report",
  "Help me prepare a handoff",
  "Help me brainstorm next steps",
  "Help me improve my prompt",
  "Help me identify risks"
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedNextQuestion?: string;
  suggestedPrompt?: string;
  sourceReminder?: string;
  humanReviewReminder?: string;
  nextAction?: string;
}

const SIMULATED_RESPONSES: Record<string, Omit<ChatMessage, "id" | "role" | "content">> = {
  "Help me understand this topic": {
    suggestedNextQuestion: "What are the core components of this topic I should focus on?",
    suggestedPrompt: "Explain [Topic] as if I am an executive making a decision about it. Include key drivers, risks, and market context.",
    sourceReminder: "Make sure you verify any explanatory claims against official industry or regulatory definitions.",
    humanReviewReminder: "Your understanding is just the starting point; leadership must review before external use.",
    nextAction: "Identify the top 3 primary sources for this topic."
  },
  "Help me build a research plan": {
    suggestedNextQuestion: "What should the timeline for this research look like?",
    suggestedPrompt: "Draft a step-by-step research plan to investigate [Specific Question]. Include required sources, milestones, and output format.",
    sourceReminder: "Include official and verified sources as a required step in your plan.",
    humanReviewReminder: "Have a senior analyst review your plan before you spend hours executing it.",
    nextAction: "Draft a list of questions you need to answer."
  },
  "Help me check my sources": {
    suggestedNextQuestion: "How do I know if this source is reliable enough?",
    suggestedPrompt: "Analyze these sources for bias, recency, and authority: [List Sources].",
    sourceReminder: "Remember, AI summaries are not official sources. Find the primary document.",
    humanReviewReminder: "Any source used for a compliance or business decision requires human validation.",
    nextAction: "Cross-reference your current sources against official records."
  },
  "Help me write the report": {
    suggestedNextQuestion: "What should the executive summary focus on?",
    suggestedPrompt: "Draft a report outline based on these findings: [Insert Findings]. Structure it with Executive Summary, Key Facts, and Risks.",
    sourceReminder: "Ensure every factual claim in your draft points back to a verified source.",
    humanReviewReminder: "AI can draft the structure, but you must write the final conclusions. Human review is mandatory.",
    nextAction: "Write the first draft of your executive summary."
  },
  "Help me prepare a handoff": {
    suggestedNextQuestion: "What might the reviewer ask me about this?",
    suggestedPrompt: "Review this research summary and identify any gaps or unanswered questions a reviewer might spot.",
    sourceReminder: "Attach all relevant primary sources to your handoff.",
    humanReviewReminder: "The handoff is a request for human review. Make sure it's clean and easy to read.",
    nextAction: "Fill out the Research Completed Handoff form."
  },
  "Help me brainstorm next steps": {
    suggestedNextQuestion: "What is the most urgent action to take right now?",
    suggestedPrompt: "Based on these findings [Insert Findings], what are 3 logical next steps for the business?",
    sourceReminder: "If next steps involve legal or compliance actions, verify the requirements.",
    humanReviewReminder: "Brainstorming is great, but any execution requires leadership sign-off.",
    nextAction: "Document 2 potential next steps and discuss them with your reviewer."
  },
  "Help me improve my prompt": {
    suggestedNextQuestion: "How can I make this prompt more specific?",
    suggestedPrompt: "Revise this prompt to be more direct, require authoritative sources, and ask for a structured output: [Your Prompt].",
    sourceReminder: "A good prompt explicitly asks the AI to cite sources or stick to provided text.",
    humanReviewReminder: "Even with a great prompt, the output is just a draft.",
    nextAction: "Test your improved prompt in the AI Prompt Coach."
  },
  "Help me identify risks": {
    suggestedNextQuestion: "What is the worst-case scenario if we ignore this?",
    suggestedPrompt: "Act as a risk analyst. Review this scenario [Insert Scenario] and list potential financial, compliance, and reputational risks.",
    sourceReminder: "Base your risk assessments on historical data or regulatory guidance.",
    humanReviewReminder: "Risk identification requires human judgment. AI might miss nuanced business context.",
    nextAction: "Add identified risks to your report draft."
  }
};

export default function RoseOSChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello Landon. I am RoseOS Chat, your research guide. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I can help with that. To get started, what specific area are you focusing on, and what is the end goal of this research?",
        suggestedNextQuestion: "What should my first step be?",
        suggestedPrompt: `Help me break down: ${userMsg.content}.`,
        sourceReminder: "Always rely on primary official sources.",
        humanReviewReminder: "Use my guidance as a starting point. Final decisions require human review.",
        nextAction: "Define your research objective clearly."
      };
      setMessages(prev => [...prev, assistantMsg]);
    }, 600);
  };

  const handleModeClick = (mode: ChatMode) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: mode
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => {
      const simulated = SIMULATED_RESPONSES[mode];
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Let's focus on: "${mode}". I can guide you through this. Here are some structured thoughts to help you move forward.`,
        ...simulated
      };
      setMessages(prev => [...prev, assistantMsg]);
    }, 600);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader
        icon={ShieldCheck}
        eyebrow="Your co-driver"
        title="RoseOS Co-Driver"
        subtitle="Your AI-guided mentor for research strategy and planning — structured prompts and next steps, always paired with source and human-review reminders."
        statsClassName="grid grid-cols-2 gap-3 shrink-0"
        stats={[
          { label: "Guidance Modes", value: CHAT_MODES.length, icon: MessageSquare },
          { label: "Human Review", value: "Required", icon: ShieldCheck },
        ]}
      />

      <div className="bg-primary/10 border border-primary/20 text-primary-foreground p-3 rounded-md flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <strong>Safety Note:</strong> RoseOS Chat is a research guide. Final company decisions and client-facing guidance require human review. AI output is draft only until source-checked and human-reviewed.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-[500px]">
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Quick Modes</h3>
          <div className="flex flex-col gap-2">
            {CHAT_MODES.map(mode => (
              <Button 
                key={mode} 
                variant="outline" 
                className="justify-start text-left h-auto py-3 px-4 whitespace-normal"
                onClick={() => handleModeClick(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
        
        <Card className="md:col-span-3 flex flex-col shadow-sm">
          <CardHeader className="border-b pb-4 bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Conversation
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-sidebar text-sidebar-foreground'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`p-4 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border'}`}>
                        {msg.content}
                      </div>
                      
                      {msg.role === 'assistant' && msg.suggestedNextQuestion && (
                        <div className="bg-card border rounded-md p-4 text-sm space-y-3 mt-2 shadow-sm">
                          {msg.suggestedNextQuestion && (
                            <div>
                              <strong className="text-xs text-muted-foreground uppercase block mb-1">Suggested Next Question</strong>
                              <span className="font-medium">{msg.suggestedNextQuestion}</span>
                            </div>
                          )}
                          {msg.suggestedPrompt && (
                            <div>
                              <strong className="text-xs text-muted-foreground uppercase block mb-1">Suggested AI Prompt</strong>
                              <code className="bg-muted px-2 py-1 rounded text-xs block whitespace-pre-wrap">{msg.suggestedPrompt}</code>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            {msg.sourceReminder && (
                              <div className="bg-secondary/50 p-2 rounded border border-secondary">
                                <strong className="text-[10px] text-muted-foreground uppercase block mb-1">Source Reminder</strong>
                                <span className="text-xs">{msg.sourceReminder}</span>
                              </div>
                            )}
                            {msg.humanReviewReminder && (
                              <div className="bg-secondary/50 p-2 rounded border border-secondary">
                                <strong className="text-[10px] text-muted-foreground uppercase block mb-1">Review Reminder</strong>
                                <span className="text-xs">{msg.humanReviewReminder}</span>
                              </div>
                            )}
                          </div>
                          {msg.nextAction && (
                            <div className="pt-1 border-t mt-2">
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-sm">
                                Next Action: {msg.nextAction}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-muted/10">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder="Ask RoseOS for guidance..." 
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
