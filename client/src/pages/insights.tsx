import { TopBar } from "@/components/top-bar";
import { WeeklyRecap } from "@/components/weekly-recap";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Music } from "lucide-react";

interface WeeklyStats {
  totalEntries: number;
  topMood: string | null;
  topArtist: string | null;
}

export default function Insights() {
  const { data: stats, isLoading } = useQuery<WeeklyStats>({
    queryKey: ["/api/weekly-stats"],
  });

  return (
    <>
      <TopBar title="Weekly Insights" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Main Weekly Recap */}
        <WeeklyRecap />
        
        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-dark-surface border-dark-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Total Vibes</CardTitle>
              <BarChart3 className="h-4 w-4 text-spotify" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-dark-elevated" />
              ) : (
                <div className="text-2xl font-bold text-text-primary" data-testid="text-total-detailed">
                  {stats?.totalEntries || 0}
                </div>
              )}
              <p className="text-xs text-text-secondary mt-1">
                vibes captured this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface border-dark-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Top Mood</CardTitle>
              <TrendingUp className="h-4 w-4 text-spotify" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-8 bg-dark-elevated" />
              ) : (
                <div className="text-3xl mb-2" data-testid="text-mood-detailed">
                  {stats?.topMood || "🎵"}
                </div>
              )}
              <p className="text-xs text-text-secondary">
                your most felt emotion
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface border-dark-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Top Artist</CardTitle>
              <Music className="h-4 w-4 text-spotify" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-4 w-24 bg-dark-elevated" />
              ) : (
                <div className="text-sm font-semibold text-text-primary truncate" data-testid="text-artist-detailed">
                  {stats?.topArtist || "No data yet"}
                </div>
              )}
              <p className="text-xs text-text-secondary mt-1">
                soundtrack to your week
              </p>
            </CardContent>
          </Card>
        </div>

        {stats && stats.totalEntries === 0 && (
          <Card className="bg-dark-surface border-dark-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <Music className="mx-auto h-12 w-12 text-text-secondary mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No vibes captured yet</h3>
                <p className="text-text-secondary">
                  Start listening to music and capture your first vibe to see weekly insights!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}