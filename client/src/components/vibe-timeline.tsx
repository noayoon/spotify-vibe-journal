import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Music } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareDialog } from "@/components/share-dialog";
import { DeleteVibeButton } from "./delete-vibe-button";
import type { VibeEntry } from "@shared/schema";

interface VibeTimelineProps {
  limit?: number;
  showLoadMore?: boolean;
  filter?: "all" | "emoji" | "artist";
  filterValue?: string;
}

export function VibeTimeline({ limit = 20, showLoadMore = false, filter = "all", filterValue = "" }: VibeTimelineProps) {
  const [offset, setOffset] = useState(0);
  const [allEntries, setAllEntries] = useState<VibeEntry[]>([]);

  const { data: entries, isLoading } = useQuery<VibeEntry[]>({
    queryKey: ["/api/vibe-entries", { limit, offset, filter, filterValue }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (filter === "emoji" && filterValue) {
        params.append("emoji", filterValue);
      } else if (filter === "artist" && filterValue) {
        params.append("artist", filterValue);
      }
      
      const response = await fetch(`/api/vibe-entries?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch vibe entries");
      }
      
      return response.json();
    },
  });

  // Update allEntries when new data comes in
  useEffect(() => {
    if (entries) {
      if (offset === 0) {
        // First load or reset
        setAllEntries(entries);
      } else {
        // Load more - append new entries
        setAllEntries(prev => [...prev, ...entries]);
      }
    }
  }, [entries, offset]);

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  if (isLoading && allEntries.length === 0) {
    return (
      <Card className="bg-dark-surface border-dark-elevated">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text-primary">
            Recent Vibes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-4 p-4">
              <Skeleton className="w-12 h-12 rounded-lg bg-dark-elevated" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-dark-elevated" />
                <Skeleton className="h-3 w-1/2 bg-dark-elevated" />
                <Skeleton className="h-3 w-full bg-dark-elevated" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const displayEntries = allEntries;

  if (!isLoading && displayEntries.length === 0) {
    return (
      <Card className="bg-dark-surface border-dark-elevated">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text-primary">
            Recent Vibes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Music className="mx-auto h-12 w-12 text-text-secondary mb-4" />
            <h4 className="text-lg font-semibold mb-2 text-text-primary">No vibes captured yet</h4>
            <p className="text-text-secondary">Start listening to music and capture your first vibe!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-surface border-dark-elevated overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text-primary">
          Recent Vibes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {displayEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 border-b border-dark-elevated hover:bg-dark-elevated transition-colors"
              data-testid={`vibe-entry-${entry.id}`}
            >
              <div className="flex items-start space-x-4">
                <img
                  src={entry.albumArt || "/placeholder-album.png"}
                  alt="Track artwork"
                  className="w-12 h-12 rounded-lg shadow-md"
                  data-testid="img-track-artwork"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xl" data-testid="text-entry-emoji">{entry.emoji}</span>
                    <span className="text-sm font-medium truncate text-text-primary" data-testid="text-track-name">
                      {entry.trackName}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm truncate" data-testid="text-artist-name">
                    {entry.artistName}
                  </p>
                  {entry.note && (
                    <p className="text-sm mt-2 text-text-primary" data-testid="text-entry-note">
                      {entry.note}
                    </p>
                  )}
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-text-secondary mb-1" data-testid="text-entry-timestamp">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </p>
                  <div className="flex gap-2 justify-end">
                    <ShareDialog vibeEntry={entry} />
                    <DeleteVibeButton vibeId={entry.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {showLoadMore && entries && entries.length >= limit && !isLoading && (
          <div className="p-4 text-center border-t border-dark-elevated">
            <Button
              onClick={loadMore}
              variant="ghost"
              className="text-spotify hover:text-spotify/80 hover:bg-dark-elevated"
              data-testid="button-load-more"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load more vibes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
