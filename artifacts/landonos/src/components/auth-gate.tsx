import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/** When the live API is up, require sign-in before showing the cockpit. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { apiAvailable, user, authLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (authLoading) return;
    if (apiAvailable && !user && location !== "/login") {
      navigate("/login");
    }
  }, [apiAvailable, user, authLoading, location, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" aria-label="Loading" />
      </div>
    );
  }

  if (apiAvailable && !user) {
    return null;
  }

  return <>{children}</>;
}
