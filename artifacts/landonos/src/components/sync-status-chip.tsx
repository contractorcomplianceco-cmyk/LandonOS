import { Database, HardDrive, Loader2, AlertTriangle } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/** Shows whether data is syncing to the live API or running locally. */
export function SyncStatusChip() {
  const { syncMode, syncError } = useStore();
  const { workspaces, activeWorkspaceId, apiAvailable, user } = useAuth();
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const workspaceLabel =
    apiAvailable && user && activeWorkspace ? activeWorkspace.name : null;

  if (syncMode === "loading") {
    return (
      <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-slate-300 md:inline-flex">
        <Loader2 className="h-3 w-3 animate-spin" /> Syncing…
      </span>
    );
  }

  if (syncMode === "live") {
    return (
      <span
        className="hidden items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/30 md:inline-flex"
        title={workspaceLabel ?? undefined}
      >
        <Database className="h-3 w-3" />
        {workspaceLabel ? `Live · ${workspaceLabel}` : "Live data"}
      </span>
    );
  }

  if (syncMode === "error") {
    return (
      <span
        className="hidden items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-medium text-rose-300 ring-1 ring-rose-500/30 md:inline-flex"
        title={syncError ?? "Save failed"}
      >
        <AlertTriangle className="h-3 w-3" /> Sync issue
      </span>
    );
  }

  return (
    <span
      className={cn(
        "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 md:inline-flex",
        "bg-white/[0.06] text-slate-300 ring-white/15",
      )}
      title="API unavailable — using browser storage"
    >
      <HardDrive className="h-3 w-3" /> Local only
    </span>
  );
}
