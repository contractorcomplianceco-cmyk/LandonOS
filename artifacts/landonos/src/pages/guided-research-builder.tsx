import React, { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { useStore } from "@/hooks/use-store";
import { GPS_STEPS, defaultData } from "@/lib/default-data";
import { ResearchRequest, Status, Priority, ResearchType } from "@/lib/types";
import { generateResearchPlan, generateSourceChecklist, generateAiPrompt, generateFollowUpQuestions, generateReportOutline, recommendReviewer } from "@/lib/guided-research-templates";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trash2, Edit2, Play, Archive, ClipboardList, Clock, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { Toolbar } from "@/components/toolbar";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { PageLoadingSkeleton } from "@/components/page-loading";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function GuidedResearchBuilder() {
  const { data, updateData, syncMode, isSaving } = useStore();
  const { toast } = useToast();
  const search = useSearch();
  const [, navigate] = useLocation();

  const [activeTab, setActiveTab] = useState(
    new URLSearchParams(search).get("new") ? "builder" : "list"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ResearchRequest>>({
    title: "",
    type: "Compliance",
    requester: "",
    reviewer: "",
    priority: "Medium",
    dueDate: "",
    whatTryingToFindOut: "",
    decisionSupported: "",
    whatWeKnow: "",
    requiredSources: "",
    whatNotToAssume: "",
    completionCriteria: "",
    requiresHumanReview: true,
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      type: "Compliance",
      requester: "",
      reviewer: "",
      priority: "Medium",
      dueDate: "",
      whatTryingToFindOut: "",
      decisionSupported: "",
      whatWeKnow: "",
      requiredSources: "",
      whatNotToAssume: "",
      completionCriteria: "",
      requiresHumanReview: true,
      notes: "",
    });
    setEditingId(null);
    setGeneratedOutput(null);
  };

  useEffect(() => {
    if (new URLSearchParams(search).get("new")) {
      resetForm();
      setActiveTab("builder");
      navigate("/guided-research-builder", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleInputChange = (field: keyof ResearchRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.whatTryingToFindOut) {
      toast({ title: "Validation Error", description: "Title and Objective are required.", variant: "destructive" });
      return;
    }

    if (editingId) {
      updateData(prev => ({
        ...prev,
        requests: prev.requests.map(r => r.id === editingId ? { ...r, ...formData } as ResearchRequest : r)
      }));
      toast({ title: "Updated", description: "Research request updated successfully." });
      setActiveTab("list");
      resetForm();
    } else {
      const newId = crypto.randomUUID();
      const gpsSteps = GPS_STEPS.reduce((acc, step) => {
        acc[step] = "Not Started";
        return acc;
      }, {} as Record<string, Status>);

      const newReq: ResearchRequest = {
        ...(formData as any),
        id: newId,
        status: "Open",
        gpsSteps
      };

      updateData(prev => ({
        ...prev,
        requests: [...prev.requests, newReq]
      }));
      
      setGeneratedOutput({
        plan: generateResearchPlan(formData),
        checklist: generateSourceChecklist(formData),
        prompt: generateAiPrompt(formData),
        questions: generateFollowUpQuestions(formData),
        outline: generateReportOutline(formData),
        reviewer: recommendReviewer(formData)
      });

      toast({ title: "Success", description: "Research request created and initial plan generated." });
    }
  };

  const filteredRequests = data.requests.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.whatTryingToFindOut.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || r.type === filterType;
    const matchesPriority = filterPriority === "all" || r.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const handleDelete = (id: string) => {
    updateData(prev => ({ ...prev, requests: prev.requests.filter(r => r.id !== id) }));
    toast({ title: "Deleted", description: "Request removed." });
  };

  const requestDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) handleDelete(deletingId);
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleArchive = (id: string) => {
    updateData(prev => ({ ...prev, requests: prev.requests.map(r => r.id === id ? { ...r, status: 'Archived' } : r) }));
    toast({ title: "Archived", description: "Request archived." });
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateData(prev => ({ ...prev, requests: prev.requests.map(r => r.id === id ? { ...r, status: newStatus } : r) }));
    toast({ title: "Status updated", description: `Request marked as ${newStatus}.` });
  };

  const handleEdit = (req: ResearchRequest) => {
    setFormData(req);
    setEditingId(req.id);
    setActiveTab("builder");
  };

  const activeRequests = data.requests.filter(
    (r) => r.status !== "Archived"
  );
  const kpis = [
    {
      label: "Active Requests",
      value: activeRequests.length,
      icon: ClipboardList,
    },
    {
      label: "In Progress",
      value: data.requests.filter((r) => r.status === "In Progress").length,
      icon: Clock,
    },
    {
      label: "Awaiting Review",
      value: activeRequests.filter(
        (r) => r.requiresHumanReview && r.status !== "Completed"
      ).length,
      icon: ShieldAlert,
    },
  ];

  const builderFields = [
    formData.title,
    formData.requester,
    formData.reviewer,
    formData.dueDate,
    formData.whatTryingToFindOut,
    formData.decisionSupported,
    formData.whatWeKnow,
    formData.requiredSources,
    formData.whatNotToAssume,
    formData.completionCriteria,
  ];
  const builderFilled = builderFields.filter((f) => f && String(f).trim()).length;
  const builderCompleteness = Math.round((builderFilled / builderFields.length) * 100);

  const priorityAccent = (priority: Priority) =>
    priority === "Executive" || priority === "High"
      ? "border-l-rose-500"
      : priority === "Medium"
      ? "border-l-sky-500"
      : "border-l-slate-400";

  if (syncMode === "loading") {
    return <PageLoadingSkeleton />;
  }

  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-6">
      <PageHeader
        icon={Target}
        eyebrow="Structured intake"
        title="Research Engine"
        subtitle="Scope the question, lock the required sources, and define what not to assume before involving AI. Disciplined intake keeps the whole workflow defensible."
        action={
          <Button
            onClick={() => {
              resetForm();
              setActiveTab("builder");
            }}
            className="bg-white text-slate-900 hover:bg-slate-200"
          >
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Button>
        }
        statsClassName="grid grid-cols-3 gap-3 shrink-0"
        stats={kpis.map((k) => ({ label: k.label, value: k.value, icon: k.icon }))}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">All Requests</TabsTrigger>
          <TabsTrigger value="builder" onClick={() => { if(activeTab !== "builder") resetForm(); }}>
            {editingId ? "Edit Request" : "New Builder"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Toolbar
            sticky
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search requests..."
          >
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {data.settings.researchTypes.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                resetForm();
                setActiveTab("builder");
              }}
              className="shrink-0 min-h-10"
            >
              <Plus className="h-4 w-4 mr-2" /> New Request
            </Button>
          </Toolbar>
          {filteredRequests.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title={data.requests.length === 0 ? "No research requests yet" : "No matching requests"}
                  description={
                    data.requests.length === 0
                      ? "Create your first structured research request to generate a plan and source checklist."
                      : "Try clearing filters or start a new request."
                  }
                  action={
                    <Button
                      onClick={() => {
                        resetForm();
                        setActiveTab("builder");
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create Research Request
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map(req => (
                    <Card key={req.id} className={`border-border/50 border-l-4 ${priorityAccent(req.priority)} shadow-sm overflow-hidden transition-all hover:shadow-md active:scale-[0.995]`}>
                      <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{req.title}</h3>
                            <Badge variant={req.status === 'Completed' ? 'default' : req.status === 'Archived' ? 'secondary' : 'outline'}>
                              {req.status}
                            </Badge>
                            <Badge variant={req.priority === 'Executive' || req.priority === 'High' ? 'destructive' : 'secondary'}>
                              {req.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{req.whatTryingToFindOut}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Type: <span className="font-medium text-foreground">{req.type}</span></span>
                            <span>Due: <span className="font-medium text-foreground">{req.dueDate}</span></span>
                            <span>Reviewer: <span className="font-medium text-foreground">{req.reviewer}</span></span>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-end gap-2 shrink-0">
                          <Select value={req.status} onValueChange={(val) => handleStatusChange(req.id, val)}>
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Blocked">Blocked</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleEdit(req)} aria-label="Edit request">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit request</TooltipContent>
                            </Tooltip>
                            {req.status !== 'Archived' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleArchive(req.id)} aria-label="Archive request">
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Archive request</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => requestDelete(req.id)} aria-label="Delete request">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete request</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
        </TabsContent>

        <TabsContent value="builder">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-sky-500">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white shadow-md shadow-sky-500/30">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{editingId ? "Edit Request" : "Intake Form"}</CardTitle>
                    <CardDescription>Fill out all required context to structure the research.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-1.5 rounded-lg border bg-sky-500/5 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Intake completeness</span>
                    <span className="font-semibold tabular-nums text-sky-300">
                      {builderFilled} of {builderFields.length} fields
                    </span>
                  </div>
                  <Progress value={builderCompleteness} />
                </div>
                <form id="builder-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Research Title *</Label>
                    <Input id="title" value={formData.title} onChange={e => handleInputChange("title", e.target.value)} required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Research Type</Label>
                      <Select value={formData.type} onValueChange={v => handleInputChange("type", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {data.settings.researchTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={formData.priority} onValueChange={v => handleInputChange("priority", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Requester</Label>
                      <Input value={formData.requester} onChange={e => handleInputChange("requester", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Reviewer</Label>
                      <Input value={formData.reviewer} onChange={e => handleInputChange("reviewer", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="date" value={formData.dueDate} onChange={e => handleInputChange("dueDate", e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>What are you trying to find out? *</Label>
                    <Textarea value={formData.whatTryingToFindOut} onChange={e => handleInputChange("whatTryingToFindOut", e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label>What decision will this support?</Label>
                    <Input value={formData.decisionSupported} onChange={e => handleInputChange("decisionSupported", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>What do we already know?</Label>
                    <Textarea value={formData.whatWeKnow} onChange={e => handleInputChange("whatWeKnow", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>What sources are required?</Label>
                    <Input value={formData.requiredSources} onChange={e => handleInputChange("requiredSources", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>What should not be assumed?</Label>
                    <Input value={formData.whatNotToAssume} onChange={e => handleInputChange("whatNotToAssume", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>What would make this research complete?</Label>
                    <Input value={formData.completionCriteria} onChange={e => handleInputChange("completionCriteria", e.target.value)} />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="humanReview" checked={formData.requiresHumanReview} onCheckedChange={(c) => handleInputChange("requiresHumanReview", c)} />
                    <Label htmlFor="humanReview">Requires human review before use</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea value={formData.notes} onChange={e => handleInputChange("notes", e.target.value)} />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" onClick={resetForm} disabled={isSaving}>Clear Form</Button>
                <Button type="submit" form="builder-form" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "Create Request & Generate Plan"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              {generatedOutput ? (
                <>
                  <Card className="border-t-4 border-t-slate-500 bg-gradient-to-br from-slate-500/10 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-500 text-white shadow-sm shadow-slate-500/30">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        Initial Output Generated
                      </CardTitle>
                      <CardDescription>
                        Review the suggested approach below. AI output is draft only until source-checked and human-reviewed.
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Accordion type="multiple" defaultValue={["plan", "prompt"]} className="w-full">
                    <AccordionItem value="plan">
                      <AccordionTrigger className="text-base font-semibold">Research Plan</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {generatedOutput.plan.map((p: string, i: number) => (
                          <div key={i} className="p-3 bg-muted rounded-md text-sm">{p}</div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="prompt">
                      <AccordionTrigger className="text-base font-semibold">Suggested AI Prompt</AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 bg-sidebar text-sidebar-foreground rounded-md text-sm font-mono whitespace-pre-wrap">
                          {generatedOutput.prompt}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="checklist">
                      <AccordionTrigger className="text-base font-semibold">Source Checklist</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {generatedOutput.checklist.map((c: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <div className="h-5 w-5 rounded border border-primary flex items-center justify-center shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="questions">
                      <AccordionTrigger className="text-base font-semibold">Follow-Up Questions</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {generatedOutput.questions.map((q: string, i: number) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="outline">
                      <AccordionTrigger className="text-base font-semibold">Report Outline</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <div className="p-3 border rounded-md">
                          <ul className="list-decimal pl-5 text-sm space-y-1">
                            {generatedOutput.outline.map((o: string, i: number) => (
                              <li key={i}>{o}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-sm mt-4">
                          <strong>Recommended Reviewer:</strong> <Badge variant="secondary">{generatedOutput.reviewer}</Badge>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </>
              ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  <Play className="h-12 w-12 mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Ready to Structure</h3>
                  <p className="max-w-sm">Fill out the intake form and click generate. The system will create a structured plan, source constraints, and baseline prompts based on your inputs.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        description="This will permanently delete this research request. This action cannot be undone."
      />
    </div>
    </TooltipProvider>
  );
}
