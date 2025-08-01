import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Share2, MessageCircle, ExternalLink, TrendingUp, Users, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Post, User } from "@shared/schema";

// Demo posts for when no real posts exist
const demoPosts = [
  {
    id: "demo-1",
    userId: "demo-user-1",
    platform: "twitter",
    url: "https://twitter.com/example/status/123",
    title: "🚀 Just launched my new SaaS project!",
    description: "After 6 months of coding, finally launching my productivity app. Would love your feedback and support! #SaaS #ProductHunt",
    status: "approved",
    likesReceived: 45,
    likesNeeded: 10,
    pointsEarned: 150,
    shares: 12,
    comments: 8,
    createdAt: new Date().toISOString(),
    author: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b2fc3aeb?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "demo-2",
    userId: "demo-user-2",
    platform: "youtube",
    url: "https://youtube.com/watch?v=example",
    title: "Complete React Tutorial for Beginners",
    description: "A comprehensive 3-hour tutorial covering everything from basics to advanced React concepts. Perfect for developers starting their journey!",
    status: "pending",
    likesReceived: 7,
    likesNeeded: 10,
    pointsEarned: 0,
    shares: 3,
    comments: 5,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: "Dev Academy",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "demo-3",
    userId: "demo-user-3",
    platform: "tiktok",
    url: "https://tiktok.com/@example/video/123",
    title: "Day in the life of a software engineer",
    description: "Follow me through my typical workday as a frontend developer at a tech startup. From morning coffee to deployment! ☕👨‍💻",
    status: "approved",
    likesReceived: 89,
    likesNeeded: 10,
    pointsEarned: 200,
    shares: 24,
    comments: 31,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    author: "TechTok Mike",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "demo-4",
    userId: "demo-user-4",
    platform: "facebook",
    url: "https://facebook.com/example/posts/123",
    title: "Small business success story 📈",
    description: "Started my online store 2 years ago with $500. Today we hit $10k monthly revenue! Here's what I learned about e-commerce...",
    status: "approved",
    likesReceived: 156,
    likesNeeded: 10,
    pointsEarned: 300,
    shares: 45,
    comments: 67,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    author: "Emma Store",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  }
];

export default function Feed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/posts"],
    retry: false,
  });

  // Demo posts for demonstration
  const demoPosts = [
    {
      id: "demo-1",
      userId: "demo-user-1",
      platform: "youtube",
      url: "https://youtube.com/watch?v=demo1",
      title: "Amazing React Tutorial - Build a Full-Stack App in 2024",
      description: "Learn how to build a complete React application with TypeScript, Tailwind CSS, and Node.js backend. Perfect for beginners!",
      status: "approved",
      likesReceived: 47,
      likesNeeded: 50,
      shares: 12,
      comments: 8,
      pointsEarned: 50,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: {
        firstName: "Sarah",
        lastName: "Johnson",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&w=150&h=150&fit=crop",
        isPremium: true,
      }
    },
    {
      id: "demo-2",
      userId: "demo-user-2",
      platform: "twitter",
      url: "https://twitter.com/user/status/demo2",
      title: "10 JavaScript Tips That Will Blow Your Mind 🤯",
      description: "Thread about advanced JavaScript concepts that every developer should know. Includes ES6+ features and performance tips.",
      status: "pending",
      likesReceived: 23,
      likesNeeded: 50,
      shares: 5,
      comments: 3,
      pointsEarned: 0,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      user: {
        firstName: "Mike",
        lastName: "Chen",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&fit=crop",
        isPremium: false,
      }
    },
    {
      id: "demo-3",
      userId: "demo-user-3",
      platform: "tiktok",
      url: "https://tiktok.com/@user/video/demo3",
      title: "Day in the Life of a Software Developer",
      description: "Follow my coding routine, productivity tips, and the tools I use daily as a full-stack developer working remotely.",
      status: "approved",
      likesReceived: 89,
      likesNeeded: 50,
      shares: 34,
      comments: 21,
      pointsEarned: 50,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      user: {
        firstName: "Emma",
        lastName: "Rodriguez",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&h=150&fit=crop",
        isPremium: true,
      }
    }
  ];

  const allPosts = [...demoPosts, ...posts];

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest(`/api/posts/${postId}/like`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Post liked! 🎉",
        description: "You earned points for engaging with the community.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Use demo posts if no real posts exist
  const allPosts2 = posts.length > 0 ? posts : demoPosts;
  const filteredPosts = allPosts2.filter((post: any) => 
    selectedPlatform === "all" || post.platform === selectedPlatform
  );

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      twitter: "🐦",
      facebook: "📘", 
      youtube: "📺",
      tiktok: "🎵"
    };
    return icons[platform] || "🔗";
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      twitter: "bg-blue-500 hover:bg-blue-600",
      facebook: "bg-blue-600 hover:bg-blue-700",
      youtube: "bg-red-500 hover:bg-red-600", 
      tiktok: "bg-pink-500 hover:bg-pink-600"
    };
    return colors[platform] || "bg-gray-500 hover:bg-gray-600";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-lg">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Community Feed
          <span className="ml-3 text-2xl">🚀</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover amazing content from our creative community. Like posts to help creators get approved and earn points for yourself!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Posts</p>
              <p className="text-2xl font-bold text-blue-900">{filteredPosts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center space-x-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Active Creators</p>
              <p className="text-2xl font-bold text-green-900">2.4k</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4 flex items-center space-x-3">
            <Heart className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Likes Today</p>
              <p className="text-2xl font-bold text-purple-900">1.2k</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Button
          variant={selectedPlatform === "all" ? "default" : "outline"}
          onClick={() => setSelectedPlatform("all")}
          className="rounded-full px-6 py-2 font-semibold transition-all duration-300"
        >
          All Posts
        </Button>
        {["twitter", "facebook", "youtube", "tiktok"].map((platform) => (
          <Button
            key={platform}
            variant={selectedPlatform === platform ? "default" : "outline"}
            onClick={() => setSelectedPlatform(platform)}
            className="rounded-full px-6 py-2 font-semibold transition-all duration-300"
          >
            {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Button>
        ))}
      </div>

      {/* Posts Grid */}
      {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-stream text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">Be the first to share your content!</p>
              <Button onClick={() => window.location.href = '/submit'}>
                Submit Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {allPosts.map((post: any) => (
              <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-gray-200">
                      <AvatarImage src={post.avatar || `https://avatar.vercel.sh/${post.userId}`} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {(post.author || post.userId).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{post.author || "Anonymous"}</p>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{formatTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-gray-900">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          className={`${getPlatformColor(post.platform)} text-white border-0 font-medium`}
                        >
                          {getPlatformIcon(post.platform)} {post.platform}
                        </Badge>
                        <Badge 
                          variant={post.status === "pending" ? "secondary" : "default"}
                          className={post.status === "pending" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}
                        >
                          {post.status === "pending" ? "🕐 Needs Likes" : "✅ Approved"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="rounded-full">
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit
                    </a>
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {post.description && (
                  <p className="text-gray-700 mb-6 leading-relaxed">{post.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeMutation.mutate(post.id)}
                      disabled={likeMutation.isPending || post.userId === user?.id}
                      className="flex items-center gap-2 hover:text-red-500 hover:bg-red-50 rounded-full px-4 py-2 transition-all duration-300"
                    >
                      <Heart className={`h-5 w-5 ${(post.likesReceived || 0) > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="font-semibold">{post.likesReceived || 0}</span>
                    </Button>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Share2 className="h-5 w-5" />
                      <span className="font-semibold">{post.shares}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="h-5 w-5" />
                      <span className="font-semibold">{post.comments}</span>
                    </div>
                  </div>

                  <div className="text-sm font-medium">
                    {post.status === "pending" && (
                      <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        {(post.likesNeeded || 10) - (post.likesReceived || 0)} more likes needed
                      </span>
                    )}
                    {post.status === "approved" && (
                      <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        +{post.pointsEarned} points earned
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

      {/* Call to Action */}
      <Card className="mt-12 border-0 shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to boost your content? 🚀</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
            Join thousands of creators who are already using BoostBuddies to grow their social media presence and earn rewards!
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-full"
            onClick={() => window.location.href = "/submit"}
          >
            Submit Your Content
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}