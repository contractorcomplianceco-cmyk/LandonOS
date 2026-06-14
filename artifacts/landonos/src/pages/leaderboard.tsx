import React from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { levelForPoints } from "@/lib/rewards";
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  type LucideIcon,
} from "lucide-react";

type Member = {
  id: string;
  name: string;
  points: number;
  streak: number;
  move: "up" | "down" | "same";
  you?: boolean;
};

const RANK_STYLE: { ring: string; chip: string; icon: LucideIcon }[] = [
  { ring: "border-blue-500/40 bg-blue-500/5 ring-1 ring-blue-500/20", chip: "bg-blue-500 text-white", icon: Crown },
  { ring: "border-indigo-500/30 bg-indigo-500/5", chip: "bg-indigo-500 text-white", icon: Medal },
  { ring: "border-sky-500/30 bg-sky-500/5", chip: "bg-sky-500 text-white", icon: Medal },
];

const MOVE: Record<Member["move"], { icon: LucideIcon; cls: string }> = {
  up: { icon: ArrowUp, cls: "text-emerald-600" },
  down: { icon: ArrowDown, cls: "text-rose-600" },
  same: { icon: Minus, cls: "text-slate-400" },
};

export default function LeaderboardPage() {
  const { data } = useStore();
  const name = data.settings.userName || "Landon";
  const myPoints = data.rewardState.points;

  const others: Member[] = [
    { id: "u1", name: "Carmen Ortiz", points: 4820, streak: 12, move: "same" },
    { id: "u2", name: "Devin Park", points: 3960, streak: 7, move: "up" },
    { id: "u3", name: "Priya Nair", points: 2740, streak: 9, move: "up" },
    { id: "u5", name: "Marcus Lee", points: 1180, streak: 3, move: "down" },
    { id: "u6", name: "Sofia Reyes", points: 980, streak: 5, move: "up" },
    { id: "u7", name: "Tomás Vega", points: 720, streak: 2, move: "down" },
  ];

  const me: Member = { id: "me", name, points: myPoints, streak: 6, move: "up", you: true };
  const members = [...others, me].sort((a, b) => b.points - a.points);
  const myRank = members.findIndex((m) => m.you) + 1;
  const topStreak = Math.max(...members.map((m) => m.streak));
  const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <PageHeader
        icon={Trophy}
        eyebrow="Research Team Leaderboard"
        title="Leaderboard"
        subtitle="Friendly competition across the research team. Points come from verified, human-reviewed work."
        stats={[
          { label: "Your Rank", value: `#${myRank}`, icon: Trophy },
          { label: "Streak", value: `${me.streak} wks`, icon: Flame },
        ]}
        statsClassName="grid grid-cols-2 gap-3 shrink-0"
      />

      {/* Metric strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Your Rank" value={`#${myRank}`} icon={Trophy} color="blue" hint={`of ${members.length}`} />
        <StatCard label="Your Points" value={myPoints.toLocaleString()} icon={Star} color="indigo" hint={levelForPoints(myPoints).level} />
        <StatCard label="Your Streak" value={`${me.streak} wks`} icon={Flame} color="rose" hint="Active weekly" />
        <StatCard label="Top Streak" value={`${topStreak} wks`} icon={TrendingUp} color="emerald" hint="Team best" />
      </div>

      {/* Podium — top 3 */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-blue-600" /> Top Performers
          </CardTitle>
          <CardDescription>This quarter's leading researchers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {members.slice(0, 3).map((m, i) => {
              const rs = RANK_STYLE[i];
              const RankIcon = rs.icon;
              return (
                <div key={m.id} className={`rounded-xl border p-4 text-center ${rs.ring}`}>
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-card text-base font-bold text-foreground ring-2 ring-border">
                    {initials(m.name)}
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${rs.chip}`}>
                      {i + 1}
                    </span>
                    <RankIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 truncate text-sm font-semibold text-foreground">
                    {m.name}{m.you && " (You)"}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.points.toLocaleString()} pts</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full standings */}
      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-indigo-600" /> Full Standings
          </CardTitle>
          <CardDescription>Everyone on the research team, ranked by points.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((m, i) => {
              const mv = MOVE[m.move];
              const MoveIcon = mv.icon;
              return (
                <div
                  key={m.id}
                  className={
                    "flex items-center gap-3 rounded-lg border px-4 py-3 " +
                    (m.you
                      ? "border-blue-500/40 bg-blue-500/5 ring-1 ring-blue-500/20"
                      : "border-border bg-card")
                  }
                >
                  <div className="w-6 text-center text-sm font-bold tabular-nums text-muted-foreground">{i + 1}</div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                    {initials(m.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className="truncate">{m.name}</span>
                      {m.you && <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-700">You</Badge>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3 text-rose-500" /> {m.streak}-week streak
                    </div>
                  </div>
                  <MoveIcon className={`h-4 w-4 shrink-0 ${mv.cls}`} />
                  <div className="w-20 text-right text-sm font-semibold tabular-nums text-foreground">
                    {m.points.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
