import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT, StatCard, type Accent } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { levelProgress } from "@/lib/rewards";

const COMPLIANCE_TIPS = [
  "AI output is a draft, not a decision. Every claim needs a verifiable source before it reaches a reviewer.",
  "Prefer official primary sources. Flag anything AI-generated or unknown until a human confirms it.",
  "When you feel stuck, log a blocker early — a clear question gets a faster answer than a silent struggle.",
  "A good brief states the decision it supports. Lead with the recommendation, then the evidence.",
  "Never auto-record a company decision. RoseOS suggests; humans review and approve.",
];

const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon; color: Accent }[] = [
  { href: "/guided-research-builder?new=1", label: "New Research", icon: Target, color: "blue" },
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

  const progress = levelProgress(data.rewardState.points);

  const pipeline: { label: string; value: number; color: Accent }[] = [
    { label: "Requests", value: data.requests.length, color: "blue" },
    { label: "Reports", value: data.reports.length, color: "sky" },
    { label: "Sources", value: data.sources.length, color: "teal" },
    { label: "Handoffs", value: data.handoffs.length, color: "emerald" },
  ];

  const tip = COMPLIANCE_TIPS[new Date().getDate() % COMPLIANCE_TIPS.length];

  return (
    <div className="space-y-6">
      <PageHeader
        statusDot
        eyebrow="All systems operational"
        title="Command Center"
        subtitle="AI-guided compliance and business research cockpit. Verify every source, keep humans in the loop."
        statsClassName="grid grid-cols-2 gap-3 shrink-0"
        action={
          <Link
            href="/guided-research-builder?new=1"
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
          >
            Start New Research <ArrowRight className="h-4 w-4" />
          </Link>
        }
        stats={[
          { label: "Level", value: data.rewardState.level, icon: Award },
          { label: "Points", value: data.rewardState.points.toLocaleString(), icon: Activity },
        ]}
      />

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
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>

      {/* Progress + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Level progress */}
        <Card className="relative overflow-hidden border-t-4 border-t-indigo-500 bg-gradient-to-br from-indigo-500/10 to-transparent lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500 text-white shadow-sm shadow-indigo-500/30">
                <TrendingUp className="w-4 h-4" />
              </span>
              Your Progress
            </CardTitle>
            <CardDescription>{progress.current.level}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold tabular-nums text-indigo-700">
                {data.rewardState.points.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">points</div>
            </div>
            <Progress value={progress.percent} />
            {progress.next ? (
              <p className="text-xs text-muted-foreground">
                {(progress.pointsForNext - progress.pointsIntoLevel).toLocaleString()} pts to{" "}
                <span className="font-semibold text-foreground">{progress.next.level}</span>
              </p>
            ) : (
              <p className="text-xs font-medium text-emerald-600">Top level reached. Outstanding work.</p>
            )}
          </CardContent>
        </Card>

        {/* Research pipeline */}
        <Card className="relative overflow-hidden border-t-4 border-t-sky-500 bg-gradient-to-br from-sky-500/10 to-transparent lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500 text-white shadow-sm shadow-sky-500/30">
                <Activity className="w-4 h-4" />
              </span>
              Research Pipeline
            </CardTitle>
            <CardDescription>Where your work stands across the workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pipeline.map((p) => {
                const c = ACCENT[p.color];
                return (
                  <div
                    key={p.label}
                    className={cn("rounded-lg border p-3 text-center transition-colors", c.soft)}
                  >
                    <div className={cn("text-2xl font-bold tabular-nums", c.value)}>{p.value}</div>
                    <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {p.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance tip of the day */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent">
        <CardContent className="flex items-start gap-3 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-500/30">
            <Lightbulb className="h-4.5 w-4.5" />
          </span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Compliance Tip
            </div>
            <p className="mt-0.5 text-sm text-foreground">{tip}</p>
          </div>
        </CardContent>
      </Card>

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
