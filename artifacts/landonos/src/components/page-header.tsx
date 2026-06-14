import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface PageHeaderStat {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}

interface PageHeaderProps {
  icon?: LucideIcon;
  eyebrow: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  stats?: PageHeaderStat[];
  statsClassName?: string;
}

const DEFAULT_STATS_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 shrink-0";

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  action,
  stats,
  statsClassName,
}: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15 backdrop-blur">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {eyebrow}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 max-w-xl text-sm md:text-base text-blue-100/80">
              {subtitle}
            </p>
          )}
          {action && <div className="mt-4">{action}</div>}
        </div>

        {stats && stats.length > 0 && (
          <div className={cn(statsClassName ?? DEFAULT_STATS_CLASS)}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                  {stat.icon && <stat.icon className="h-3.5 w-3.5" />}
                  {stat.label}
                </div>
                <div className="mt-1 text-2xl font-bold text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
