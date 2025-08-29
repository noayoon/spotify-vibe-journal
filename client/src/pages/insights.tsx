import { TopBar } from "@/components/top-bar";
import { WeeklyRecap } from "@/components/weekly-recap";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";

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
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8 pb-8">
        {/* Main Weekly Recap - Spotify Style */}
        <WeeklyRecap />

        {/* Empty State */}
        {!isLoading && stats && stats.totalEntries === 0 && (
          <Card className="bg-dark-surface border-dark-elevated">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                  <Music className="h-10 w-10 text-text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">No vibes captured yet</h3>
                <p className="text-text-secondary max-w-md mx-auto">
                  Start listening to music and capture your first vibe to see your weekly insights and top moods!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}