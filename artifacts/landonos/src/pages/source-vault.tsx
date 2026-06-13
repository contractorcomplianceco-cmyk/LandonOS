import React, { useState } from 'react';
import { useStore } from "@/hooks/use-store";
import { Source, SourceType } from "@/lib/types";
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
import { AlertTriangle, Plus, Database, ExternalLink, ShieldCheck, ShieldAlert, FileSearch } from "lucide-react";

const SOURCE_TYPES: SourceType[] = [
  'Official Source', 
  'Internal Company Record', 
  'Client-Provided', 
  'Competitor', 
  'Market-Industry', 
  'AI Draft', 
  'Unknown'
];

export default function SourceVault() {
  const { data, updateData } = useStore();
  const { toast } = useToast();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Source>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const filteredSources = data.sources.filter(s => {
    const matchesSearch = !searchQuery || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.keyFacts.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "All" || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = () => {
    setFormData({
      id: crypto.randomUUID(),
      title: "",
      urlOrFileRef: "",
      type: "Official Source",
      relatedResearchId: "",
      dateCaptured: new Date().toISOString().split('T')[0],
      summary: "",
      keyFacts: "",
      confidenceRating: 10,
      sourceQualityRating: 10,
      tags: [],
      notes: ""
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (source: Source) => {
    setFormData({ ...source });
    setEditingId(source.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.type) {
      toast({ title: "Error", description: "Title and type are required.", variant: "destructive" });
      return;
    }

    const sourceToSave = formData as Source;

    updateData(prev => {
      const existing = prev.sources.findIndex(s => s.id === sourceToSave.id);
      if (existing >= 0) {
        const newSources = [...prev.sources];
        newSources[existing] = sourceToSave;
        return { ...prev, sources: newSources };
      } else {
        return { ...prev, sources: [...prev.sources, sourceToSave] };
      }
    });

    toast({ title: "Success", description: "Source saved successfully." });
    setIsDialogOpen(false);
  };

  const getSourceStyle = (type: SourceType) => {
    if (type === 'Official Source') return 'bg-green-500/10 text-green-700 border-green-500/20';
    if (type === 'AI Draft' || type === 'Unknown') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  // Find risky research requests (only AI Draft/Unknown sources attached)
  const riskyResearchIds = data.requests.filter(req => {
    const attachedSources = data.sources.filter(s => s.relatedResearchId === req.id);
    if (attachedSources.length === 0) return false;
    return attachedSources.every(s => s.type === 'AI Draft' || s.type === 'Unknown');
  }).map(r => r.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Source Vault</h1>
          <p className="text-muted-foreground">Centralized repository for verified intelligence and documents</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Source
        </Button>
      </div>

      {risksWarning(riskyResearchIds, data.requests)}

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full">
          <FileSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title, summary, key facts, tags..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sources</SelectItem>
            {SOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSources.length === 0 ? (
          <div className="col-span-full text-center p-12 border border-dashed rounded-lg text-muted-foreground bg-muted/10">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No sources found. Adjust filters or add a new source.</p>
          </div>
        ) : (
          filteredSources.map(source => {
            const req = data.requests.find(r => r.id === source.relatedResearchId);
            const isOfficial = source.type === 'Official Source';
            const isRisky = source.type === 'AI Draft' || source.type === 'Unknown';
            
            return (
              <Card key={source.id} className={`flex flex-col hover:border-primary/50 transition-colors ${isOfficial ? 'border-green-500/30' : ''} ${isRisky ? 'border-destructive/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={getSourceStyle(source.type)}>
                      {isOfficial && <ShieldCheck className="w-3 h-3 mr-1" />}
                      {isRisky && <ShieldAlert className="w-3 h-3 mr-1" />}
                      {source.type}
                    </Badge>
                    <div className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                      Q: {source.sourceQualityRating}/10
                    </div>
                  </div>
                  <CardTitle className="text-base leading-tight">{source.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{source.summary}</p>
                  
                  <div className="mt-auto space-y-3">
                    {source.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {source.tags.map(t => (
                          <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground border-t pt-3 flex justify-between items-center">
                      <span className="truncate pr-2">Req: {req?.title || 'None'}</span>
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleEdit(source)}>Edit</Button>
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
            <DialogTitle>{editingId ? 'Edit Source' : 'Add Source'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            
            <div className="space-y-2">
              <Label>Source Title</Label>
              <Input value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>URL or File Ref</Label>
              <Input value={formData.urlOrFileRef || ''} onChange={e => setFormData({...formData, urlOrFileRef: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Source Type</Label>
              <Select value={formData.type || ''} onValueChange={(v: SourceType) => setFormData({...formData, type: v})}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
              <Label>Summary</Label>
              <Textarea value={formData.summary || ''} onChange={e => setFormData({...formData, summary: e.target.value})} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Key Facts (Extracted)</Label>
              <Textarea value={formData.keyFacts || ''} onChange={e => setFormData({...formData, keyFacts: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Quality Rating (1-10)</Label>
              <Input type="number" min="1" max="10" value={formData.sourceQualityRating || 5} onChange={e => setFormData({...formData, sourceQualityRating: parseInt(e.target.value) || 5})} />
            </div>

            <div className="space-y-2">
              <Label>Confidence Rating (1-10)</Label>
              <Input type="number" min="1" max="10" value={formData.confidenceRating || 5} onChange={e => setFormData({...formData, confidenceRating: parseInt(e.target.value) || 5})} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Tags (Comma separated)</Label>
              <Input 
                value={(formData.tags || []).join(', ')} 
                onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} 
                placeholder="Compliance, Pricing, AWS..."
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function risksWarning(riskyIds: string[], requests: any[]) {
  if (riskyIds.length === 0) return null;
  return (
    <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Action Required: AI-Only Source Risks Detected</AlertTitle>
      <AlertDescription>
        The following research requests currently rely ONLY on AI Draft or Unknown sources:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {riskyIds.map(id => {
            const req = requests.find(r => r.id === id);
            return <li key={id} className="font-medium">{req?.title}</li>;
          })}
        </ul>
        <p className="mt-2 text-sm">Please attach Official Sources before approving reports for these items.</p>
      </AlertDescription>
    </Alert>
  );
}
