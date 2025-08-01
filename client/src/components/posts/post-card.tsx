import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Heart, Share, MessageCircle } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    platform: string;
    content: string;
    status: string;
    likesReceived: number;
    likesNeeded: number;
    shares: number;
    comments: number;
    pointsEarned: number;
    createdAt: string;
  };
}

const PostCard = React.memo(function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likePostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
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

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return { icon: 'fab fa-twitter', color: 'bg-blue-500', textColor: 'text-blue-500' };
      case 'facebook':
        return { icon: 'fab fa-facebook', color: 'bg-blue-600', textColor: 'text-blue-600' };
      case 'youtube':
        return { icon: 'fab fa-youtube', color: 'bg-red-500', textColor: 'text-red-500' };
      case 'tiktok':
        return { icon: 'fab fa-tiktok', color: 'bg-black', textColor: 'text-black' };
      default:
        return { icon: 'fas fa-link', color: 'bg-gray-500', textColor: 'text-gray-500' };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const platformInfo = useMemo(() => getPlatformIcon(post.platform), [post.platform]);
  const statusVariant = useMemo(() => post.status === 'approved' ? 'default' : post.status === 'pending' ? 'secondary' : 'destructive', [post.status]);
  const statusColor = useMemo(() => post.status === 'approved' ? 'bg-green-100 text-green-800' : 
                     post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                     'bg-red-100 text-red-800', [post.status]);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${platformInfo.color} rounded-lg flex items-center justify-center`}>
              <i className={`${platformInfo.icon} text-white text-sm`}></i>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
              </p>
              <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          <Badge className={`${statusColor} text-xs px-2 py-1 rounded-full border-0`}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-gray-500 hover:text-red-500 p-0"
              onClick={() => likePostMutation.mutate()}
              disabled={likePostMutation.isPending}
            >
              <Heart className="w-4 h-4" />
              <span>{post.likesReceived}</span>
            </Button>
            <span className="flex items-center space-x-1">
              <Share className="w-4 h-4" />
              <span>{post.shares}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </span>
          </div>

          <div className="text-sm">
            {post.status === 'pending' ? (
              <span className="text-yellow-600">
                {post.likesNeeded - post.likesReceived} more likes needed
              </span>
            ) : post.status === 'approved' ? (
              <span className="text-green-600 font-medium">
                +{post.pointsEarned} points earned
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default PostCard;