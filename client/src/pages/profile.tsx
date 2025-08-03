import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  User, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Link as LinkIcon,
  Crown,
  Star,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  // Get user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  // Get user posts
  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts/user"],
  });

  // Get user activity
  const { data: userActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/user/activity"],
  });

  if (statsLoading || postsLoading || activityLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    // You can add platform-specific icons here
    return <LinkIcon className="w-4 h-4" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              {user?.isPremium && (
                <Crown className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                {user?.isPremium && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 text-lg mb-4">{user?.email}</p>
              
              {userStats?.bio && (
                <p className="text-gray-700 mb-4">{userStats.bio}</p>
              )}
              
              {userStats?.website && (
                <a 
                  href={userStats.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <LinkIcon className="w-4 h-4" />
                  {userStats.website}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{user?.points || 0}</p>
                <p className="text-sm text-gray-600">Points</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Joined {formatDate(user?.createdAt || new Date().toISOString())}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{userStats?.totalPosts || 0}</p>
            <p className="text-sm text-gray-600">Posts Submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{userStats?.totalLikes || 0}</p>
            <p className="text-sm text-gray-600">Likes Given</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{userStats?.approvedPosts || 0}</p>
            <p className="text-sm text-gray-600">Approved Posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">#{userStats?.rank || 'N/A'}</p>
            <p className="text-sm text-gray-600">Leaderboard Rank</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            My Posts
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {userPosts && userPosts.length > 0 ? (
            userPosts.map((post: any) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-3">{post.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          {getPlatformIcon(post.platform)}
                          <span className="capitalize">{post.platform}</span>
                        </div>
                        <span>{formatDate(post.createdAt)}</span>
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          View Post <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                  </div>
                  
                  {post.status === 'approved' && (
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.currentLikes || 0} / {post.likesNeeded}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments || 0} comments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>{post.shares || 0} shares</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't submitted any posts yet. Start sharing your content to grow your social media presence!
                </p>
                <Button>Submit Your First Post</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {userActivity && userActivity.length > 0 ? (
            userActivity.map((activity: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {activity.type === 'like' && <Heart className="w-5 h-5 text-red-500" />}
                      {activity.type === 'comment' && <MessageCircle className="w-5 h-5 text-blue-500" />}
                      {activity.type === 'share' && <Share2 className="w-5 h-5 text-green-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.description}</span>
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                    </div>
                    <Badge variant="outline">+{activity.pointsEarned} pts</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                <p className="text-gray-600">
                  Start engaging with other creators' posts to see your activity here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">First Post</h3>
                <p className="text-sm text-gray-600">Successfully submitted your first post</p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800">Earned</Badge>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Social Butterfly</h3>
                <p className="text-sm text-gray-600">Engage with 100 posts</p>
                <Badge variant="outline" className="mt-2">Not Earned</Badge>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Premium Member</h3>
                <p className="text-sm text-gray-600">Upgrade to Premium status</p>
                {user?.isPremium ? (
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800">Earned</Badge>
                ) : (
                  <Badge variant="outline" className="mt-2">Not Earned</Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}