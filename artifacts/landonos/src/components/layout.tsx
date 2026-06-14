import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { useHelp } from "@/hooks/use-help";
import { useToast } from "@/hooks/use-toast";
import { PageHelp } from "@/components/page-help";
import ccaCrest from "@assets/cca-crest-inset_1781446966845.png";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Target,
  Sparkles,
  Bot,
  Menu,
  Search,
  Bell,
  Plus,
  FileSearch,
  HelpCircle,
  PlayCircle,
  UserCog,
  Briefcase,
  HeartPulse,
  LogOut,
  ChevronDown,
  Wallet,
  Rocket,
  Trophy,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Command Center", icon: LayoutDashboard }],
  },
  {
    label: "Research",
    items: [
      { href: "/guided-research-builder", label: "Research Builder", icon: Target },
      { href: "/prompt-coach", label: "Prompt Coach", icon: Sparkles },
      { href: "/research-gps", label: "Research GPS", icon: Compass },
      { href: "/source-vault", label: "Source Vault", icon: Database },
      { href: "/report-builder", label: "Report Builder", icon: FileText },
      { href: "/handoff", label: "Handoff", icon: Send },
    ],
  },
  {
    label: "Collaborate",
    items: [
      { href: "/roseos-chat", label: "RoseOS Chat", icon: Bot },
      { href: "/blocked", label: "Blocked Help", icon: AlertTriangle },
      { href: "/brainstorming", label: "Brainstorming", icon: Lightbulb },
      { href: "/company-brain", label: "RoseOS", icon: BrainCircuit },
    ],
  },
  {
    label: "Growth & Rewards",
    items: [
      { href: "/training-academy", label: "Training Academy", icon: GraduationCap },
      { href: "/reward-center", label: "Rewards", icon: Award },
      { href: "/bonus-tracker", label: "Bonus Tracker", icon: Wallet },
      { href: "/team-lead-track", label: "Team Lead Track", icon: Rocket },
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    ],
  },
  {
    label: "Workspace",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

function SidebarBrand() {
  return (
    <div className="px-4 py-4 border-b border-sidebar-border/60 flex items-center gap-3">
      <img
        src={ccaCrest}
        alt="CCA crest"
        className="h-10 w-10 shrink-0 object-contain drop-shadow-md"
      />
      <div className="min-w-0">
        <h1 className="font-bold text-base leading-tight text-sidebar-foreground tracking-tight">
          LandonOS
        </h1>
        <p className="text-[11px] text-sidebar-foreground/60 leading-tight truncate">
          Research Command Center
        </p>
      </div>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            {section.label}
          </div>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="block" onClick={onNavigate}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary/15 text-sidebar-primary border-l-2 border-sidebar-primary pl-[10px]"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon size={18} className={isActive ? "text-sidebar-primary" : "opacity-70"} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  const { data } = useStore();
  const activeResearches = data.requests.filter(
    (r) => r.status === "Open" || r.status === "In Progress"
  ).length;
  const needAttention =
    data.blockers.filter((b) => b.status === "Open" || b.status === "In Review").length +
    data.requests.filter((r) => r.status === "Blocked").length;

  return (
    <div className="px-4 py-4 border-t border-sidebar-border/60">
      <div className="rounded-md bg-sidebar-accent/40 px-3 py-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-1">
          Today's Focus
        </div>
        <div className="text-sm text-sidebar-foreground/90 leading-snug">
          {activeResearches} active {activeResearches === 1 ? "research" : "researches"}
        </div>
        <div className="text-xs text-sidebar-foreground/60">
          {needAttention} need your attention
        </div>
      </div>
      <div className="mt-3 text-[11px] text-sidebar-foreground/40">RoseOS v2.7.4</div>
    </div>
  );
}

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: "online" | "synced" | "review";
}) {
  const dot =
    tone === "review" ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-50 ring-1 ring-white/15 backdrop-blur">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </div>
  );
}

function GlobalSearch() {
  const { data } = useStore();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (href: string) => {
    navigate(href);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: { label: string; sub: string; href: string }[] = [];
    data.requests.forEach((r) => {
      if (r.title.toLowerCase().includes(q))
        out.push({ label: r.title, sub: "Research Request", href: "/guided-research-builder" });
    });
    data.reports.forEach((r) => {
      if (r.title.toLowerCase().includes(q))
        out.push({ label: r.title, sub: "Report", href: "/report-builder" });
    });
    data.sources.forEach((s) => {
      if (s.title.toLowerCase().includes(q))
        out.push({ label: s.title, sub: "Source", href: "/source-vault" });
    });
    return out.slice(0, 6);
  }, [query, data]);

  return (
    <div className="relative w-full max-w-md">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-100/60"
      />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results.length > 0) {
            e.preventDefault();
            go(results[0].href);
          } else if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder="Search research, reports, sources..."
        className="h-9 pl-9 pr-12 bg-white/10 border-white/15 text-white placeholder:text-blue-100/50 focus-visible:ring-white/30"
        aria-label="Search research, reports, and sources"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-0.5 rounded border border-white/20 bg-white/10 px-1.5 text-[10px] font-medium text-blue-100/70 sm:flex">
        ⌘K
      </kbd>
      {open && query.trim() && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              No matches for "{query.trim()}"
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(r.href)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent focus:bg-accent focus:outline-none"
              >
                <FileSearch size={15} className="text-muted-foreground shrink-0" />
                <span className="flex-1 truncate text-sm text-foreground">{r.label}</span>
                <span className="text-[11px] text-muted-foreground">{r.sub}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data } = useStore();
  const { hintsEnabled, toggleHints, startTour } = useHelp();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const attentionCount =
    data.blockers.filter((b) => b.status === "Open" || b.status === "In Review").length;
  const initials = (data.settings.userName || "Landon")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        <header className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shrink-0">
          <div className="flex h-16 items-center gap-3 px-3 md:px-6">
            {/* Left: mobile menu + branding */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </Button>
            <div className="min-w-0 shrink-0">
              <div className="font-semibold text-white leading-tight truncate">
                Research Command Center
              </div>
              <div className="text-xs text-blue-200 leading-tight truncate hidden sm:block">
                AI-Guided Research Training Cockpit
              </div>
            </div>

            {/* Center: search */}
            <div className="hidden lg:flex flex-1 justify-center px-4">
              <GlobalSearch />
            </div>

            {/* Right: status + actions */}
            <div className="flex flex-1 lg:flex-none items-center justify-end gap-2 md:gap-3">
              <div className="hidden xl:flex items-center gap-2">
                <StatusChip label="AI Online" tone="online" />
                <StatusChip label="Sources Synced" tone="synced" />
                <StatusChip label="Human Review Required" tone="review" />
              </div>

              <button
                type="button"
                onClick={startTour}
                className="rounded-md p-2 text-blue-100/70 hover:bg-white/10 hover:text-white"
                aria-label="Start narrated walkthrough"
                title="Start narrated walkthrough"
              >
                <PlayCircle size={18} />
              </button>
              <button
                type="button"
                onClick={toggleHints}
                className={cn(
                  "rounded-md p-2 hover:bg-white/10 hover:text-white",
                  hintsEnabled ? "text-sky-300" : "text-blue-100/70"
                )}
                aria-label={hintsEnabled ? "Hide help hints" : "Show help hints"}
                aria-pressed={hintsEnabled}
                title={hintsEnabled ? "Help hints on" : "Help hints off"}
              >
                <HelpCircle size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/blocked")}
                className="relative rounded-md p-2 text-blue-100/70 hover:bg-white/10 hover:text-white"
                aria-label="Attention items"
              >
                <Bell size={18} />
                {attentionCount > 0 && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-400 ring-2 ring-slate-900" />
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/roseos-chat")}
                className="rounded-md p-2 text-blue-100/70 hover:bg-white/10 hover:text-white"
                aria-label="RoseOS Chat"
              >
                <MessageSquare size={18} />
              </button>

              <div className="mx-1 hidden h-8 w-px bg-white/15 sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    aria-label="Open profile menu"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white ring-1 ring-white/20">
                      {initials}
                    </div>
                    <div className="hidden text-left leading-tight md:block">
                      <div className="text-sm font-medium text-white">
                        {data.settings.userName || "Landon"}
                      </div>
                      <div className="text-[11px] text-blue-200/70">
                        {data.settings.userRole || "Research Lead"}
                      </div>
                    </div>
                    <ChevronDown size={15} className="hidden text-blue-100/70 md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="text-sm font-medium">{data.settings.userName || "Landon"}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {data.settings.userRole || "Research Lead"}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <UserCog className="mr-2 h-4 w-4" /> My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/employee-account")}>
                    <Briefcase className="mr-2 h-4 w-4" /> Employee Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/benefits")}>
                    <HeartPulse className="mr-2 h-4 w-4" /> My Benefits
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-rose-600 focus:text-rose-700"
                    onClick={() =>
                      toast({
                        title: "Signed out",
                        description: "This is a local demo workspace — there is no remote session to end.",
                      })
                    }
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => navigate("/guided-research-builder?new=1")}
                className="ml-1 hidden shrink-0 gap-1.5 bg-white text-slate-900 hover:bg-blue-50 sm:flex"
              >
                <Plus size={16} />
                <span className="hidden md:inline">New Research Request</span>
                <span className="md:hidden">New</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <PageHelp />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
