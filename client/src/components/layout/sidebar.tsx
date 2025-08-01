import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-home" },
  { name: "Submit Post", href: "/submit", icon: "fas fa-plus-circle" },
  { name: "Analytics", href: "/analytics", icon: "fas fa-chart-line" },
  { name: "Communities", href: "/communities", icon: "fas fa-users" },
  { name: "Scheduler", href: "/scheduler", icon: "fas fa-calendar" },
  { name: "Collab Spotlight", href: "/collab", icon: "fas fa-star" },
  { name: "Live Events", href: "/events", icon: "fas fa-broadcast-tower" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-rocket text-white text-sm"></i>
          </div>
          <span className="text-xl font-bold text-gray-900">BoostBuddies</span>
        </div>
      </div>
      
      <nav className="flex flex-1 flex-col px-4 py-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={cn(
                  location === item.href
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                  "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors"
                )}
              >
                <i className={`${item.icon} w-5`}></i>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <i className="fas fa-crown text-yellow-500 text-lg"></i>
              <span className="font-semibold text-gray-900">Upgrade to Pro</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Get advanced analytics and ad-free experience</p>
            <Button className="w-full bg-primary text-white hover:bg-indigo-700 transition-colors">
              Upgrade Now
            </Button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
