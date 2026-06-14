import React, { useState } from 'react';
import { useStore } from "@/hooks/use-store";
import { Blocker, BlockerStatus, Priority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Plus, LifeBuoy, Filter, CheckCircle2, Clock, Hourglass, type LucideIcon } from "lucide-react";
import { StatCard, type Accent } from "@/components/stat-card";
import { cn } from "@/lib/utils";

const BLOCKER_TYPES = [
  "I don't know where to start",
  "I can't find sources",
  "I found conflicting information",
  "I don't understand the topic",
  "I need a better AI prompt",
  "I need Rose review",
  "I need Carmen review",
  "I need Gregg review",
  "I need help turning this into a report",
  "I need help deciding what matters"
];

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Executive'];
const STATUSES: BlockerStatus[] = ['Open', 'In Review', 'Waiting on Landon', 'Resolved', 'Archived'];

const STATUS_BORDER_L: Record<BlockerStatus, string> = {
  'Open': 'border-l-blue-500',
  'In Review': 'border-l-sky-500',
  'Waiting on Landon': 'border-l-indigo-500',
  'Resolved': 'border-l-emerald-500',
  'Archived': 'border-l-slate-400',
};

const STATUS_BADGE: Record<BlockerStatus, string> = {
  'Open': 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  'In Review': 'bg-sky-500/10 text-sky-700 border-sky-500/30',
  'Waiting on Landon': 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30',
  'Resolved': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  'Archived': 'bg-slate-500/10 text-slate-700 border-slate-500/30',
};

export default function Blocked() {
  const { data, updateData } = useStore();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Blocker>>({});
  const [statusFilter, setStatusFilter] = useState<string>("Active"); // Active = not resolved/archived

  const filteredBlockers = data.blockers.filter(b => {
    if (statusFilter === "Active") return b.status === 'Open' || b.status === 'In Review' || b.status === 'Waiting on Landon';
    if (statusFilter === "All") return true;
    return b.status === statusFilter;
  });

  const handleCreate = () => {
    setFormData({
      id: crypto.randomUUID(),
      relatedResearchId: "",
      type: BLOCKER_TYPES[0],
      description: "",
      urgency: "Medium",
      whoShouldHelp: "",
      whatTried: "",
      suggestedNextStep: "",
      status: "Open"
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (blocker: Blocker) => {
    setFormData({ ...blocker });
    setEditingId(blocker.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.type || !formData.description) {
      toast({ title: "Error", description: "Type and description are required.", variant: "destructive" });
      return;
    }

    const blockerToSave = formData as Blocker;

    updateData(prev => {
      const existing = prev.blockers.findIndex(b => b.id === blockerToSave.id);
      if (existing >= 0) {
        const newBlockers = [...prev.blockers];
        newBlockers[existing] = blockerToSave;
        return { ...prev, blockers: newBlockers };
      } else {
        return { ...prev, blockers: [...prev.blockers, blockerToSave] };
      }
    });

    toast({ title: "Success", description: "Blocker saved successfully." });
    setIsDialogOpen(false);
  };

  const handleResolve = (id: string) => {
    updateData(prev => ({
      ...prev,
      blockers: prev.blockers.map(b => b.id === id ? { ...b, status: 'Resolved' } : b)
    }));
    toast({ title: "Resolved", description: "Blocker marked as resolved." });
  };

  const getUrgencyBadge = (urgency: Priority) => {
    if (urgency === 'Executive') return <Badge className="bg-rose-600 hover:bg-rose-700 text-white border-none shadow-sm shadow-rose-900/20">{urgency}</Badge>;
    if (urgency === 'High') return <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none">{urgency}</Badge>;
    if (urgency === 'Medium') return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none">{urgency}</Badge>;
    return <Badge variant="secondary">{urgency}</Badge>;
  };

  const activeBlockers = data.blockers.filter(
    (b) => b.status === "Open" || b.status === "In Review" || b.status === "Waiting on Landon"
  );
  const blockerKpis = [
    {
      label: "Active Issues",
      value: activeBlockers.length,
      icon: LifeBuoy,
    },
    {
      label: "Urgent",
      value: activeBlockers.filter((b) => b.urgency === "High" || b.urgency === "Executive").length,
      icon: AlertTriangle,
    },
    {
      label: "Resolved",
      value: data.blockers.filter((b) => b.status === "Resolved").length,
      icon: CheckCircle2,
    },
  ];

  const blockerStats: { label: string; value: number; icon: LucideIcon; color: Accent }[] = [
    { label: "Open", value: data.blockers.filter((b) => b.status === "Open").length, icon: LifeBuoy, color: "blue" },
    { label: "In Review", value: data.blockers.filter((b) => b.status === "In Review").length, icon: Clock, color: "sky" },
    { label: "Waiting on Landon", value: data.blockers.filter((b) => b.status === "Waiting on Landon").length, icon: Hourglass, color: "indigo" },
    { label: "Resolved", value: data.blockers.filter((b) => b.status === "Resolved").length, icon: CheckCircle2, color: "emerald" },
  ];

  return (
    <div className="space-y-6">
      {/* Executive hero banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15 backdrop-blur">
              <LifeBuoy className="h-3.5 w-3.5" />
              Escalation desk
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Blocked / Need Help
            </h1>
            <p className="mt-1.5 max-w-xl text-sm md:text-base text-blue-100/80">
              Raise issues early instead of spinning your wheels. Log what you tried, who should help, and the suggested next step — then route it for review.
            </p>
            <button
              type="button"
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
            >
              <LifeBuoy className="h-4 w-4" /> I'm Stuck
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            {blockerKpis.map((k) => (
              <div
                key={k.label}
                className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-blue-100/70">
                  <k.icon className="h-3.5 w-3.5" /> {k.label}
                </div>
                <div className="mt-1 text-2xl font-bold text-white">{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics strip — blockers by status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blockerStats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>

      <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border w-fit">
        <Filter className="w-4 h-4 text-muted-foreground ml-2" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active Issues</SelectItem>
            <SelectItem value="All">All Issues</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBlockers.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-lg text-muted-foreground bg-muted/10">
            <LifeBuoy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No blocked items found. Great progress!</p>
          </div>
        ) : (
          filteredBlockers.map(blocker => {
            const req = data.requests.find(r => r.id === blocker.relatedResearchId);
            return (
              <Card
                key={blocker.id}
                className={cn(
                  "border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  STATUS_BORDER_L[blocker.status]
                )}
              >
                <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{blocker.type}</h3>
                          {getUrgencyBadge(blocker.urgency)}
                        </div>
                        <p className="text-sm font-medium text-primary">Req: {req?.title || 'General / Unlinked'}</p>
                      </div>
                      <Badge variant="outline" className={cn("border", STATUS_BADGE[blocker.status])}>{blocker.status}</Badge>
                    </div>
                    
                    <div className="text-sm bg-muted/30 p-3 rounded-md border">
                      <span className="font-semibold block mb-1">Description:</span>
                      {blocker.description}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-semibold block text-foreground">What I've tried:</span>
                        {blocker.whatTried || 'Nothing yet.'}
                      </div>
                      <div>
                        <span className="font-semibold block text-foreground">Needs help from:</span>
                        {blocker.whoShouldHelp || 'Anyone'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-48 flex flex-col items-end justify-between border-l pl-6 space-y-4">
                    <div className="text-right w-full text-sm">
                      <span className="block text-muted-foreground mb-1">Suggested Next Step:</span>
                      <span className="font-medium">{blocker.suggestedNextStep || 'Need guidance'}</span>
                    </div>
                    <div className="flex flex-col space-y-2 w-full">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(blocker)}>Edit</Button>
                      {blocker.status !== 'Resolved' && (
                        <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleResolve(blocker.id)}>Mark Resolved</Button>
                      )}
                    </div>
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
            <DialogTitle>{editingId ? 'Edit Blocker' : 'Raise a Blocker'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            
            <div className="space-y-2">
              <Label>Blocker Type</Label>
              <Select value={formData.type || ''} onValueChange={v => setFormData({...formData, type: v})}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {BLOCKER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Related Research Request</Label>
              <Select value={formData.relatedResearchId || ''} onValueChange={v => setFormData({...formData, relatedResearchId: v})}>
                <SelectTrigger><SelectValue placeholder="Select request (Optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {data.requests.map(req => <SelectItem key={req.id} value={req.id}>{req.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Be specific about where you are stuck..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>What have you tried?</Label>
              <Textarea placeholder="Show that you've attempted to solve it..." value={formData.whatTried || ''} onChange={e => setFormData({...formData, whatTried: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select value={formData.urgency || 'Medium'} onValueChange={(v: Priority) => setFormData({...formData, urgency: v})}>
                  <SelectTrigger><SelectValue placeholder="Urgency" /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Who Should Help?</Label>
                <Select value={formData.whoShouldHelp || ''} onValueChange={v => setFormData({...formData, whoShouldHelp: v})}>
                  <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rose">Rose</SelectItem>
                    <SelectItem value="Carmen">Carmen</SelectItem>
                    <SelectItem value="Gregg">Gregg</SelectItem>
                    <SelectItem value="Anyone">Anyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Suggested Next Step</Label>
              <Input placeholder="E.g., Review my prompt, Check my logic..." value={formData.suggestedNextStep || ''} onChange={e => setFormData({...formData, suggestedNextStep: e.target.value})} />
            </div>

            <div className="space-y-2 border-t pt-4 mt-2">
              <Label>Status</Label>
              <Select value={formData.status || 'Open'} onValueChange={(v: BlockerStatus) => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Blocker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
