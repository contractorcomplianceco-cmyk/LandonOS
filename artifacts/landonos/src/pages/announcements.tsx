import React, { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Announcement, AnnouncementCategory, AnnouncementLevel } from "@/lib/types";
import {
  ANNOUNCEMENT_CATEGORIES,
  ANNOUNCEMENT_LEVELS,
  levelAccent,
  sortAnnouncements,
} from "@/lib/announcements";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { Toolbar } from "@/components/toolbar";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { ACCENT } from "@/components/stat-card";
import { cn } from "@/lib/utils";
import {
  Megaphone,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Pencil,
  Lock,
  ShieldCheck,
  LogOut,
  EyeOff,
  AlertTriangle,
  Radio,
} from "lucide-react";

export default function Announcements() {
  const { data, updateData } = useStore();
  const { toast } = useToast();

  const isAdmin = data.admin?.unlocked ?? false;

  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("All");

  // Admin sign-in
  const [signInOpen, setSignInOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");

  // Create / edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Announcement>>({});

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSignIn = () => {
    if (passcodeInput.trim() === (data.admin?.passcode ?? "")) {
      updateData((prev) => ({ ...prev, admin: { ...prev.admin, unlocked: true } }));
      toast({ title: "Admin mode enabled", description: "You can now publish and manage announcements." });
      setSignInOpen(false);
      setPasscodeInput("");
    } else {
      toast({ title: "Incorrect passcode", description: "Admin sign-in failed.", variant: "destructive" });
    }
  };

  const handleSignOut = () => {
    updateData((prev) => ({ ...prev, admin: { ...prev.admin, unlocked: false } }));
    toast({ title: "Admin mode disabled", description: "Announcement controls are locked." });
  };

  const handleCreate = () => {
    setFormData({
      id: crypto.randomUUID(),
      title: "",
      body: "",
      category: "Company",
      level: "Info",
      author: data.settings.userName || "Admin",
      date: new Date().toISOString().split("T")[0],
      pinned: false,
      active: true,
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (a: Announcement) => {
    setFormData({ ...a });
    setEditingId(a.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.body?.trim()) {
      toast({ title: "Missing details", description: "A title and message are required.", variant: "destructive" });
      return;
    }
    const toSave = formData as Announcement;
    updateData((prev) => {
      const idx = prev.announcements.findIndex((a) => a.id === toSave.id);
      if (idx >= 0) {
        const next = [...prev.announcements];
        next[idx] = toSave;
        return { ...prev, announcements: next };
      }
      return { ...prev, announcements: [...prev.announcements, toSave] };
    });
    toast({ title: "Announcement saved", description: toSave.active ? "It is now live for everyone." : "Saved as an archived draft." });
    setIsDialogOpen(false);
  };

  const togglePin = (a: Announcement) => {
    updateData((prev) => ({
      ...prev,
      announcements: prev.announcements.map((x) =>
        x.id === a.id ? { ...x, pinned: !x.pinned } : x
      ),
    }));
  };

  const toggleActive = (a: Announcement) => {
    updateData((prev) => ({
      ...prev,
      announcements: prev.announcements.map((x) =>
        x.id === a.id ? { ...x, active: !x.active } : x
      ),
    }));
  };

  const requestDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      updateData((prev) => ({
        ...prev,
        announcements: prev.announcements.filter((a) => a.id !== deletingId),
      }));
      toast({ title: "Announcement deleted" });
    }
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const visible = sortAnnouncements(data.announcements ?? [])
    .filter((a) => (isAdmin ? true : a.active))
    .filter((a) => levelFilter === "All" || a.level === levelFilter)
    .filter((a) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });

  const activeCount = (data.announcements ?? []).filter((a) => a.active).length;
  const pinnedCount = (data.announcements ?? []).filter((a) => a.active && a.pinned).length;
  const criticalCount = (data.announcements ?? []).filter((a) => a.active && a.level === "Critical").length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        eyebrow="Company broadcast"
        title="Race Control"
        subtitle="Official company announcements broadcast to everyone in the cockpit. Admins publish here; the whole team reads here."
        action={
          isAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleCreate} className="bg-white text-slate-900 hover:bg-slate-200">
                <Plus className="mr-2 h-4 w-4" /> New Announcement
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <LogOut className="mr-2 h-4 w-4" /> Exit admin
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setSignInOpen(true)}
              className="bg-white text-slate-900 hover:bg-slate-200"
            >
              <Lock className="mr-2 h-4 w-4" /> Admin sign in
            </Button>
          )
        }
        statsClassName="grid grid-cols-3 gap-3 shrink-0"
        stats={[
          { label: "Live", value: activeCount, icon: Radio },
          { label: "Pinned", value: pinnedCount, icon: Pin },
          { label: "Critical", value: criticalCount, icon: AlertTriangle },
        ]}
      />

      {isAdmin && (
        <Alert className="border-red-500/30 bg-red-500/10 text-foreground">
          <ShieldCheck className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-300">Admin mode active</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Anything you publish here is broadcast to everyone using this workspace in this browser.
            Archived announcements are hidden from the team but remain visible to you.
          </AlertDescription>
        </Alert>
      )}

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search announcements by title, message, author, category..."
      >
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Levels</SelectItem>
            {ANNOUNCEMENT_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      <div className="space-y-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements"
            description={
              isAdmin
                ? "Publish your first announcement to broadcast it to the team."
                : "There are no announcements right now. Check back later."
            }
          />
        ) : (
          visible.map((a) => {
            const accent = ACCENT[levelAccent(a.level)];
            return (
              <Card
                key={a.id}
                className={cn(
                  "border-l-4 bg-gradient-to-br transition-all",
                  accent.borderL,
                  accent.grad,
                  !a.active && "opacity-70"
                )}
              >
                <CardContent className="pt-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {a.pinned && a.active && (
                        <Badge variant="outline" className={cn("gap-1", accent.soft, accent.text)}>
                          <Pin className="h-3 w-3" /> Pinned
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn(accent.soft, accent.text)}>
                        {a.level}
                      </Badge>
                      <Badge variant="secondary" className="text-[11px]">
                        {a.category}
                      </Badge>
                      {!a.active && (
                        <Badge variant="outline" className="gap-1 border-slate-400/40 text-slate-300">
                          <EyeOff className="h-3 w-3" /> Archived
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold leading-tight text-foreground">{a.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.author} · {a.date}
                      </p>
                    </div>

                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>

                    {isAdmin && (
                      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => togglePin(a)}>
                          {a.pinned ? (
                            <>
                              <PinOff className="mr-1.5 h-4 w-4" /> Unpin
                            </>
                          ) : (
                            <>
                              <Pin className="mr-1.5 h-4 w-4" /> Pin
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => toggleActive(a)}>
                          {a.active ? (
                            <>
                              <EyeOff className="mr-1.5 h-4 w-4" /> Archive
                            </>
                          ) : (
                            <>
                              <Radio className="mr-1.5 h-4 w-4" /> Publish
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleEdit(a)}>
                          <Pencil className="mr-1.5 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-8 w-8 text-destructive"
                          onClick={() => requestDelete(a.id)}
                          aria-label="Delete announcement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Admin sign-in dialog */}
      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-400" /> Admin sign in
            </DialogTitle>
            <DialogDescription>
              Enter the admin passcode to publish and manage announcements. Demo passcode:{" "}
              <span className="font-mono font-semibold text-foreground">landon-admin</span> (changeable in code).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Passcode</Label>
            <Input
              type="password"
              value={passcodeInput}
              autoFocus
              onChange={(e) => setPasscodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSignIn();
              }}
              placeholder="Enter admin passcode"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignInOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSignIn}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Unlock admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
            <DialogDescription>
              Published announcements appear on the dashboard and the Race Control page for everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Title</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mandatory human-review sign-off"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category || "Company"}
                onValueChange={(v: AnnouncementCategory) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ANNOUNCEMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={formData.level || "Info"}
                onValueChange={(v: AnnouncementLevel) => setFormData({ ...formData, level: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {ANNOUNCEMENT_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Author</Label>
              <Input
                value={formData.author || ""}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Name and role"
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Message</Label>
              <Textarea
                rows={5}
                value={formData.body || ""}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Write the announcement the team should read..."
              />
            </div>

            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="h-4 w-4 accent-red-500"
                />
                Pin to top
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.active ?? true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 accent-red-500"
                />
                Publish (visible to everyone)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Announcement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        description="This will permanently delete this announcement for everyone. This action cannot be undone."
      />
    </div>
  );
}
