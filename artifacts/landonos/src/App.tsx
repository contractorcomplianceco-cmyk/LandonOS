import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AppProvider } from "@/hooks/use-store";
import { HelpProvider } from "@/hooks/use-help";
import { AppLayout } from "@/components/layout";
import { AuthGate } from "@/components/auth-gate";
import { GuidedTour } from "@/components/guided-tour";
import { WalkthroughVideo } from "@/components/walkthrough-video";

import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import Welcome from "@/pages/welcome";
import Dashboard from "@/pages/dashboard";
import GuidedResearchBuilder from "@/pages/guided-research-builder";
import PromptCoach from "@/pages/prompt-coach";
import ResearchGPS from "@/pages/research-gps";
import ReportBuilder from "@/pages/report-builder";
import SourceVault from "@/pages/source-vault";
import Blocked from "@/pages/blocked";
import RoseOSChat from "@/pages/roseos-chat";
import Handoff from "@/pages/handoff";
import Brainstorming from "@/pages/brainstorming";
import RewardCenter from "@/pages/reward-center";
import TrainingAcademy from "@/pages/training-academy";
import CompanyBrain from "@/pages/company-brain";
import Settings from "@/pages/settings";
import InstallAppPage from "@/pages/install-app";
import Account from "@/pages/account";
import EmployeeAccount from "@/pages/employee-account";
import Benefits from "@/pages/benefits";
import BonusTracker from "@/pages/bonus-tracker";
import TeamLeadTrack from "@/pages/team-lead-track";
import Leaderboard from "@/pages/leaderboard";
import Announcements from "@/pages/announcements";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/welcome" component={Welcome} />
      <Route path="/" component={Dashboard} />
      <Route path="/guided-research-builder" component={GuidedResearchBuilder} />
      <Route path="/prompt-coach" component={PromptCoach} />
      <Route path="/research-gps" component={ResearchGPS} />
      <Route path="/report-builder" component={ReportBuilder} />
      <Route path="/source-vault" component={SourceVault} />
      <Route path="/blocked" component={Blocked} />
      <Route path="/roseos-chat" component={RoseOSChat} />
      <Route path="/handoff" component={Handoff} />
      <Route path="/brainstorming" component={Brainstorming} />
      <Route path="/reward-center" component={RewardCenter} />
      <Route path="/training-academy" component={TrainingAcademy} />
      <Route path="/bonus-tracker" component={BonusTracker} />
      <Route path="/team-lead-track" component={TeamLeadTrack} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/company-brain" component={CompanyBrain} />
      <Route path="/account" component={Account} />
      <Route path="/employee-account" component={EmployeeAccount} />
      <Route path="/benefits" component={Benefits} />
      <Route path="/settings" component={Settings} />
      <Route path="/install" component={InstallAppPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
              <Switch>
                <Route path="/login" component={LoginPage} />
                <Route>
                  <AuthGate>
                    <HelpProvider>
                      <AppLayout>
                        <Router />
                      </AppLayout>
                      <GuidedTour />
                      <WalkthroughVideo />
                    </HelpProvider>
                  </AuthGate>
                </Route>
              </Switch>
            </WouterRouter>
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
