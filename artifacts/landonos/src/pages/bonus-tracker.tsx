import React from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, type Accent } from "@/components/stat-card";
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
  Paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  Pending: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  "Under Review": "border-rose-500/30 bg-rose-500/10 text-rose-700",
};

const CATEGORIES: { label: string; amount: number; bar: string }[] = [
  { label: "Milestone", amount: 850, bar: "bg-blue-500" },
  { label: "Quality", amount: 700, bar: "bg-teal-500" },
  { label: "Speed", amount: 250, bar: "bg-sky-500" },
  { label: "Recognition", amount: 150, bar: "bg-indigo-500" },
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
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15 backdrop-blur">
              <Wallet className="h-3.5 w-3.5" />
              Incentive & Bonus Tracker
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Bonus Tracker</h1>
            <p className="mt-1.5 max-w-xl text-sm md:text-base text-blue-100/80">
              {name}'s performance incentives for the year. Amounts are calculated by Finance and paid through Payroll — informational only.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <TrendingUp className="h-3.5 w-3.5" /> Earned YTD
              </div>
              <div className="mt-1 text-2xl font-bold text-white">{fmt(ytd)}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <Clock className="h-3.5 w-3.5" /> Pending
              </div>
              <div className="mt-1 text-2xl font-bold text-white">{fmt(pending)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Paid Out" value={fmt(paid)} icon={Banknote} color="emerald" hint="Cleared by Payroll" />
        <StatCard label="Pending Review" value={fmt(pending)} icon={Clock} color="sky" hint="Awaiting approval" />
        <StatCard label="Bonus Events" value={ENTRIES.length} icon={Award} color="indigo" hint="This year" />
        <StatCard label="Next Payout" value="Jul 1" icon={Target} color="blue" hint="Estimated date" />
      </div>

      {/* Annual target progress */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" /> Annual Incentive Target
          </CardTitle>
          <CardDescription>Progress toward your {fmt(target)} potential for the year.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-foreground">{fmt(ytd)}</div>
            <div className="text-sm text-muted-foreground">of {fmt(target)} · {pct}%</div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Earnings by category */}
      <Card className="border-t-4 border-t-teal-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" /> Earnings by Category
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
      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-600" /> Bonus Activity
          </CardTitle>
          <CardDescription>Every incentive event and its payout status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ENTRIES.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/5"
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
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
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
  blue: "bg-blue-500/10 text-blue-600",
  indigo: "bg-indigo-500/10 text-indigo-600",
  teal: "bg-teal-500/10 text-teal-600",
  sky: "bg-sky-500/10 text-sky-600",
  rose: "bg-rose-500/10 text-rose-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  slate: "bg-slate-500/10 text-slate-600",
};
