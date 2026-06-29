import { Database, HardDrive, Loader2, AlertTriangle } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/** Shows whether data is syncing to the live API or running locally. */
export function SyncStatusChip() {
  const { syncMode, syncError, isSaving } = useStore();
  const { workspaces, activeWorkspaceId, apiAvailable, user } = useAuth();
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const workspaceLabel =
    apiAvailable && user && activeWorkspace ? activeWorkspace.name : null;

  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium ring-1 sm:px-2.5 sm:text-[11px]";

  if (syncMode === "live" && isSaving) {
    return (
      <span
        className={cn(base, "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30")}
        title="Saving changes…"
        role="status"
      >
        <Loader2 className="h-3 w-3 animate-spin shrink-0" aria-hidden="true" />
        <span className="hidden min-[380px]:inline">Saving…</span>
      </span>
    );
  }

  if (syncMode === "loading") {
    return (
      <span className={cn(base, "bg-white/10 text-slate-300 ring-white/15")} role="status">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        <span className="hidden min-[380px]:inline">Syncing…</span>
      </span>
    );
  }

  if (syncMode === "live") {
    return (
      <span
        className={cn(
          base,
          "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
        )}
        title={workspaceLabel ?? "Connected to live workspace sync"}
        role="status"
      >
        <Database className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="max-w-[7rem] truncate sm:max-w-none">
          {workspaceLabel ? (
            <>
              <span className="hidden sm:inline">Live · </span>
              {workspaceLabel}
            </>
          ) : (
            "Live"
          )}
        </span>
      </span>
    );
  }

  if (syncMode === "error") {
    return (
      <span
        className={cn(base, "bg-rose-500/15 text-rose-300 ring-rose-500/30")}
        title={syncError ?? "Save failed"}
        role="status"
      >
        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Sync issue</span>
        <span className="sm:hidden">Error</span>
      </span>
    );
  }

  return (
    <span
      className={cn(base, "bg-white/[0.06] text-slate-300 ring-white/15")}
      title="API unavailable — using browser storage"
      role="status"
    >
      <HardDrive className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">Local only</span>
      <span className="sm:hidden">Local</span>
    </span>
  );
}
