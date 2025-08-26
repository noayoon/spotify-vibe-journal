import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Pause } from "lucide-react";
import { useNowPlaying } from "@/hooks/use-now-playing";
import { Skeleton } from "@/components/ui/skeleton";

export function NowPlaying() {
  const { data: nowPlaying, isLoading, error } = useNowPlaying();

  return (
    <Card className="bg-dark-surface border-dark-elevated">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text-primary flex items-center">
          <Music className="text-spotify mr-2" />
          Now Playing
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="w-16 h-16 rounded-lg bg-dark-elevated" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 bg-dark-elevated" />
              <Skeleton className="h-3 w-1/2 bg-dark-elevated" />
              <Skeleton className="h-3 w-1/3 bg-dark-elevated" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Pause className="mx-auto h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary">Failed to load current track</p>
            <p className="text-sm text-text-secondary">Check your Spotify connection</p>
          </div>
        ) : !nowPlaying?.isPlaying || !nowPlaying?.track ? (
          <div className="text-center py-8">
            <Pause className="mx-auto h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary">No music playing</p>
            <p className="text-sm text-text-secondary">Start playing music on Spotify to capture your vibe</p>
          </div>
        ) : (
          <div className="flex items-center space-x-4" data-testid="now-playing-track">
            <img
              src={nowPlaying.track.albumArt}
              alt="Album artwork"
              className="w-16 h-16 rounded-lg shadow-lg"
              data-testid="img-album-art"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate text-text-primary" data-testid="text-track-name">
                {nowPlaying.track.name}
              </h4>
              <p className="text-text-secondary text-sm truncate" data-testid="text-artist-name">
                {nowPlaying.track.artist}
              </p>
              <p className="text-text-secondary text-xs truncate" data-testid="text-album-name">
                {nowPlaying.track.album}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-spotify rounded-full animate-pulse"></div>
              <span className="text-xs text-text-secondary">Playing</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
