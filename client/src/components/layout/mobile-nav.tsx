import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: "fas fa-home" },
  { name: "Analytics", href: "/analytics", icon: "fas fa-chart-line" },
  { name: "Groups", href: "/communities", icon: "fas fa-users" },
  { name: "Profile", href: "/profile", icon: "fas fa-user" },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center py-2 px-3 transition-colors",
              location === item.href ? "text-primary" : "text-gray-500"
            )}
          >
            <i className={`${item.icon} text-xl mb-1`}></i>
            <span className="text-xs font-medium">{item.name}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
