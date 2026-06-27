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
  Gauge as GaugeIcon,
  Lightbulb,
  Megaphone,
  Pin,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT, StatCard, type Accent } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Gauge } from "@/components/gauge";
import { levelProgress } from "@/lib/rewards";
import { levelAccent } from "@/lib/announcements";
import { EmptyState } from "@/components/empty-state";
import { PageLoadingSkeleton } from "@/components/page-loading";

const COMPLIANCE_TIPS = [
  "AI output is a draft, not a decision. Every claim needs a verifiable source before it reaches a reviewer.",
  "Prefer official primary sources. Flag anything AI-generated or unknown until a human confirms it.",
  "When you feel stuck, log a blocker early — a clear question gets a faster answer than a silent struggle.",
  "A good brief states the decision it supports. Lead with the recommendation, then the evidence.",
  "Never auto-record a company decision. RoseOS suggests; humans review and approve.",
];

const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon; color: Accent }[] = [
  { href: "/guided-research-builder?new=1", label: "Research Engine", icon: Target, color: "red" },
  { href: "/prompt-coach", label: "Tuning Bay", icon: MessageSquare, color: "slate" },
  { href: "/roseos-chat", label: "RoseOS Co-Driver", icon: ShieldCheck, color: "teal" },
  { href: "/report-builder", label: "Brief Builder", icon: FileText, color: "sky" },
  { href: "/blocked", label: "Pit Stop", icon: AlertTriangle, color: "rose" },
  { href: "/handoff", label: "Finish Line Handoff", icon: Send, color: "emerald" },
];

export default function Dashboard() {
  const { data, syncMode } = useStore();

  if (syncMode === "loading") {
    return <PageLoadingSkeleton />;
  }

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
    { label: "Open Requests", value: openRequests.length, icon: Target, color: "red" },
    { label: "Pit Stops", value: blockedItems.length, icon: AlertTriangle, color: "rose" },
    { label: "Briefs in Progress", value: reportsInProgress.length, icon: FileText, color: "sky" },
    { label: "Finished Handoffs", value: handoffsCompleted.length, icon: ShieldCheck, color: "emerald" },
  ];

  const riskySources = data.sources.filter(
    (s) => s.type === "AI Draft" || s.type === "Unknown"
  );

  const progress = levelProgress(data.rewardState.points);

  // ----- Performance gauges -----
  const verifiedSources = data.sources.length - riskySources.length;
  const sourceQuality = data.sources.length
    ? Math.round((verifiedSources / data.sources.length) * 100)
    : 0;

  const readyReports = data.reports.filter(
    (r) =>
      r.status === "Ready for Review" ||
      r.status === "Reviewed" ||
      r.status === "Approved"
  ).length;
  const reportReadiness = data.reports.length
    ? Math.round((readyReports / data.reports.length) * 100)
    : 0;

  const completedRequests = data.requests.filter((r) => r.status === "Completed").length;
  const researchVelocity = data.requests.length
    ? Math.round((completedRequests / data.requests.length) * 100)
    : 0;

  const gaugeTone = (v: number): "red" | "emerald" | "steel" =>
    v >= 70 ? "emerald" : v >= 40 ? "steel" : "red";

  const reviewRisk = data.sources.length
    ? Math.round((riskySources.length / data.sources.length) * 100)
    : 0;
  const riskTone = (v: number): "red" | "emerald" | "amber" =>
    v >= 60 ? "red" : v >= 30 ? "amber" : "emerald";

  const pipeline: { label: string; value: number; color: Accent }[] = [
    { label: "Requests", value: data.requests.length, color: "red" },
    { label: "Briefs", value: data.reports.length, color: "sky" },
    { label: "Sources", value: data.sources.length, color: "teal" },
    { label: "Handoffs", value: data.handoffs.length, color: "emerald" },
  ];

  const tip = COMPLIANCE_TIPS[new Date().getDate() % COMPLIANCE_TIPS.length];

  const LEVEL_RANK: Record<string, number> = { Critical: 0, Important: 1, Info: 2 };
  const activeAnnouncements = (data.announcements ?? [])
    .filter((a) => a.active)
    .slice()
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const rankDiff = (LEVEL_RANK[a.level] ?? 3) - (LEVEL_RANK[b.level] ?? 3);
      if (rankDiff !== 0) return rankDiff;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GaugeIcon}
        statusDot
        eyebrow="All systems operational"
        title="Performance Cockpit"
        subtitle="Your research command instrument cluster. Verify every source, keep humans in the loop."
        statsClassName="grid grid-cols-2 gap-3 shrink-0"
        action={
          <Link
            href="/guided-research-builder?new=1"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 min-h-10 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start New Research <ArrowRight className="h-4 w-4" />
          </Link>
        }
        stats={[
          { label: "Level", value: data.rewardState.level, icon: Award },
          { label: "Points", value: data.rewardState.points.toLocaleString(), icon: Activity },
        ]}
      />

      {/* Company broadcast — announcements from Race Control */}
      {activeAnnouncements.length > 0 && (
        <Card className="carbon relative overflow-hidden border-white/10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-sm shadow-red-500/40">
                  <Megaphone className="h-4 w-4" />
                </span>
                Race Control
              </CardTitle>
              <Link
                href="/announcements"
                className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CardDescription>Company announcements broadcast to everyone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAnnouncements.map((a) => {
              const accent = ACCENT[levelAccent(a.level)];
              return (
                <Link
                  key={a.id}
                  href="/announcements"
                  className={cn(
                    "flex items-start gap-3 rounded-lg border border-l-4 p-3 transition-colors hover:bg-muted/40",
                    accent.borderL
                  )}
                >
                  <span className={cn("mt-1 flex h-2 w-2 shrink-0 rounded-full", accent.iconSolid)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {a.pinned && <Pin className={cn("h-3 w-3 shrink-0", accent.text)} />}
                      <span className="truncate text-sm font-semibold text-foreground">{a.title}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{a.body}</p>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", accent.soft, accent.text)}>
                    {a.level}
                  </Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Instrument cluster — performance gauges */}
      <Card className="carbon relative overflow-hidden border-white/10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-sm shadow-red-500/40">
              <GaugeIcon className="w-4 h-4" />
            </span>
            Instrument Cluster
          </CardTitle>
          <CardDescription>Live performance read-outs across your research operation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-center rounded-lg border border-white/10 bg-black/20 py-5">
              <Gauge
                value={sourceQuality}
                tone={gaugeTone(sourceQuality)}
                label="Source Quality"
                sublabel="Official"
              />
            </div>
            <div className="flex items-center justify-center rounded-lg border border-white/10 bg-black/20 py-5">
              <Gauge
                value={reportReadiness}
                tone={gaugeTone(reportReadiness)}
                label="Report Readiness"
                sublabel="Ready"
              />
            </div>
            <div className="flex items-center justify-center rounded-lg border border-white/10 bg-black/20 py-5">
              <Gauge
                value={researchVelocity}
                tone={gaugeTone(researchVelocity)}
                label="Research Velocity"
                sublabel="Completed"
              />
            </div>
            <div className="flex items-center justify-center rounded-lg border border-white/10 bg-black/20 py-5">
              <Gauge
                value={reviewRisk}
                tone={riskTone(reviewRisk)}
                label="Human Review Risk"
                sublabel="Unverified"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {QUICK_ACTIONS.map((a) => {
          const c = ACCENT[a.color];
          return (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                "group h-24 min-h-[5.5rem] flex flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
              <span className="text-xs font-semibold text-foreground text-center px-1">{a.label}</span>
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
        <Card className="relative overflow-hidden border-t-4 border-t-red-500 bg-gradient-to-br from-red-500/10 to-transparent lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-sm shadow-red-500/40">
                <Award className="w-4 h-4" />
              </span>
              Driver Standing
            </CardTitle>
            <CardDescription>{progress.current.level}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold tabular-nums text-red-400">
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
              <p className="text-xs font-medium text-emerald-400">Top level reached. Outstanding work.</p>
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
      <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/10 to-transparent">
        <CardContent className="flex items-start gap-3 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm shadow-red-500/40">
            <Lightbulb className="h-4.5 w-4.5" />
          </span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-red-400">
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
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-sm shadow-red-500/40">
                <ListChecks className="w-4 h-4" />
              </span>
              Today's Research Priorities
            </CardTitle>
            <CardDescription>Items needing your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {openRequests.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No open requests"
                description="You're caught up. Start a new research request when the next question lands."
                action={
                  <Link
                    href="/guided-research-builder?new=1"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 min-h-10 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/80"
                  >
                    Start New Research <ArrowRight className="h-4 w-4" />
                  </Link>
                }
                className="border-solid bg-muted/5 p-8"
              />
            ) : (
              openRequests.map((req) => {
                const urgent = req.priority === "Executive" || req.priority === "High";
                return (
                  <Link
                    key={req.id}
                    href="/guided-research-builder"
                    className={cn(
                      "flex flex-col space-y-2 p-3 border border-l-4 rounded-md transition-colors hover:bg-muted/40 active:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      urgent ? "border-l-red-500" : "border-l-sky-500"
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
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Source Quality Warnings */}
        <Card className="col-span-1 border-destructive/30 bg-gradient-to-br from-red-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-sm shadow-red-500/40">
                <AlertTriangle className="w-4 h-4" />
              </span>
              Source Quality Warnings
            </CardTitle>
            <CardDescription>Sources requiring human review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskySources.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="All sources verified"
                  description="No AI drafts or unknown sources need review right now."
                  action={
                    <Link
                      href="/source-vault"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      Open Source Garage <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  }
                  className="border-none bg-transparent p-4"
                />
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
