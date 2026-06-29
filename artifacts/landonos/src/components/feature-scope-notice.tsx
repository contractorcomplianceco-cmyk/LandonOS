import { Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Honest scope labels for prototype / local-only surfaces. */
export type FeatureScope =
  | "template-ai"
  | "brain-suggestions"
  | "source-manual"
  | "workspace-local"
  | "hr-preview";

const COPY: Record<
  FeatureScope,
  { title: string; body: string; tone: "sky" | "amber" | "slate"; icon: typeof Info }
> = {
  "template-ai": {
    title: "Template responses only",
    body: "RoseOS AI and prompt tools use local template answers until live AI is separately approved. Treat all output as draft until source-checked and human-reviewed.",
    tone: "sky",
    icon: Info,
  },
  "brain-suggestions": {
    title: "Suggestions only — not Company Brain records",
    body: "Updates here stay in your workspace as suggestions. Nothing is written to the official Company Brain until leadership approves and records it elsewhere.",
    tone: "amber",
    icon: AlertTriangle,
  },
  "source-manual": {
    title: "Manual source tracking — not automated verification",
    body: "Source types and ratings are your own notes. LandonOS does not validate URLs or confirm official status against external registries.",
    tone: "amber",
    icon: AlertTriangle,
  },
  "workspace-local": {
    title: "This workspace only — not company-wide yet",
    body: "Announcements, leaderboard standings, and reward points shown here are stored in your workspace blob. They are not shared across the whole company unless backed by shared tables later.",
    tone: "slate",
    icon: Info,
  },
  "hr-preview": {
    title: "Informational preview only",
    body: "HR, payroll, and benefits screens use sample data for layout review. Real balances and documents live in payroll/HR systems — not here.",
    tone: "slate",
    icon: Info,
  },
};

const TONE_CLASS: Record<(typeof COPY)[FeatureScope]["tone"], string> = {
  sky: "border-sky-500/30 bg-sky-500/10 text-foreground",
  amber: "border-amber-500/30 bg-amber-500/10 text-foreground",
  slate: "border-white/15 bg-white/[0.04] text-foreground",
};

const TITLE_CLASS: Record<(typeof COPY)[FeatureScope]["tone"], string> = {
  sky: "text-sky-300",
  amber: "text-amber-300",
  slate: "text-slate-300",
};

export function FeatureScopeNotice({
  scope,
  className,
}: {
  scope: FeatureScope;
  className?: string;
}) {
  const { title, body, tone, icon: Icon } = COPY[scope];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        TONE_CLASS[tone],
        className,
      )}
      role="note"
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", TITLE_CLASS[tone])} aria-hidden="true" />
      <div>
        <strong className={TITLE_CLASS[tone]}>{title}</strong>
        <p className="mt-1 text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
