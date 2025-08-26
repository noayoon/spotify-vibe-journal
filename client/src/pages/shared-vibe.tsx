import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, Calendar } from "lucide-react";
import { Link } from "wouter";

interface SharedVibeData {
  id: string;
  shareId: string;
  title?: string;
  description?: string;
  viewCount: number;
  createdAt: string;
  vibeEntry: {
    emoji: string;
    note?: string;
    trackName: string;
    artistName: string;
    albumName: string;
    albumArt?: string;
    spotifyTrackId?: string;
    createdAt: string;
  };
  user: {
    displayName: string;
    avatarUrl?: string;
  };
}

export default function SharedVibe() {
  const { shareId } = useParams<{ shareId: string }>();
  const [sharedVibe, setSharedVibe] = useState<SharedVibeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;

    fetch(`/api/shared-vibes/${shareId}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("This vibe moment could not be found");
          }
          throw new Error("Failed to load shared vibe");
        }
        return res.json();
      })
      .then(data => {
        setSharedVibe(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [shareId]);

  const openSpotify = () => {
    if (sharedVibe?.vibeEntry.spotifyTrackId) {
      window.open(`https://open.spotify.com/track/${sharedVibe.vibeEntry.spotifyTrackId}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent mx-auto mb-4" />
          <p className="text-text-secondary">Loading shared vibe...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedVibe) {
    return (
      <div className="min-h-screen bg-dark-base text-text-primary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-2xl font-bold mb-4">Vibe Not Found</h1>
          <p className="text-text-secondary mb-6">
            {error || "This shared vibe moment doesn't exist or has been removed."}
          </p>
          <Link href="/" data-testid="link-home">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              Explore Vibe Journal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-base text-text-primary">
      {/* Header */}
      <div className="border-b border-dark-elevated p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors">
              <div className="text-xl">🎵</div>
              <span className="font-bold">Vibe Journal</span>
            </div>
          </Link>
          <Badge variant="secondary" className="bg-dark-elevated text-text-secondary border-0">
            <Eye className="w-3 h-3 mr-1" />
            {sharedVibe.viewCount} {sharedVibe.viewCount === 1 ? 'view' : 'views'}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {sharedVibe.user.avatarUrl && (
              <img 
                src={sharedVibe.user.avatarUrl} 
                alt={sharedVibe.user.displayName}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{sharedVibe.user.displayName}</p>
              <p className="text-sm text-text-secondary flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(sharedVibe.vibeEntry.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {sharedVibe.title && (
            <h1 className="text-2xl font-bold mb-2">{sharedVibe.title}</h1>
          )}
          
          {sharedVibe.description && (
            <p className="text-text-secondary text-lg">{sharedVibe.description}</p>
          )}
        </div>

        {/* Vibe Card */}
        <Card className="bg-dark-elevated border-0 p-8 mb-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Album Art */}
            {sharedVibe.vibeEntry.albumArt && (
              <div className="flex-shrink-0">
                <img 
                  src={sharedVibe.vibeEntry.albumArt} 
                  alt={sharedVibe.vibeEntry.albumName}
                  className="w-48 h-48 rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Track Info & Vibe */}
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{sharedVibe.vibeEntry.trackName}</h2>
                <p className="text-xl text-text-secondary mb-1">{sharedVibe.vibeEntry.artistName}</p>
                <p className="text-text-secondary">{sharedVibe.vibeEntry.albumName}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-6xl">{sharedVibe.vibeEntry.emoji}</div>
                <div>
                  <p className="text-sm text-text-secondary uppercase tracking-wide font-medium mb-1">
                    The Vibe
                  </p>
                  {sharedVibe.vibeEntry.note ? (
                    <p className="text-lg">{sharedVibe.vibeEntry.note}</p>
                  ) : (
                    <p className="text-text-secondary italic">No note added</p>
                  )}
                </div>
              </div>

              {sharedVibe.vibeEntry.spotifyTrackId && (
                <Button 
                  onClick={openSpotify}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                  data-testid="button-play-spotify"
                >
                  <Play className="w-4 h-4" />
                  Play on Spotify
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="text-text-secondary mb-4">
            Capture your own musical moments and feelings
          </p>
          <Link href="/" data-testid="link-start-journaling">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
              Start Your Vibe Journal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}