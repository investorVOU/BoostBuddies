import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Shield, 
  Settings, 
  FileText, 
  DollarSign, 
  Coins, 
  Key, 
  CheckCircle, 
  XCircle, 
  Users,
  Eye,
  Trash2
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  description: string;
  platform: string;
  url: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface SystemSetting {
  key: string;
  value: string;
  description: string;
  category: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch pending posts
  const { data: pendingPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/admin/posts", "pending"],
    queryFn: () => apiRequest("/api/admin/posts?status=pending"),
  });

  // Fetch system settings
  const { data: systemSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: () => apiRequest("/api/admin/settings"),
  });

  // Post approval/rejection mutation
  const postActionMutation = useMutation({
    mutationFn: async ({ postId, action, reason }: { postId: string; action: 'approve' | 'reject'; reason?: string }) => {
      return apiRequest(`/api/admin/posts/${postId}/${action}`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({
        title: "Post updated successfully!",
        description: "The post status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Settings update mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest(`/api/admin/settings/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Setting updated successfully!",
        description: "The system setting has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update setting",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePostAction = (postId: string, action: 'approve' | 'reject', reason?: string) => {
    postActionMutation.mutate({ postId, action, reason });
  };

  const handleSettingUpdate = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage posts, users, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payment APIs
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Crypto Addresses
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Posts Management */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Pending Post Submissions</CardTitle>
                <CardDescription>
                  Review and approve/reject user post submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" message="Loading posts..." />
                  </div>
                ) : pendingPosts?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending posts to review
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPosts?.map((post: Post) => (
                      <div key={post.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            <p className="text-gray-600 text-sm">{post.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>Platform: {post.platform}</span>
                              <span>User: {post.user.firstName} {post.user.lastName}</span>
                              <span>Email: {post.user.email}</span>
                            </div>
                          </div>
                          <Badge variant="outline">{post.status}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(post.url, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Post
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handlePostAction(post.id, 'approve')}
                            disabled={postActionMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handlePostAction(post.id, 'reject', 'Content does not meet guidelines')}
                            disabled={postActionMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment APIs */}
          <TabsContent value="payment">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flutterwave API Configuration</CardTitle>
                  <CardDescription>Configure Flutterwave payment gateway settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SettingInput
                    label="Public Key"
                    settingKey="FLUTTERWAVE_PUBLIC_KEY"
                    settings={systemSettings}
                    onUpdate={handleSettingUpdate}
                    type="password"
                  />
                  <SettingInput
                    label="Secret Key"
                    settingKey="FLUTTERWAVE_SECRET_KEY"
                    settings={systemSettings}
                    onUpdate={handleSettingUpdate}
                    type="password"
                  />
                  <SettingInput
                    label="Encryption Key"
                    settingKey="FLUTTERWAVE_ENCRYPTION_KEY"
                    settings={systemSettings}
                    onUpdate={handleSettingUpdate}
                    type="password"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paystack API Configuration</CardTitle>
                  <CardDescription>Configure Paystack payment gateway settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SettingInput
                    label="Public Key"
                    settingKey="PAYSTACK_PUBLIC_KEY"
                    settings={systemSettings}
                    onUpdate={handleSettingUpdate}
                    type="password"
                  />
                  <SettingInput
                    label="Secret Key"
                    settingKey="PAYSTACK_SECRET_KEY"
                    settings={systemSettings}
                    onUpdate={handleSettingUpdate}
                    type="password"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Crypto Addresses */}
          <TabsContent value="crypto">
            <Card>
              <CardHeader>
                <CardTitle>Cryptocurrency Addresses</CardTitle>
                <CardDescription>Configure crypto wallet addresses for payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingInput
                  label="Bitcoin (BTC) Address"
                  settingKey="BTC_ADDRESS"
                  settings={systemSettings}
                  onUpdate={handleSettingUpdate}
                />
                <SettingInput
                  label="Ethereum (ETH) Address"
                  settingKey="ETH_ADDRESS"
                  settings={systemSettings}
                  onUpdate={handleSettingUpdate}
                />
                <SettingInput
                  label="USDT Address"
                  settingKey="USDT_ADDRESS"
                  settings={systemSettings}
                  onUpdate={handleSettingUpdate}
                />
                <SettingInput
                  label="Polygon (MATIC) Address"
                  settingKey="MATIC_ADDRESS"
                  settings={systemSettings}
                  onUpdate={handleSettingUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingInput
                  label="Monthly Premium Price (USD)"
                  settingKey="PREMIUM_MONTHLY_PRICE"
                  settings={systemSettings}
                  onUpdate={handleSettingUpdate}
                  type="number"
                />
                <SettingInput
                  label="Yearly Premium Price (USD)"
                  settingKey="PREMIUM_YEARLY_PRICE"
                  settings={systemSettings}
                  onUpdate={handleSettingUpdate}
                  type="number"
                />
                <SettingInput
                  label="Points per Like"
                  settingKey="POINTS_PER_LIKE"
                  settings={systemSettings}
                  onUpdate={handleSettingUpdate}
                  type="number"
                />
                <SettingInput
                  label="Points per Share"
                  settingKey="POINTS_PER_SHARE"
                  settings={systemSettings}
                  onUpdate={handleSettingUpdate}
                  type="number"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper component for setting inputs
function SettingInput({ 
  label, 
  settingKey, 
  settings, 
  onUpdate, 
  type = "text" 
}: { 
  label: string; 
  settingKey: string; 
  settings: SystemSetting[]; 
  onUpdate: (key: string, value: string) => void;
  type?: string;
}) {
  const [value, setValue] = useState("");
  const setting = settings?.find(s => s.key === settingKey);

  useEffect(() => {
    if (setting) {
      setValue(setting.value);
    }
  }, [setting]);

  const handleUpdate = () => {
    onUpdate(settingKey, value);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <Button onClick={handleUpdate} size="sm">
          Update
        </Button>
      </div>
      {setting?.description && (
        <p className="text-sm text-gray-500">{setting.description}</p>
      )}
    </div>
  );
}