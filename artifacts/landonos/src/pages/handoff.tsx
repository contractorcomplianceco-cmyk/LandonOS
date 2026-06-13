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
import { Send, Plus, Trash2, Edit, Copy, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Handoff, HandoffStatus } from "@/lib/types";

const HANDOFF_STATUSES: HandoffStatus[] = [
  "Draft", "Ready for Rose", "Ready for Carmen", "Ready for Gregg", "Needs More Research", "Approved", "Archived"
];

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

  const getStatusColor = (status: HandoffStatus) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Draft": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Needs More Research": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Send className="w-8 h-8 text-primary" />
            Research Completed Handoff
          </h1>
          <p className="text-muted-foreground">Structure and submit your research for leadership review.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> New Handoff
        </Button>
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
            <Card key={handoff.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg">{handoff.title}</CardTitle>
                    <CardDescription className="mt-1">Reviewer: {handoff.whoReviews || "Unassigned"}</CardDescription>
                  </div>
                  <Badge variant="outline" className={getStatusColor(handoff.status)}>
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
