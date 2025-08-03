import { useAuth } from "@/hooks/useAuth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();

  // Check if user is admin (you can implement proper admin checking)
  const isAdmin = user?.email === 'admin@boostbuddies.com';

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This area is restricted to administrators only. If you believe you should have access, 
              please contact the system administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}