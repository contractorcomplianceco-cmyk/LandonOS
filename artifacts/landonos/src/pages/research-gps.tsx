import React, { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { GPS_STEPS } from "@/lib/default-data";
import { Status, ResearchRequest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Compass, CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResearchGPS() {
  const { data, updateData } = useStore();
  const [selectedReqId, setSelectedReqId] = useState<string>("");

  const activeRequest = data.requests.find(r => r.id === selectedReqId);

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "Complete": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "In Progress": return <Clock className="w-5 h-5 text-primary" />;
      case "Needs Help": return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground/30" />;
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Complete": return "border-green-500/50 bg-green-500/10";
      case "In Progress": return "border-primary/50 bg-primary/10";
      case "Needs Help": return "border-destructive/50 bg-destructive/10";
      default: return "border-border bg-card";
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Compass className="w-8 h-8 mr-3 text-primary" />
            Research GPS
          </h1>
          <p className="text-muted-foreground">Navigate the 10-step executive research workflow.</p>
        </div>
      </div>

      <Card>
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
          <Card className="bg-sidebar text-sidebar-foreground border-sidebar-border">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2 w-full">
                <h2 className="text-xl font-bold">{activeRequest.title}</h2>
                <div className="flex gap-2 text-sm text-sidebar-foreground/70">
                  <Badge variant="outline" className="border-sidebar-foreground/20 text-sidebar-foreground">{activeRequest.type}</Badge>
                  <span className="flex items-center"><ArrowRight className="w-3 h-3 mx-1" /> {activeRequest.reviewer}</span>
                </div>
              </div>
              <div className="w-full md:w-64 shrink-0 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Overall Progress</span>
                  <span>{calculateProgress(activeRequest)}%</span>
                </div>
                <Progress value={calculateProgress(activeRequest)} className="h-2" />
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
                  <Card key={step} className={cn("transition-colors duration-200", getStatusColor(currentStatus))}>
                    <div className="flex items-center p-4">
                      <div className="hidden sm:flex shrink-0 w-8 h-8 rounded-full bg-background border items-center justify-center mr-4 z-10 font-mono text-xs text-muted-foreground">
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
