import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, TrendingUp, Trophy, ListChecks, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import { LEVELS, levelProgress } from "@/lib/rewards";

export default function RewardCenter() {
  const { data } = useStore();
  const { rewardState, settings } = data;
  const progress = levelProgress(rewardState.points);

  const rewardActions = [
    { label: "Complete a research request", points: settings.rewardSettings.completeResearch },
    { label: "Add an official source", points: settings.rewardSettings.addOfficialSource },
    { label: "Improve an AI prompt", points: settings.rewardSettings.improvePrompt },
    { label: "Raise a blocker early", points: settings.rewardSettings.raiseBlockerEarly },
    { label: "Complete a report", points: settings.rewardSettings.completeReport },
    { label: "Complete a handoff", points: settings.rewardSettings.completeHandoff },
    { label: "Get a report approved", points: settings.rewardSettings.reportApproved },
    { label: "Suggest a Company Brain update", points: settings.rewardSettings.suggestBrainUpdate },
    { label: "Complete a training lesson", points: settings.rewardSettings.completeLesson },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reward Center</h1>
        <p className="text-muted-foreground">Skill progression and achievement tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Current Rank: {progress.current.level}
            </CardTitle>
            <CardDescription>
              {progress.current.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{rewardState.points} points</span>
                {progress.next ? (
                  <span className="text-muted-foreground">{progress.pointsForNext - progress.pointsIntoLevel} points to next rank</span>
                ) : (
                  <span className="text-primary font-medium">Max Rank Achieved</span>
                )}
              </div>
              <Progress value={progress.percent} className="h-3" />
              {progress.next && (
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{progress.current.level}</span>
                  <span>{progress.next.level}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  Badges Earned
                </h4>
                {rewardState.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {rewardState.badges.map((badge, i) => (
                      <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">No badges earned yet.</div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  Suggested Next Skill
                </h4>
                <div className="p-3 bg-secondary/50 rounded-md border border-border text-sm font-medium">
                  {rewardState.suggestedNextSkill}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {rewardState.recentAchievements.length > 0 ? (
              <ul className="space-y-3">
                {rewardState.recentAchievements.slice(0, 5).map((ach, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Star className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground italic text-center py-4">No recent achievements.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Rank Roadmap
            </CardTitle>
            <CardDescription>The path to executive research</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {LEVELS.map((level, i) => {
                const isCurrent = level.level === progress.current.level;
                const isPassed = rewardState.points >= level.minPoints && !isCurrent;
                
                return (
                  <div key={level.level} className={`flex gap-4 p-3 rounded-md border ${isCurrent ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                    <div className="shrink-0 pt-0.5">
                      {isPassed ? (
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted flex items-center justify-center" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isCurrent ? 'text-primary' : isPassed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {level.level}
                        </span>
                        <span className="text-xs text-muted-foreground">({level.minPoints} pts)</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="w-5 h-5 text-primary" />
              How to Earn Points
            </CardTitle>
            <CardDescription>Actions that build research mastery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 mb-4 bg-muted/50 border border-border rounded-md flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold">Quality over speed.</span> The system rewards thoroughness, relying on official sources, identifying risks, and asking for help early. Rushing through requests without verification earns fewer points.
              </div>
            </div>
            
            <div className="space-y-2">
              {rewardActions.map((action, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm">{action.label}</span>
                  <Badge variant="outline" className="font-mono text-xs font-medium">+{action.points}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
