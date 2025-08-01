import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function CollabSpotlight() {
  const { data: collabs = [], isLoading } = useQuery({
    queryKey: ["/api/collabs"],
    retry: false,
  });

  const featuredCollab = collabs[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-star text-yellow-500"></i>
          <span>Collab Spotlight</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ) : featuredCollab ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={featuredCollab.imageUrl}
                alt="Collaboration team" 
                className="w-12 h-12 rounded-full object-cover" 
              />
              <div>
                <p className="font-medium text-gray-900">{featuredCollab.title}</p>
                <p className="text-sm text-gray-500">AI & Machine Learning</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{featuredCollab.description}</p>
            <Button className="w-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
              View Collaboration
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-star text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500">No featured collaborations yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
