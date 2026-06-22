import { cn } from "@/lib/utils";

export type GaugeTone = "red" | "steel" | "emerald" | "amber";

const TONE: Record<GaugeTone, { stroke: string; text: string; glow: string }> = {
  red: { stroke: "stroke-red-500", text: "text-red-400", glow: "drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" },
  steel: { stroke: "stroke-sky-400", text: "text-sky-300", glow: "drop-shadow-[0_0_6px_rgba(56,189,248,0.45)]" },
  emerald: { stroke: "stroke-emerald-400", text: "text-emerald-300", glow: "drop-shadow-[0_0_6px_rgba(52,211,153,0.45)]" },
  amber: { stroke: "stroke-red-400", text: "text-red-300", glow: "drop-shadow-[0_0_6px_rgba(248,113,113,0.45)]" },
};

interface GaugeProps {
  value: number;
  label?: string;
  sublabel?: string;
  tone?: GaugeTone;
  size?: number;
  thickness?: number;
  className?: string;
  showValue?: boolean;
  valueSuffix?: string;
}

/**
 * Precision instrument-style circular gauge.
 * Renders a 270deg sweep arc (like a car tach) with a colored value track.
 */
export function Gauge({
  value,
  label,
  sublabel,
  tone = "red",
  size = 120,
  thickness = 9,
  className,
  showValue = true,
  valueSuffix = "%",
}: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const t = TONE[tone];
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const sweep = 0.75; // 270deg open-bottom dial
  const arcLen = circumference * sweep;
  const dash = (clamped / 100) * arcLen;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-[135deg]"
          aria-hidden="true"
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            className="stroke-white/10"
            strokeDasharray={`${arcLen} ${circumference}`}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            className={cn(t.stroke, t.glow, "transition-[stroke-dasharray] duration-700 ease-out")}
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold tabular-nums leading-none", t.text)}>
              {Math.round(clamped)}
              <span className="text-sm align-top">{valueSuffix}</span>
            </span>
            {sublabel && (
              <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>
      {label && (
        <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
