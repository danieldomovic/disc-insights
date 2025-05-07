import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Quiz from "@/pages/Quiz";
import Results from "@/pages/Results";
import AuthPage from "@/pages/auth-page";
import WelcomePage from "@/pages/welcome-page";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-light-gray">
      <Header />
      <main className="flex-grow">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={WelcomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/quiz" component={Quiz} />
          <Route path="/results/:resultId?" component={Results} />
          
          {/* Protected routes */}
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/profile" component={Dashboard} />
          <ProtectedRoute path="/teams" component={Dashboard} />
          <ProtectedRoute path="/reports" component={Dashboard} />
          <ProtectedRoute path="/comparisons" component={Dashboard} />
          
          {/* 404 fallback */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
