import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface WeeklyStats {
  totalEntries: number;
  topMood: string | null;
  topArtist: string | null;
}

interface VibeEntry {
  id: string;
  emoji: string;
  notes?: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumArt: string;
  createdAt: string;
}

interface TimelineDay {
  day: number;
  dayLabel: string;
  entries: VibeEntry[];
}

interface WeeklyTimelineData {
  timeline: TimelineDay[];
  currentDay: number;
  weekStart: string;
  weekEnd: string;
}

interface TooltipData {
  x: number;
  y: number;
  entries: VibeEntry[];
  day: string;
}

function WeeklyTimeline() {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  
  const { data: timelineData, isLoading: isLoadingTimeline } = useQuery<WeeklyTimelineData>({
    queryKey: ["/api/weekly-timeline"],
  });

  const handleDayHover = (event: React.MouseEvent, day: TimelineDay) => {
    if (day.entries.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        entries: day.entries,
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day.day]
      });
    }
  };

  const handleDayLeave = () => {
    setTooltip(null);
  };

  if (isLoadingTimeline) {
    return (
      <Card className="bg-dark-surface border-dark-elevated">
        <CardContent className="p-6">
          <Skeleton className="w-full h-16 bg-dark-elevated" />
        </CardContent>
      </Card>
    );
  }

  if (!timelineData) return null;

  const { timeline, currentDay } = timelineData;

  return (
    <>
      <Card className="bg-dark-surface border-dark-elevated">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Weekly Timeline</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-6 left-4 right-4 h-0.5 bg-gray-600"></div>
            
            {/* Current day indicator */}
            <div 
              className="absolute top-5 w-2 h-2 bg-spotify rounded-full transition-all duration-300"
              style={{ 
                left: `${(currentDay / 6) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            ></div>

            {/* Day markers */}
            <div className="flex justify-between items-center relative z-10">
              {timeline.map((day, index) => (
                <div 
                  key={day.day}
                  className="flex flex-col items-center cursor-pointer"
                  onMouseEnter={(e) => handleDayHover(e, day)}
                  onMouseLeave={handleDayLeave}
                  data-testid={`timeline-day-${day.dayLabel}`}
                >
                  {/* Day label */}
                  <div className="text-sm text-text-secondary mb-2 font-medium">
                    {day.dayLabel}
                  </div>
                  
                  {/* Day dot */}
                  <div className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
                    day.entries.length > 0 
                      ? 'bg-gray-300 border-gray-300 hover:bg-white hover:border-white' 
                      : 'bg-transparent border-gray-600'
                  }`}>
                  </div>

                  {/* Emoji stack for entries */}
                  {day.entries.length > 0 && (
                    <div className="flex -space-x-1 mt-2 max-w-[40px] overflow-hidden">
                      {day.entries.slice(0, 3).map((entry, entryIndex) => (
                        <div 
                          key={entry.id}
                          className="text-xs bg-dark-elevated rounded-full w-6 h-6 flex items-center justify-center border border-gray-700"
                          style={{ zIndex: 3 - entryIndex }}
                        >
                          {entry.emoji}
                        </div>
                      ))}
                      {day.entries.length > 3 && (
                        <div className="text-xs bg-dark-elevated rounded-full w-6 h-6 flex items-center justify-center border border-gray-700 text-text-secondary">
                          +{day.entries.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {tooltip && (
        <div 
          className="fixed z-50 bg-dark-elevated border border-gray-700 rounded-lg p-3 shadow-xl pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="text-sm font-semibold text-text-primary mb-2">
            {tooltip.day} ({tooltip.entries.length} vibe{tooltip.entries.length !== 1 ? 's' : ''})
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {tooltip.entries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 text-xs">
                <span className="text-sm">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary truncate font-medium">
                    {entry.trackName}
                  </div>
                  <div className="text-text-secondary truncate">
                    {entry.artistName}
                  </div>
                  {entry.notes && (
                    <div className="text-text-secondary truncate italic">
                      "{entry.notes}"
                    </div>
                  )}
                </div>
              </div>
            ))}
            {tooltip.entries.length > 3 && (
              <div className="text-xs text-text-secondary text-center pt-1 border-t border-gray-700">
                +{tooltip.entries.length - 3} more vibes
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
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

      {/* Weekly Timeline */}
      <WeeklyTimeline />
    </div>
  );
}
