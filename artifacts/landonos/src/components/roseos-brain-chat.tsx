import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Sparkles } from "lucide-react";
import { CompanyBrainUpdate } from "@/lib/types";

interface BrainChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  matches?: CompanyBrainUpdate[];
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "what", "whats", "about", "tell", "show", "give",
  "from", "into", "have", "has", "are", "our", "any", "all", "did", "does", "was",
  "were", "this", "that", "there", "here", "you", "your", "roseos", "brain", "record",
  "records", "know", "knowledge",
]);

function searchBrain(updates: CompanyBrainUpdate[], query: string): CompanyBrainUpdate[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
  if (terms.length === 0) return [];
  return updates
    .map((u) => {
      const haystack = `${u.title} ${u.whatChanged} ${u.whyItMatters} ${u.draftUpdateText} ${u.recommendedRecord} ${u.status}`.toLowerCase();
      const score = terms.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
      return { u, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.u);
}

export function RoseOSBrainChat() {
  const { data } = useStore();
  const [messages, setMessages] = useState<BrainChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello Landon. I'm RoseOS. Ask me what the company has on record — I'll surface matching entries from the brain. Everything I return is a tracked suggestion until a human marks it Recorded.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const recordTypes = Array.from(new Set(data.brainUpdates.map((u) => u.recommendedRecord)));
  const quickPrompts = recordTypes.slice(0, 4).map((r) => `What's in the ${r}?`);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) return;

    const userMsg: BrainChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const matches = searchBrain(data.brainUpdates, q);
      const content =
        matches.length > 0
          ? `I found ${matches.length} record${matches.length === 1 ? "" : "s"} in the company brain related to that. These are draft/suggested entries — confirm against the recorded source and human review before acting on them.`
          : data.brainUpdates.length === 0
          ? "The company brain has no entries yet. File a suggestion above and it will become searchable here."
          : "I couldn't find a matching record for that. Try a different keyword, or file a new suggestion above so it's captured.";

      const assistantMsg: BrainChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        matches: matches.length > 0 ? matches : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 400);
  };

  return (
    <Card className="flex flex-col shadow-sm">
      <CardHeader className="border-b pb-4 bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Ask RoseOS
        </CardTitle>
      </CardHeader>

      <ScrollArea className="h-[320px] p-4">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-sidebar text-sidebar-foreground"
                  }`}
                >
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-lg text-sm ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.matches && (
                    <div className="space-y-2">
                      {msg.matches.map((m) => (
                        <div key={m.id} className="bg-card border rounded-md p-3 text-sm shadow-sm">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold">{m.title}</span>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {m.status}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] mb-2">
                            {m.recommendedRecord}
                          </Badge>
                          <p className="text-xs text-muted-foreground line-clamp-3">{m.whatChanged}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {quickPrompts.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {quickPrompts.map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => ask(p)}
            >
              <Sparkles className="w-3 h-3 text-primary" />
              {p}
            </Button>
          ))}
        </div>
      )}

      <div className="p-4 border-t bg-muted/10 mt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the company brain a question..."
            className="flex-1"
            aria-label="Ask the company brain a question"
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
