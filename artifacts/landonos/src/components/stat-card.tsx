import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type Accent = "red" | "blue" | "indigo" | "teal" | "sky" | "rose" | "emerald" | "slate";

interface AccentStyle {
  value: string;
  borderT: string;
  grad: string;
  iconSolid: string;
  iconShadow: string;
  hover: string;
  soft: string;
  text: string;
}

export const ACCENT: Record<Accent, AccentStyle> = {
  red: {
    value: "text-red-400",
    borderT: "border-t-red-500",
    grad: "from-red-500/10 to-transparent",
    iconSolid: "bg-red-600",
    iconShadow: "shadow-red-500/40",
    hover: "hover:border-red-500/50 hover:bg-red-500/5",
    soft: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
  },
  blue: {
    value: "text-sky-300",
    borderT: "border-t-sky-500",
    grad: "from-sky-500/10 to-transparent",
    iconSolid: "bg-sky-600",
    iconShadow: "shadow-sky-500/30",
    hover: "hover:border-sky-500/50 hover:bg-sky-500/5",
    soft: "bg-sky-500/10 border-sky-500/30",
    text: "text-sky-300",
  },
  indigo: {
    value: "text-slate-200",
    borderT: "border-t-slate-400",
    grad: "from-slate-400/10 to-transparent",
    iconSolid: "bg-slate-500",
    iconShadow: "shadow-slate-500/30",
    hover: "hover:border-slate-400/50 hover:bg-slate-400/5",
    soft: "bg-slate-400/10 border-slate-400/30",
    text: "text-slate-200",
  },
  teal: {
    value: "text-teal-300",
    borderT: "border-t-teal-500",
    grad: "from-teal-500/10 to-transparent",
    iconSolid: "bg-teal-500",
    iconShadow: "shadow-teal-500/30",
    hover: "hover:border-teal-500/50 hover:bg-teal-500/5",
    soft: "bg-teal-500/10 border-teal-500/30",
    text: "text-teal-300",
  },
  sky: {
    value: "text-sky-300",
    borderT: "border-t-sky-500",
    grad: "from-sky-500/10 to-transparent",
    iconSolid: "bg-sky-500",
    iconShadow: "shadow-sky-500/30",
    hover: "hover:border-sky-500/50 hover:bg-sky-500/5",
    soft: "bg-sky-500/10 border-sky-500/30",
    text: "text-sky-300",
  },
  rose: {
    value: "text-red-400",
    borderT: "border-t-red-500",
    grad: "from-red-500/10 to-transparent",
    iconSolid: "bg-red-600",
    iconShadow: "shadow-red-500/40",
    hover: "hover:border-red-500/50 hover:bg-red-500/5",
    soft: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
  },
  emerald: {
    value: "text-emerald-300",
    borderT: "border-t-emerald-500",
    grad: "from-emerald-500/10 to-transparent",
    iconSolid: "bg-emerald-500",
    iconShadow: "shadow-emerald-500/30",
    hover: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
    soft: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-300",
  },
  slate: {
    value: "text-slate-200",
    borderT: "border-t-slate-400",
    grad: "from-slate-400/10 to-transparent",
    iconSolid: "bg-slate-500",
    iconShadow: "shadow-slate-500/30",
    hover: "hover:border-slate-400/50 hover:bg-slate-400/5",
    soft: "bg-slate-400/10 border-slate-400/30",
    text: "text-slate-300",
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: Accent;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, color, hint, className }: StatCardProps) {
  const c = ACCENT[color];
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-t-4 bg-gradient-to-br transition-all hover:-translate-y-0.5 hover:shadow-lg",
        c.borderT,
        c.grad,
        className
      )}
    >
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className={cn("mt-2 text-4xl font-bold tabular-nums", c.value)}>{value}</div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
              c.iconSolid,
              c.iconShadow
            )}
          >
            <Icon className="w-6 h-6" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
