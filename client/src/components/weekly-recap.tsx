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
    <Card className="bg-gradient-to-r from-vibe-orange to-spotify border-none">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-dark-bg flex items-center justify-between">
          This Week's Vibe
          <BarChart3 className="text-xl" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center text-dark-bg">
            {isLoading ? (
              <Skeleton className="h-8 w-8 mx-auto mb-1 bg-dark-bg/20" />
            ) : (
              <div className="text-2xl mb-1" data-testid="text-top-mood">
                {stats?.topMood || "🎵"}
              </div>
            )}
            <p className="text-sm font-medium">Most Felt</p>
          </div>
          
          <div className="text-center text-dark-bg">
            {isLoading ? (
              <Skeleton className="h-4 w-20 mx-auto mb-1 bg-dark-bg/20" />
            ) : (
              <div className="text-sm font-semibold mb-1 truncate" data-testid="text-top-artist">
                {stats?.topArtist || "N/A"}
              </div>
            )}
            <p className="text-sm font-medium">Top Artist</p>
          </div>
          
          <div className="text-center text-dark-bg">
            {isLoading ? (
              <Skeleton className="h-6 w-8 mx-auto mb-1 bg-dark-bg/20" />
            ) : (
              <div className="text-xl font-bold mb-1" data-testid="text-total-entries">
                {stats?.totalEntries || 0}
              </div>
            )}
            <p className="text-sm font-medium">Vibes Logged</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
