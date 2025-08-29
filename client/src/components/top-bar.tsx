import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, User, LogOut, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 px-3 py-2 h-auto hover:bg-dark-elevated rounded-full"
                data-testid="button-user-menu"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback className="bg-dark-elevated text-text-primary">
                    {user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm text-text-primary" data-testid="text-user-name">
                  {user.displayName}
                </span>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-dark-surface border-dark-elevated shadow-xl"
            >
              <Link href="/profile">
                <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 text-text-primary hover:bg-dark-elevated cursor-pointer">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuSeparator className="bg-dark-elevated" />
              
              <DropdownMenuItem
                className="flex items-center space-x-2 px-3 py-2 text-text-primary hover:bg-dark-elevated cursor-pointer"
                onClick={() => {
                  window.open("https://accounts.spotify.com", "_blank");
                }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Account</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="flex items-center space-x-2 px-3 py-2 text-text-primary hover:bg-dark-elevated cursor-pointer"
                onClick={() => {
                  window.open("https://support.spotify.com", "_blank");
                }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Support</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-dark-elevated" />
              
              <DropdownMenuItem
                className="flex items-center space-x-2 px-3 py-2 text-text-primary hover:bg-dark-elevated cursor-pointer"
                onClick={() => {
                  window.location.href = "/api/auth/logout";
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
