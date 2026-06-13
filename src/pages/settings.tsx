import { useState, useRef } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, RotateCcw, ShieldCheck, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data, updateData, resetData } = useStore();
  const { settings } = data;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local form state for settings to avoid saving on every keystroke
  const [appName, setAppName] = useState(settings.appName);
  const [userName, setUserName] = useState(settings.userName);
  const [userRole, setUserRole] = useState(settings.userRole);
  
  const [newRole, setNewRole] = useState("");
  const [newResearchType, setNewResearchType] = useState("");
  const [newSourceType, setNewSourceType] = useState("");

  const handleSaveProfile = () => {
    updateData(prev => ({
      ...prev,
      settings: { ...prev.settings, appName, userName, userRole }
    }));
    toast({ title: "Settings Saved", description: "Profile configuration updated." });
  };

  const handleAddListItem = (field: 'roleLabels' | 'researchTypes' | 'sourceTypes', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    if (settings[field].includes(value)) {
      toast({ title: "Duplicate", description: "This item already exists.", variant: "destructive" });
      return;
    }
    updateData(prev => ({
      ...prev,
      settings: { ...prev.settings, [field]: [...prev.settings[field], value] }
    }));
    setter("");
  };

  const handleRemoveListItem = (field: 'roleLabels' | 'researchTypes' | 'sourceTypes', index: number) => {
    updateData(prev => {
      const list = [...prev.settings[field]];
      list.splice(index, 1);
      return { ...prev, settings: { ...prev.settings, [field]: list } };
    });
  };

  const handleRewardChange = (key: keyof typeof settings.rewardSettings, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    updateData(prev => ({
      ...prev,
      settings: { 
        ...prev.settings, 
        rewardSettings: { ...prev.settings.rewardSettings, [key]: num } 
      }
    }));
  };

  const handleExportData = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `landonos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.settings && parsed.requests) {
          updateData(() => parsed);
          toast({ title: "Import Successful", description: "Data restored from backup." });
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        toast({ title: "Import Failed", description: "Invalid JSON backup file.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to completely reset all data to the default state? This cannot be undone.")) {
      resetData();
      toast({ title: "Data Reset", description: "App restored to default sample data." });
      setAppName(settings.appName); // these won't auto-update if reset doesn't trigger re-render
      setUserName(settings.userName);
      setUserRole(settings.userRole);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure application preferences and manage data</p>
      </div>

      <div className="bg-muted border rounded-md p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-semibold text-foreground">System Guardrails</span>
          <ul className="list-disc list-inside text-muted-foreground mt-2 ml-4 space-y-1">
            <li>AI-generated content is draft only.</li>
            <li>Official sources should be preferred.</li>
            <li>Compliance and business conclusions require human review before client-facing use.</li>
            <li>The system helps Landon learn, not replace judgment.</li>
          </ul>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile & App</TabsTrigger>
          <TabsTrigger value="lists">Lists & Categories</TabsTrigger>
          <TabsTrigger value="rewards">Reward Settings</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile & Application</CardTitle>
              <CardDescription>Basic system identities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>App Name</Label>
                <Input value={appName} onChange={e => setAppName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>User Name</Label>
                <Input value={userName} onChange={e => setUserName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>User Role</Label>
                <Input value={userRole} onChange={e => setUserRole(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="lists" className="mt-4 space-y-4">
          {/* Roles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Role Labels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {settings.roleLabels.map((r, i) => (
                  <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1">
                    {r}
                    <button onClick={() => handleRemoveListItem('roleLabels', i)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="New role..." value={newRole} onChange={e => setNewRole(e.target.value)} className="max-w-sm" />
                <Button variant="secondary" onClick={() => handleAddListItem('roleLabels', newRole, setNewRole)}><Plus className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>

          {/* Research Types */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Research Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {settings.researchTypes.map((r, i) => (
                  <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1">
                    {r}
                    <button onClick={() => handleRemoveListItem('researchTypes', i)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="New type..." value={newResearchType} onChange={e => setNewResearchType(e.target.value)} className="max-w-sm" />
                <Button variant="secondary" onClick={() => handleAddListItem('researchTypes', newResearchType, setNewResearchType)}><Plus className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>

          {/* Source Types */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Source Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {settings.sourceTypes.map((r, i) => (
                  <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1">
                    {r}
                    <button onClick={() => handleRemoveListItem('sourceTypes', i)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="New type..." value={newSourceType} onChange={e => setNewSourceType(e.target.value)} className="max-w-sm" />
                <Button variant="secondary" onClick={() => handleAddListItem('sourceTypes', newSourceType, setNewSourceType)}><Plus className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward Value Adjustments</CardTitle>
              <CardDescription>Configure how many points each action awards.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.rewardSettings).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-md">
                  <Label className="font-normal">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                  <Input 
                    type="number" 
                    value={val} 
                    onChange={e => handleRewardChange(key as any, e.target.value)} 
                    className="w-24 text-right font-mono"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export & Import</CardTitle>
              <CardDescription>Save a backup of your local storage data or restore from a JSON file.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" /> Export JSON
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Import JSON
              </Button>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImportData} 
              />
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Reset Application Data</CardTitle>
              <CardDescription>Wipe all local storage and restore the default sample data provided in the spec.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
