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
  /** When true, renders an animated "live" status dot before the eyebrow text. Off by default. */
  statusDot?: boolean;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  stats?: PageHeaderStat[];
  statsClassName?: string;
  leading?: React.ReactNode;
}

const DEFAULT_STATS_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 shrink-0";

export function PageHeader({
  icon: Icon,
  eyebrow,
  statusDot = false,
  title,
  subtitle,
  action,
  stats,
  statsClassName,
  leading,
}: PageHeaderProps) {
  return (
    <div className="carbon chrome-edge relative overflow-hidden rounded-xl border border-white/10 p-6 md:p-8 shadow-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.20),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {leading && <div className="shrink-0">{leading}</div>}
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10 backdrop-blur">
              {statusDot && (
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              )}
              {Icon && <Icon className="h-3.5 w-3.5 text-red-400" />}
              {eyebrow}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 max-w-xl text-sm md:text-base text-slate-300/85">
                {subtitle}
              </p>
            )}
            {action && <div className="mt-4">{action}</div>}
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className={cn(statsClassName ?? DEFAULT_STATS_CLASS)}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/[0.05] px-4 py-3 ring-1 ring-white/10 backdrop-blur"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {stat.icon && <stat.icon className="h-3.5 w-3.5 text-red-400" />}
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
