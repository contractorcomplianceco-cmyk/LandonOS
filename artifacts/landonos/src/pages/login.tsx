import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Gauge, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { login, register, user, authLoading, apiAvailable } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/");
  }, [authLoading, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast({ title: "Signed in", description: "Welcome back to LandonOS." });
      } else {
        await register(email, password, displayName);
        toast({ title: "Account created", description: "Your workspace is ready." });
      }
      navigate("/");
    } catch (err) {
      toast({
        title: mode === "login" ? "Sign in failed" : "Registration failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="carbon flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_55%)]" />
      <Card className="relative w-full max-w-md border-white/10 bg-card/95 shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/30">
            <Gauge className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">LandonOS</CardTitle>
          <CardDescription>
            {apiAvailable
              ? "Sign in to sync your research cockpit across sessions."
              : "API unavailable — use the app locally without an account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!apiAvailable ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Start the api-server and Postgres to enable accounts and live sync.
              </p>
              <Link href="/">
                <Button className="w-full min-h-11">Continue in Local Mode</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Landon"
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
              <Button type="submit" className="w-full min-h-11" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
              <button
                type="button"
                className="w-full min-h-11 rounded-md text-center text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50 active:bg-muted/70"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login"
                  ? "Need an account? Register"
                  : "Already have an account? Sign in"}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
