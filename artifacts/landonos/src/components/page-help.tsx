import { useLocation } from "wouter";
import { useHelp } from "@/hooks/use-help";
import { PAGE_HELP } from "@/lib/walkthrough";
import { Info, X, Compass, BookOpen } from "lucide-react";

export function PageHelp() {
  const { hintsEnabled, disableHints, startTour, openGuide } = useHelp();
  const [location] = useLocation();

  if (!hintsEnabled) return null;
  const path = location.split(/[?#]/)[0];
  const help = PAGE_HELP[path];
  if (!help) return null;

  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-md bg-primary/10 p-1.5 text-primary">
          <Info size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">{help.title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{help.body}</p>
          {help.tip && (
            <p className="mt-1.5 text-xs font-medium text-primary">{help.tip}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <button
              type="button"
              onClick={openGuide}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <BookOpen size={13} /> Open the full guide
            </button>
            <button
              type="button"
              onClick={startTour}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Compass size={13} /> Take the narrated walkthrough
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={disableHints}
          aria-label="Hide help hints"
          title="Hide help hints (re-enable from the Help button in the top bar)"
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
