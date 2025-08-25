import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Music, Plus, History, BarChart3, User } from "lucide-react";

const navigation = [
  { name: "Capture Vibe", href: "/", icon: Plus },
  { name: "History", href: "/timeline", icon: History },
  { name: "Weekly Recap", href: "/insights", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="lg:w-64 bg-dark-surface border-r border-dark-elevated lg:fixed lg:h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Music className="text-spotify text-2xl" />
          <h1 className="text-xl font-bold text-text-primary">Vibe Journal</h1>
        </div>
        
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 mx-2 rounded-md transition-all duration-150 ease-in-out",
                    isActive
                      ? "bg-dark-elevated text-spotify font-medium"
                      : "text-text-secondary hover:bg-dark-hover hover:text-text-primary"
                  )}
                  data-testid={`link-${item.name.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
