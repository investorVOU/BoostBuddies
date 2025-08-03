import { Route, Router, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePrefetch } from "@/hooks/usePrefetch";
import { LoadingScreen } from "@/components/ui/loading-spinner";

import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Home from "@/pages/home";
import Feed from "@/pages/feed";
import SubmitPost from "@/pages/submit-post";
import Communities from "@/pages/communities";
import Analytics from "@/pages/analytics";
import Premium from "@/pages/premium";
import Security from "@/pages/security";
import AdminDashboard from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import About from "@/pages/about";
import HowItWorks from "@/pages/how-it-works";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  usePrefetch();

  // Remove the loading screen - let components handle their own loading states

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup", "/about", "/how-it-works"];

  return (
    <Router>
      <Switch>
        <Route path="/">
          {isAuthenticated ? <Home /> : <Landing />}
        </Route>

        <Route path="/login">
          {isAuthenticated ? <Home /> : <Login />}
        </Route>

        <Route path="/signup">
          {isAuthenticated ? <Home /> : <Signup />}
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
            <Login />
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
            <Login />
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
            <Login />
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
            <Login />
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
            <Login />
          )}
        </Route>

        <Route path="/admin/login">
          <AdminLogin />
        </Route>

        <Route path="/admin">
          <AdminDashboard />
        </Route>

        <Route path="/profile">
          {isAuthenticated ? (
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <Profile />
                </main>
              </div>
              <MobileNav />
            </div>
          ) : (
            <Login />
          )}
        </Route>

        <Route path="/settings">
          {isAuthenticated ? (
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <Settings />
                </main>
              </div>
              <MobileNav />
            </div>
          ) : (
            <Login />
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
            <Login />
          )}
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </Router>
  );
}