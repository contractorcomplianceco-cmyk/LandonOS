import React, { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, Plus, Trash2, Edit, Copy, AlertTriangle, FileText, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Handoff, HandoffStatus } from "@/lib/types";
import { StatCard, type Accent } from "@/components/stat-card";
import { cn } from "@/lib/utils";

const HANDOFF_STATUSES: HandoffStatus[] = [
  "Draft", "Ready for Rose", "Ready for Carmen", "Ready for Gregg", "Needs More Research", "Approved", "Archived"
];

const STATUS_BORDER_T: Record<HandoffStatus, string> = {
  "Draft": "border-t-slate-400",
  "Ready for Rose": "border-t-sky-500",
  "Ready for Carmen": "border-t-sky-500",
  "Ready for Gregg": "border-t-sky-500",
  "Needs More Research": "border-t-rose-500",
  "Approved": "border-t-emerald-500",
  "Archived": "border-t-slate-400",
};

const STATUS_BADGE: Record<HandoffStatus, string> = {
  "Draft": "bg-slate-500/10 text-slate-700 border-slate-500/30",
  "Ready for Rose": "bg-sky-500/10 text-sky-700 border-sky-500/30",
  "Ready for Carmen": "bg-sky-500/10 text-sky-700 border-sky-500/30",
  "Ready for Gregg": "bg-sky-500/10 text-sky-700 border-sky-500/30",
  "Needs More Research": "bg-rose-500/10 text-rose-700 border-rose-500/30",
  "Approved": "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  "Archived": "bg-slate-500/10 text-slate-700 border-slate-500/30",
};

export default function HandoffPage() {
  const { data, updateData } = useStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Handoff>>({
    title: "",
    whatResearched: "",
    whyItMatters: "",
    whatFound: "",
    stillUnknown: "",
    recommendedAction: "",
    whoReviews: "",
    affectsCompanyDecision: false,
    affectsClientFacing: false,
    updateCompanyBrain: false,
    sourcesAttached: [],
    reportAttached: "",
    status: "Draft"
  });

  const activeHandoffs = data.handoffs.filter(h => h.status !== 'Archived');
  const readyCount = activeHandoffs.filter(h => h.status.startsWith("Ready for")).length;
  const approvedCount = data.handoffs.filter(h => h.status === "Approved").length;
  const needsResearchCount = activeHandoffs.filter(h => h.status === "Needs More Research").length;

  const handleOpenDialog = (handoff?: Handoff) => {
    if (handoff) {
      setEditingId(handoff.id);
      setFormData({ ...handoff });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        whatResearched: "",
        whyItMatters: "",
        whatFound: "",
        stillUnknown: "",
        recommendedAction: "",
        whoReviews: "",
        affectsCompanyDecision: false,
        affectsClientFacing: false,
        updateCompanyBrain: false,
        sourcesAttached: [],
        reportAttached: "",
        status: "Draft"
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.whatResearched) {
      toast({ title: "Validation Error", description: "Title and What Was Researched are required.", variant: "destructive" });
      return;
    }

    if (editingId) {
      updateData(prev => ({
        ...prev,
        handoffs: prev.handoffs.map(h => h.id === editingId ? { ...h, ...formData as Handoff } : h)
      }));
      toast({ title: "Handoff updated", description: "Your handoff has been successfully updated." });
    } else {
      const newHandoff: Handoff = {
        ...(formData as Handoff),
        id: crypto.randomUUID()
      };
      updateData(prev => ({
        ...prev,
        handoffs: [...prev.handoffs, newHandoff]
      }));
      toast({ title: "Handoff created", description: "New handoff has been created." });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    updateData(prev => ({
      ...prev,
      handoffs: prev.handoffs.filter(h => h.id !== id)
    }));
    toast({ title: "Handoff deleted", description: "The handoff has been removed." });
  };

  const handleArchive = (id: string) => {
    updateData(prev => ({
      ...prev,
      handoffs: prev.handoffs.map(h => h.id === id ? { ...h, status: "Archived" } : h)
    }));
    toast({ title: "Handoff archived", description: "The handoff has been moved to the archive." });
  };

  const handleStatusChange = (id: string, newStatus: HandoffStatus) => {
    updateData(prev => ({
      ...prev,
      handoffs: prev.handoffs.map(h => h.id === id ? { ...h, status: newStatus } : h)
    }));
    toast({ title: "Status updated", description: `Handoff status changed to ${newStatus}.` });
  };

  const copyToClipboard = (handoff: Handoff) => {
    const text = `
RESEARCH HANDOFF: ${handoff.title}
Status: ${handoff.status}
Reviewer: ${handoff.whoReviews}

WHAT WAS RESEARCHED:
${handoff.whatResearched}

WHY IT MATTERS:
${handoff.whyItMatters}

WHAT WAS FOUND:
${handoff.whatFound}

STILL UNKNOWN:
${handoff.stillUnknown}

RECOMMENDED ACTION:
${handoff.recommendedAction}

FLAGS:
- Affects Company Decision: ${handoff.affectsCompanyDecision ? "Yes" : "No"}
- Affects Client-Facing: ${handoff.affectsClientFacing ? "Yes" : "No"}
- Update Company Brain: ${handoff.updateCompanyBrain ? "Yes" : "No"}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Handoff preview copied to clipboard." });
  };

  const getStatusColor = (status: HandoffStatus) => STATUS_BADGE[status];

  const handoffStats: { label: string; value: number; icon: LucideIcon; color: Accent }[] = [
    { label: "Approved", value: data.handoffs.filter((h) => h.status === "Approved").length, icon: CheckCircle2, color: "emerald" },
    { label: "Ready for Review", value: readyCount, icon: Send, color: "sky" },
    { label: "Drafts", value: data.handoffs.filter((h) => h.status === "Draft").length, icon: FileText, color: "slate" },
    { label: "Total", value: data.handoffs.length, icon: Clock, color: "blue" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-50 ring-1 ring-white/15 backdrop-blur">
              <Send className="h-3.5 w-3.5" />
              Leadership Handoff
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Research Completed Handoff</h1>
            <p className="max-w-xl text-blue-100/80">
              Structure and submit your research for leadership review — self-contained, source-checked, and decision-ready.
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-white text-slate-900 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" /> New Handoff
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-blue-100/70">Active</div>
              <div className="text-2xl font-bold text-white">{activeHandoffs.length}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-blue-100/70">Ready for Review</div>
              <div className="text-2xl font-bold text-white">{readyCount}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-blue-100/70">Approved</div>
              <div className="text-2xl font-bold text-white">{approvedCount}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-blue-100/70">Needs Research</div>
              <div className="text-2xl font-bold text-white">{needsResearchCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics strip — handoffs by status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {handoffStats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/10 p-4 rounded-md flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>Review Guidelines:</strong> Ensure your handoff is self-contained. A reviewer should understand what you found, why it matters, and what is still unknown without asking you. AI-generated content is draft only.
        </div>
      </div>

      {activeHandoffs.length === 0 ? (
        <Card className="border-dashed bg-muted/5">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p>No active handoffs found.</p>
            <p className="text-sm">Create a new handoff when your research is ready for review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeHandoffs.map(handoff => (
            <Card
              key={handoff.id}
              className={cn(
                "flex flex-col border-t-4 transition-all hover:-translate-y-0.5 hover:shadow-lg",
                STATUS_BORDER_T[handoff.status]
              )}
            >
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg">{handoff.title}</CardTitle>
                    <CardDescription className="mt-1">Reviewer: {handoff.whoReviews || "Unassigned"}</CardDescription>
                  </div>
                  <Badge variant="outline" className={cn("border", getStatusColor(handoff.status))}>
                    {handoff.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">What was found</h4>
                  <p className="text-sm line-clamp-3">{handoff.whatFound || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Recommended Action</h4>
                  <p className="text-sm line-clamp-2">{handoff.recommendedAction || "Not specified"}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {handoff.affectsCompanyDecision && <Badge variant="secondary" className="text-xs">Affects Decision</Badge>}
                  {handoff.affectsClientFacing && <Badge variant="secondary" className="text-xs">Client Facing</Badge>}
                  {handoff.updateCompanyBrain && <Badge variant="secondary" className="text-xs">Brain Update</Badge>}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/10 p-3 flex justify-between">
                <div className="flex gap-2">
                  <Select 
                    value={handoff.status} 
                    onValueChange={(val) => handleStatusChange(handoff.id, val as HandoffStatus)}
                  >
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HANDOFF_STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => copyToClipboard(handoff)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(handoff)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleArchive(handoff.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Handoff" : "Create New Handoff"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Research Title *</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. Q3 Vendor Compliance Audit"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Who should review it?</Label>
                <Select 
                  value={formData.whoReviews} 
                  onValueChange={val => setFormData({...formData, whoReviews: val})}
                >
                  <SelectTrigger><SelectValue placeholder="Select reviewer" /></SelectTrigger>
                  <SelectContent>
                    {data.settings.roleLabels.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={val => setFormData({...formData, status: val as HandoffStatus})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HANDOFF_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>What was researched? *</Label>
              <Textarea 
                className="h-20"
                value={formData.whatResearched} 
                onChange={e => setFormData({...formData, whatResearched: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Why it matters</Label>
              <Textarea 
                className="h-20"
                value={formData.whyItMatters} 
                onChange={e => setFormData({...formData, whyItMatters: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>What was found</Label>
              <Textarea 
                className="h-24"
                value={formData.whatFound} 
                onChange={e => setFormData({...formData, whatFound: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>What is still unknown</Label>
              <Textarea 
                className="h-20"
                value={formData.stillUnknown} 
                onChange={e => setFormData({...formData, stillUnknown: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Recommended Action</Label>
              <Textarea 
                className="h-20"
                value={formData.recommendedAction} 
                onChange={e => setFormData({...formData, recommendedAction: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="affects-company" 
                  checked={formData.affectsCompanyDecision}
                  onCheckedChange={checked => setFormData({...formData, affectsCompanyDecision: checked === true})}
                />
                <Label htmlFor="affects-company" className="text-sm font-normal">Affects company decision</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="affects-client" 
                  checked={formData.affectsClientFacing}
                  onCheckedChange={checked => setFormData({...formData, affectsClientFacing: checked === true})}
                />
                <Label htmlFor="affects-client" className="text-sm font-normal">Affects client-facing process</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="update-brain" 
                  checked={formData.updateCompanyBrain}
                  onCheckedChange={checked => setFormData({...formData, updateCompanyBrain: checked === true})}
                />
                <Label htmlFor="update-brain" className="text-sm font-normal">Update Company Brain</Label>
              </div>
            </div>

            {(formData.affectsCompanyDecision || formData.affectsClientFacing) && (
              <div className="bg-destructive/10 text-destructive text-xs p-2 rounded flex items-center mt-2">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Compliance and business conclusions require human review before client-facing or company-decision use.
              </div>
            )}
            
            <div className="space-y-2 pt-2 border-t mt-4">
              <Label>Attach Report</Label>
              <Select 
                value={formData.reportAttached || "none"} 
                onValueChange={val => setFormData({...formData, reportAttached: val === "none" ? "" : val})}
              >
                <SelectTrigger><SelectValue placeholder="Select a report to attach" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No report attached</SelectItem>
                  {data.reports.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.title} ({r.status})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Handoff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
