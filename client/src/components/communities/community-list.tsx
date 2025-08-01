import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function CommunityList() {
  const { data: userCommunities = [], isLoading } = useQuery({
    queryKey: ["/api/communities/user"],
    retry: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Communities</span>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/communities"}>
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-12 h-5 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : userCommunities.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-users text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500 text-sm mb-3">No communities joined yet</p>
            <Button size="sm" onClick={() => window.location.href = "/communities"}>
              Discover Communities
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {userCommunities.slice(0, 2).map((community: any) => (
              <div key={community.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-${community.color}-500 rounded-lg flex items-center justify-center`}>
                    <i className={`${community.icon} text-white text-sm`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{community.name}</p>
                    <p className="text-xs text-gray-500">{community.memberCount?.toLocaleString()} members</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  5 new
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
