import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Agents from "./pages/Agents";
import AgentFlowEditor from "./pages/AgentFlowEditor";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeBaseDetail from "./pages/KnowledgeBaseDetail";
import PhoneNumbers from "./pages/PhoneNumbers";
import CallLogs from "./pages/CallLogs";
import Automations from "./pages/Automations";
import VoiceLibrary from "./pages/VoiceLibrary";
import Settings from "./pages/Settings";
import ChatbotDemo from "./pages/ChatbotDemo";
import AgencySetup from "./pages/AgencySetup";
import IntegrationsDashboard from "./pages/IntegrationsDashboard";
import CallAnalysis from "./pages/CallAnalysis";
import LiveMonitoring from "./pages/LiveMonitoring";
import AgentTesting from "./pages/AgentTesting";
import Integrations from "./pages/Integrations";
import CarrierManagement from "./pages/CarrierManagement";
import QueueManagement from "./pages/QueueManagement";
import CDRReporting from "./pages/CDRReporting";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/chatbot-demo"} component={ChatbotDemo} />
      <Route path={"/agency-setup"} component={AgencySetup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/agents" component={Agents} />
      <Route path="/agents/:id/edit" component={AgentFlowEditor} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/knowledge-base/:id" component={KnowledgeBaseDetail} />
      <Route path="/phone-numbers" component={PhoneNumbers} />
      <Route path="/call-logs" component={CallLogs} />
      <Route path="/automations" component={Automations} />
      <Route path="/voices" component={VoiceLibrary} />
      <Route path="/settings" component={Settings} />
      <Route path="/integrations-dashboard" component={IntegrationsDashboard} />
      <Route path="/call-analysis" component={CallAnalysis} />
      <Route path="/live-monitoring" component={LiveMonitoring} />
      <Route path="/testing" component={AgentTesting} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/carriers" component={CarrierManagement} />
      <Route path="/queues" component={QueueManagement} />
      <Route path="/cdr" component={CDRReporting} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
