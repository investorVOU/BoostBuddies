import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Header from "@/components/layout/header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Communities() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: allCommunities = [], isLoading: allCommunitiesLoading } = useQuery({
    queryKey: ["/api/communities"],
    retry: false,
  });

  const { data: userCommunities = [], isLoading: userCommunitiesLoading } = useQuery({
    queryKey: ["/api/communities/user"],
    retry: false,
  });

  const joinCommunityMutation = useMutation({
    mutationFn: async (communityId: string) => {
      await apiRequest("POST", `/api/communities/${communityId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communities/user"] });
      toast({
        title: "Success",
        description: "Joined community successfully!",
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
        description: "Failed to join community. Please try again.",
        variant: "destructive",
      });
    },
  });

  const leaveCommunityMutation = useMutation({
    mutationFn: async (communityId: string) => {
      await apiRequest("DELETE", `/api/communities/${communityId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communities/user"] });
      toast({
        title: "Success",
        description: "Left community successfully!",
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
        description: "Failed to leave community. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const userCommunityIds = userCommunities.map((c: any) => c.id);
  const availableCommunities = allCommunities.filter((c: any) => !userCommunityIds.includes(c.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />
      
      <div className="lg:pl-64">
        <Header />
        
        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Communities</h1>
            <p className="text-gray-600">
              Join niche communities to connect with like-minded creators and get targeted engagement.
            </p>
          </div>

          <Tabs defaultValue="my-communities" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-communities">My Communities</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>

            <TabsContent value="my-communities" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCommunitiesLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : userCommunities.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-users text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No communities joined yet</h3>
                    <p className="text-gray-500 mb-4">Join communities to connect with other creators in your niche.</p>
                    <Button onClick={() => document.querySelector('[value="discover"]')?.click()}>
                      Discover Communities
                    </Button>
                  </div>
                ) : (
                  userCommunities.map((community: any) => (
                    <Card key={community.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-12 h-12 bg-${community.color}-500 rounded-lg flex items-center justify-center`}>
                            <i className={`${community.icon} text-white text-lg`}></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{community.name}</h3>
                            <p className="text-sm text-gray-500">{community.memberCount.toLocaleString()} members</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{community.description}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => leaveCommunityMutation.mutate(community.id)}
                          disabled={leaveCommunityMutation.isPending}
                        >
                          {leaveCommunityMutation.isPending ? "Leaving..." : "Leave Community"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="discover" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCommunitiesLoading ? (
                  [...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : availableCommunities.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-check-circle text-2xl text-green-500"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500">You've joined all available communities.</p>
                  </div>
                ) : (
                  availableCommunities.map((community: any) => (
                    <Card key={community.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-12 h-12 bg-${community.color}-500 rounded-lg flex items-center justify-center`}>
                            <i className={`${community.icon} text-white text-lg`}></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{community.name}</h3>
                            <p className="text-sm text-gray-500">{community.memberCount.toLocaleString()} members</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{community.description}</p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => joinCommunityMutation.mutate(community.id)}
                          disabled={joinCommunityMutation.isPending}
                        >
                          {joinCommunityMutation.isPending ? "Joining..." : "Join Community"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
