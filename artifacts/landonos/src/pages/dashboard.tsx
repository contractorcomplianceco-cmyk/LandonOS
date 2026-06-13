import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileText, Database, Target, AlertTriangle, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  const { data } = useStore();

  const openRequests = data.requests.filter(r => r.status === 'Open' || r.status === 'In Progress');
  const blockedItems = data.blockers.filter(b => b.status === 'Open' || b.status === 'In Review');
  const reportsInProgress = data.reports.filter(r => r.status === 'Draft' || r.status === 'Needs Sources');
  const handoffsCompleted = data.handoffs.filter(h => h.status === 'Approved');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
          <p className="text-muted-foreground">AI-guided compliance and business research cockpit</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
            {data.rewardState.level}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {data.rewardState.points} pts
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link href="/guided-research-builder">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-primary/5">
            <Target className="w-6 h-6 text-primary" />
            <span className="text-xs">New Research</span>
          </Button>
        </Link>
        <Link href="/prompt-coach">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-primary/5">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span className="text-xs">Prompt Coach</span>
          </Button>
        </Link>
        <Link href="/roseos-chat">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-primary/5">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="text-xs">Ask RoseOS</span>
          </Button>
        </Link>
        <Link href="/report-builder">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-primary/5">
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-xs">Build Report</span>
          </Button>
        </Link>
        <Link href="/blocked">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2 hover:border-destructive hover:bg-destructive/5 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-xs">I'm Blocked</span>
          </Button>
        </Link>
        <Link href="/handoff">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2 hover:border-primary hover:bg-primary/5">
            <Send className="w-6 h-6 text-primary" />
            <span className="text-xs">Create Handoff</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{blockedItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports in Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportsInProgress.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Handoffs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{handoffsCompleted.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Priorities */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Today's Research Priorities</CardTitle>
            <CardDescription>Items needing your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {openRequests.length === 0 ? (
              <div className="text-sm text-muted-foreground italic p-4 text-center border rounded-md">No open requests. Great job!</div>
            ) : (
              openRequests.map(req => (
                <div key={req.id} className="flex flex-col space-y-2 p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{req.title}</span>
                    <Badge variant={req.priority === 'Executive' || req.priority === 'High' ? 'destructive' : 'secondary'}>{req.priority}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Due: {req.dueDate}</span>
                    <span>Reviewer: {req.reviewer}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Source Quality Warnings */}
        <Card className="col-span-1 border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Source Quality Warnings
            </CardTitle>
            <CardDescription>Sources requiring human review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.sources.filter(s => s.type === 'AI Draft' || s.type === 'Unknown').length === 0 ? (
                <div className="text-sm text-muted-foreground italic">No risky sources currently attached to open requests.</div>
              ) : (
                data.sources.filter(s => s.type === 'AI Draft' || s.type === 'Unknown').map(s => (
                  <div key={s.id} className="flex flex-col space-y-1 p-3 bg-background border border-destructive/20 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{s.title}</span>
                      <Badge variant="outline" className="text-destructive border-destructive">{s.type}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.notes || 'Needs verification.'}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// Ensure icons used but not imported above are available
import { MessageSquare, Send } from "lucide-react";
