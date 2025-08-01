import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden text-gray-500">
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome back, <span className="font-medium">{user?.firstName || "Creator"}</span>!
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Points Display */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-full px-4 py-2">
            <i className="fas fa-coins text-green-500"></i>
            <span className="font-semibold text-gray-900">{user?.points || 0}</span>
            <span className="text-sm text-gray-600">pts</span>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2">
            <i className="fas fa-bell text-xl"></i>
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
              3
            </Badge>
          </Button>
          
          {/* Profile Menu */}
          <div className="relative">
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"}
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              onClick={() => window.location.href = '/api/logout'}
              title="Click to logout"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
