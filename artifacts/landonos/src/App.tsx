import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/hooks/use-store";
import { HelpProvider } from "@/hooks/use-help";
import { AppLayout } from "@/components/layout";
import { GuidedTour } from "@/components/guided-tour";

import NotFound from "@/pages/not-found";
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

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
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
      <Route path="/company-brain" component={CompanyBrain} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <HelpProvider>
              <AppLayout>
                <Router />
              </AppLayout>
              <GuidedTour />
            </HelpProvider>
          </WouterRouter>
          <Toaster />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
