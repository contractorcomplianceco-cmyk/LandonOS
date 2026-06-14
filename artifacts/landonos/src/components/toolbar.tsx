import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, type LucideIcon } from "lucide-react";

interface ToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchIcon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export function Toolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchIcon: Icon = Search,
  children,
  className,
}: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm",
        className
      )}
    >
      {onSearchChange && (
        <div className="relative flex-1 w-full">
          <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9"
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      {children}
    </div>
  );
}
