import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsGridProps {
  stats?: {
    totalPosts: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    points: number;
  };
  isLoading?: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const statCards = [
    {
      title: "Posts Boosted",
      value: stats?.totalPosts || 0,
      icon: "fab fa-twitter",
      color: "bg-blue-100",
      iconColor: "text-blue-500",
      change: "+12%",
    },
    {
      title: "Total Likes",
      value: stats?.totalLikes || 0,
      icon: "fas fa-heart",
      color: "bg-pink-100",
      iconColor: "text-pink-500",
      change: "+24%",
    },
    {
      title: "Total Shares",
      value: stats?.totalShares || 0,
      icon: "fas fa-share",
      color: "bg-purple-100",
      iconColor: "text-purple-500",
      change: "+8%",
    },
    {
      title: "Total Comments",
      value: stats?.totalComments || 0,
      icon: "fas fa-comments",
      color: "bg-green-100",
      iconColor: "text-green-500",
      change: "+16%",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <i className={`${stat.icon} ${stat.iconColor}`}></i>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                {stat.change}
              </Badge>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
