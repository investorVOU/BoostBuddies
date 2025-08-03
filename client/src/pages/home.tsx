import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Star,
  Clock,
  Zap,
  Target,
  Award,
  Crown,
  Sparkles
} from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:pl-64">
        <Header />

        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="w-8 h-8 text-yellow-300" />
                      Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Creator'}!
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Boost your social media presence and connect with creators worldwide
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{stats?.totalPosts || 0}</div>
                    <div className="text-sm text-blue-100">Posts Boosted</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Total Engagements</p>
                    <p className="text-3xl font-bold text-green-700">{stats?.totalEngagements || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12% this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Community Members</p>
                    <p className="text-3xl font-bold text-blue-700">{stats?.communityMembers || 1250}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <Users className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600">Growing daily</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Your Points</p>
                    <p className="text-3xl font-bold text-purple-700">{stats?.userPoints || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <Star className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600">Rank #{stats?.userRank || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 uppercase tracking-wide">Success Rate</p>
                    <p className="text-3xl font-bold text-yellow-700">{stats?.successRate || 85}%</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <Award className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">Above average</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Enhanced */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get started with these popular actions to boost your social media presence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/submit">
                  <Button className="w-full h-auto p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" size="lg">
                    <div className="text-center">
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-semibold">Submit Post</div>
                      <div className="text-xs opacity-90">Get engagement boost</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/feed">
                  <Button variant="outline" className="w-full h-auto p-4 border-2 hover:bg-green-50" size="lg">
                    <div className="text-center">
                      <Heart className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <div className="font-semibold">Boost Others</div>
                      <div className="text-xs text-gray-600">Earn points</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/premium">
                  <Button variant="outline" className="w-full h-auto p-4 border-2 border-yellow-300 hover:bg-yellow-50" size="lg">
                    <div className="text-center">
                      <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                      <div className="font-semibold">Go Premium</div>
                      <div className="text-xs text-gray-600">Unlock features</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Posts */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      Recent Posts
                    </CardTitle>
                    <Link href="/feed">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
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
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-500 mb-4">Start by submitting your first post to get community engagement!</p>
                      <Link href="/submit">
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                          Submit Your First Post
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.slice(0, 3).map((post: any) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar Content */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Leaderboard />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Active Communities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CommunityList />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Collaboration Spotlight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CollabSpotlight />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-red-500" />
                    Live Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveEvents />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button (Mobile) */}
      <Link href="/submit">
        <Button 
          className="lg:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-xl z-40 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}

