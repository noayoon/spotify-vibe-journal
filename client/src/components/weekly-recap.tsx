import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyStats {
  totalEntries: number;
  topMood: string | null;
  topArtist: string | null;
}

export function WeeklyRecap() {
  const { data: stats, isLoading } = useQuery<WeeklyStats>({
    queryKey: ["/api/weekly-stats"],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">This Week's Vibe</h2>
        <p className="text-sm text-text-secondary">Only visible to you</p>
      </div>

      {/* Main Stats Grid - Spotify Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Mood - Large Circular Icon */}
        <Card className="bg-dark-surface border-dark-elevated hover:bg-dark-elevated transition-colors">
          <CardContent className="p-6 text-center">
            {isLoading ? (
              <Skeleton className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-elevated" />
            ) : (
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-4xl" data-testid="text-top-mood">
                  {stats?.topMood || "🎵"}
                </span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-text-primary mb-1">Top Mood</h3>
            <p className="text-sm text-text-secondary">your most felt emotion</p>
          </CardContent>
        </Card>

        {/* Top Artist - Profile Picture Style */}
        <Card className="bg-dark-surface border-dark-elevated hover:bg-dark-elevated transition-colors">
          <CardContent className="p-6 text-center">
            {isLoading ? (
              <Skeleton className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-elevated" />
            ) : (
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700">
                <span className="text-lg font-bold text-text-primary">
                  {stats?.topArtist ? stats.topArtist.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-text-primary mb-1">Top Artist</h3>
            <p className="text-sm text-text-secondary truncate" data-testid="text-top-artist">
              {stats?.topArtist || "No data yet"}
            </p>
          </CardContent>
        </Card>

        {/* Total Vibes */}
        <Card className="bg-dark-surface border-dark-elevated hover:bg-dark-elevated transition-colors">
          <CardContent className="p-6 text-center">
            {isLoading ? (
              <Skeleton className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-elevated" />
            ) : (
              <div className="w-20 h-20 mx-auto mb-4 bg-spotify rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-dark-bg" data-testid="text-total-entries">
                  {stats?.totalEntries || 0}
                </span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-text-primary mb-1">Vibes Logged</h3>
            <p className="text-sm text-text-secondary">tracks captured this week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
