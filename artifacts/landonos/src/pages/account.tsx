import React, { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCog,
  Mail,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Monitor,
  Globe,
  Clock,
  LayoutGrid,
  Bell,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SESSIONS = [
  { id: "s1", device: "MacBook Pro · Chrome", location: "Austin, TX, US", last: "Active now", current: true },
  { id: "s2", device: "iPhone 15 · Safari", location: "Austin, TX, US", last: "2 hours ago", current: false },
  { id: "s3", device: "iPad Air · Safari", location: "Dallas, TX, US", last: "Yesterday", current: false },
];

const NOTIFICATIONS: { key: string; label: string; desc: string }[] = [
  { key: "assignments", label: "New research assignments", desc: "When a request is assigned to you" },
  { key: "reviews", label: "Review decisions", desc: "When Rose, Carmen, or Gregg responds" },
  { key: "blockers", label: "Blocker updates", desc: "Replies on items you flagged" },
  { key: "rewards", label: "Reward milestones", desc: "Level-ups and new badges" },
  { key: "digest", label: "Weekly digest", desc: "Monday summary of your activity" },
  { key: "security", label: "Security alerts", desc: "New sign-ins and password changes" },
];

export default function AccountPage() {
  const { data } = useStore();
  const { toast } = useToast();
  const name = data.settings.userName || "Landon";
  const email = `${name.split(" ")[0].toLowerCase()}@roseos.com`;

  const [twoFactor, setTwoFactor] = useState(true);
  const [language, setLanguage] = useState("en-US");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [density, setDensity] = useState("comfortable");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactTables, setCompactTables] = useState(true);
  const [sessions, setSessions] = useState(SESSIONS);
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    assignments: true,
    reviews: true,
    blockers: true,
    rewards: true,
    digest: false,
    security: true,
  });

  const endSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Session ended", description: "That device has been signed out." });
  };

  const signOut = () => {
    toast({
      title: "Signed out",
      description: "This is a local demo workspace — there is no remote session to end.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <PageHeader
        icon={UserCog}
        eyebrow="Account & Security"
        title="My Account"
        subtitle="Manage your sign-in, security, and personal app preferences. These are your own settings — not HR or payroll records."
        stats={[
          { label: "2FA", value: twoFactor ? "On" : "Off", icon: ShieldCheck },
          { label: "Sessions", value: sessions.length, icon: Monitor },
        ]}
        statsClassName="grid grid-cols-2 gap-3 shrink-0"
      />

      {/* Sign-in & security */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-600" /> Sign-in & Security
          </CardTitle>
          <CardDescription>Your login credentials and account protection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> Login Email
                </div>
                <div className="mt-0.5 truncate text-sm font-medium text-foreground">{email}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Update email", description: "A confirmation link would be sent to your new address." })}>
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <KeyRound className="h-3.5 w-3.5" /> Password
                </div>
                <div className="mt-0.5 text-sm font-medium text-foreground">Last changed 38 days ago</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Change password", description: "You'd be guided through a secure password reset." })}>
                Update
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Two-Factor Authentication
                <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                  {twoFactor ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Authenticator app · adds a one-time code at sign-in.
              </div>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} aria-label="Toggle two-factor authentication" />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5" /> Active Sessions
            </div>
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600">
                      <Monitor className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="truncate">{s.device}</span>
                        {s.current && (
                          <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-700">This device</Badge>
                        )}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.location} · {s.last}
                      </div>
                    </div>
                  </div>
                  {!s.current && (
                    <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-500/10 hover:text-rose-700" onClick={() => endSession(s.id)}>
                      Sign out
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" /> Preferences
          </CardTitle>
          <CardDescription>How the workspace looks and behaves for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-muted-foreground" /> Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                  <SelectItem value="fr-FR">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> Time Zone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" /> Dashboard Density</Label>
              <Select value={density} onValueChange={setDensity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="cozy">Cozy</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-foreground">Reduced motion</div>
                <div className="text-xs text-muted-foreground">Minimize animations across the app</div>
              </div>
              <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} aria-label="Toggle reduced motion" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-foreground">Compact tables</div>
                <div className="text-xs text-muted-foreground">Tighter row spacing in lists</div>
              </div>
              <Switch checked={compactTables} onCheckedChange={setCompactTables} aria-label="Toggle compact tables" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-t-4 border-t-sky-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-sky-600" /> Notification Preferences
          </CardTitle>
          <CardDescription>Choose what you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {NOTIFICATIONS.map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0 pr-3">
                  <div className="text-sm font-medium text-foreground">{n.label}</div>
                  <div className="text-xs text-muted-foreground">{n.desc}</div>
                </div>
                <Switch
                  checked={!!notifs[n.key]}
                  onCheckedChange={(v) => setNotifs((prev) => ({ ...prev, [n.key]: v }))}
                  aria-label={`Toggle ${n.label}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card className="border-t-4 border-t-slate-400">
        <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-500/10 text-slate-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Sign out of this account</div>
              <div className="text-xs text-muted-foreground">Ends your session on this device.</div>
            </div>
          </div>
          <Button variant="outline" className="gap-2 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
