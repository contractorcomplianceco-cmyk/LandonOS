import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";
import { levelForPoints } from "@/lib/rewards";
import { useToast } from "@/hooks/use-toast";

export default function TrainingAcademy() {
  const { data, updateData } = useStore();
  const { training, settings, rewardState } = data;
  const { toast } = useToast();

  const totalLessons = training.reduce((acc, track) => acc + track.lessons.length, 0);
  const completedLessons = training.reduce((acc, track) => acc + track.lessons.filter(l => l.completed).length, 0);
  const overallProgress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const toggleChecklist = (trackId: string, lessonId: string, itemIndex: number) => {
    updateData(prev => {
      const newTraining = [...prev.training];
      const trackIndex = newTraining.findIndex(t => t.id === trackId);
      if (trackIndex === -1) return prev;
      
      const newTrack = { ...newTraining[trackIndex] };
      const lessonIndex = newTrack.lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex === -1) return prev;
      
      const newLesson = { ...newTrack.lessons[lessonIndex] };
      const newChecklist = [...newLesson.checklist];
      newChecklist[itemIndex] = { ...newChecklist[itemIndex], done: !newChecklist[itemIndex].done };
      
      newLesson.checklist = newChecklist;
      newTrack.lessons[lessonIndex] = newLesson;
      newTraining[trackIndex] = newTrack;
      
      return { ...prev, training: newTraining };
    });
  };

  const completeLesson = (trackId: string, lessonId: string) => {
    updateData(prev => {
      const newTraining = [...prev.training];
      const trackIndex = newTraining.findIndex(t => t.id === trackId);
      if (trackIndex === -1) return prev;
      
      const newTrack = { ...newTraining[trackIndex] };
      const lessonIndex = newTrack.lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex === -1) return prev;
      
      const newLesson = { ...newTrack.lessons[lessonIndex] };
      if (newLesson.completed) return prev; // Already completed
      
      newLesson.completed = true;
      newTrack.lessons[lessonIndex] = newLesson;
      newTraining[trackIndex] = newTrack;
      
      const pointsEarned = prev.settings.rewardSettings.completeLesson;
      const newPoints = prev.rewardState.points + pointsEarned;
      const newLevel = levelForPoints(newPoints).level;
      
      const newRecentAchievements = [
        `Completed lesson: ${newLesson.title}`,
        ...prev.rewardState.recentAchievements
      ];

      toast({
        title: "Lesson Completed!",
        description: `You earned ${pointsEarned} points.`,
      });

      return {
        ...prev,
        training: newTraining,
        rewardState: {
          ...prev.rewardState,
          points: newPoints,
          level: newLevel,
          recentAchievements: newRecentAchievements
        }
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Training Academy</h1>
          <p className="text-muted-foreground">Master the principles of executive-level research</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <h3 className="font-semibold">Overall Progress</h3>
                <span className="text-sm font-medium">{completedLessons} / {totalLessons} Lessons</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {training.map((track, idx) => (
          <div key={track.id} className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
              <span className="text-muted-foreground font-mono text-sm">Track {idx + 1}</span>
              {track.title}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {track.lessons.map(lesson => (
                <Card key={lesson.id} className={`flex flex-col ${lesson.completed ? 'border-primary/30 bg-primary/5' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={lesson.completed ? "default" : "outline"} className={lesson.completed ? "bg-primary" : "text-muted-foreground"}>
                        {lesson.completed ? "Completed" : "Pending"}
                      </Badge>
                      <Badge variant="secondary" className="font-normal text-xs">{lesson.relatedModule}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{lesson.title}</CardTitle>
                    <CardDescription className="text-sm mt-2">{lesson.explanation}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div className="space-y-2 bg-secondary/30 p-3 rounded-md border border-border/50">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Checklist
                        </h4>
                        {lesson.checklist.map((item, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <Checkbox 
                              id={`check-${lesson.id}-${i}`} 
                              checked={item.done}
                              disabled={lesson.completed}
                              onCheckedChange={() => toggleChecklist(track.id, lesson.id, i)}
                              className="mt-0.5"
                            />
                            <label 
                              htmlFor={`check-${lesson.id}-${i}`}
                              className={`text-sm leading-tight cursor-pointer ${item.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                            >
                              {item.text}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-3 bg-muted rounded-md border border-border text-sm">
                        <div className="font-semibold flex items-center gap-1.5 mb-1 text-foreground">
                          <PlayCircle className="w-4 h-4 text-primary" /> Practice Task
                        </div>
                        <p className="text-muted-foreground">{lesson.practiceTask}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4">
                    <Button 
                      className="w-full" 
                      variant={lesson.completed ? "secondary" : "default"}
                      disabled={lesson.completed || !lesson.checklist.every(c => c.done)}
                      onClick={() => completeLesson(track.id, lesson.id)}
                    >
                      {lesson.completed ? (
                        <>Completed <CheckCircle2 className="w-4 h-4 ml-2" /></>
                      ) : (
                        <>Mark Lesson Complete <ChevronRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {track.lessons.length === 0 && (
                <div className="col-span-full p-8 text-center text-muted-foreground border rounded-lg bg-card">
                  No lessons in this track yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
