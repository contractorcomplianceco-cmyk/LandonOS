import React from 'react';
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LEVELS, levelProgress } from "@/lib/rewards";
import { Award, Star, Medal, Zap, BookOpen, Target, CheckCircle2 } from "lucide-react";

export default function RewardCenter() {
  const { data } = useStore();
  const { rewardState, settings } = data;
  
  const progress = levelProgress(rewardState.points);
  
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-50 ring-1 ring-white/15 backdrop-blur">
              <Award className="h-3.5 w-3.5" />
              Skill Progression
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Reward Center</h1>
            <p className="max-w-xl text-blue-100/80">
              Track your professional growth — quality and thoroughness are rewarded over speed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-blue-100/70">Level</div>
              <div className="text-2xl font-bold text-white">{rewardState.level}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-blue-100/70">Points</div>
              <div className="text-2xl font-bold text-white">{rewardState.points}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-blue-100/70">Badges</div>
              <div className="text-2xl font-bold text-white">{rewardState.badges.length}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-blue-100/70">To Next</div>
              <div className="text-2xl font-bold text-white">{progress.percent}%</div>
            </div>
          </div>
        </div>
      </div>
      
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
          <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-4">
            {LEVELS.map((level, idx) => {
              const isAchieved = rewardState.points >= level.minPoints;
              const isCurrent = level.level === rewardState.level;
              return (
                <div key={idx} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${isCurrent ? 'bg-primary border-primary ring-4 ring-primary/20' : isAchieved ? 'bg-primary border-primary' : 'bg-background border-muted'}`} />
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isAchieved ? 'text-foreground' : 'text-muted-foreground'}`}>{level.level}</span>
                      <span className="text-xs text-muted-foreground font-mono">{level.minPoints} pts</span>
                    </div>
                    <span className="text-sm text-muted-foreground mt-1">{level.description}</span>
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
