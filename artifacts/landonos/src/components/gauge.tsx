import { useId } from "react";
import { cn } from "@/lib/utils";

export type GaugeTone = "red" | "steel" | "emerald" | "amber";

const TONE: Record<
  GaugeTone,
  { stops: [string, string, string]; accent: string; accentText: string; glow: string }
> = {
  red: { stops: ["#fecaca", "#ef4444", "#b91c1c"], accent: "#ef4444", accentText: "#fca5a5", glow: "rgba(239,68,68,0.55)" },
  steel: { stops: ["#e0f2fe", "#38bdf8", "#0369a1"], accent: "#38bdf8", accentText: "#7dd3fc", glow: "rgba(56,189,248,0.50)" },
  emerald: { stops: ["#d1fae5", "#10b981", "#047857"], accent: "#10b981", accentText: "#6ee7b7", glow: "rgba(16,185,129,0.50)" },
  amber: { stops: ["#fecdd3", "#f43f5e", "#9f1239"], accent: "#f43f5e", accentText: "#fda4af", glow: "rgba(244,63,94,0.50)" },
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

const START = -135;
const SWEEP = 270;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function arcPath(cx: number, cy: number, r: number, f0: number, f1: number) {
  const a0 = START + f0 * SWEEP;
  const a1 = START + f1 * SWEEP;
  const start = polar(cx, cy, r, a0);
  const end = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

/**
 * Luxury performance instrument gauge.
 * Layered SVG: chrome bezel, graphite face, fine tick ring, red (tone) progress
 * arc with a soft inner glow + glowing tip, and a subtle glass sheen. Inspired by
 * modern luxury digital cockpits — refined and brand-safe, no real-brand assets.
 */
export function Gauge({
  value,
  label,
  sublabel,
  tone = "red",
  size = 148,
  thickness = 8,
  className,
  showValue = true,
  valueSuffix = "%",
}: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const frac = clamped / 100;
  const t = TONE[tone];
  const uid = useId().replace(/:/g, "");
  const half = size / 2;
  const bezelR = half - 4;
  const arcR = half - 16;
  const faceR = half - 8;
  const arcW = thickness;
  const tickOuter = arcR - arcW / 2 - 4;

  const ticks = [];
  const TICK_COUNT = 40;
  for (let i = 0; i <= TICK_COUNT; i++) {
    const f = i / TICK_COUNT;
    const major = i % 10 === 0;
    const len = major ? 8 : 3.5;
    const a = START + f * SWEEP;
    const p1 = polar(half, half, tickOuter, a);
    const p2 = polar(half, half, tickOuter - len, a);
    const reached = f <= frac + 0.001;
    ticks.push(
      <line
        key={i}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={
          major
            ? reached
              ? t.accent
              : "rgba(226,232,240,0.55)"
            : reached
              ? t.accentText
              : "rgba(148,163,184,0.30)"
        }
        strokeWidth={major ? 1.6 : 1}
        strokeLinecap="round"
      />,
    );
  }

  const tip = polar(half, half, arcR, START + frac * SWEEP);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className="relative"
        style={{ width: size, height: size, filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.55))" }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <defs>
            <linearGradient id={`chrome-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f6f8fa" />
              <stop offset="22%" stopColor="#aeb4bc" />
              <stop offset="50%" stopColor="#6b7178" />
              <stop offset="72%" stopColor="#d9dde2" />
              <stop offset="100%" stopColor="#82888f" />
            </linearGradient>
            <radialGradient id={`face-${uid}`} cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#262b32" />
              <stop offset="55%" stopColor="#14171c" />
              <stop offset="100%" stopColor="#080a0c" />
            </radialGradient>
            <linearGradient id={`arc-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={t.stops[0]} />
              <stop offset="55%" stopColor={t.stops[1]} />
              <stop offset="100%" stopColor={t.stops[2]} />
            </linearGradient>
            <radialGradient id={`sheen-${uid}`} cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <filter id={`blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.2" />
            </filter>
          </defs>

          {/* chrome bezel + inner groove */}
          <circle cx={half} cy={half} r={bezelR} fill="none" stroke={`url(#chrome-${uid})`} strokeWidth={4} />
          <circle cx={half} cy={half} r={bezelR - 2.5} fill="none" stroke="rgba(0,0,0,0.65)" strokeWidth={1} />

          {/* graphite face */}
          <circle cx={half} cy={half} r={faceR} fill={`url(#face-${uid})`} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

          {/* glass sheen */}
          <ellipse cx={half} cy={half * 0.78} rx={faceR * 0.72} ry={faceR * 0.42} fill={`url(#sheen-${uid})`} />

          {/* fine tick ring */}
          {ticks}

          {/* track groove */}
          <path d={arcPath(half, half, arcR, 0, 1)} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={arcW + 2} strokeLinecap="round" />
          <path d={arcPath(half, half, arcR, 0, 1)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={arcW} strokeLinecap="round" />

          {/* progress soft glow */}
          {frac > 0 && (
            <path
              d={arcPath(half, half, arcR, 0, frac)}
              fill="none"
              stroke={t.glow}
              strokeWidth={arcW + 5}
              strokeLinecap="round"
              filter={`url(#blur-${uid})`}
              opacity={0.7}
            />
          )}

          {/* progress arc */}
          {frac > 0 && (
            <path d={arcPath(half, half, arcR, 0, frac)} fill="none" stroke={`url(#arc-${uid})`} strokeWidth={arcW} strokeLinecap="round" />
          )}

          {/* progress tip */}
          {frac > 0 && (
            <>
              <circle cx={tip.x} cy={tip.y} r={arcW / 2 + 1.5} fill={t.glow} filter={`url(#blur-${uid})`} />
              <circle cx={tip.x} cy={tip.y} r={arcW / 2 - 0.5} fill="#ffffff" />
              <circle cx={tip.x} cy={tip.y} r={arcW / 2 - 2} fill={t.accent} />
            </>
          )}
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-bold tabular-nums leading-none text-slate-50">
              {Math.round(clamped)}
              <span className="text-sm align-top text-slate-300">{valueSuffix}</span>
            </span>
            {sublabel && (
              <span
                className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: t.accentText }}
              >
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>
      {label && (
        <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">{label}</span>
      )}
    </div>
  );
}
