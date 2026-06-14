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
import { BrainCircuit, Plus, ShieldAlert, FileSearch, Trash2, Edit2, Database, CheckCircle2, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { cn } from "@/lib/utils";
import { RoseOSBrainChat } from "@/components/roseos-brain-chat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15 backdrop-blur">
              <BrainCircuit className="h-3.5 w-3.5" />
              Institutional Memory
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">RoseOS</h1>
            <p className="mt-1.5 max-w-xl text-sm md:text-base text-blue-100/80">
              The company's brain — a reviewed system of record for decisions, projects, and SOPs. Ask it what's on file, or file a suggestion. Nothing is recorded until a human signs off.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 shrink-0">
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <Database className="h-3.5 w-3.5" /> Suggestions
              </div>
              <div className="mt-1 text-2xl font-bold text-white">{totalUpdates}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <CheckCircle2 className="h-3.5 w-3.5" /> Recorded
              </div>
              <div className="mt-1 text-2xl font-bold text-white">{recordedCount}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <AlertCircle className="h-3.5 w-3.5" /> Needs Review
              </div>
              <div className="mt-1 text-2xl font-bold text-white">{needsReviewCount}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                <BrainCircuit className="h-3.5 w-3.5" /> Record Types
              </div>
              <div className="mt-1 text-2xl font-bold text-white">{RECORD_TYPES.length}</div>
            </div>
          </div>
        </div>

        <div className="relative mt-6">
          <Button onClick={handleCreate} className="bg-white text-slate-900 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" />
            New Suggestion
          </Button>
        </div>
      </div>

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

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full">
          <FileSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search updates..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUpdates.length === 0 ? (
          <div className="col-span-full text-center p-12 border border-dashed rounded-lg text-muted-foreground bg-muted/10">
            <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No brain updates found. Create a new suggestion.</p>
          </div>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this update suggestion. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
