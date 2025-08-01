import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Header from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Analytics() {
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

  const approvedPosts = posts.filter((post: any) => post.status === "approved");
  const pendingPosts = posts.filter((post: any) => post.status === "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />
      
      <div className="lg:pl-64">
        <Header />
        
        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              Track your engagement metrics and see how your content performs across all platforms.
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-blue-500"></i>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.totalPosts || 0}
                </p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-heart text-pink-500"></i>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+24%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.totalLikes || 0}
                </p>
                <p className="text-sm text-gray-600">Total Likes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-share text-purple-500"></i>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+8%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.totalShares || 0}
                </p>
                <p className="text-sm text-gray-600">Total Shares</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-comments text-green-500"></i>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+16%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.totalComments || 0}
                </p>
                <p className="text-sm text-gray-600">Total Comments</p>
              </CardContent>
            </Card>
          </div>

          {/* Post Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Approved Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>Approved Posts ({approvedPosts.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : approvedPosts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No approved posts yet</p>
                ) : (
                  <div className="space-y-4">
                    {approvedPosts.slice(0, 5).map((post: any) => (
                      <div key={post.id} className="border-b border-gray-200 pb-3 last:border-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${
                            post.platform === 'twitter' ? 'bg-blue-100' :
                            post.platform === 'facebook' ? 'bg-blue-100' :
                            post.platform === 'youtube' ? 'bg-red-100' :
                            'bg-black'
                          }`}>
                            <i className={`fab fa-${post.platform} text-xs ${
                              post.platform === 'twitter' ? 'text-blue-500' :
                              post.platform === 'facebook' ? 'text-blue-600' :
                              post.platform === 'youtube' ? 'text-red-500' :
                              'text-white'
                            }`}></i>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <i className="fas fa-heart"></i>
                            <span>{post.likesReceived}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <i className="fas fa-share"></i>
                            <span>{post.shares}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <i className="fas fa-comments"></i>
                            <span>{post.comments}</span>
                          </span>
                          <span className="text-green-600 font-medium">
                            +{post.pointsEarned} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-clock text-yellow-500"></i>
                  <span>Pending Approval ({pendingPosts.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : pendingPosts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending posts</p>
                ) : (
                  <div className="space-y-4">
                    {pendingPosts.map((post: any) => (
                      <div key={post.id} className="border-b border-gray-200 pb-3 last:border-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${
                            post.platform === 'twitter' ? 'bg-blue-100' :
                            post.platform === 'facebook' ? 'bg-blue-100' :
                            post.platform === 'youtube' ? 'bg-red-100' :
                            'bg-black'
                          }`}>
                            <i className={`fab fa-${post.platform} text-xs ${
                              post.platform === 'twitter' ? 'text-blue-500' :
                              post.platform === 'facebook' ? 'text-blue-600' :
                              post.platform === 'youtube' ? 'text-red-500' :
                              'text-white'
                            }`}></i>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-4 text-gray-500">
                            <span className="flex items-center space-x-1">
                              <i className="fas fa-heart"></i>
                              <span>{post.likesReceived}</span>
                            </span>
                          </div>
                          <span className="text-yellow-600 font-medium">
                            {post.likesNeeded - post.likesReceived} more likes needed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
