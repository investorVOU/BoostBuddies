import React, { Suspense } from "react";
import { Router, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { usePrefetch } from "@/hooks/usePrefetch";

// Lazy load components
const LandingPage = React.lazy(() => import("@/pages/landing"));
const HomePage = React.lazy(() => import("@/pages/home"));
const AuthPage = React.lazy(() => import("@/pages/auth"));
const FeedPage = React.lazy(() => import("@/pages/feed"));
const SubmitPostPage = React.lazy(() => import("@/pages/submit-post"));
const CommunitiesPage = React.lazy(() => import("@/pages/communities"));
const AnalyticsPage = React.lazy(() => import("@/pages/analytics"));
const PremiumPage = React.lazy(() => import("@/pages/premium"));
const NotFoundPage = React.lazy(() => import("@/pages/not-found"));

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">BB</span>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/submit" component={SubmitPostPage} />
      <Route path="/communities" component={CommunitiesPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/premium" component={PremiumPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function AppContent() {
  usePrefetch();

  return (
    <Router>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>}>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/home" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/feed" component={FeedPage} />
          <Route path="/submit" component={SubmitPostPage} />
          <Route path="/communities" component={CommunitiesPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/premium" component={PremiumPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Suspense>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}