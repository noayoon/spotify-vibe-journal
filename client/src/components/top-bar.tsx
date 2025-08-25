import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { user } = useAuth();

  return (
    <div className="bg-dark-surface border-b border-dark-elevated p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 hover:bg-dark-elevated text-text-primary"
            data-testid="button-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-text-primary" data-testid="text-page-title">
            {title}
          </h2>
        </div>
        
        {user && (
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback className="bg-dark-elevated text-text-primary">
                {user.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm text-text-primary" data-testid="text-user-name">
              {user.displayName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
