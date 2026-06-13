import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Compass,
  MessageSquare,
  FileText,
  Database,
  AlertTriangle,
  Send,
  Lightbulb,
  Award,
  GraduationCap,
  BrainCircuit,
  Settings,
  ShieldCheck,
  Target,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/guided-research-builder", label: "Guided Research Builder", icon: Target },
  { href: "/prompt-coach", label: "AI Prompt Coach", icon: MessageSquare },
  { href: "/research-gps", label: "Research GPS", icon: Compass },
  { href: "/report-builder", label: "Report Builder", icon: FileText },
  { href: "/source-vault", label: "Source Vault", icon: Database },
  { href: "/blocked", label: "Blocked / Need Help", icon: AlertTriangle },
  { href: "/roseos-chat", label: "RoseOS Chat", icon: MessageSquare },
  { href: "/handoff", label: "Completed Handoff", icon: Send },
  { href: "/brainstorming", label: "Brainstorming Studio", icon: Lightbulb },
  { href: "/reward-center", label: "Reward Center", icon: Award },
  { href: "/training-academy", label: "Training Academy", icon: GraduationCap },
  { href: "/company-brain", label: "Company Brain Updates", icon: BrainCircuit },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarBrand() {
  return (
    <div className="p-4 border-b border-sidebar-border/50 flex items-center space-x-2">
      <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
        <ShieldCheck size={20} />
      </div>
      <div>
        <h1 className="font-bold text-sm leading-tight text-sidebar-foreground">LandonOS</h1>
        <p className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider">Command Center</p>
      </div>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href} className="block" onClick={onNavigate}>
            <div
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary/20 text-sidebar-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon size={18} className={isActive ? "text-sidebar-primary" : "opacity-70"} />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="p-4 border-t border-sidebar-border/50 text-xs text-sidebar-foreground/60">
      <div className="font-semibold text-sidebar-foreground mb-1">Compliance Active</div>
      <div>AI Output Draft Only</div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-col shrink-0">
        <SidebarBrand />
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border [&>button]:text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex flex-col h-full">
            <SidebarBrand />
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </Button>
            <div className="font-medium text-foreground truncate">
              {NAV_ITEMS.find((i) => i.href === location)?.label || "LandonOS"}
            </div>
          </div>
          <div className="flex items-center space-x-4 shrink-0">
            <div className="text-sm text-muted-foreground hidden sm:flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Secure Connection
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              L
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
