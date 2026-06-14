import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Compass,
  Database,
  FileText,
  BrainCircuit,
  Award,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Circle,
  Star,
  type LucideIcon,
} from "lucide-react";

// Snappy, slightly overshooting spring — gives entrances an energetic "pop".
const pop = { type: "spring" as const, stiffness: 380, damping: 15, mass: 0.6 };
const spring = { type: "spring" as const, stiffness: 260, damping: 18 };

function SceneShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center md:px-12"
    >
      {children}
    </motion.div>
  );
}

function Kicker({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...pop, delay: 0.05 }}
      className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100 backdrop-blur"
    >
      {/* Pulsing energy ring around the kicker icon. */}
      <span className="relative flex h-3.5 w-3.5 items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-sky-400/50"
          animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <Icon className="relative h-3.5 w-3.5 text-sky-300" />
      </span>
      {label}
    </motion.div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...pop, delay }}
      className="flex min-w-[7rem] flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur"
    >
      <motion.span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <Icon className="h-4 w-4 text-white" />
      </motion.span>
      <motion.span
        className="text-2xl font-bold leading-none tabular-nums text-white"
        initial={{ scale: 0.6 }}
        animate={{ scale: [0.6, 1.2, 1] }}
        transition={{ ...pop, delay: delay + 0.12 }}
      >
        {value}
      </motion.span>
      <span className="text-[11px] text-blue-100/70">{label}</span>
    </motion.div>
  );
}

function Chip({
  icon: Icon,
  label,
  color,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...pop, delay }}
      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur"
    >
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </span>
      <span className="whitespace-nowrap text-sm font-semibold text-white">{label}</span>
    </motion.div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <motion.h3
      initial={{ opacity: 0, y: 22, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...pop, delay: 0.12 }}
      className="text-2xl font-black tracking-tight text-white md:text-4xl"
    >
      {children}
    </motion.h3>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.3 }}
      className="mt-3 max-w-xl text-sm text-blue-100/80 md:text-base"
    >
      {children}
    </motion.p>
  );
}

export function OnboardingScene({ id }: { id: string }) {
  switch (id) {
    case "command-center":
      return (
        <SceneShell>
          <Kicker icon={LayoutDashboard} label="Command Center" />
          <Title>Your daily cockpit</Title>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Tile icon={Target} label="Open requests" value="3" color="bg-blue-500" delay={0.18} />
            <Tile icon={ShieldCheck} label="Need review" value="2" color="bg-teal-500" delay={0.28} />
            <Tile icon={FileText} label="Reports" value="4" color="bg-sky-500" delay={0.38} />
            <Tile icon={Award} label="Handoffs" value="6" color="bg-indigo-500" delay={0.48} />
          </div>
        </SceneShell>
      );
    case "research-builder":
      return (
        <SceneShell>
          <Kicker icon={Target} label="Research Builder" />
          <Title>Scope it before the AI</Title>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Chip icon={Target} label="Decision it supports" color="bg-blue-500" delay={0.18} />
            <Chip icon={Database} label="Required sources" color="bg-sky-500" delay={0.3} />
            <Chip icon={ShieldCheck} label="What not to assume" color="bg-teal-500" delay={0.42} />
          </div>
          <Sub>A clear, scoped question keeps the entire workflow disciplined.</Sub>
        </SceneShell>
      );
    case "research-gps": {
      const steps = ["Understand", "Plan", "Gather", "Verify", "Draft", "Handoff"];
      return (
        <SceneShell>
          <Kicker icon={Compass} label="Research GPS" />
          <Title>A guided ten-step route</Title>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {steps.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ ...pop, delay: 0.16 + i * 0.09 }}
                className="flex items-center gap-2"
              >
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                  {i < 3 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-blue-200/70" />
                  )}
                  {s}
                </span>
                {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-blue-200/50" />}
              </motion.div>
            ))}
          </div>
          <Sub>Each step shows whether it's complete, in progress, or needs help.</Sub>
        </SceneShell>
      );
    }
    case "source-vault":
      return (
        <SceneShell>
          <Kicker icon={Database} label="Source Vault" />
          <Title>Trust, but verify</Title>
          <div className="mt-6 flex w-full max-w-2xl flex-col gap-2.5">
            {[
              { label: "Official record", tag: "Trusted", tone: "emerald", icon: ShieldCheck },
              { label: "AI draft", tag: "Flagged", tone: "sky", icon: BrainCircuit },
              { label: "Unknown source", tag: "Flagged", tone: "slate", icon: Circle },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: 28, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ ...pop, delay: 0.18 + i * 0.12 }}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.07] px-4 py-2.5 backdrop-blur"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium text-white">
                  <row.icon className="h-4 w-4 text-blue-200" />
                  {row.label}
                </span>
                <span
                  className={
                    row.tone === "emerald"
                      ? "rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-400/30"
                      : row.tone === "sky"
                        ? "rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200 ring-1 ring-sky-400/30"
                        : "rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-100/80 ring-1 ring-white/20"
                  }
                >
                  {row.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </SceneShell>
      );
    case "report-builder":
      return (
        <SceneShell>
          <Kicker icon={FileText} label="Report Builder" />
          <Title>Leadership-ready, every time</Title>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...pop, delay: 0.22 }}
            className="mt-6 w-full max-w-md rounded-xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-100/70">
                Readiness score
              </span>
              <motion.span
                className="text-sm font-bold text-emerald-300"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 1.25, 1], opacity: 1 }}
                transition={{ ...pop, delay: 1.1 }}
              >
                82%
              </motion.span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "82%" }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-100/75">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
              Warns you when official sources or answers are missing.
            </div>
          </motion.div>
        </SceneShell>
      );
    case "roseos":
      return (
        <SceneShell>
          <Kicker icon={BrainCircuit} label="RoseOS" />
          <Title>The company brain</Title>
          <div className="mt-6 flex w-full max-w-lg flex-col gap-2.5">
            <motion.div
              initial={{ opacity: 0, x: -24, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ ...pop, delay: 0.18 }}
              className="self-start rounded-2xl rounded-bl-sm bg-white/10 px-4 py-2.5 text-sm text-white backdrop-blur"
            >
              What's on record for the vendor review?
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ ...pop, delay: 0.5 }}
              className="self-end rounded-2xl rounded-br-sm bg-sidebar-primary/30 px-4 py-2.5 text-sm text-white ring-1 ring-sidebar-primary/40 backdrop-blur"
            >
              Here's the current record — proposed updates stay drafts until approved.
            </motion.div>
          </div>
          <Sub>Nothing is recorded without human review.</Sub>
        </SceneShell>
      );
    case "growth-rewards":
      return (
        <SceneShell>
          <Kicker icon={Award} label="Growth & Rewards" />
          <Title>Watch your career grow</Title>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [0.5, 1.18, 1] }}
            transition={{ ...pop, delay: 0.22 }}
            className="mt-6 text-5xl font-black md:text-6xl"
          >
            <span className="bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent">
              1,250 pts
            </span>
          </motion.div>
          <div className="mt-5 flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -60 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ ...pop, delay: 0.4 + i * 0.1 }}
              >
                <motion.span
                  className="inline-block"
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 + i * 0.12 }}
                >
                  <Star className="h-6 w-6 fill-sky-300 text-sky-300" />
                </motion.span>
              </motion.span>
            ))}
          </div>
          <Sub>Points and badges reflect real research skill, from Source Finder upward.</Sub>
        </SceneShell>
      );
    default:
      return null;
  }
}
