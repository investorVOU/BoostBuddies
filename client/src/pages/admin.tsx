import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Activity, Database, Settings, UserCheck, AlertTriangle, TrendingUp, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();

  // Check admin status
  const { data: adminStatus, isLoading: adminLoading } = useQuery({
    queryKey: ['/api/admin/status'],
    retry: false,
  });

  // Get all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Get posts for moderation
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['/api/admin/posts'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Get system stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Get admin logs
  const { data: adminLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/admin/logs'],
    enabled: !!adminStatus?.isAdmin,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: any }) => {
      return await apiRequest(`/api/admin/users/${data.userId}`, "PATCH", data.updates);
    },
    onSuccess: () => {
      toast({ title: "User updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (data: { postId: string; status: string; rejectedReason?: string }) => {
      return await apiRequest(`/api/admin/posts/${data.postId}`, "PATCH", {
        status: data.status,
        rejectedReason: data.rejectedReason
      });
    },
    onSuccess: () => {
      toast({ title: "Post updated successfully" });
      refetchPosts();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update post", description: error.message, variant: "destructive" });
    },
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!adminStatus?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/"}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-blue-600">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">$4,892</div>
              <p className="text-xs text-green-600">+23% this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">127</div>
              <p className="text-xs text-purple-600">8.4% conversion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admin Logins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.adminLogins || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Post Moderation</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="logs">Admin Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage all registered users and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p>Loading users...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs">{user.id}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.firstName} {user.lastName}</TableCell>
                          <TableCell>{user.points || 0}</TableCell>
                          <TableCell>
                            <Badge variant={user.isPremium ? "default" : "secondary"}>
                              {user.isPremium ? "Premium" : "Free"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserMutation.mutate({
                                userId: user.id,
                                updates: { isPremium: !user.isPremium }
                              })}
                            >
                              Toggle Premium
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Post Moderation</CardTitle>
                <CardDescription>
                  Review, approve, or reject user posts. Posts are auto-approved when users engage with 10 other posts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <p>Loading posts...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Engagements</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts?.map((post: any) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{post.user?.firstName} {post.user?.lastName}</p>
                              <p className="text-sm text-gray-500">{post.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.platform}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{post.title}</p>
                              <a href={post.url} target="_blank" rel="noopener noreferrer" 
                                 className="text-sm text-blue-600 hover:underline">
                                View Link
                              </a>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              post.status === 'approved' || post.status === 'auto_approved' ? "default" :
                              post.status === 'rejected' ? "destructive" : "secondary"
                            }>
                              {post.status === 'auto_approved' ? 'Auto-Approved' : post.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{post.engagementsCompleted}/10</p>
                              {post.engagementsCompleted >= 10 && (
                                <Badge className="mt-1" variant="default">Eligible</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {post.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updatePostMutation.mutate({
                                    postId: post.id,
                                    status: 'approved'
                                  })}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updatePostMutation.mutate({
                                    postId: post.id,
                                    status: 'rejected',
                                    rejectedReason: 'Manual rejection by admin'
                                  })}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {post.status !== 'pending' && (
                              <span className="text-sm text-gray-500">
                                {post.approvedAt && `Approved ${new Date(post.approvedAt).toLocaleDateString()}`}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {posts?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500">
                            No posts submitted yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Admin Activity Logs</CardTitle>
                <CardDescription>
                  Track all admin activities and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <p>Loading logs...</p>
                ) : (
                  <div className="space-y-4">
                    {adminLogs?.map((log: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{log.action}</p>
                          <span className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{log.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Maintenance Mode</h3>
                      <p className="text-sm text-gray-600">Temporarily disable user access</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">User Registration</h3>
                      <p className="text-sm text-gray-600">Allow new user registrations</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-600">System email settings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}