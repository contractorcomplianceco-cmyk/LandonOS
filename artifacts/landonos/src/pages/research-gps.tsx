import React, { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { GPS_STEPS } from "@/lib/default-data";
import { Status, ResearchRequest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gauge } from "@/components/gauge";
import { Compass, CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

const STEP_BORDER: Record<Status, string> = {
  "Complete": "border-l-emerald-500 bg-emerald-500/5",
  "In Progress": "border-l-sky-500 bg-sky-500/5",
  "Needs Help": "border-l-rose-500 bg-rose-500/5",
  "Not Started": "border-l-slate-300 bg-card",
};

const STEP_CHIP: Record<Status, string> = {
  "Complete": "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30",
  "In Progress": "bg-sky-500 text-white shadow-sm shadow-sky-500/30",
  "Needs Help": "bg-rose-500 text-white shadow-sm shadow-rose-500/30",
  "Not Started": "bg-slate-700 text-slate-300",
};

export default function ResearchGPS() {
  const { data, updateData } = useStore();
  const [selectedReqId, setSelectedReqId] = useState<string>("");

  const activeRequest = data.requests.find(r => r.id === selectedReqId);

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "Complete": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "In Progress": return <Clock className="w-5 h-5 text-sky-300" />;
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
      <PageHeader
        icon={Compass}
        eyebrow="10-step workflow"
        title="Track Map"
        subtitle="Navigate every research mission through a disciplined, auditable 10-step path — from scoping the question to handoff for human review."
        statsClassName="grid grid-cols-2 gap-3 shrink-0"
        stats={[
          { label: "Workflow Steps", value: GPS_STEPS.length, icon: CheckCircle2 },
          { label: "Active Missions", value: activeMissions.length, icon: Clock },
        ]}
      />

      <Card className="border-t-4 border-t-sky-500">
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
        <EmptyState
          icon={Compass}
          description="Select a research request to view its GPS path."
          className="h-64"
        />
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
                <CardContent>
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                    <div className="flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 px-6 py-4">
                      <Gauge
                        value={pct}
                        tone={pct >= 70 ? "emerald" : pct >= 40 ? "steel" : "red"}
                        label="Research Progress"
                        sublabel="Steps done"
                      />
                    </div>
                    <div className="w-full flex-1 space-y-3">
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold tabular-nums text-emerald-400">
                          {completedCount} <span className="text-base font-medium text-muted-foreground">of {GPS_STEPS.length} complete</span>
                        </div>
                        <div className="text-sm font-semibold tabular-nums text-emerald-400">{pct}%</div>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          <Card className="carbon relative overflow-hidden border-white/10 text-white shadow-lg">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.22),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            <CardContent className="relative p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2 w-full">
                <h2 className="text-xl font-bold">{activeRequest.title}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Badge variant="outline" className="border-white/25 text-white">{activeRequest.type}</Badge>
                  <span className="flex items-center"><ArrowRight className="w-3 h-3 mx-1" /> {activeRequest.reviewer}</span>
                </div>
              </div>
              <div className="w-full md:w-64 shrink-0 space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-200">
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
