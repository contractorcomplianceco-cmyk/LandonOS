import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Download, Smartphone, Monitor, CheckCircle2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Reusable card — link to full install page from Settings or Welcome. */
export function InstallAppCard() {
  return (
    <Card className="border-t-4 border-t-sky-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5 text-sky-300" /> Install on your device
        </CardTitle>
        <CardDescription>
          Add CCA Command Center to your phone or computer for quick access like a native app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/install">
          <Button className="gap-2">
            <Smartphone className="h-4 w-4" /> View install instructions
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function InstallAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Download}
        eyebrow="PWA"
        title="Install CCA Command Center"
        subtitle="Internal app only — add to your home screen or desktop for one-tap access. Requires HTTPS on your server."
      />

      {installed ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-center gap-3 py-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-medium text-foreground">Already installed</div>
              <div className="text-sm text-muted-foreground">
                You&apos;re running CCA Command Center in standalone mode.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : deferredPrompt ? (
        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-emerald-300" /> Install now
            </CardTitle>
            <CardDescription>Your browser supports one-click install on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={triggerInstall} className="gap-2">
              <Download className="h-4 w-4" /> Install CCA Command Center
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4 text-sky-300" /> iPhone / iPad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Open this site in <strong className="text-foreground">Safari</strong> (not Chrome).</p>
            <p className="flex items-start gap-2">
              <Share className="h-4 w-4 shrink-0 mt-0.5 text-sky-300" />
              2. Tap <strong className="text-foreground">Share</strong> → <strong className="text-foreground">Add to Home Screen</strong>.
            </p>
            <p>3. Confirm the name <strong className="text-foreground">CCA</strong> and tap Add.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4 text-emerald-300" /> Android
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Open in <strong className="text-foreground">Chrome</strong>.</p>
            <p>2. Tap the menu (⋮) → <strong className="text-foreground">Install app</strong> or <strong className="text-foreground">Add to Home screen</strong>.</p>
            <p>3. Follow the prompts — the icon uses the deep navy CCA theme.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-4 w-4 text-violet-300" /> Desktop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Use <strong className="text-foreground">Chrome</strong> or <strong className="text-foreground">Edge</strong> on HTTPS.</p>
            <p>2. Click the install icon in the address bar, or Menu → <strong className="text-foreground">Install CCA Command Center</strong>.</p>
            <p>3. The app opens in its own window without browser chrome.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-muted/20">
        <CardContent className="py-4 text-sm text-muted-foreground">
          This is the <strong className="text-foreground">internal Command Center</strong> only — not the public
          website or client portal. Session data is never cached by the service worker; sign out when using a shared device.
        </CardContent>
      </Card>
    </div>
  );
}
