import React, { useState, useMemo } from 'react';
import { useStore } from "@/hooks/use-store";
import { Report, ReportStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Plus, FileText, CheckCircle2, ClipboardCopy, Trash2, ShieldAlert, Files, FileClock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { StatCard, ACCENT, type Accent } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Toolbar } from "@/components/toolbar";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

const REPORT_STATUSES: ReportStatus[] = ['Draft', 'Needs Sources', 'Ready for Review', 'Needs More Research', 'Reviewed', 'Approved', 'Archived'];

export default function ReportBuilder() {
  const { data, updateData } = useStore();
  const { toast } = useToast();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Report>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const activeReports = data.reports.filter(r => r.status !== 'Archived' && r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreate = () => {
    setFormData({
      id: crypto.randomUUID(),
      title: "",
      relatedResearchId: "",
      preparedFor: "",
      preparedBy: data.settings.userName,
      date: new Date().toISOString().split('T')[0],
      objective: "",
      executiveSummary: "",
      keyFindings: "",
      sourceBackedFacts: "",
      risks: "",
      opportunities: "",
      unknowns: "",
      recommendation: "",
      nextSteps: "",
      sourcesReviewed: [],
      reviewerNotes: "",
      status: 'Draft'
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (report: Report) => {
    setFormData({ ...report });
    setEditingId(report.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.relatedResearchId) {
      toast({ title: "Error", description: "Title and related research are required.", variant: "destructive" });
      return;
    }

    const reportToSave = formData as Report;

    updateData(prev => {
      const existing = prev.reports.findIndex(r => r.id === reportToSave.id);
      if (existing >= 0) {
        const newReports = [...prev.reports];
        newReports[existing] = reportToSave;
        return { ...prev, reports: newReports };
      } else {
        return { ...prev, reports: [...prev.reports, reportToSave] };
      }
    });

    toast({ title: "Success", description: "Report saved successfully." });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    updateData(prev => ({ ...prev, reports: prev.reports.filter(r => r.id !== id) }));
    toast({ title: "Deleted", description: "Report has been deleted." });
  };

  const requestDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      setIsDialogOpen(false);
      handleDelete(deletingId);
    }
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleArchive = (id: string) => {
    updateData(prev => ({
      ...prev,
      reports: prev.reports.map(r => r.id === id ? { ...r, status: 'Archived' } : r)
    }));
    toast({ title: "Archived", description: "Report has been archived." });
  };

  const calculateReadiness = (report: Partial<Report>) => {
    let score = 0;
    const requiredSections = ['executiveSummary', 'keyFindings', 'sourceBackedFacts', 'recommendation'];
    const completedSections = requiredSections.filter(s => report[s as keyof Report] && (report[s as keyof Report] as string).trim().length > 0);
    score += (completedSections.length / requiredSections.length) * 40;

    const sources = report.sourcesReviewed?.map(id => data.sources.find(s => s.id === id)).filter(Boolean) || [];
    if (sources.length > 0) score += 20;
    if (sources.length > 2) score += 10;

    const avgQuality = sources.length ? sources.reduce((acc, s) => acc + (s?.sourceQualityRating || 0), 0) / sources.length : 0;
    if (avgQuality >= 8) score += 20;
    else if (avgQuality >= 5) score += 10;

    if (!report.unknowns || report.unknowns.trim().length === 0) score += 10;

    const req = data.requests.find(r => r.id === report.relatedResearchId);
    if (req && req.requiresHumanReview && report.status !== 'Reviewed' && report.status !== 'Approved') {
      // Penalty or just don't add
    }

    return Math.min(100, Math.round(score));
  };

  const getWarnings = (report: Partial<Report>) => {
    const warnings = [];
    const sources = report.sourcesReviewed?.map(id => data.sources.find(s => s.id === id)).filter(Boolean) || [];
    const req = data.requests.find(r => r.id === report.relatedResearchId);
    
    if (sources.length > 0 && !sources.some(s => s?.type === 'Official Source')) {
      warnings.push("Needs official source");
    }
    if (sources.length > 0 && sources.every(s => s?.type === 'AI Draft' || s?.type === 'Unknown')) {
      warnings.push("AI-only source risk");
    }
    if (req?.requiresHumanReview && report.status !== 'Approved') {
      warnings.push("Human review required");
    }
    if (report.unknowns && report.unknowns.trim().length > 0) {
      warnings.push("Open questions remain");
    }
    if (report.reviewerNotes && report.reviewerNotes.trim().length > 0 && report.status !== 'Approved') {
      warnings.push("Unresolved reviewer notes");
    }

    return warnings;
  };

  const copyToClipboard = (report: Report) => {
    const text = `
Title: ${report.title}
Date: ${report.date}
Prepared For: ${report.preparedFor}
Prepared By: ${report.preparedBy}

OBJECTIVE:
${report.objective}

EXECUTIVE SUMMARY:
${report.executiveSummary}

KEY FINDINGS:
${report.keyFindings}

SOURCE-BACKED FACTS:
${report.sourceBackedFacts}

RISKS:
${report.risks}

OPPORTUNITIES:
${report.opportunities}

UNKNOWNS:
${report.unknowns}

RECOMMENDATION:
${report.recommendation}

NEXT STEPS:
${report.nextSteps}

SOURCES REVIEWED:
${report.sourcesReviewed.map(id => {
  const s = data.sources.find(s => s.id === id);
  return s ? `- ${s.title} (${s.type})` : `- Unknown Source`;
}).join('\n')}
    `.trim();
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Report text copied to clipboard." });
  };

  const renderPreview = (reportId: string | null) => {
    if (!reportId) return null;
    const report = data.reports.find(r => r.id === reportId);
    if (!report) return null;

    return (
      <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>Clean export-ready format</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-sm">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">{report.title}</h2>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>Prepared For: <span className="text-foreground">{report.preparedFor}</span></div>
                <div>Date: <span className="text-foreground">{report.date}</span></div>
                <div>Prepared By: <span className="text-foreground">{report.preparedBy}</span></div>
                <div>Status: <Badge variant="outline">{report.status}</Badge></div>
              </div>
            </div>
            
            {report.objective && (<div><h3 className="font-semibold text-primary mb-1 uppercase text-xs">Objective</h3><p className="whitespace-pre-wrap">{report.objective}</p></div>)}
            {report.executiveSummary && (<div><h3 className="font-semibold text-primary mb-1 uppercase text-xs">Executive Summary</h3><p className="whitespace-pre-wrap">{report.executiveSummary}</p></div>)}
            {report.keyFindings && (<div><h3 className="font-semibold text-primary mb-1 uppercase text-xs">Key Findings</h3><p className="whitespace-pre-wrap">{report.keyFindings}</p></div>)}
            {report.sourceBackedFacts && (<div><h3 className="font-semibold text-primary mb-1 uppercase text-xs">Source-Backed Facts</h3><p className="whitespace-pre-wrap">{report.sourceBackedFacts}</p></div>)}
            
            <div className="grid grid-cols-2 gap-4">
              {report.risks && (<div><h3 className="font-semibold text-rose-400 mb-1 uppercase text-xs">Risks</h3><p className="whitespace-pre-wrap">{report.risks}</p></div>)}
              {report.opportunities && (<div><h3 className="font-semibold text-emerald-400 mb-1 uppercase text-xs">Opportunities</h3><p className="whitespace-pre-wrap">{report.opportunities}</p></div>)}
            </div>

            {report.unknowns && (<div><h3 className="font-semibold text-rose-400 mb-1 uppercase text-xs">Unknowns</h3><p className="whitespace-pre-wrap">{report.unknowns}</p></div>)}
            {report.recommendation && (<div><h3 className="font-semibold text-primary mb-1 uppercase text-xs">Recommendation</h3><p className="whitespace-pre-wrap font-medium">{report.recommendation}</p></div>)}
            {report.nextSteps && (<div><h3 className="font-semibold text-primary mb-1 uppercase text-xs">Next Steps</h3><p className="whitespace-pre-wrap">{report.nextSteps}</p></div>)}
            
            {report.sourcesReviewed.length > 0 && (
              <div>
                <h3 className="font-semibold text-primary mb-1 uppercase text-xs">Sources Reviewed</h3>
                <ul className="list-disc pl-5">
                  {report.sourcesReviewed.map(id => {
                    const s = data.sources.find(s => s.id === id);
                    return <li key={id}>{s?.title || id} <Badge variant="secondary" className="ml-2 text-[10px]">{s?.type}</Badge></li>;
                  })}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewId(null)}>Close</Button>
            <Button onClick={() => copyToClipboard(report)}>
              <ClipboardCopy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const nonArchivedReports = data.reports.filter((r) => r.status !== "Archived");
  const reportKpis = [
    {
      label: "Active Reports",
      value: nonArchivedReports.length,
      icon: FileText,
    },
    {
      label: "Approved",
      value: nonArchivedReports.filter((r) => r.status === "Approved").length,
      icon: CheckCircle2,
    },
    {
      label: "Awaiting Review",
      value: nonArchivedReports.filter((r) => r.status === "Ready for Review").length,
      icon: ShieldAlert,
    },
  ];

  const statusAccent = (status: ReportStatus) => {
    switch (status) {
      case "Approved":
        return "border-l-emerald-500";
      case "Reviewed":
      case "Ready for Review":
        return "border-l-sky-500";
      case "Needs Sources":
      case "Needs More Research":
        return "border-l-rose-500";
      default:
        return "border-l-slate-400";
    }
  };

  const readinessAccent = (score: number): Accent => {
    if (score >= 80) return "emerald";
    if (score >= 50) return "blue";
    return "rose";
  };

  const reportMetrics: { label: string; value: number; icon: typeof FileText; color: Accent }[] = [
    { label: "Total Reports", value: nonArchivedReports.length, icon: Files, color: "blue" },
    { label: "Drafts", value: nonArchivedReports.filter((r) => r.status === "Draft").length, icon: FileClock, color: "slate" },
    { label: "Needs Sources", value: nonArchivedReports.filter((r) => r.status === "Needs Sources" || r.status === "Needs More Research").length, icon: ShieldAlert, color: "rose" },
    { label: "Approved", value: nonArchivedReports.filter((r) => r.status === "Approved").length, icon: CheckCircle2, color: "emerald" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        eyebrow="Executive reporting"
        title="Brief Builder"
        subtitle="Draft, score, and finalize source-backed executive reports. The readiness score flags gaps before anything reaches a decision-maker."
        action={
          <Button onClick={handleCreate} className="bg-white text-slate-900 hover:bg-slate-200">
            <Plus className="h-4 w-4 mr-2" /> New Report
          </Button>
        }
        statsClassName="grid grid-cols-3 gap-3 shrink-0"
        stats={reportKpis.map((k) => ({ label: k.label, value: k.value, icon: k.icon }))}
      />

      {/* Report metrics strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportMetrics.map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} icon={m.icon} color={m.color} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500 text-white shadow-sm shadow-sky-500/30">
          <FileText className="w-4 h-4" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight">Active Reports</h2>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search reports..."
      />

      <div className="grid grid-cols-1 gap-4">
        {activeReports.length === 0 ? (
          <EmptyState icon={FileText} description="No reports found. Create your first report to get started." />
        ) : (
          activeReports.map(report => {
            const readiness = calculateReadiness(report);
            const warnings = getWarnings(report);
            const rAccent = ACCENT[readinessAccent(readiness)];

            return (
              <Card key={report.id} className={cn("border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-lg", statusAccent(report.status))}>
                <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Prepared for: {report.preparedFor || 'Unassigned'} • By: {report.preparedBy}</p>
                      </div>
                      <Badge variant={report.status === 'Approved' ? 'default' : 'outline'}>{report.status}</Badge>
                    </div>
                    
                    {warnings.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {warnings.map(w => (
                          <Badge key={w} variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            {w}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="md:w-64 flex flex-col items-end justify-between border-l pl-6">
                    <div className="w-full mb-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-medium text-muted-foreground">Readiness Score</span>
                        <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-sm font-bold tabular-nums", rAccent.soft, rAccent.value)}>
                          {readiness}/100
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", rAccent.iconSolid)}
                          style={{ width: `${readiness}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewId(report.id)}>Preview</Button>
                      <Button size="sm" className="flex-1" onClick={() => handleEdit(report)}>Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Report' : 'New Report'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Report Title</Label>
                <Input value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Related Research Request</Label>
                <Select value={formData.relatedResearchId || ''} onValueChange={v => setFormData({...formData, relatedResearchId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select research request" /></SelectTrigger>
                  <SelectContent>
                    {data.requests.map(req => (
                      <SelectItem key={req.id} value={req.id}>{req.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prepared For (Reviewer)</Label>
                  <Input value={formData.preparedFor || ''} onChange={e => setFormData({...formData, preparedFor: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status || 'Draft'} onValueChange={(v: ReportStatus) => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      {REPORT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Objective</Label>
                <Textarea className="h-20" value={formData.objective || ''} onChange={e => setFormData({...formData, objective: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Executive Summary</Label>
                <Textarea className="h-32" value={formData.executiveSummary || ''} onChange={e => setFormData({...formData, executiveSummary: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <Label>Recommendation</Label>
                <Textarea className="h-24 font-medium" value={formData.recommendation || ''} onChange={e => setFormData({...formData, recommendation: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sources Attached</Label>
                <div className="border rounded-md p-3 h-40 overflow-y-auto space-y-2 bg-muted/20">
                  {data.sources.filter(s => s.relatedResearchId === formData.relatedResearchId || !formData.relatedResearchId).length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">No sources available for this request.</div>
                  ) : (
                    data.sources
                      .filter(s => s.relatedResearchId === formData.relatedResearchId || !formData.relatedResearchId)
                      .map(source => (
                      <div key={source.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`src-${source.id}`}
                          checked={(formData.sourcesReviewed || []).includes(source.id)}
                          onCheckedChange={(checked) => {
                            const curr = formData.sourcesReviewed || [];
                            setFormData({
                              ...formData,
                              sourcesReviewed: checked 
                                ? [...curr, source.id]
                                : curr.filter(id => id !== source.id)
                            });
                          }}
                        />
                        <div className="grid leading-none">
                          <label htmlFor={`src-${source.id}`} className="text-sm font-medium leading-none cursor-pointer">
                            {source.title}
                          </label>
                          <p className="text-[10px] text-muted-foreground mt-1">{source.type}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Key Findings (Source-Backed)</Label>
                <Textarea className="h-24" value={formData.keyFindings || ''} onChange={e => setFormData({...formData, keyFindings: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Risks</Label>
                  <Textarea value={formData.risks || ''} onChange={e => setFormData({...formData, risks: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Opportunities</Label>
                  <Textarea value={formData.opportunities || ''} onChange={e => setFormData({...formData, opportunities: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Unknowns / Open Questions</Label>
                <Textarea value={formData.unknowns || ''} onChange={e => setFormData({...formData, unknowns: e.target.value})} />
              </div>

              <div className="space-y-2 border-t pt-4 mt-4">
                <Label className="text-primary">Reviewer Notes</Label>
                <Textarea placeholder="Notes from reviewer..." className="bg-primary/5 border-primary/20" value={formData.reviewerNotes || ''} onChange={e => setFormData({...formData, reviewerNotes: e.target.value})} />
              </div>
            </div>

          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {editingId ? (
              <Button variant="destructive" size="sm" onClick={() => requestDelete(editingId)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : <div />}
            <div className="flex space-x-2">
              {editingId && formData.status !== 'Archived' && (
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); handleArchive(editingId); }}>Archive</Button>
              )}
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Report</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderPreview(previewId)}

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        description="This will permanently delete this report. This action cannot be undone."
      />
    </div>
  );
}
