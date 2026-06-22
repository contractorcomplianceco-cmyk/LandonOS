import React from 'react';
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LEVELS, levelProgress } from "@/lib/rewards";
import { StatCard } from "@/components/stat-card";
import { Gauge } from "@/components/gauge";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Award, Star, Medal, Zap, BookOpen, Target, CheckCircle2, TrendingUp, GraduationCap } from "lucide-react";

export default function RewardCenter() {
  const { data } = useStore();
  const { rewardState, settings } = data;
  
  const progress = levelProgress(rewardState.points);

  const completedLessons = data.training.flatMap(t => t.lessons).filter(l => l.completed).length;
  const pointsToNext = progress.next ? progress.pointsForNext - progress.pointsIntoLevel : 0;
  
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Award}
        eyebrow="Skill Progression"
        title="Garage Rewards"
        subtitle="Track your professional growth — quality and thoroughness are rewarded over speed."
        stats={[
          { label: "Level", value: rewardState.level, icon: Award },
          { label: "Points", value: rewardState.points, icon: Star },
          { label: "Badges", value: rewardState.badges.length, icon: Medal },
          { label: "To Next", value: `${progress.percent}%`, icon: TrendingUp },
        ]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Points" value={rewardState.points} icon={Star} color="blue" />
        <StatCard label="Level" value={rewardState.level} icon={Award} color="indigo" />
        <StatCard label="Lessons Completed" value={completedLessons} icon={GraduationCap} color="emerald" />
        <StatCard label="Badges Earned" value={rewardState.badges.length} icon={Medal} color="sky" />
      </div>

      <Card className="border-t-4 border-t-slate-500 bg-gradient-to-br from-slate-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-500 text-white shadow-sm shadow-slate-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            Level Progress
          </CardTitle>
          <CardDescription>{progress.current.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 px-6 py-4">
              <Gauge
                value={progress.percent}
                tone={progress.next ? "steel" : "emerald"}
                label="To Next Level"
                sublabel={progress.next ? progress.next.level : "Max"}
              />
            </div>
            <div className="w-full flex-1 space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tabular-nums text-slate-300">{rewardState.points.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">total points</div>
                </div>
                <div className="text-right text-sm font-semibold tabular-nums text-slate-300">{progress.percent}%</div>
              </div>
              <Progress value={progress.percent} className="h-2" />
              {progress.next ? (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{pointsToNext.toLocaleString()}</span> pts to next level{" "}
                  <span className="font-semibold text-foreground">{progress.next.level}</span>
                </p>
              ) : (
                <p className="text-xs font-medium text-emerald-400">Top level reached. Outstanding work.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Current Level</div>
                <div className="text-3xl font-bold text-primary">{rewardState.level}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-muted-foreground mb-1">Total Points</div>
                <div className="text-2xl font-bold">{rewardState.points}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {progress.next ? progress.next.level : 'Max Level'}</span>
                <span className="font-medium">{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} className="h-2" />
              {progress.next && (
                <div className="text-xs text-muted-foreground text-right">
                  {progress.pointsForNext - progress.pointsIntoLevel} points until next level
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" /> Suggested Next Skill
              </h4>
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm text-primary font-medium">
                {rewardState.suggestedNextSkill}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Medal className="w-5 h-5 mr-2 text-primary" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rewardState.badges.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">No badges earned yet.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {rewardState.badges.map(badge => (
                  <Badge key={badge} variant="secondary" className="px-3 py-1.5 flex items-center">
                    <Star className="w-3 h-3 mr-1.5 text-sky-500" />
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-primary" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rewardState.recentAchievements.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">No recent achievements.</div>
            ) : (
              <ul className="space-y-3">
                {rewardState.recentAchievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 shrink-0"></span>
                    <span className="text-sm">{achievement}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              How to Earn Points
            </CardTitle>
            <CardDescription>Quality and thoroughness are rewarded over speed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm py-1 border-b border-border/50"><span>Complete a research request</span> <span className="font-medium">+{settings.rewardSettings.completeResearch}</span></div>
              <div className="flex justify-between text-sm py-1 border-b border-border/50"><span>Add an official source</span> <span className="font-medium">+{settings.rewardSettings.addOfficialSource}</span></div>
              <div className="flex justify-between text-sm py-1 border-b border-border/50"><span>Improve a prompt</span> <span className="font-medium">+{settings.rewardSettings.improvePrompt}</span></div>
              <div className="flex justify-between text-sm py-1 border-b border-border/50"><span>Raise a blocker early</span> <span className="font-medium">+{settings.rewardSettings.raiseBlockerEarly}</span></div>
              <div className="flex justify-between text-sm py-1 border-b border-border/50"><span>Complete a report</span> <span className="font-medium">+{settings.rewardSettings.completeReport}</span></div>
              <div className="flex justify-between text-sm py-1 border-b border-border/50"><span>Complete a handoff</span> <span className="font-medium">+{settings.rewardSettings.completeHandoff}</span></div>
              <div className="flex justify-between text-sm py-1 border-b border-border/50"><span>Report approved</span> <span className="font-medium">+{settings.rewardSettings.reportApproved}</span></div>
              <div className="flex justify-between text-sm py-1 border-b border-border/50"><span>Suggest Brain update</span> <span className="font-medium">+{settings.rewardSettings.suggestBrainUpdate}</span></div>
              <div className="flex justify-between text-sm py-1"><span>Complete training lesson</span> <span className="font-medium">+{settings.rewardSettings.completeLesson}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary" />
            Career Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-muted ml-3 space-y-4 pb-4">
            {LEVELS.map((level, idx) => {
              const isAchieved = rewardState.points >= level.minPoints;
              const isCurrent = level.level === rewardState.level;
              const cardClass = isCurrent
                ? "border-l-sky-500 bg-sky-500/5"
                : isAchieved
                ? "border-l-emerald-500 bg-emerald-500/5"
                : "border-l-slate-300 bg-card";
              const dotClass = isCurrent
                ? "bg-sky-500 border-sky-500 ring-4 ring-sky-500/20"
                : isAchieved
                ? "bg-emerald-500 border-emerald-500"
                : "bg-background border-muted";
              return (
                <div key={idx} className="relative pl-6">
                  <div className={cn("absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 z-10", dotClass)} />
                  <div className={cn("rounded-md border border-l-4 p-3 transition-all hover:-translate-y-0.5 hover:shadow-md", cardClass)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("font-semibold", isAchieved ? "text-foreground" : "text-muted-foreground")}>{level.level}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent && <Badge className="bg-sky-500 hover:bg-red-500">Current</Badge>}
                        {!isCurrent && isAchieved && (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">Achieved</Badge>
                        )}
                        {!isAchieved && (
                          <Badge variant="outline" className="border-slate-300 text-slate-500">Locked</Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">{level.minPoints} pts</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground mt-1 block">{level.description}</span>
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
