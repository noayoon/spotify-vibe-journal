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
      let activeSection = "capture-vibe"; // default
      
      // Check which section is currently most visible
      for (let i = 0; i < sections.length; i++) {
        const sectionId = sections[i];
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // If section is in viewport (at least partially visible)
          if (rect.top < viewportHeight * 0.6 && rect.bottom > 100) {
            activeSection = sectionId;
          }
          
          // Special case for the last section (history) - activate if we're near the bottom
          if (i === sections.length - 1) {
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            // If we're within 400px of the bottom, activate the last section
            if (scrollTop + windowHeight >= documentHeight - 400) {
              activeSection = sectionId;
            }
          }
        }
      }
      
      setActiveSection(activeSection);
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

            </>
          ) : location === "/profile" ? (
            // Profile page navigation - just show back to home
            <Link href="/">
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 mx-2 rounded-md transition-all duration-150 ease-in-out cursor-pointer",
                  "text-text-secondary hover:bg-dark-hover hover:text-text-primary"
                )}
                data-testid="link-back-home"
              >
                <Plus className="h-5 w-5" />
                <span>Back to Home</span>
              </div>
            </Link>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
