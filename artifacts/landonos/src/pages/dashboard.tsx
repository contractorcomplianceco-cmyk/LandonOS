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
  Award,
  ArrowRight,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "blue" | "indigo" | "teal" | "sky" | "rose" | "emerald";

const ACCENT: Record<
  Accent,
  {
    value: string;
    borderT: string;
    grad: string;
    iconSolid: string;
    iconShadow: string;
    hover: string;
  }
> = {
  blue: {
    value: "text-blue-700",
    borderT: "border-t-blue-500",
    grad: "from-blue-500/10 to-transparent",
    iconSolid: "bg-blue-500",
    iconShadow: "shadow-blue-500/30",
    hover: "hover:border-blue-500/50 hover:bg-blue-500/5",
  },
  indigo: {
    value: "text-indigo-700",
    borderT: "border-t-indigo-500",
    grad: "from-indigo-500/10 to-transparent",
    iconSolid: "bg-indigo-500",
    iconShadow: "shadow-indigo-500/30",
    hover: "hover:border-indigo-500/50 hover:bg-indigo-500/5",
  },
  teal: {
    value: "text-teal-700",
    borderT: "border-t-teal-500",
    grad: "from-teal-500/10 to-transparent",
    iconSolid: "bg-teal-500",
    iconShadow: "shadow-teal-500/30",
    hover: "hover:border-teal-500/50 hover:bg-teal-500/5",
  },
  sky: {
    value: "text-sky-700",
    borderT: "border-t-sky-500",
    grad: "from-sky-500/10 to-transparent",
    iconSolid: "bg-sky-500",
    iconShadow: "shadow-sky-500/30",
    hover: "hover:border-sky-500/50 hover:bg-sky-500/5",
  },
  rose: {
    value: "text-rose-700",
    borderT: "border-t-rose-500",
    grad: "from-rose-500/10 to-transparent",
    iconSolid: "bg-rose-500",
    iconShadow: "shadow-rose-500/30",
    hover: "hover:border-rose-500/50 hover:bg-rose-500/5",
  },
  emerald: {
    value: "text-emerald-700",
    borderT: "border-t-emerald-500",
    grad: "from-emerald-500/10 to-transparent",
    iconSolid: "bg-emerald-500",
    iconShadow: "shadow-emerald-500/30",
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
      {/* Executive hero banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              All systems operational
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Command Center
            </h1>
            <p className="mt-1.5 max-w-xl text-sm md:text-base text-blue-100/80">
              AI-guided compliance and business research cockpit. Verify every source, keep humans in the loop.
            </p>
            <Link
              href="/guided-research-builder"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
            >
              Start New Research <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex shrink-0 items-stretch gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <Award className="h-3.5 w-3.5" /> Level
              </div>
              <div className="mt-1 text-lg font-bold text-white">{data.rewardState.level}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <Activity className="h-3.5 w-3.5" /> Points
              </div>
              <div className="mt-1 text-lg font-bold text-white">
                {data.rewardState.points.toLocaleString()}
              </div>
            </div>
          </div>
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
                "group h-24 flex flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                c.hover
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm transition-transform group-hover:scale-110",
                  c.iconSolid,
                  c.iconShadow
                )}
              >
                <a.icon className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold text-foreground">{a.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const c = ACCENT[s.color];
          return (
            <Card
              key={s.label}
              className={cn(
                "relative overflow-hidden border-t-4 bg-gradient-to-br transition-shadow hover:shadow-lg",
                c.borderT,
                c.grad
              )}
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                    <div className={cn("mt-2 text-4xl font-bold tabular-nums", c.value)}>
                      {s.value}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md",
                      c.iconSolid,
                      c.iconShadow
                    )}
                  >
                    <s.icon className="w-6 h-6" />
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
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white shadow-sm shadow-blue-500/30">
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
                      "flex flex-col space-y-2 p-3 border border-l-4 rounded-md transition-colors hover:bg-muted/40",
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
        <Card className="col-span-1 border-destructive/30 bg-gradient-to-br from-rose-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-500 text-white shadow-sm shadow-rose-500/30">
                <AlertTriangle className="w-4 h-4" />
              </span>
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
