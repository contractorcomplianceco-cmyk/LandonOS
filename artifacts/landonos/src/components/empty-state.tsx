import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 p-8 sm:p-12 text-center text-muted-foreground",
        className
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/30">
        <Icon className="h-7 w-7 opacity-60" aria-hidden="true" />
      </span>
      {title && <p className="text-base font-semibold text-foreground">{title}</p>}
      {description && (
        <p className={cn("max-w-sm text-sm leading-relaxed", title ? "mt-2" : "")}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
