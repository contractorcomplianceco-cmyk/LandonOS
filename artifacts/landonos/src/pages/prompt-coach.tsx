import React, { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePromptImprovement } from "@/lib/prompt-coach-templates";
import { Sparkles, Target, Database, FileText, CheckCircle2, ShieldAlert, ArrowRight, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PromptCoach() {
  const { data } = useStore();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [researchType, setResearchType] = useState("Compliance");
  const [intendedOutput, setIntendedOutput] = useState("");
  const [requiredSources, setRequiredSources] = useState("");
  const [reviewer, setReviewer] = useState("");

  const [result, setResult] = useState<{improved: string, why: string} | null>(null);

  const handleAction = (action: string) => {
    if (!prompt) {
      toast({ title: "No prompt provided", description: "Please enter a rough prompt first.", variant: "destructive" });
      return;
    }

    const context = {
      type: researchType,
      intendedOutput,
      requiredSources,
      reviewer
    };

    const res = generatePromptImprovement(action, prompt, context);
    setResult(res);
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.improved);
      toast({ title: "Copied", description: "Improved prompt copied to clipboard." });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Executive hero banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Prompt engineering
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              AI Prompt Coach
            </h1>
            <p className="mt-1.5 max-w-xl text-sm md:text-base text-blue-100/80">
              Transform rough questions into disciplined, source-backed executive prompts. Every rewrite keeps verification and human review in the loop.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <Target className="h-3.5 w-3.5" /> Strategies
              </div>
              <div className="mt-1 text-2xl font-bold text-white">6</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <ShieldAlert className="h-3.5 w-3.5" /> Output
              </div>
              <div className="mt-1 text-sm font-bold text-white">Draft until reviewed</div>
            </div>
          </div>
        </div>
      </div>

      <Alert variant="default" className="bg-destructive/10 text-destructive border-destructive/20">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Compliance Guardrail Active</AlertTitle>
        <AlertDescription>
          AI output is draft only until source-checked and human-reviewed. Do not use AI generated conclusions for final business decisions without verification.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-md shadow-blue-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Prompt Context</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rough Prompt / Question *</Label>
                <Textarea 
                  placeholder="e.g., What are the rules for data residency in Europe?" 
                  className="min-h-[120px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Research Type</Label>
                <Select value={researchType} onValueChange={setResearchType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {data.settings.researchTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Intended Output</Label>
                <Input 
                  placeholder="e.g., Executive Summary, Vendor Comparison" 
                  value={intendedOutput}
                  onChange={(e) => setIntendedOutput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Required Sources</Label>
                <Input 
                  placeholder="e.g., GDPR Article 28, SOC 2 Reports" 
                  value={requiredSources}
                  onChange={(e) => setRequiredSources(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Reviewer</Label>
                <Input 
                  placeholder="e.g., Rose, Carmen" 
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Optimization strategies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="default" className="w-full justify-start" onClick={() => handleAction("improve")}>
              <Sparkles className="w-4 h-4 mr-2" /> Improve my prompt
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => handleAction("specific")}>
              <Target className="w-4 h-4 mr-2" /> Make it specific
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => handleAction("sources")}>
              <Database className="w-4 h-4 mr-2" /> Add source locks
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => handleAction("executive")}>
              <FileText className="w-4 h-4 mr-2" /> Executive format
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleAction("questions")}>
              <span className="font-serif italic mr-2 text-lg leading-none">?</span> Follow-up questions
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleAction("assumptions")}>
              <ShieldAlert className="w-4 h-4 mr-2" /> Check assumptions
            </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <Card className="border-primary/50 shadow-md">
                <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-primary flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Optimized Prompt
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>Copy</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="font-mono text-sm leading-relaxed p-4 bg-sidebar text-sidebar-foreground rounded-md whitespace-pre-wrap">
                    {result.improved}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 border-t flex flex-col items-start gap-2">
                  <div className="flex items-center text-sm font-semibold text-foreground">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Why this is better:
                  </div>
                  <p className="text-sm text-muted-foreground">{result.why}</p>
                </CardFooter>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Original Input</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic text-foreground opacity-80">"{prompt}"</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Source Requirement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">
                      {requiredSources ? requiredSources : <span className="text-destructive flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> None specified</span>}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="h-full min-h-[400px] border-dashed border-2 flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-transparent">
              <Sparkles className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-2">Prompt Optimization</h3>
              <p className="max-w-md text-sm">Enter a rough question and select an optimization strategy. The coach will rewrite your prompt to ensure executive quality and strict source adherence.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
