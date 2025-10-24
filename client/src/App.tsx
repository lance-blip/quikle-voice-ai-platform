import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Agents from "./pages/Agents";
import AgentFlowEditor from "./pages/AgentFlowEditor";
import KnowledgeBase from "./pages/KnowledgeBase";
import PhoneNumbers from "./pages/PhoneNumbers";
import CallLogs from "./pages/CallLogs";
import Automations from "./pages/Automations";
import VoiceLibrary from "./pages/VoiceLibrary";
import Settings from "./pages/Settings";
import LiveMonitoring from "./pages/LiveMonitoring";
import AgentTesting from "./pages/AgentTesting";
import Integrations from "./pages/Integrations";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/agents" component={Agents} />
      <Route path="/agents/:id/edit" component={AgentFlowEditor} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/phone-numbers" component={PhoneNumbers} />
      <Route path="/call-logs" component={CallLogs} />
      <Route path="/automations" component={Automations} />
      <Route path="/voices" component={VoiceLibrary} />
      <Route path="/settings" component={Settings} />
      <Route path="/live-monitoring" component={LiveMonitoring} />
      <Route path="/testing" component={AgentTesting} />
      <Route path="/integrations" component={Integrations} />
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
