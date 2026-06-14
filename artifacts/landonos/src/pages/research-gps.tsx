import React, { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { GPS_STEPS } from "@/lib/default-data";
import { Status, ResearchRequest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Compass, CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_BORDER: Record<Status, string> = {
  "Complete": "border-l-emerald-500 bg-emerald-500/5",
  "In Progress": "border-l-blue-500 bg-blue-500/5",
  "Needs Help": "border-l-rose-500 bg-rose-500/5",
  "Not Started": "border-l-slate-300 bg-card",
};

const STEP_CHIP: Record<Status, string> = {
  "Complete": "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30",
  "In Progress": "bg-blue-500 text-white shadow-sm shadow-blue-500/30",
  "Needs Help": "bg-rose-500 text-white shadow-sm shadow-rose-500/30",
  "Not Started": "bg-slate-100 text-slate-500",
};

export default function ResearchGPS() {
  const { data, updateData } = useStore();
  const [selectedReqId, setSelectedReqId] = useState<string>("");

  const activeRequest = data.requests.find(r => r.id === selectedReqId);

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "Complete": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "In Progress": return <Clock className="w-5 h-5 text-blue-500" />;
      case "Needs Help": return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground/30" />;
    }
  };

  const handleStatusChange = (step: string, status: Status) => {
    if (!activeRequest) return;
    
    updateData(prev => ({
      ...prev,
      requests: prev.requests.map(r => {
        if (r.id === activeRequest.id) {
          return {
            ...r,
            gpsSteps: {
              ...r.gpsSteps,
              [step]: status
            }
          };
        }
        return r;
      })
    }));
  };

  const calculateProgress = (req: ResearchRequest) => {
    if (!req || !req.gpsSteps) return 0;
    const total = GPS_STEPS.length;
    const completed = GPS_STEPS.filter(s => req.gpsSteps[s] === "Complete").length;
    return Math.round((completed / total) * 100);
  };

  const activeMissions = data.requests.filter((r) => r.status !== "Archived");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Executive hero banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15 backdrop-blur">
              <Compass className="h-3.5 w-3.5" />
              10-step workflow
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Research GPS
            </h1>
            <p className="mt-1.5 max-w-xl text-sm md:text-base text-blue-100/80">
              Navigate every research mission through a disciplined, auditable 10-step path — from scoping the question to handoff for human review.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <CheckCircle2 className="h-3.5 w-3.5" /> Workflow Steps
              </div>
              <div className="mt-1 text-2xl font-bold text-white">{GPS_STEPS.length}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <Clock className="h-3.5 w-3.5" /> Active Missions
              </div>
              <div className="mt-1 text-2xl font-bold text-white">{activeMissions.length}</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-t-4 border-t-blue-500">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Select Active Mission</CardTitle>
          <Select value={selectedReqId} onValueChange={setSelectedReqId}>
            <SelectTrigger className="w-full h-12 text-base">
              <SelectValue placeholder="Choose a research request..." />
            </SelectTrigger>
            <SelectContent>
              {data.requests.filter(r => r.status !== 'Archived').length === 0 ? (
                <SelectItem value="none" disabled>No active requests available</SelectItem>
              ) : (
                data.requests.filter(r => r.status !== 'Archived').map(req => (
                  <SelectItem key={req.id} value={req.id}>
                    {req.title} <span className="text-muted-foreground text-xs ml-2">({req.type})</span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardHeader>
      </Card>

      {!activeRequest ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
          <Compass className="w-12 h-12 mb-4 opacity-20" />
          <p>Select a research request to view its GPS path.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {(() => {
            const completedCount = GPS_STEPS.filter(s => activeRequest.gpsSteps[s] === "Complete").length;
            const pct = calculateProgress(activeRequest);
            return (
              <Card className="border-t-4 border-t-emerald-500 bg-gradient-to-br from-emerald-500/10 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                      <ListChecks className="w-4 h-4" />
                    </span>
                    Mission Progress
                  </CardTitle>
                  <CardDescription>How far this research has moved through the 10-step path</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold tabular-nums text-emerald-700">
                      {completedCount} <span className="text-base font-medium text-muted-foreground">of {GPS_STEPS.length} complete</span>
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-emerald-700">{pct}%</div>
                  </div>
                  <Progress value={pct} className="h-2" />
                </CardContent>
              </Card>
            );
          })()}

          <Card className="relative overflow-hidden border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 text-white shadow-lg">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_55%)]" />
            <CardContent className="relative p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2 w-full">
                <h2 className="text-xl font-bold">{activeRequest.title}</h2>
                <div className="flex items-center gap-2 text-sm text-blue-100/80">
                  <Badge variant="outline" className="border-white/25 text-white">{activeRequest.type}</Badge>
                  <span className="flex items-center"><ArrowRight className="w-3 h-3 mx-1" /> {activeRequest.reviewer}</span>
                </div>
              </div>
              <div className="w-full md:w-64 shrink-0 space-y-2">
                <div className="flex justify-between text-sm font-medium text-blue-100">
                  <span>Overall Progress</span>
                  <span>{calculateProgress(activeRequest)}%</span>
                </div>
                <Progress value={calculateProgress(activeRequest)} className="h-2 bg-white/15" />
              </div>
            </CardContent>
          </Card>

          <div className="relative">
            {/* Vertical path line */}
            <div className="absolute left-6 md:left-[2.25rem] top-4 bottom-4 w-px bg-border/50 hidden sm:block"></div>

            <div className="space-y-4 relative z-10">
              {GPS_STEPS.map((step, index) => {
                const currentStatus = activeRequest.gpsSteps[step] || "Not Started";
                return (
                  <Card key={step} className={cn("border-l-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", STEP_BORDER[currentStatus])}>
                    <div className="flex items-center p-4">
                      <div className={cn("hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center mr-4 z-10 font-mono text-xs font-semibold", STEP_CHIP[currentStatus])}>
                        {index + 1}
                      </div>
                      
                      <div className="shrink-0 mr-4">
                        {getStatusIcon(currentStatus)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={cn("font-medium text-base", currentStatus === "Complete" && "text-muted-foreground line-through decoration-muted-foreground/30")}>
                          {step}
                        </h3>
                      </div>
                      
                      <div className="shrink-0 ml-4">
                        <Select 
                          value={currentStatus} 
                          onValueChange={(val) => handleStatusChange(step, val as Status)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Complete">Complete</SelectItem>
                            <SelectItem value="Needs Help">Needs Help</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
