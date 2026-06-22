import React from 'react';
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { levelForPoints } from "@/lib/rewards";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, CheckCircle2, Circle, PlayCircle, BookOpen, Star, ListChecks } from "lucide-react";
import { TrainingLesson } from "@/lib/types";

export default function TrainingAcademy() {
  const { data, updateData } = useStore();
  const { toast } = useToast();
  
  const tracks = data.training;
  const allLessons = tracks.flatMap(t => t.lessons);
  const completedLessons = allLessons.filter(l => l.completed).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 0;

  const handleToggleChecklist = (trackId: string, lessonId: string, itemIdx: number) => {
    updateData(prev => {
      const newTraining = [...prev.training];
      const trackIdx = newTraining.findIndex(t => t.id === trackId);
      if (trackIdx === -1) return prev;
      
      const newTrack = { ...newTraining[trackIdx], lessons: [...newTraining[trackIdx].lessons] };
      const lessonIdx = newTrack.lessons.findIndex(l => l.id === lessonId);
      if (lessonIdx === -1) return prev;
      
      const newLesson = { ...newTrack.lessons[lessonIdx], checklist: [...newTrack.lessons[lessonIdx].checklist] };
      newLesson.checklist[itemIdx] = { ...newLesson.checklist[itemIdx], done: !newLesson.checklist[itemIdx].done };
      
      newTrack.lessons[lessonIdx] = newLesson;
      newTraining[trackIdx] = newTrack;
      
      return { ...prev, training: newTraining };
    });
  };

  const handleToggleLessonCompletion = (trackId: string, lesson: TrainingLesson) => {
    const willComplete = !lesson.completed;
    
    updateData(prev => {
      const newTraining = [...prev.training];
      const trackIdx = newTraining.findIndex(t => t.id === trackId);
      if (trackIdx === -1) return prev;
      
      const newTrack = { ...newTraining[trackIdx], lessons: [...newTraining[trackIdx].lessons] };
      const lessonIdx = newTrack.lessons.findIndex(l => l.id === lesson.id);
      if (lessonIdx === -1) return prev;
      
      const newLesson = { ...newTrack.lessons[lessonIdx], completed: willComplete };
      newTrack.lessons[lessonIdx] = newLesson;
      newTraining[trackIdx] = newTrack;
      
      const pointsDelta = prev.settings.rewardSettings.completeLesson;
      const newPoints = Math.max(
        0,
        prev.rewardState.points + (willComplete ? pointsDelta : -pointsDelta)
      );
      const newLevelDef = levelForPoints(newPoints);

      const achievement = `Completed lesson: ${lesson.title}`;
      const newRewardState = {
        ...prev.rewardState,
        points: newPoints,
        level: newLevelDef.level,
        recentAchievements: willComplete
          ? [achievement, ...prev.rewardState.recentAchievements].slice(0, 10)
          : prev.rewardState.recentAchievements.filter(a => a !== achievement),
      };

      setTimeout(() => {
        toast({
          title: willComplete ? "Lesson Completed" : "Lesson Reopened",
          description: willComplete
            ? `You earned ${pointsDelta} points. Keep going!`
            : `${pointsDelta} points removed while this lesson is incomplete.`,
        });
      }, 100);

      return { ...prev, training: newTraining, rewardState: newRewardState };
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow="Skill Curriculum"
        title="Driver Training"
        subtitle="Master the art of AI-guided, source-verified intelligence gathering — one lesson at a time."
        stats={[
          { label: "Completed", value: completedLessons, icon: CheckCircle2 },
          { label: "Lessons", value: allLessons.length, icon: GraduationCap },
          { label: "Progress", value: `${progressPercent}%`, icon: ListChecks },
          { label: "Tracks", value: tracks.length, icon: BookOpen },
        ]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Tracks" value={tracks.length} icon={BookOpen} color="blue" />
        <StatCard label="Total Lessons" value={allLessons.length} icon={GraduationCap} color="sky" />
        <StatCard label="Lessons Completed" value={completedLessons} icon={CheckCircle2} color="emerald" />
        <StatCard label="Points Earned" value={data.rewardState.points} icon={Star} color="indigo" />
      </div>

      <Card className="border-t-4 border-t-emerald-500 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
              <ListChecks className="w-4 h-4" />
            </span>
            Overall Progress
          </CardTitle>
          <CardDescription>{completedLessons} of {allLessons.length} lessons completed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Curriculum completion</span>
            <span className="font-semibold tabular-nums text-emerald-400">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>
      
      <div className="space-y-8">
        {tracks.map(track => {
          const trackTotal = track.lessons.length;
          const trackDone = track.lessons.filter(l => l.completed).length;
          const trackPercent = trackTotal > 0 ? Math.round((trackDone / trackTotal) * 100) : 0;
          return (
          <div key={track.id} className="space-y-4">
            <div className="border-b pb-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500 text-white shadow-sm shadow-sky-500/30">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  {track.title}
                </h2>
                <span className="text-sm font-semibold tabular-nums text-sky-300 shrink-0">{trackDone}/{trackTotal}</span>
              </div>
              <Progress value={trackPercent} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {track.lessons.map(lesson => (
                <Card key={lesson.id} className={cn("overflow-hidden border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-md", lesson.completed ? "border-l-emerald-500 bg-emerald-500/5" : "border-l-slate-300")}>
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            {lesson.completed ? (
                              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5 mr-2 text-muted-foreground" />
                            )}
                            {lesson.title}
                          </h3>
                          <Badge variant="outline" className="mt-2 text-xs">Module: {lesson.relatedModule}</Badge>
                        </div>
                        <Button 
                          variant={lesson.completed ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleLessonCompletion(track.id, lesson)}
                        >
                          {lesson.completed ? "Mark as Incomplete" : "Mark as Completed"}
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{lesson.explanation}</p>
                      
                      <div className="bg-card border rounded-md p-4 space-y-3">
                        <h4 className="text-sm font-semibold mb-2">Checklist</h4>
                        {lesson.checklist.map((item, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <Checkbox 
                              id={`check-${lesson.id}-${idx}`}
                              checked={item.done}
                              onCheckedChange={() => handleToggleChecklist(track.id, lesson.id, idx)}
                            />
                            <label 
                              htmlFor={`check-${lesson.id}-${idx}`} 
                              className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${item.done ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {item.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-6 md:w-64 border-t md:border-t-0 md:border-l flex flex-col justify-center">
                      <h4 className="text-sm font-semibold flex items-center mb-2">
                        <PlayCircle className="w-4 h-4 mr-2 text-primary" />
                        Practice Task
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">{lesson.practiceTask}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
