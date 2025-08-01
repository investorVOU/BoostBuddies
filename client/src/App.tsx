import { Route, Router, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePrefetch } from "@/hooks/usePrefetch";
import { LoadingScreen } from "@/components/ui/loading-spinner";

import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Home from "@/pages/home";
import Feed from "@/pages/feed";
import SubmitPost from "@/pages/submit-post";
import Communities from "@/pages/communities";
import Analytics from "@/pages/analytics";
import Premium from "@/pages/premium";
import Security from "@/pages/security";
import AdminDashboard from "@/pages/admin";
import About from "@/pages/about";
import HowItWorks from "@/pages/how-it-works";
import NotFound from "@/pages/not-found";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  usePrefetch();

  if (isLoading) {
    return <LoadingScreen message="Setting up your dashboard..." />;
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth", "/about", "/how-it-works"];

  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          {isAuthenticated ? <Home /> : <Landing />}
        </Route>

        <Route path="/auth">
          {isAuthenticated ? <Home /> : <Auth />}
        </Route>

        <Route path="/about">
          <About />
        </Route>

        <Route path="/how-it-works">
          <HowItWorks />
        </Route>

        {/* Protected routes */}
        <Route path="/feed">
          {isAuthenticated ? (
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <div className="p-6">
                    <Feed />
                  </div>
                </main>
              </div>
              <MobileNav />
            </div>
          ) : (
            <Auth />
          )}
        </Route>

        <Route path="/submit">
          {isAuthenticated ? (
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <div className="p-6">
                    <SubmitPost />
                  </div>
                </main>
              </div>
              <MobileNav />
            </div>
          ) : (
            <Auth />
          )}
        </Route>

        <Route path="/communities">
          {isAuthenticated ? (
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <div className="p-6">
                    <Communities />
                  </div>
                </main>
              </div>
              <MobileNav />
            </div>
          ) : (
            <Auth />
          )}
        </Route>

        <Route path="/analytics">
          {isAuthenticated ? (
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <div className="p-6">
                    <Analytics />
                  </div>
                </main>
              </div>
              <MobileNav />
            </div>
          ) : (
            <Auth />
          )}
        </Route>

        <Route path="/premium">
          {isAuthenticated ? (
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <div className="p-6">
                    <Premium />
                  </div>
                </main>
              </div>
              <MobileNav />
            </div>
          ) : (
            <Auth />
          )}
        </Route>

        <Route path="/admin">
          {isAuthenticated ? <AdminDashboard /> : <Auth />}
        </Route>

        <Route path="/profile">
          {isAuthenticated ? (
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <div className="p-6">
                    <Home />
                  </div>
                </main>
              </div>
              <MobileNav />
            </div>
          ) : (
            <Auth />
          )}
        </Route>
 <Route path="/security">
          {isAuthenticated ? (
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <div className="p-6">
                    <Security />
                  </div>
                </main>
              </div>
              <MobileNav />
            </div>
          ) : (
            <Auth />
          )}
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </Router>
  );
}