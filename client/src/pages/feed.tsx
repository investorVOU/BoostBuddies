import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Share2, MessageCircle, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Post, User } from "@shared/schema";

export default function Feed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: false,
  });

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
        title: "Post liked!",
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

  const filteredPosts = posts.filter((post: Post) => 
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
      twitter: "bg-blue-500",
      facebook: "bg-blue-600",
      youtube: "bg-red-500", 
      tiktok: "bg-pink-500"
    };
    return colors[platform] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community Feed</h1>
          <p className="text-muted-foreground">
            Like 10 posts to get your own post approved and earn points!
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedPlatform === "all" ? "default" : "outline"}
            onClick={() => setSelectedPlatform("all")}
          >
            All Posts
          </Button>
          {["twitter", "facebook", "youtube", "tiktok"].map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? "default" : "outline"}
              onClick={() => setSelectedPlatform(platform)}
            >
              {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to submit a post for community engagement!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post: Post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://avatar.vercel.sh/${post.userId}`} />
                      <AvatarFallback>
                        {post.userId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={`${getPlatformColor(post.platform)} text-white`}
                        >
                          {getPlatformIcon(post.platform)} {post.platform}
                        </Badge>
                        <Badge variant="outline">
                          {post.status === "pending" ? "Needs Likes" : "Approved"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit
                    </a>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {post.description && (
                  <p className="text-muted-foreground mb-4">{post.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeMutation.mutate(post.id)}
                      disabled={likeMutation.isPending || post.userId === user?.id}
                      className="flex items-center gap-1 hover:text-red-500"
                    >
                      <Heart className={`h-4 w-4 ${(post.likesReceived || 0) > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                      {post.likesReceived || 0}
                    </Button>
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Share2 className="h-4 w-4" />
                      {post.shares}
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {post.status === "pending" && (
                      <span className="text-orange-600">
                        {(post.likesNeeded || 10) - (post.likesReceived || 0)} more likes needed
                      </span>
                    )}
                    {post.status === "approved" && (
                      <span className="text-green-600">
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
    </div>
  );
}