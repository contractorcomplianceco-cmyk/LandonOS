import React, { useRef, useState } from 'react';
import { useSearch } from 'wouter';
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { defaultData } from "@/lib/default-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Download, Upload, AlertTriangle, User, List, Award, Database, FolderKanban, Plus } from "lucide-react";
import { InstallAppCard } from "@/pages/install-app";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { data, updateData, resetData } = useStore();
  const {
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    createWorkspace,
    apiAvailable,
    user,
  } = useAuth();
  const { settings } = data;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const search = useSearch();
  const defaultTab = new URLSearchParams(search).get("tab") ?? "profile";
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const showWorkspaces = apiAvailable && !!user;

  const updateSetting = (key: keyof typeof settings, value: any) => {
    updateData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const updateRewardSetting = (key: keyof typeof settings.rewardSettings, value: number) => {
    updateData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        rewardSettings: {
          ...prev.settings.rewardSettings,
          [key]: value
        }
      }
    }));
  };

  const handleArrayUpdate = (key: keyof typeof settings, index: number, value: string) => {
    const arr = [...(settings[key] as string[])];
    arr[index] = value;
    updateSetting(key, arr);
  };

  const handleArrayAdd = (key: keyof typeof settings) => {
    const arr = [...(settings[key] as string[]), "New Item"];
    updateSetting(key, arr);
  };

  const handleArrayRemove = (key: keyof typeof settings, index: number) => {
    const arr = [...(settings[key] as string[])];
    arr.splice(index, 1);
    updateSetting(key, arr);
  };

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `landonos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "Your data has been exported successfully." });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        const requiredArrays = [
          "requests",
          "sources",
          "reports",
          "blockers",
          "handoffs",
          "ideas",
          "brainUpdates",
          "training",
        ];
        const arraysValid =
          importedData &&
          typeof importedData === "object" &&
          requiredArrays.every((k) => Array.isArray(importedData[k]));
        const objectsValid =
          importedData &&
          importedData.settings &&
          typeof importedData.settings === "object" &&
          importedData.rewardState &&
          typeof importedData.rewardState === "object";
        if (arraysValid && objectsValid) {
          // Merge with defaults so older backups missing newer top-level fields
          // (e.g. announcements/admin) still import without breaking the app.
          updateData({ ...defaultData, ...importedData });
          toast({ title: "Import Successful", description: "Your data has been restored." });
        } else {
          throw new Error("Invalid format");
        }
      } catch (error) {
        toast({ title: "Import Failed", description: "The selected file is not a valid backup.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateWorkspace = async () => {
    const name = newWorkspaceName.trim() || "New Cockpit";
    try {
      await createWorkspace(name);
      setNewWorkspaceName("");
      toast({ title: "Workspace created", description: `"${name}" is now active.` });
    } catch (err) {
      toast({
        title: "Could not create workspace",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Settings2}
        eyebrow="Workspace Configuration"
        title="Settings"
        subtitle="Tune your profile, the lists that drive every module, reward values, and your data backups — all in one place."
        stats={[
          { label: "Research Types", value: settings.researchTypes.length, icon: List },
          { label: "Source Types", value: settings.sourceTypes.length, icon: Database },
          { label: "Reviewers", value: settings.roleLabels.length, icon: User },
          { label: "Reward Rules", value: Object.keys(settings.rewardSettings).length, icon: Award },
        ]}
      />

      <InstallAppCard />

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="bg-card border w-full justify-start h-auto p-1 rounded-md overflow-x-auto flex-nowrap">
          <TabsTrigger value="profile" className="flex items-center py-2"><User className="w-4 h-4 mr-2" /> Profile</TabsTrigger>
          {showWorkspaces && (
            <TabsTrigger value="workspaces" className="flex items-center py-2">
              <FolderKanban className="w-4 h-4 mr-2" /> Workspaces
            </TabsTrigger>
          )}
          <TabsTrigger value="lists" className="flex items-center py-2"><List className="w-4 h-4 mr-2" /> Lists & Categories</TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center py-2"><Award className="w-4 h-4 mr-2" /> Rewards Config</TabsTrigger>
          <TabsTrigger value="data" className="flex items-center py-2"><Database className="w-4 h-4 mr-2" /> Data Management</TabsTrigger>
        </TabsList>

        {showWorkspaces && (
          <TabsContent value="workspaces" className="space-y-6 outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Your workspaces</CardTitle>
                <CardDescription>
                  Each workspace has its own research data. Switching reloads the active cockpit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{workspace.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Updated {new Date(workspace.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      {workspace.id === activeWorkspaceId ? (
                        <span className="text-xs font-medium text-emerald-400">Active</span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => switchWorkspace(workspace.id)}
                        >
                          Switch
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="New workspace name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                  />
                  <Button className="gap-2 shrink-0" onClick={handleCreateWorkspace}>
                    <Plus className="h-4 w-4" /> Create workspace
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="profile" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>General Profile</CardTitle>
              <CardDescription>Basic application and user details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Application Name</Label>
                  <Input value={settings.appName} onChange={e => updateSetting('appName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>User Name (Landon)</Label>
                  <Input value={settings.userName} onChange={e => updateSetting('userName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>User Role</Label>
                  <Input value={settings.userRole} onChange={e => updateSetting('userRole', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Research Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.researchTypes.map((type, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={type} onChange={e => handleArrayUpdate('researchTypes', idx, e.target.value)} />
                    <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleArrayRemove('researchTypes', idx)}>Remove</Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => handleArrayAdd('researchTypes')} className="w-full">Add Type</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.sourceTypes.map((type, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={type} onChange={e => handleArrayUpdate('sourceTypes', idx, e.target.value)} />
                    <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleArrayRemove('sourceTypes', idx)}>Remove</Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => handleArrayAdd('sourceTypes')} className="w-full">Add Type</Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Role Labels (Reviewers)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {settings.roleLabels.map((role, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={role} onChange={e => handleArrayUpdate('roleLabels', idx, e.target.value)} />
                      <Button variant="outline" className="text-destructive hover:bg-destructive/10 px-2" onClick={() => handleArrayRemove('roleLabels', idx)}>X</Button>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" onClick={() => handleArrayAdd('roleLabels')} className="w-full sm:w-auto">Add Role</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Point Values</CardTitle>
              <CardDescription>Adjust how many points are awarded for actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(settings.rewardSettings).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <Input type="number" value={value} onChange={e => updateRewardSetting(key as any, parseInt(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export & Import</CardTitle>
                <CardDescription>Backup or restore your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Button className="w-full justify-start" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" /> Export to JSON
                  </Button>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".json" 
                      ref={fileInputRef}
                      onChange={handleImport}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" className="w-full justify-start pointer-events-none">
                      <Upload className="w-4 h-4 mr-2" /> Import from JSON
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Resetting sample data will clear all current work and restore the application to its default state. This cannot be undone unless you export a backup first.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">Reset to Default Data</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        current local data and restore the initial sample dataset.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        resetData();
                        toast({ title: "Data Reset", description: "Application has been restored to default state." });
                      }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, reset data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
