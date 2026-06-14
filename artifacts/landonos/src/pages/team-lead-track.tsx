import React from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/hooks/use-toast";
import {
  Rocket,
  Target,
  CheckCircle2,
  Clock,
  Circle,
  Users,
  ClipboardCheck,
  ShieldCheck,
  MessagesSquare,
  GraduationCap,
  Flag,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type CompStatus = "Complete" | "In Progress" | "Not Started";

type Competency = {
  id: string;
  label: string;
  desc: string;
  percent: number;
  status: CompStatus;
  icon: LucideIcon;
};

const COMPETENCIES: Competency[] = [
  { id: "c1", label: "Mentorship", desc: "Guide and onboard new researchers", percent: 100, status: "Complete", icon: Users },
  { id: "c2", label: "Review Leadership", desc: "Lead source & report reviews", percent: 80, status: "In Progress", icon: ClipboardCheck },
  { id: "c3", label: "Compliance Mastery", desc: "Own compliance-sensitive research", percent: 90, status: "In Progress", icon: ShieldCheck },
  { id: "c4", label: "Stakeholder Comms", desc: "Brief Rose, Carmen & Gregg directly", percent: 55, status: "In Progress", icon: MessagesSquare },
  { id: "c5", label: "Project Ownership", desc: "Run a research track end-to-end", percent: 40, status: "In Progress", icon: Flag },
  { id: "c6", label: "Coaching Certification", desc: "Complete the lead coaching module", percent: 0, status: "Not Started", icon: GraduationCap },
];

const STATUS_BADGE: Record<CompStatus, string> = {
  Complete: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  "In Progress": "border-sky-500/30 bg-sky-500/10 text-sky-700",
  "Not Started": "border-slate-500/30 bg-slate-500/10 text-slate-700",
};

const COMP_BAR: Record<CompStatus, string> = {
  Complete: "bg-emerald-500",
  "In Progress": "bg-sky-500",
  "Not Started": "bg-slate-400",
};

type Milestone = { id: string; label: string; note: string; state: "done" | "current" | "upcoming" };
const MILESTONES: Milestone[] = [
  { id: "m1", label: "Researcher", note: "Foundations certified", state: "done" },
  { id: "m2", label: "Senior Researcher", note: "Owns complex briefs", state: "done" },
  { id: "m3", label: "Lead Candidate", note: "Building leadership competencies", state: "current" },
  { id: "m4", label: "Team Lead", note: "Pending manager sign-off", state: "upcoming" },
];

const NEXT_STEPS = [
  "Co-lead the next compliance review with Carmen",
  "Complete the Lead Coaching certification module",
  "Own one research track from intake to handoff",
];

export default function TeamLeadTrackPage() {
  const { data } = useStore();
  const { toast } = useToast();
  const name = data.settings.userName || "Landon";

  const overall = Math.round(COMPETENCIES.reduce((s, c) => s + c.percent, 0) / COMPETENCIES.length);
  const met = COMPETENCIES.filter((c) => c.status === "Complete").length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Rocket}
        eyebrow="Leadership Development"
        title="Team Lead Track"
        subtitle={`${name}'s path toward leading a research team. Progress is reviewed and signed off by your manager.`}
        statsClassName="grid grid-cols-2 gap-3 shrink-0"
        stats={[
          { label: "Track Progress", value: `${overall}%`, icon: Target },
          { label: "Skills Met", value: `${met}/${COMPETENCIES.length}`, icon: CheckCircle2 },
        ]}
      />

      {/* Metric strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall Readiness" value={`${overall}%`} icon={Target} color="blue" hint="Toward Team Lead" />
        <StatCard label="Competencies Met" value={`${met}/${COMPETENCIES.length}`} icon={CheckCircle2} color="emerald" hint="Fully complete" />
        <StatCard label="Current Stage" value="3 of 4" icon={Rocket} color="indigo" hint="Lead candidate" />
        <StatCard label="Est. Promotion" value="Q4 2026" icon={Clock} color="sky" hint="With sign-off" />
      </div>

      {/* Overall readiness */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" /> Promotion Readiness
          </CardTitle>
          <CardDescription>Average across all leadership competencies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-foreground">{overall}%</div>
            <div className="text-sm text-muted-foreground">Team Lead readiness</div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${overall}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Milestones timeline */}
      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-indigo-600" /> Career Milestones
          </CardTitle>
          <CardDescription>Your progression from researcher to team lead.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MILESTONES.map((m) => {
              const done = m.state === "done";
              const current = m.state === "current";
              return (
                <div
                  key={m.id}
                  className={
                    "rounded-lg border px-4 py-4 " +
                    (current
                      ? "border-blue-500/40 bg-blue-500/5 ring-1 ring-blue-500/20"
                      : done
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border bg-card")
                  }
                >
                  <div className="mb-2 flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : current ? (
                      <Rocket className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                    <span className="text-sm font-semibold text-foreground">{m.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.note}</p>
                  {current && (
                    <Badge className="mt-2 border-blue-500/30 bg-blue-500/10 text-blue-700">You are here</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Competencies */}
      <Card className="border-t-4 border-t-teal-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-teal-600" /> Leadership Competencies
          </CardTitle>
          <CardDescription>Skills assessed by your manager toward the lead role.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {COMPETENCIES.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-500/10 text-teal-600">
                      <c.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{c.label}</div>
                      <div className="text-xs text-muted-foreground">{c.desc}</div>
                    </div>
                  </div>
                  <Badge className={STATUS_BADGE[c.status]}>{c.status}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${COMP_BAR[c.status]}`} style={{ width: `${c.percent}%` }} />
                  </div>
                  <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{c.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next steps */}
      <Card className="border-t-4 border-t-sky-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-sky-600" /> Recommended Next Steps
          </CardTitle>
          <CardDescription>Actions that move you closer to the lead role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {NEXT_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sm font-semibold text-sky-700">
                  {i + 1}
                </div>
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-indigo-500/25 bg-indigo-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Promotion requires manager review and sign-off.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast({ title: "Review requested", description: "Your manager has been asked to review your Team Lead progress." })}
            >
              Request Progress Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
