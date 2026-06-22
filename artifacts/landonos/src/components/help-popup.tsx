import { useLocation } from "wouter";
import { useHelp } from "@/hooks/use-help";
import { PAGE_HELP } from "@/lib/walkthrough";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Compass, PlayCircle, ShieldCheck, LifeBuoy } from "lucide-react";

export function HelpPopup() {
  const { guideOpen, closeGuide, startTour, openVideo } = useHelp();
  const [location] = useLocation();
  const path = location.split(/[?#]/)[0];
  const help = PAGE_HELP[path];

  const fallback = {
    title: "Help & Guides",
    body: "Pick a module from the sidebar to see step-by-step guidance for it, or take the narrated walkthrough for a full tour of the cockpit.",
    tip: undefined as string | undefined,
    sections: undefined,
  };
  const content = help ?? fallback;

  return (
    <Dialog open={guideOpen} onOpenChange={(open) => !open && closeGuide()}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-2 border-b border-border bg-gradient-to-br from-primary/15 via-card to-card px-6 pb-5 pt-6 text-left">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <LifeBuoy size={14} /> Quick Guide
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {content.body}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[45vh] overflow-y-auto px-6 py-5">
          {content.sections && content.sections.length > 0 && (
            <ol className="space-y-4">
              {content.sections.map((s, i) => (
                <li key={s.heading} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold tabular-nums text-primary ring-1 ring-primary/30">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{s.heading}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {content.tip && (
            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-xs font-medium text-primary">{content.tip}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-border bg-card px-6 py-4 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              closeGuide();
              startTour();
            }}
          >
            <Compass size={15} /> Narrated walkthrough
          </Button>
          <Button
            type="button"
            className="flex-1 gap-2"
            onClick={() => {
              closeGuide();
              openVideo();
            }}
          >
            <PlayCircle size={15} /> Watch the Hype Reel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
