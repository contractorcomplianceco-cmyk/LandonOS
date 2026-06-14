import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  FileText,
  Target,
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
  Send,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "blue" | "indigo" | "teal" | "sky" | "rose" | "emerald";

const ACCENT: Record<
  Accent,
  { tile: string; value: string; borderL: string; hover: string }
> = {
  blue: {
    tile: "bg-blue-500/10 text-blue-600",
    value: "text-blue-600",
    borderL: "border-l-blue-500",
    hover: "hover:border-blue-500/50 hover:bg-blue-500/5",
  },
  indigo: {
    tile: "bg-indigo-500/10 text-indigo-600",
    value: "text-indigo-600",
    borderL: "border-l-indigo-500",
    hover: "hover:border-indigo-500/50 hover:bg-indigo-500/5",
  },
  teal: {
    tile: "bg-teal-500/10 text-teal-600",
    value: "text-teal-600",
    borderL: "border-l-teal-500",
    hover: "hover:border-teal-500/50 hover:bg-teal-500/5",
  },
  sky: {
    tile: "bg-sky-500/10 text-sky-600",
    value: "text-sky-600",
    borderL: "border-l-sky-500",
    hover: "hover:border-sky-500/50 hover:bg-sky-500/5",
  },
  rose: {
    tile: "bg-rose-500/10 text-rose-600",
    value: "text-rose-600",
    borderL: "border-l-rose-500",
    hover: "hover:border-rose-500/50 hover:bg-rose-500/5",
  },
  emerald: {
    tile: "bg-emerald-500/10 text-emerald-600",
    value: "text-emerald-600",
    borderL: "border-l-emerald-500",
    hover: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
  },
};

const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon; color: Accent }[] = [
  { href: "/guided-research-builder", label: "New Research", icon: Target, color: "blue" },
  { href: "/prompt-coach", label: "Prompt Coach", icon: MessageSquare, color: "indigo" },
  { href: "/roseos-chat", label: "Ask RoseOS", icon: ShieldCheck, color: "teal" },
  { href: "/report-builder", label: "Build Report", icon: FileText, color: "sky" },
  { href: "/blocked", label: "I'm Blocked", icon: AlertTriangle, color: "rose" },
  { href: "/handoff", label: "Create Handoff", icon: Send, color: "emerald" },
];

export default function Dashboard() {
  const { data } = useStore();

  const openRequests = data.requests.filter(
    (r) => r.status === "Open" || r.status === "In Progress"
  );
  const blockedItems = data.blockers.filter(
    (b) => b.status === "Open" || b.status === "In Review"
  );
  const reportsInProgress = data.reports.filter(
    (r) => r.status === "Draft" || r.status === "Needs Sources"
  );
  const handoffsCompleted = data.handoffs.filter((h) => h.status === "Approved");

  const stats: { label: string; value: number; icon: LucideIcon; color: Accent }[] = [
    { label: "Open Requests", value: openRequests.length, icon: Target, color: "blue" },
    { label: "Blocked Items", value: blockedItems.length, icon: AlertTriangle, color: "rose" },
    { label: "Reports in Progress", value: reportsInProgress.length, icon: FileText, color: "sky" },
    { label: "Completed Handoffs", value: handoffsCompleted.length, icon: ShieldCheck, color: "emerald" },
  ];

  const riskySources = data.sources.filter(
    (s) => s.type === "AI Draft" || s.type === "Unknown"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
          <p className="text-muted-foreground">AI-guided compliance and business research cockpit</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
            {data.rewardState.level}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            {data.rewardState.points} pts
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {QUICK_ACTIONS.map((a) => {
          const c = ACCENT[a.color];
          return (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                "h-24 flex flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-card transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                c.hover
              )}
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.tile)}>
                <a.icon className="w-5 h-5" />
              </span>
              <span className="text-xs font-medium text-foreground">{a.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const c = ACCENT[s.color];
          return (
            <Card key={s.label} className={cn("border-l-4", c.borderL)}>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
                    <div className={cn("text-3xl font-bold mt-1", c.value)}>{s.value}</div>
                  </div>
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg", c.tile)}>
                    <s.icon className="w-5 h-5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Priorities */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600">
                <ListChecks className="w-4 h-4" />
              </span>
              Today's Research Priorities
            </CardTitle>
            <CardDescription>Items needing your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {openRequests.length === 0 ? (
              <div className="text-sm text-muted-foreground italic p-4 text-center border rounded-md">
                No open requests. Great job!
              </div>
            ) : (
              openRequests.map((req) => {
                const urgent = req.priority === "Executive" || req.priority === "High";
                return (
                  <div
                    key={req.id}
                    className={cn(
                      "flex flex-col space-y-2 p-3 border border-l-4 rounded-md",
                      urgent ? "border-l-rose-500" : "border-l-blue-500"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{req.title}</span>
                      <Badge variant={urgent ? "destructive" : "secondary"}>{req.priority}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Due: {req.dueDate}</span>
                      <span>Reviewer: {req.reviewer}</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Source Quality Warnings */}
        <Card className="col-span-1 border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Source Quality Warnings
            </CardTitle>
            <CardDescription>Sources requiring human review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskySources.length === 0 ? (
                <div className="text-sm text-muted-foreground italic">
                  No risky sources currently attached to open requests.
                </div>
              ) : (
                riskySources.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col space-y-1 p-3 bg-background border border-destructive/20 rounded-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{s.title}</span>
                      <Badge variant="outline" className="text-destructive border-destructive">
                        {s.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.notes || "Needs verification."}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
