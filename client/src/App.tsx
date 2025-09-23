import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TravelDataProvider } from "@/contexts/travel-data-context";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import Footer from "@/components/navigation/footer";
import FeedbackPage from "@/pages/feedback";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TravelDataProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <Footer />
        </TooltipProvider>
      </TravelDataProvider>
    </QueryClientProvider>
  );
}

export default App;
