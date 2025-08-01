
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Heart, MessageCircle, Share2, Users } from "lucide-react";

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'share' | 'join';
  user: string;
  content: string;
  timestamp: Date;
}

export function RealTimeActivity() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'like',
      user: 'John D.',
      content: 'liked your Twitter post',
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: '2',
      type: 'join',
      user: 'Sarah M.',
      content: 'joined YouTube Community',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '3',
      type: 'comment',
      user: 'Mike R.',
      content: 'commented on your Facebook post',
      timestamp: new Date(Date.now() - 8 * 60 * 1000)
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'share': return <Share2 className="h-4 w-4 text-green-500" />;
      case 'join': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Live Activity
          <Badge variant="secondary" className="ml-auto">
            {activities.length} new
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {activity.user.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {getIcon(activity.type)}
                <span className="text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.content}
                </span>
              </div>
              <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
