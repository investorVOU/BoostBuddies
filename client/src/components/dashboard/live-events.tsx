import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function LiveEvents() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    retry: false,
  });

  const liveEvents = events.filter((event: any) => event.status === 'live');
  const upcomingEvents = events.filter((event: any) => event.status === 'upcoming');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-broadcast-tower text-red-500"></i>
          <span>Live Events</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 rounded-lg p-4 h-24"></div>
            <div className="bg-gray-200 rounded-lg p-4 h-20"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {liveEvents.map((event: any) => (
              <div key={event.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    LIVE
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">{event.title}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                <Button className="w-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                  Join Now
                </Button>
              </div>
            ))}
            
            {upcomingEvents.slice(0, 2).map((event: any) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    UPCOMING
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">{event.title}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {event.scheduledAt ? new Date(event.scheduledAt).toLocaleDateString() : 'Tomorrow at 3:00 PM'}
                </p>
                <Button variant="outline" className="w-full">
                  Set Reminder
                </Button>
              </div>
            ))}
            
            {liveEvents.length === 0 && upcomingEvents.length === 0 && (
              <div className="text-center py-4">
                <i className="fas fa-broadcast-tower text-4xl text-gray-300 mb-2"></i>
                <p className="text-gray-500">No live events right now</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
