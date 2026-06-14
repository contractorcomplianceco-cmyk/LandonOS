import React, { useState } from 'react';
import { useStore } from "@/hooks/use-store";
import { CompanyBrainUpdate, CompanyBrainUpdateStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrainCircuit, Plus, ShieldAlert, Trash2, Edit2, Database, CheckCircle2, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { cn } from "@/lib/utils";
import { RoseOSBrainChat } from "@/components/roseos-brain-chat";
import { PageHeader } from "@/components/page-header";
import { Toolbar } from "@/components/toolbar";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

const RECORD_TYPES = [
  "Active Projects Tracker",
  "Decision Log",
  "Build Registry",
  "Requirements Registry",
  "Automation Registry",
  "SOP Library",
  "Knowledge Gap Report",
  "Team Directory"
];

const STATUSES: CompanyBrainUpdateStatus[] = [
  "Suggested", "Needs Review", "Approved to Record", "Recorded", "Archived"
];

export default function CompanyBrain() {
  const { data, updateData } = useStore();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CompanyBrainUpdate>>({});
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const totalUpdates = data.brainUpdates.length;
  const recordedCount = data.brainUpdates.filter(u => u.status === "Recorded").length;
  const needsReviewCount = data.brainUpdates.filter(u => u.status === "Needs Review").length;

  const filteredUpdates = data.brainUpdates.filter(u => {
    const matchesSearch = !searchQuery || 
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.whatChanged.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.draftUpdateText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setFormData({
      id: crypto.randomUUID(),
      title: "",
      relatedResearchId: "",
      recommendedRecord: RECORD_TYPES[0],
      whatChanged: "",
      whyItMatters: "",
      draftUpdateText: "",
      status: "Suggested"
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (update: CompanyBrainUpdate) => {
    setFormData({ ...update });
    setEditingId(update.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.recommendedRecord || !formData.draftUpdateText) {
      toast({ title: "Error", description: "Title, Record Type, and Draft Text are required.", variant: "destructive" });
      return;
    }

    const updateToSave = formData as CompanyBrainUpdate;

    updateData(prev => {
      const existing = prev.brainUpdates.findIndex(u => u.id === updateToSave.id);
      if (existing >= 0) {
        const newUpdates = [...prev.brainUpdates];
        newUpdates[existing] = updateToSave;
        return { ...prev, brainUpdates: newUpdates };
      } else {
        return { ...prev, brainUpdates: [...prev.brainUpdates, updateToSave] };
      }
    });

    toast({ title: "Success", description: "Brain update saved." });
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    updateData(prev => ({
      ...prev,
      brainUpdates: prev.brainUpdates.filter(u => u.id !== deletingId)
    }));
    toast({ title: "Deleted", description: "Brain update removed." });
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const STATUS_STYLE: Record<CompanyBrainUpdateStatus, { border: string; badge: string }> = {
    "Recorded": { border: "border-l-emerald-500", badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
    "Approved to Record": { border: "border-l-emerald-500", badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
    "Needs Review": { border: "border-l-rose-500", badge: "bg-rose-500/10 text-rose-700 border-rose-500/30" },
    "Suggested": { border: "border-l-blue-500", badge: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
    "Archived": { border: "border-l-slate-400", badge: "bg-slate-500/10 text-slate-700 border-slate-400/40" },
  };

  const getStatusStyle = (status: CompanyBrainUpdateStatus) =>
    STATUS_STYLE[status] ?? { border: "border-l-slate-400", badge: "bg-slate-500/10 text-slate-700 border-slate-400/40" };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BrainCircuit}
        eyebrow="Institutional Memory"
        title="RoseOS"
        subtitle="The company's brain — a reviewed system of record for decisions, projects, and SOPs. Ask it what's on file, or file a suggestion. Nothing is recorded until a human signs off."
        action={
          <Button onClick={handleCreate} className="bg-white text-slate-900 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" />
            New Suggestion
          </Button>
        }
        statsClassName="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 shrink-0"
        stats={[
          { label: "Suggestions", value: totalUpdates, icon: Database },
          { label: "Recorded", value: recordedCount, icon: CheckCircle2 },
          { label: "Needs Review", value: needsReviewCount, icon: AlertCircle },
          { label: "Record Types", value: RECORD_TYPES.length, icon: BrainCircuit },
        ]}
      />

      <Alert className="bg-primary/5 border-primary/20 text-foreground">
        <ShieldAlert className="h-4 w-4 text-primary" />
        <AlertTitle className="font-semibold text-primary">Compliance Guardrail Active</AlertTitle>
        <AlertDescription>
          Company decisions are <strong>never auto-recorded</strong>. Everything stays "Suggested" until human-reviewed.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Suggestions" value={totalUpdates} icon={Database} color="blue" hint="Total on file" />
        <StatCard label="Recorded" value={recordedCount} icon={CheckCircle2} color="emerald" hint="Signed off by a human" />
        <StatCard label="Needs Review" value={needsReviewCount} icon={AlertCircle} color="rose" hint="Awaiting a reviewer" />
        <StatCard label="Record Types" value={RECORD_TYPES.length} icon={BrainCircuit} color="indigo" hint="System of record" />
      </div>

      <RoseOSBrainChat />

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search updates..."
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </Toolbar>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUpdates.length === 0 ? (
          <EmptyState icon={BrainCircuit} description="No brain updates found. Create a new suggestion." />
        ) : (
          filteredUpdates.map(update => {
            const req = data.requests.find(r => r.id === update.relatedResearchId);
            const style = getStatusStyle(update.status);
            return (
              <Card
                key={update.id}
                className={cn(
                  "flex flex-col border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  style.border
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">{update.recommendedRecord}</Badge>
                    <Badge variant="outline" className={style.badge}>{update.status}</Badge>
                  </div>
                  <CardTitle className="text-lg">{update.title}</CardTitle>
                  <CardDescription>From: {req?.title || 'No related request'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground">What Changed</div>
                    <p className="text-sm">{update.whatChanged}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground">Why It Matters</div>
                    <p className="text-sm">{update.whyItMatters}</p>
                  </div>
                  <div className="space-y-1 p-3 bg-muted/30 border rounded-md">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Draft Update Text</div>
                    <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap">{update.draftUpdateText}</p>
                  </div>
                  
                  <div className="mt-auto pt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(update)}>
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteClick(update.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Suggestion' : 'New Suggestion'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            
            <div className="space-y-2 md:col-span-2">
              <Label>Suggestion Title</Label>
              <Input value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Target Record</Label>
              <Select value={formData.recommendedRecord || ''} onValueChange={v => setFormData({...formData, recommendedRecord: v})}>
                <SelectTrigger><SelectValue placeholder="Select record" /></SelectTrigger>
                <SelectContent>
                  {RECORD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Related Research Request</Label>
              <Select value={formData.relatedResearchId || ''} onValueChange={v => setFormData({...formData, relatedResearchId: v})}>
                <SelectTrigger><SelectValue placeholder="Select request" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {data.requests.map(req => <SelectItem key={req.id} value={req.id}>{req.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>What Changed</Label>
              <Textarea value={formData.whatChanged || ''} onChange={e => setFormData({...formData, whatChanged: e.target.value})} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Why It Matters</Label>
              <Textarea value={formData.whyItMatters || ''} onChange={e => setFormData({...formData, whyItMatters: e.target.value})} />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Draft Update Text</Label>
              <Textarea className="font-mono text-sm" value={formData.draftUpdateText || ''} onChange={e => setFormData({...formData, draftUpdateText: e.target.value})} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Status</Label>
              <Select value={formData.status || ''} onValueChange={(v: CompanyBrainUpdateStatus) => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Suggestion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        description="This will permanently delete this update suggestion. This action cannot be undone."
      />

    </div>
  );
}
