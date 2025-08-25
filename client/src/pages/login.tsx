import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";

export default function Login() {
  const handleSpotifyLogin = () => {
    window.location.href = "/api/auth/spotify";
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-dark-surface border-dark-elevated">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-spotify rounded-full">
              <Music className="h-8 w-8 text-dark-bg" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-text-primary">
            Spotify Vibe Journal
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Turn your music moments into a meaningful journal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSpotifyLogin}
            className="w-full bg-spotify hover:bg-spotify/90 text-dark-bg font-semibold py-3"
            data-testid="button-spotify-login"
          >
            <Music className="mr-2 h-5 w-5" />
            Connect with Spotify
          </Button>
          <p className="text-xs text-text-secondary text-center mt-4">
            We'll connect to your Spotify account to capture your music vibes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
