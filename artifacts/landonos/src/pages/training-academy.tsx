import React from 'react';
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { levelForPoints } from "@/lib/rewards";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, CheckCircle2, Circle, ArrowRight, PlayCircle } from "lucide-react";
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Training Academy</h1>
          <p className="text-muted-foreground">Master the art of AI-guided intelligence gathering</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span>{completedLessons} of {allLessons.length} lessons completed</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>
      
      <div className="space-y-8">
        {tracks.map(track => (
          <div key={track.id} className="space-y-4">
            <h2 className="text-xl font-bold flex items-center border-b pb-2">
              <GraduationCap className="w-5 h-5 mr-2 text-primary" />
              {track.title}
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {track.lessons.map(lesson => (
                <Card key={lesson.id} className={`overflow-hidden transition-colors ${lesson.completed ? 'border-primary/30 bg-primary/5' : ''}`}>
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            {lesson.completed ? (
                              <CheckCircle2 className="w-5 h-5 mr-2 text-primary" />
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
        ))}
      </div>
    </div>
  );
}
