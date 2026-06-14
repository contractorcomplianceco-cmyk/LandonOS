import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HeartPulse,
  Plane,
  Stethoscope,
  Smile,
  Eye,
  Shield,
  PiggyBank,
  GraduationCap,
  Dumbbell,
  Lock,
  Info,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TimeOff = { id: string; label: string; used: number; total: number; bar: string };
const TIME_OFF: TimeOff[] = [
  { id: "pto", label: "Paid Time Off", used: 9, total: 20, bar: "bg-blue-500" },
  { id: "sick", label: "Sick Leave", used: 2, total: 10, bar: "bg-teal-500" },
  { id: "personal", label: "Personal Days", used: 1, total: 5, bar: "bg-sky-500" },
];

type Plan = {
  id: string;
  label: string;
  plan: string;
  status: "Enrolled" | "Waived";
  icon: LucideIcon;
};
const PLANS: Plan[] = [
  { id: "medical", label: "Medical", plan: "PPO Plus — Blue Network", status: "Enrolled", icon: Stethoscope },
  { id: "dental", label: "Dental", plan: "Premier Dental", status: "Enrolled", icon: Smile },
  { id: "vision", label: "Vision", plan: "ClearSight Vision", status: "Enrolled", icon: Eye },
  { id: "life", label: "Life Insurance", plan: "2× base salary", status: "Waived", icon: Shield },
];

type Perk = { id: string; label: string; value: string; note: string; icon: LucideIcon; accent: string };
const PERKS: Perk[] = [
  { id: "retire", label: "401(k) Match", value: "6% match", note: "Managed by Payroll", icon: PiggyBank, accent: "text-indigo-600 bg-indigo-500/10" },
  { id: "learn", label: "Learning Stipend", value: "$1,500 / yr", note: "$640 used", icon: GraduationCap, accent: "text-blue-600 bg-blue-500/10" },
  { id: "wellness", label: "Wellness Credit", value: "$600 / yr", note: "$200 used", icon: Dumbbell, accent: "text-teal-600 bg-teal-500/10" },
];

export default function BenefitsPage() {
  const { toast } = useToast();
  const managed = (what: string) =>
    toast({ title: "Managed by HR / Payroll", description: `${what} are handled during open enrollment. A request would be submitted to HR for review.` });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <PageHeader
        icon={HeartPulse}
        eyebrow="Benefits & Time Off"
        title="My Benefits"
        subtitle="Review your time-off balances, health coverage, and perks. Plan changes are handled by HR and Payroll."
        stats={[
          { label: "PTO Left", value: "11 days", icon: Plane },
          { label: "Plans", value: "3 active", icon: Shield },
        ]}
        statsClassName="grid grid-cols-2 gap-3 shrink-0"
      />

      {/* Time-off balances */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-blue-600" /> Time-Off Balances
          </CardTitle>
          <CardDescription>Used versus remaining for the current year.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {TIME_OFF.map((t) => {
              const remaining = t.total - t.used;
              const pct = Math.round((t.used / t.total) * 100);
              return (
                <div key={t.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm font-medium text-foreground">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.used}/{t.total}</div>
                  </div>
                  <div className="mt-2 mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {remaining}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">days left</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => managed("Time-off requests")}>
              Request Time Off
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health & insurance */}
      <Card className="border-t-4 border-t-teal-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-teal-600" /> Health & Insurance
          </CardTitle>
          <CardDescription>
            Your current coverage. Premiums and deductions are managed by Payroll.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {PLANS.map((p) => {
              const enrolled = p.status === "Enrolled";
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-500/10 text-teal-600">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{p.label}</div>
                      <div className="truncate text-xs text-muted-foreground">{p.plan}</div>
                    </div>
                  </div>
                  <Badge
                    className={
                      enrolled
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                        : "border-slate-500/30 bg-slate-500/10 text-slate-700"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-sky-500/30 bg-sky-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Lock className="h-4 w-4 text-sky-600" />
              Premiums &amp; deductions are managed by Payroll.
            </div>
            <Button variant="outline" size="sm" onClick={() => managed("Plan changes")}>
              Request Change
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Retirement & perks */}
      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-indigo-600" /> Retirement & Perks
          </CardTitle>
          <CardDescription>Contributions and stipends available to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {PERKS.map((perk) => (
              <div key={perk.id} className="rounded-lg border border-border bg-card p-4">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md ${perk.accent}`}>
                  <perk.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium text-foreground">{perk.label}</div>
                <div className="mt-0.5 text-xl font-bold text-foreground">{perk.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{perk.note}</div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-indigo-500/25 bg-indigo-500/5 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p className="text-sm text-foreground">
              Your 401(k) balance and contribution rate are{" "}
              <span className="font-medium">managed by Payroll</span>. Plan changes are submitted to HR
              during open enrollment — you view your benefits here but never self-approve changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
