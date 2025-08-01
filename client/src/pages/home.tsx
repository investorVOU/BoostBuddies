import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Header from "@/components/layout/header";
import StatsGrid from "@/components/dashboard/stats-grid";
import QuickActions from "@/components/dashboard/quick-actions";
import PostCard from "@/components/posts/post-card";
import CollabSpotlight from "@/components/dashboard/collab-spotlight";
import LiveEvents from "@/components/dashboard/live-events";
import Leaderboard from "@/components/dashboard/leaderboard";
import CommunityList from "@/components/communities/community-list";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts/user"],
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/users/stats"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:pl-64">
        <Header />

        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Stats Grid */}
          <StatsGrid stats={stats} isLoading={statsLoading} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Posts */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              {postsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-4">Start by submitting your first post to get community engagement!</p>
                  <Button onClick={() => window.location.href = "/submit"}>
                    Submit Your First Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              <CollabSpotlight />
              <CommunityList />
              <LiveEvents />
              <Leaderboard />
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button (Mobile) */}
      <Button 
        className="lg:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg z-40"
        onClick={() => window.location.href = "/submit"}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}