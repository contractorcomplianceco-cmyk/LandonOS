import { Sparkles } from "lucide-react";
import { isRoseReviewModeEnabled } from "@/lib/rose-review-mode";

/** Small premium banner shown while temporary Rose Review Mode is active. */
export function RoseReviewModeBanner() {
  if (!isRoseReviewModeEnabled()) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-cyan-400/30 bg-gradient-to-r from-sky-950/95 via-cyan-950/95 to-sky-950/95 px-4 py-1.5 text-center text-xs font-medium tracking-wide text-cyan-100 shadow-sm backdrop-blur-sm"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-300" aria-hidden />
      <span>Rose Review Mode · Temporary access expires automatically</span>
    </div>
  );
}
