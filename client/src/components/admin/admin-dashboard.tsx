import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2
} from "lucide-react";

export function AdminDashboard() {
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Get pending posts
  const { data: pendingPosts, isLoading: loadingPosts } = useQuery({
    queryKey: ["/api/admin/posts/pending"],
  });

  // Get analytics data
  const { data: leaderboard } = useQuery({
    queryKey: ["/api/analytics/leaderboard"],
  });

  // Approve post mutation
  const approvePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest(`/api/admin/posts/${postId}/approve`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts/pending"] });
      toast({
        title: "Post approved",
        description: "The post has been approved and is now visible to users.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error approving post",
        description: error.message || "Failed to approve post",
        variant: "destructive",
      });
    },
  });

  // Reject post mutation
  const rejectPostMutation = useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
      return apiRequest(`/api/admin/posts/${postId}/reject`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts/pending"] });
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedPost(null);
      toast({
        title: "Post rejected",
        description: "The post has been rejected and the user has been notified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error rejecting post",
        description: error.message || "Failed to reject post",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (postId: string) => {
    approvePostMutation.mutate(postId);
  };

  const handleReject = (post: any) => {
    setSelectedPost(post);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (selectedPost && rejectReason.trim()) {
      rejectPostMutation.mutate({
        postId: selectedPost.id,
        reason: rejectReason,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage posts, users, and platform analytics</p>
        </div>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Post Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Pending Posts Review
              </CardTitle>
              <CardDescription>
                Posts waiting for approval. Review content and approve or reject accordingly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPosts ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : pendingPosts && pendingPosts.length > 0 ? (
                <div className="space-y-4">
                  {pendingPosts.map((post: any) => (
                    <Card key={post.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2" data-testid={`post-title-${post.id}`}>
                              {post.title}
                            </h3>
                            <p className="text-gray-600 mb-3">{post.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Badge variant="outline">{post.platform}</Badge>
                              </span>
                              <span>Submitted: {new Date(post.createdAt).toLocaleDateString()}</span>
                              <a 
                                href={post.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                                data-testid={`post-url-${post.id}`}
                              >
                                View Original Post
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {getStatusBadge(post.status)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => handleApprove(post.id)}
                            disabled={approvePostMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`button-approve-${post.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(post)}
                            variant="destructive"
                            disabled={rejectPostMutation.isPending}
                            data-testid={`button-reject-${post.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending posts to review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Posts</p>
                    <p className="text-2xl font-bold">{pendingPosts?.length || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{leaderboard?.length || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Today</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Leaderboard</CardTitle>
              <CardDescription>Top users by points and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((user: any, index: number) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{user.points || 0} pts</p>
                        {user.isPremium && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Premium</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No user data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">User management features coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Post Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this post. The user will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why this post is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
                data-testid="textarea-reject-reason"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmReject}
                disabled={!rejectReason.trim() || rejectPostMutation.isPending}
                data-testid="button-confirm-reject"
              >
                {rejectPostMutation.isPending ? "Rejecting..." : "Reject Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}