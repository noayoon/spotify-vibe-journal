import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Music, Plus, History, BarChart3, User } from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Capture Vibe", href: "/", icon: Plus, sectionId: "capture-vibe" },
  { name: "History", href: "/timeline", icon: History },
  { name: "Weekly Recap", href: "/insights", icon: BarChart3, sectionId: "weekly-recap" },
  { name: "Profile", href: "/profile", icon: User },
];

const sectionNavigation = [
  { name: "Capture Vibe", sectionId: "capture-vibe", icon: Plus },
  { name: "Weekly Recap", sectionId: "weekly-recap", icon: BarChart3 },
  { name: "History", sectionId: "history", icon: History },
];

export function Sidebar() {
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState("capture-vibe");

  // Scroll spy effect
  useEffect(() => {
    if (location !== "/") return;

    const handleScroll = () => {
      const sections = sectionNavigation.map(nav => nav.sectionId);
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Consider a section active if it's in the top half of the viewport
          if (rect.top <= 200 && rect.bottom >= 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    }
  };

  return (
    <div className="lg:w-64 bg-dark-surface border-r border-dark-elevated lg:fixed lg:h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Music className="text-spotify text-2xl" />
          <h1 className="text-xl font-bold text-text-primary">Vibe Journal</h1>
        </div>
        
        <nav className="space-y-1">
          {location === "/" ? (
            // Section-based navigation for the main dashboard
            <>
              {sectionNavigation.map((item) => {
                const isActive = activeSection === item.sectionId;
                const Icon = item.icon;
                
                return (
                  <div
                    key={item.name}
                    onClick={() => scrollToSection(item.sectionId)}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 mx-2 rounded-md transition-all duration-150 ease-in-out cursor-pointer",
                      isActive
                        ? "bg-dark-elevated text-spotify font-medium"
                        : "text-text-secondary hover:bg-dark-hover hover:text-text-primary"
                    )}
                    data-testid={`section-${item.name.toLowerCase().replace(" ", "-")}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                );
              })}
              <div className="border-t border-dark-elevated my-4"></div>
              <Link href="/profile">
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 mx-2 rounded-md transition-all duration-150 ease-in-out cursor-pointer",
                    "text-text-secondary hover:bg-dark-hover hover:text-text-primary"
                  )}
                  data-testid="link-profile"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </div>
              </Link>
            </>
          ) : (
            // Regular navigation for other pages
            navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 mx-2 rounded-md transition-all duration-150 ease-in-out cursor-pointer",
                      isActive
                        ? "bg-dark-elevated text-spotify font-medium"
                        : "text-text-secondary hover:bg-dark-hover hover:text-text-primary"
                    )}
                    data-testid={`link-${item.name.toLowerCase().replace(" ", "-")}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })
          )}
        </nav>
      </div>
    </div>
  );
}
