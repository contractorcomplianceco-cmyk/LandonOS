import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Search, BrainCircuit, Pencil, Trash2, ArrowRight } from "lucide-react";
import { CompanyBrainUpdate, CompanyBrainUpdateStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

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

const STATUS_COLORS: Record<CompanyBrainUpdateStatus, string> = {
  "Suggested": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  "Needs Review": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Approved to Record": "bg-green-500/10 text-green-600 border-green-500/20",
  "Recorded": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Archived": "bg-muted text-muted-foreground border-muted-foreground/20"
};

export default function CompanyBrain() {
  const { data, updateData } = useStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<CompanyBrainUpdateStatus | "All">("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CompanyBrainUpdate | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [relatedResearchId, setRelatedResearchId] = useState("None");
  const [recommendedRecord, setRecommendedRecord] = useState(RECORD_TYPES[0]);
  const [whatChanged, setWhatChanged] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [draftUpdateText, setDraftUpdateText] = useState("");
  const [status, setStatus] = useState<CompanyBrainUpdateStatus>("Suggested");

  const openForm = (item?: CompanyBrainUpdate) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title);
      setRelatedResearchId(item.relatedResearchId || "None");
      setRecommendedRecord(item.recommendedRecord);
      setWhatChanged(item.whatChanged);
      setWhyItMatters(item.whyItMatters);
      setDraftUpdateText(item.draftUpdateText);
      setStatus(item.status);
    } else {
      setEditingItem(null);
      setTitle("");
      setRelatedResearchId("None");
      setRecommendedRecord(RECORD_TYPES[0]);
      setWhatChanged("");
      setWhyItMatters("");
      setDraftUpdateText("");
      setStatus("Suggested");
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!title || !whatChanged || !draftUpdateText) {
      toast({ title: "Validation Error", description: "Title, What Changed, and Draft Text are required.", variant: "destructive" });
      return;
    }

    const item: CompanyBrainUpdate = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      title,
      relatedResearchId: relatedResearchId === "None" ? "" : relatedResearchId,
      recommendedRecord,
      whatChanged,
      whyItMatters,
      draftUpdateText,
      status
    };

    updateData(prev => {
      let nextList;
      if (editingItem) {
        nextList = prev.brainUpdates.map(u => u.id === item.id ? item : u);
      } else {
        nextList = [...prev.brainUpdates, item];
      }
      return { ...prev, brainUpdates: nextList };
    });

    toast({ title: "Success", description: editingItem ? "Update saved." : "Suggestion created." });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if(confirm("Delete this suggestion?")) {
      updateData(prev => ({ ...prev, brainUpdates: prev.brainUpdates.filter(u => u.id !== id) }));
      toast({ title: "Deleted", description: "Suggestion removed." });
    }
  };

  const filteredUpdates = data.brainUpdates.filter(u => {
    if (filterStatus !== "All" && u.status !== filterStatus) return false;
    if (search && !u.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Brain Updates</h1>
          <p className="text-muted-foreground">Suggest changes to core company records</p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="w-4 h-4 mr-2" /> New Suggestion
        </Button>
      </div>

      <div className="bg-destructive/5 border border-destructive/20 rounded-md p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-destructive">Compliance Guardrail</h4>
          <p className="text-sm text-destructive/90 mt-1">Company decisions are never auto-recorded. Everything stays Suggested until reviewed by leadership.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search suggestions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Suggested">Suggested</SelectItem>
            <SelectItem value="Needs Review">Needs Review</SelectItem>
            <SelectItem value="Approved to Record">Approved to Record</SelectItem>
            <SelectItem value="Recorded">Recorded</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredUpdates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 border-dashed">
          <BrainCircuit className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No suggestions found</h3>
          <p className="text-muted-foreground mb-4">You haven't made any update suggestions yet.</p>
          <Button variant="outline" onClick={() => openForm()}>Create Suggestion</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUpdates.map(update => (
            <Card key={update.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <Badge variant="outline" className={STATUS_COLORS[update.status]}>{update.status}</Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openForm(update)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(update.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{update.title}</CardTitle>
                <div className="flex items-center text-xs text-muted-foreground font-mono mt-1">
                  <BrainCircuit className="w-3 h-3 mr-1" />
                  {update.recommendedRecord}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">What Changed</h4>
                  <p className="text-sm bg-muted/50 p-2 rounded border">{update.whatChanged}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Draft Text</h4>
                  <p className="text-sm bg-primary/5 border border-primary/20 p-2 rounded font-serif italic">"{update.draftUpdateText}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Suggestion" : "New Company Brain Suggestion"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Update Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g. Record approved vendor list for Q4" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Record Type</Label>
                <Select value={recommendedRecord} onValueChange={setRecommendedRecord}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECORD_TYPES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Suggested">Suggested</SelectItem>
                    <SelectItem value="Needs Review">Needs Review</SelectItem>
                    <SelectItem value="Approved to Record">Approved to Record</SelectItem>
                    <SelectItem value="Recorded">Recorded</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Related Research Request</Label>
              <Select value={relatedResearchId} onValueChange={setRelatedResearchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a request (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  {data.requests.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>What Changed?</Label>
              <Textarea value={whatChanged} onChange={e => setWhatChanged(e.target.value)} rows={2} />
            </div>

            <div className="grid gap-2">
              <Label>Why It Matters</Label>
              <Textarea value={whyItMatters} onChange={e => setWhyItMatters(e.target.value)} rows={2} />
            </div>

            <div className="grid gap-2">
              <Label>Draft Update Text (The exact text to be recorded)</Label>
              <Textarea value={draftUpdateText} onChange={e => setDraftUpdateText(e.target.value)} rows={3} className="font-serif" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Suggestion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
