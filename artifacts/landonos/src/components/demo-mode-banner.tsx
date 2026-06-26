import { Info } from "lucide-react";
import { env } from "@/lib/env";

interface DemoModeBannerProps {
  feature: string;
}

/** Shown on AI-backed surfaces when no API key is configured. */
export function DemoModeBanner({ feature }: DemoModeBannerProps) {
  if (!env.demoMode) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
      <div className="text-foreground">
        <strong className="text-sky-300">Demo mode</strong> — {feature} uses local mock
        responses. Set <code className="rounded bg-muted px-1 text-xs">VITE_OPENAI_API_KEY</code>{" "}
        for live AI when ready.
      </div>
    </div>
  );
}
