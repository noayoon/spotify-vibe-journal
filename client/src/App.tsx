import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Timeline from "@/pages/timeline";
import Profile from "@/pages/profile";
import Insights from "@/pages/insights";
import SharedVibe from "@/pages/shared-vibe";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg text-text-primary">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col">
        {children}
      </div>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public route for shared vibes */}
      <Route path="/share/:shareId" component={SharedVibe} />
      
      {/* Protected routes */}
      {user ? (
        <AuthenticatedLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/timeline" component={Timeline} />
            <Route path="/insights" component={Insights} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </AuthenticatedLayout>
      ) : (
        <Login />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
