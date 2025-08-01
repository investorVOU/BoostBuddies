import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export default function Leaderboard() {
  const { user } = useAuth();
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/users/leaderboard"],
    retry: false,
  });

  const userRank = leaderboard.findIndex((u: any) => u.id === user?.id) + 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-trophy text-yellow-500"></i>
          <span>Weekly Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 3).map((user: any, index: number) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 text-white text-xs rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-orange-400'
                  }`}>
                    {index + 1}
                  </span>
                  <img 
                    src={user.profileImageUrl || `https://images.unsplash.com/photo-${index === 0 ? '1494790108755-2616b612b786' : index === 1 ? '1472099645785-5658abf4ff4e' : '1438761681033-6461ffad8d80'}?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32`}
                    alt={`${user.firstName || 'User'}`} 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <span className="font-medium text-gray-900">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'Anonymous'}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${index === 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {(user.points || 0).toLocaleString()} pts
                </span>
              </div>
            ))}
            
            {userRank > 3 && (
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {userRank}
                    </span>
                    <span className="font-medium text-gray-900">You</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {(user?.points || 0).toLocaleString()} pts
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
