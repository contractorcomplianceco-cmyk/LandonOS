import React from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, type Accent } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { FeatureScopeNotice } from "@/components/feature-scope-notice";
import {
  Wallet,
  TrendingUp,
  Banknote,
  Clock,
  Target,
  Award,
  Zap,
  Users,
  Lock,
  type LucideIcon,
} from "lucide-react";

type BonusStatus = "Paid" | "Pending" | "Under Review";

type BonusEntry = {
  id: string;
  label: string;
  type: string;
  amount: number;
  date: string;
  status: BonusStatus;
  icon: LucideIcon;
  accent: Accent;
};

const ENTRIES: BonusEntry[] = [
  { id: "b1", label: "Q2 Research Milestone", type: "Milestone", amount: 850, date: "Jun 1, 2026", status: "Paid", icon: Target, accent: "blue" },
  { id: "b2", label: "Source Quality Streak", type: "Quality", amount: 300, date: "May 22, 2026", status: "Paid", icon: Award, accent: "emerald" },
  { id: "b3", label: "Fast Turnaround — 5 reports", type: "Speed", amount: 250, date: "May 10, 2026", status: "Paid", icon: Zap, accent: "sky" },
  { id: "b4", label: "Peer Recognition — Carmen", type: "Recognition", amount: 150, date: "Jun 8, 2026", status: "Pending", icon: Users, accent: "indigo" },
  { id: "b5", label: "Compliance Accuracy Bonus", type: "Quality", amount: 400, date: "Jun 12, 2026", status: "Under Review", icon: Award, accent: "teal" },
];

const STATUS_BADGE: Record<BonusStatus, string> = {
  Paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Pending: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  "Under Review": "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

const CATEGORIES: { label: string; amount: number; bar: string }[] = [
  { label: "Milestone", amount: 850, bar: "bg-sky-500" },
  { label: "Quality", amount: 700, bar: "bg-teal-500" },
  { label: "Speed", amount: 250, bar: "bg-sky-500" },
  { label: "Recognition", amount: 150, bar: "bg-slate-500" },
];

export default function BonusTrackerPage() {
  const { data } = useStore();
  const name = data.settings.userName || "Landon";

  const paid = ENTRIES.filter((e) => e.status === "Paid").reduce((s, e) => s + e.amount, 0);
  const pending = ENTRIES.filter((e) => e.status !== "Paid").reduce((s, e) => s + e.amount, 0);
  const ytd = paid + pending;
  const target = 4000;
  const pct = Math.min(100, Math.round((ytd / target) * 100));
  const maxCat = Math.max(...CATEGORIES.map((c) => c.amount));

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wallet}
        eyebrow="Incentive & Bonus Tracker"
        title="Bonus Tracker"
        subtitle={`${name}'s performance incentives for the year. Amounts are calculated by Finance and paid through Payroll — informational only.`}
        statsClassName="grid grid-cols-2 gap-3 shrink-0"
        stats={[
          { label: "Earned YTD", value: fmt(ytd), icon: TrendingUp },
          { label: "Pending", value: fmt(pending), icon: Clock },
        ]}
      />

      <FeatureScopeNotice scope="hr-preview" />

      {/* Metric strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Paid Out" value={fmt(paid)} icon={Banknote} color="emerald" hint="Cleared by Payroll" />
        <StatCard label="Pending Review" value={fmt(pending)} icon={Clock} color="sky" hint="Awaiting approval" />
        <StatCard label="Bonus Events" value={ENTRIES.length} icon={Award} color="indigo" hint="This year" />
        <StatCard label="Next Payout" value="Jul 1" icon={Target} color="blue" hint="Estimated date" />
      </div>

      {/* Annual target progress */}
      <Card className="border-t-4 border-t-sky-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-sky-300" /> Annual Incentive Target
          </CardTitle>
          <CardDescription>Progress toward your {fmt(target)} potential for the year.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-foreground">{fmt(ytd)}</div>
            <div className="text-sm text-muted-foreground">of {fmt(target)} · {pct}%</div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-slate-500" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Earnings by category */}
      <Card className="border-t-4 border-t-teal-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-400" /> Earnings by Category
          </CardTitle>
          <CardDescription>Where your incentives came from.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CATEGORIES.map((c) => (
            <div key={c.label}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-medium text-foreground">{c.label}</span>
                <span className="text-muted-foreground">{fmt(c.amount)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.round((c.amount / maxCat) * 100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bonus log */}
      <Card className="border-t-4 border-t-slate-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-slate-300" /> Bonus Activity
          </CardTitle>
          <CardDescription>Every incentive event and its payout status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ENTRIES.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-slate-500/40 hover:bg-slate-500/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${ACCENT_SOFT[e.accent]}`}>
                    <e.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{e.label}</div>
                    <div className="text-xs text-muted-foreground">{e.type} · {e.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(e.amount)}</span>
                  <Badge className={STATUS_BADGE[e.status]}>{e.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-sky-500/30 bg-sky-500/5 px-4 py-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            <p className="text-sm text-foreground">
              <span className="font-medium">Managed by Finance &amp; Payroll.</span> Bonus calculations and
              payout dates are set by HR/Finance — this view is informational and not self-editable.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ACCENT_SOFT: Record<Accent, string> = {
  red: "bg-red-500/15 text-red-400",
  blue: "bg-slate-500/15 text-slate-300",
  indigo: "bg-slate-500/15 text-slate-300",
  teal: "bg-teal-500/15 text-teal-300",
  sky: "bg-slate-500/15 text-slate-300",
  rose: "bg-red-500/15 text-red-400",
  emerald: "bg-emerald-500/15 text-emerald-300",
  slate: "bg-slate-500/15 text-slate-300",
};
