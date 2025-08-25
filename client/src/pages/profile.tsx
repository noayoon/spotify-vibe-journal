import { TopBar } from "@/components/top-bar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Shield, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const response = await apiRequest("GET", "/api/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vibe-journal-export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Your vibe data has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <>
      <TopBar title="Profile & Settings" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Card className="bg-dark-surface border-dark-elevated max-w-2xl">
          <CardHeader>
            <CardTitle className="text-text-primary">Profile & Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                <AvatarFallback className="bg-dark-elevated text-text-primary text-lg">
                  {user.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-text-primary" data-testid="text-display-name">
                  {user.displayName}
                </h3>
                <p className="text-text-secondary" data-testid="text-email">
                  {user.email}
                </p>
                <p className="text-spotify text-sm">Connected to Spotify</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full justify-start bg-dark-elevated border-dark-elevated hover:bg-dark-elevated/80 text-text-primary"
                data-testid="button-export"
              >
                <Download className="mr-3 h-4 w-4" />
                Export My Data
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-dark-elevated border-dark-elevated hover:bg-dark-elevated/80 text-text-primary"
                data-testid="button-privacy"
              >
                <Shield className="mr-3 h-4 w-4" />
                Privacy Settings
              </Button>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-start bg-red-600/20 border-red-600/50 hover:bg-red-600/30 text-red-400"
                data-testid="button-signout"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
