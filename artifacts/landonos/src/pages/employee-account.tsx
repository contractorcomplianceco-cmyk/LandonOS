import React from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  IdCard,
  Mail,
  Phone,
  MapPin,
  Building2,
  CalendarDays,
  UserCircle2,
  ShieldAlert,
  FileText,
  Lock,
  Download,
  Info,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DOCUMENTS = [
  { id: "d1", name: "Employment Agreement", meta: "PDF · Signed Jan 2024", icon: FileText },
  { id: "d2", name: "Role Description — Research Lead", meta: "PDF · Updated Mar 2026", icon: FileText },
  { id: "d3", name: "Organization Chart", meta: "PDF · Updated Apr 2026", icon: FileText },
];

const GATED = [
  { id: "g1", label: "Compensation", note: "Salary, bonus & equity", status: "Managed by HR" },
  { id: "g2", label: "Payroll & Pay Stubs", note: "Direct deposit & earnings", status: "Managed by Payroll" },
  { id: "g3", label: "Tax Records", note: "W-2, withholdings", status: "Request Access" },
];

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export default function EmployeeAccountPage() {
  const { data } = useStore();
  const { toast } = useToast();
  const name = data.settings.userName || "Landon";
  const title = data.settings.userRole || "Research Lead";
  const email = `${name.split(" ")[0].toLowerCase()}@roseos.com`;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold text-white ring-1 ring-white/20">
              {name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15 backdrop-blur">
                <Briefcase className="h-3.5 w-3.5" />
                Employment Record
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{name}</h1>
              <p className="mt-1 text-sm md:text-base text-blue-100/80">
                {title} · Compliance & Research
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <IdCard className="h-3.5 w-3.5" /> Employee ID
              </div>
              <div className="mt-1 text-2xl font-bold text-white">RO-2041</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <CalendarDays className="h-3.5 w-3.5" /> Tenure
              </div>
              <div className="mt-1 text-2xl font-bold text-white">2.4 yrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Informational notice */}
      <div className="flex items-start gap-3 rounded-lg border border-sky-500/30 bg-sky-500/5 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
        <p className="text-sm text-foreground">
          This is your employment record for reference. Any change request is{" "}
          <span className="font-medium">submitted to HR for review — informational only</span>. Records are
          not self-editable.
        </p>
      </div>

      {/* Personal & employment details */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-blue-600" /> Personal & Employment Details
          </CardTitle>
          <CardDescription>On file with HR. Submit corrections for review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Detail icon={UserCircle2} label="Full Name" value={name} />
            <Detail icon={Briefcase} label="Job Title" value={title} />
            <Detail icon={Building2} label="Department" value="Compliance & Research" />
            <Detail icon={IdCard} label="Employee ID" value="RO-2041" />
            <Detail icon={Mail} label="Work Email" value={email} />
            <Detail icon={Phone} label="Phone" value="+1 (512) 555-0148" />
            <Detail icon={MapPin} label="Location" value="Austin, TX (Hybrid)" />
            <Detail icon={UserCircle2} label="Manager" value="Rose Calderon" />
            <Detail icon={CalendarDays} label="Start Date" value="Jan 8, 2024" />
            <Detail icon={Briefcase} label="Employment Type" value="Full-time · Salaried" />
            <Detail icon={Phone} label="Emergency Contact" value="M. Hart · +1 (512) 555-0199" />
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => toast({ title: "Submitted to HR", description: "Your correction request was sent to HR for review. Informational only." })}
            >
              Request a Correction
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" /> Documents
          </CardTitle>
          <CardDescription>Employment paperwork available to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600">
                    <doc.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.meta}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-700"
                  onClick={() => toast({ title: "Opening document", description: `${doc.name} would open in a secure viewer.` })}
                >
                  <Download className="h-3.5 w-3.5" /> View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gated: comp / payroll / tax */}
      <Card className="border-t-4 border-t-rose-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" /> Compensation, Payroll & Tax
          </CardTitle>
          <CardDescription>
            Sensitive records are managed by HR and Payroll. They are never shown inline here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {GATED.map((g) => (
              <div
                key={g.id}
                className="rounded-lg border border-rose-500/25 bg-rose-500/5 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lock className="h-4 w-4 text-rose-600" /> {g.label}
                  </div>
                  <Badge className="border-rose-500/30 bg-rose-500/10 text-rose-700">Restricted</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{g.note}</div>
                <div className="mt-3 select-none font-mono text-lg tracking-widest text-muted-foreground/70">
                  ••• ••• •••
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => toast({ title: g.status, description: "HR / Payroll handles this record. A request would be logged for review." })}
                >
                  {g.status}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
