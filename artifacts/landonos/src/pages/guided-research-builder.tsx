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
import { Target, Search, Plus, Trash2, Edit2, Play, Archive, AlertTriangle, ClipboardList, Clock, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GuidedResearchBuilder() {
  const { data, updateData } = useStore();
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

  const handleArchive = (id: string) => {
    updateData(prev => ({ ...prev, requests: prev.requests.map(r => r.id === id ? { ...r, status: 'Archived' } : r) }));
    toast({ title: "Archived", description: "Request archived." });
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateData(prev => ({ ...prev, requests: prev.requests.map(r => r.id === id ? { ...r, status: newStatus } : r) }));
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

  const priorityAccent = (priority: Priority) =>
    priority === "Executive" || priority === "High"
      ? "border-l-rose-500"
      : priority === "Medium"
      ? "border-l-blue-500"
      : "border-l-slate-400";

  return (
    <div className="space-y-6">
      {/* Executive hero banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15 backdrop-blur">
              <Target className="h-3.5 w-3.5" />
              Structured intake
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Research Builder
            </h1>
            <p className="mt-1.5 max-w-xl text-sm md:text-base text-blue-100/80">
              Scope the question, lock the required sources, and define what not to assume before involving AI. Disciplined intake keeps the whole workflow defensible.
            </p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab("builder");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
            >
              <Plus className="h-4 w-4" /> New Request
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                  <k.icon className="h-3.5 w-3.5" /> {k.label}
                </div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {k.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">All Requests</TabsTrigger>
          <TabsTrigger value="builder" onClick={() => { if(activeTab !== "builder") resetForm(); }}>
            {editingId ? "Edit Request" : "New Builder"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <CardTitle className="text-lg font-medium">Research Requests</CardTitle>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search requests..." 
                      className="pl-8" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {data.settings.researchTypes.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-40">
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
                  <Button onClick={() => setActiveTab("builder")} className="shrink-0">
                    <Plus className="h-4 w-4 mr-2" /> New
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">No requests found</h3>
                  <p className="text-muted-foreground">Adjust filters or create a new request.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map(req => (
                    <Card key={req.id} className={`border-border/50 border-l-4 ${priorityAccent(req.priority)} shadow-sm overflow-hidden transition-shadow hover:shadow-md`}>
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
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(req)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {req.status !== 'Archived' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchive(req.id)}>
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(req.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-blue-500">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-md shadow-blue-500/30">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{editingId ? "Edit Request" : "Intake Form"}</CardTitle>
                    <CardDescription>Fill out all required context to structure the research.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                <Button variant="outline" onClick={resetForm}>Clear</Button>
                <Button type="submit" form="builder-form">{editingId ? "Update Request" : "Generate Plan & Create"}</Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              {generatedOutput ? (
                <>
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="text-primary h-5 w-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-primary">Initial Output Generated</p>
                      <p className="text-muted-foreground mt-1">Review the suggested approach below. AI output is draft only until source-checked and human-reviewed.</p>
                    </div>
                  </div>

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
    </div>
  );
}
