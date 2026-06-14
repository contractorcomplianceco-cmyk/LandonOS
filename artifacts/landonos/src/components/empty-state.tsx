import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 p-12 text-center text-muted-foreground",
        className
      )}
    >
      <Icon className="mb-4 h-12 w-12 opacity-50" />
      {title && <p className="font-medium text-foreground">{title}</p>}
      {description && <p className={cn(title && "mt-1 text-sm")}>{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
