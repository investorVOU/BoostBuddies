import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  const actions = [
    {
      title: "Submit Post",
      icon: "fas fa-plus",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700",
      href: "/submit",
    },
    {
      title: "View Analytics",
      icon: "fas fa-chart-bar",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "hover:from-purple-600 hover:to-purple-700",
      href: "/analytics",
    },
    {
      title: "Join Groups",
      icon: "fas fa-users",
      gradient: "from-green-500 to-green-600",
      hoverGradient: "hover:from-green-600 hover:to-green-700",
      href: "/communities",
    },
    {
      title: "Schedule",
      icon: "fas fa-calendar",
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "hover:from-orange-600 hover:to-orange-700",
      href: "/scheduler",
    },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              className={`flex items-center justify-center space-x-2 bg-gradient-to-r ${action.gradient} text-white py-3 px-4 rounded-lg ${action.hoverGradient} transition-all hover:shadow-md`}
              onClick={() => window.location.href = action.href}
            >
              <i className={action.icon}></i>
              <span className="font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
