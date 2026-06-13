import React, { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Lightbulb, Plus, Trash2, Edit, ArrowRight, Filter, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Idea, IdeaCategory, ConvertToType } from "@/lib/types";
import { GPS_STEPS } from "@/lib/default-data";

const IDEA_CATEGORIES: IdeaCategory[] = [
  "Opportunity", "Risk", "Automation", "Sales Support", "Compliance Support", "Client Support", "Internal Process"
];

const CONVERT_OPTIONS: ConvertToType[] = [
  "Research Request", "Automation Idea", "Leadership Question", "Company Brain Update Suggestion"
];

const PROMPT_CARDS = [
  { text: "What opportunity are we missing?", category: "Opportunity" },
  { text: "What risk should we watch?", category: "Risk" },
  { text: "What could be automated?", category: "Automation" },
  { text: "What would help sales?", category: "Sales Support" },
  { text: "What would help compliance?", category: "Compliance Support" },
  { text: "What would help Gregg prepare?", category: "Internal Process" },
  { text: "What should Rose know?", category: "Internal Process" },
  { text: "What research should we do next?", category: "Opportunity" },
  { text: "What process seems confusing?", category: "Internal Process" },
  { text: "What pattern are you noticing?", category: "Opportunity" }
] as const;

export default function BrainstormingStudio() {
  const { data, updateData } = useStore();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  
  const [formData, setFormData] = useState<Partial<Idea>>({
    title: "",
    category: "Opportunity",
    description: "",
    whyItMatters: "",
    suggestedNextAction: "",
    convertTo: null
  });

  const filteredIdeas = filterCategory === "All" 
    ? data.ideas 
    : data.ideas.filter(i => i.category === filterCategory);

  const handleOpenDialog = (idea?: Idea, defaultTitle?: string, defaultCategory?: IdeaCategory) => {
    if (idea) {
      setEditingId(idea.id);
      setFormData({ ...idea });
    } else {
      setEditingId(null);
      setFormData({
        title: defaultTitle || "",
        category: defaultCategory || "Opportunity",
        description: "",
        whyItMatters: "",
        suggestedNextAction: "",
        convertTo: null
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.category) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      return;
    }

    if (editingId) {
      updateData(prev => ({
        ...prev,
        ideas: prev.ideas.map(i => i.id === editingId ? { ...i, ...formData as Idea } : i)
      }));
      toast({ title: "Idea updated", description: "Your idea has been successfully updated." });
    } else {
      const newIdea: Idea = {
        ...(formData as Idea),
        id: crypto.randomUUID(),
        convertTo: null
      };
      updateData(prev => ({
        ...prev,
        ideas: [...prev.ideas, newIdea]
      }));
      toast({ title: "Idea captured", description: "Your new idea has been saved." });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    updateData(prev => ({
      ...prev,
      ideas: prev.ideas.filter(i => i.id !== id)
    }));
    toast({ title: "Idea deleted", description: "The idea has been removed from the studio." });
  };

  const handleConvert = (idea: Idea, targetType: ConvertToType) => {
    const id = crypto.randomUUID();
    
    if (targetType === "Research Request") {
      updateData(prev => ({
        ...prev,
        requests: [...prev.requests, {
          id,
          title: idea.title,
          type: "Internal Operations",
          requester: data.settings.userName,
          reviewer: "Rose",
          priority: "Medium",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          whatTryingToFindOut: idea.description,
          decisionSupported: idea.whyItMatters,
          whatWeKnow: "",
          requiredSources: "",
          whatNotToAssume: "",
          completionCriteria: idea.suggestedNextAction,
          requiresHumanReview: true,
          notes: "Converted from Brainstorming Studio",
          status: "Open",
          gpsSteps: GPS_STEPS.reduce((acc, step) => ({ ...acc, [step]: "Not Started" }), {})
        }],
        ideas: prev.ideas.map(i => i.id === idea.id ? { ...i, convertTo: targetType } : i)
      }));
      toast({ title: "Converted to Research Request", description: "A new open research request has been created." });
    } else if (targetType === "Company Brain Update Suggestion") {
      updateData(prev => ({
        ...prev,
        brainUpdates: [...prev.brainUpdates, {
          id,
          title: idea.title,
          relatedResearchId: "",
          recommendedRecord: "Active Projects Tracker",
          whatChanged: idea.description,
          whyItMatters: idea.whyItMatters,
          draftUpdateText: `[${idea.category}] ${idea.suggestedNextAction}`,
          status: "Suggested"
        }],
        ideas: prev.ideas.map(i => i.id === idea.id ? { ...i, convertTo: targetType } : i)
      }));
      toast({ title: "Converted to Brain Update", description: "A new company brain update suggestion has been created." });
    } else {
      updateData(prev => ({
        ...prev,
        ideas: prev.ideas.map(i => i.id === idea.id ? { ...i, convertTo: targetType } : i)
      }));
      toast({ title: "Idea converted", description: `Idea marked as converted to ${targetType}.` });
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case "Risk": return "bg-red-100 text-red-800 border-red-200";
      case "Opportunity": return "bg-green-100 text-green-800 border-green-200";
      case "Automation": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-primary" />
            Brainstorming Studio
          </h1>
          <p className="text-muted-foreground">Capture, categorize, and convert ideas into actionable research.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Freeform Idea
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Idea Starters</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {PROMPT_CARDS.map((card, idx) => (
            <Card 
              key={idx} 
              className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group"
              onClick={() => handleOpenDialog(undefined, card.text, card.category as IdeaCategory)}
            >
              <CardContent className="p-4 flex flex-col h-full justify-between">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">{card.text}</p>
                <div className="mt-3 flex justify-between items-center">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {card.category}
                  </Badge>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="border-t pt-8 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Idea Board</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {IDEA_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredIdeas.length === 0 ? (
          <Card className="border-dashed bg-muted/5">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Target className="w-12 h-12 mb-4 opacity-20" />
              <p>No ideas found in this category.</p>
              <p className="text-sm">Click an Idea Starter above to begin brainstorming.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map(idea => (
              <Card key={idea.id} className={`flex flex-col relative overflow-hidden ${idea.convertTo ? 'opacity-70 grayscale-[30%]' : ''}`}>
                {idea.convertTo && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-bl-md font-medium shadow-sm z-10">
                    Converted: {idea.convertTo}
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-base font-semibold leading-tight">{idea.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className={`w-fit mt-2 ${getCategoryColor(idea.category)}`}>
                    {idea.category}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0 flex-1 space-y-3 text-sm">
                  {idea.description && (
                    <p className="text-muted-foreground line-clamp-3">{idea.description}</p>
                  )}
                  {idea.suggestedNextAction && (
                    <div className="bg-muted/30 p-2 rounded border text-xs">
                      <span className="font-semibold block mb-1">Next Action:</span>
                      {idea.suggestedNextAction}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/10 p-3 flex justify-between gap-2">
                  <Select 
                    value={idea.convertTo || "convert"} 
                    onValueChange={(val) => handleConvert(idea, val as ConvertToType)}
                  >
                    <SelectTrigger className="flex-1 h-8 text-xs bg-background">
                      <SelectValue placeholder="Convert to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONVERT_OPTIONS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(idea)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(idea.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Idea" : "Capture Idea"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Idea / Prompt *</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. What opportunity are we missing with X?"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={val => setFormData({...formData, category: val as IdeaCategory})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IDEA_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                className="h-20"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Expand on the idea..."
              />
            </div>

            <div className="space-y-2">
              <Label>Why it matters</Label>
              <Textarea 
                className="h-16"
                value={formData.whyItMatters} 
                onChange={e => setFormData({...formData, whyItMatters: e.target.value})} 
                placeholder="What is the business impact?"
              />
            </div>

            <div className="space-y-2">
              <Label>Suggested Next Action</Label>
              <Input 
                value={formData.suggestedNextAction} 
                onChange={e => setFormData({...formData, suggestedNextAction: e.target.value})} 
                placeholder="e.g. Schedule 15 min review with Rose"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Idea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
