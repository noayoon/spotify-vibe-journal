import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface WeeklyStats {
  totalEntries: number;
  topMood: string | null;
  topArtist: string | null;
  topArtistImage: string | null;
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
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
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

  const { timeline, currentDay, streak } = timelineData;

  // Calculate exact current position including time of day
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimePercent = (currentHours * 60 + currentMinutes) / (24 * 60);
  const dayWidth = 100 / 7;
  const exactCurrentPosition = (currentDay * dayWidth) + (currentTimePercent * dayWidth);

  return (
    <>
      <Card className="bg-dark-surface border-dark-elevated">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Weekly Timeline</h3>
            {streak && streak.currentStreak > 1 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-orange-400">🔥</span>
                <span className="text-text-secondary">
                  {streak.currentStreak} day streak!
                </span>
              </div>
            )}
          </div>
          <div className="relative pb-6">
            {/* Timeline line */}
            <div className="absolute top-6 left-4 right-4 h-0.5 bg-gray-600"></div>
            
            {/* Current time indicator */}
            <div 
              className="absolute top-5 w-2 h-2 bg-spotify rounded-full transition-all duration-300 shadow-sm"
              style={{ 
                left: `${Math.min(Math.max(exactCurrentPosition, 2), 98)}%`,
                transform: 'translateX(-50%)'
              }}
            ></div>

            {/* Day markers and timeline container */}
            <div className="relative">
              {/* Day labels */}
              <div className="flex justify-between items-center mb-8 relative z-20">
                {timeline.map((day, dayIndex) => {
                  // Check if this day is part of the current streak
                  const isPartOfStreak = streak && streak.currentStreak > 1 && 
                    dayIndex <= currentDay && 
                    dayIndex >= (currentDay - streak.currentStreak + 1) &&
                    day.entries.length > 0;
                  
                  return (
                    <div key={day.day} className="flex flex-col items-center">
                      <div className="text-sm text-text-secondary font-medium">
                        {day.dayLabel}
                      </div>
                      <div className="relative mt-2">
                        {/* Main day indicator */}
                        <div className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
                          day.entries.length > 0 
                            ? 'bg-gray-300 border-gray-300' 
                            : 'bg-transparent border-gray-600'
                        }`}>
                        </div>
                        {/* Fire indicator for streak days */}
                        {isPartOfStreak && (
                          <div className="absolute -top-1 -right-1 text-xs">
                            🔥
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vibe entries positioned by time */}
              <div className="absolute top-12 left-0 right-0 h-16 overflow-visible">
                {(() => {
                  // Flatten all entries with their positions and sort by time
                  const allEntries = timeline.flatMap((day, dayIndex) => 
                    day.entries.map((entry) => {
                      const entryTime = new Date(entry.createdAt);
                      const hours = entryTime.getHours();
                      const minutes = entryTime.getMinutes();
                      
                      // Calculate position within the day (0-100%)
                      const timePercent = (hours * 60 + minutes) / (24 * 60) * 100;
                      
                      // Calculate horizontal position across the week
                      const dayWidth = 100 / 7;
                      const dayStart = dayIndex * dayWidth;
                      const exactPosition = dayStart + (timePercent * dayWidth / 100);
                      
                      const timeString = entryTime.toLocaleTimeString([], { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      });

                      return {
                        ...entry,
                        exactPosition,
                        timeString,
                        dayIndex,
                        dayLabel: day.dayLabel
                      };
                    })
                  );

                  // Sort by position to detect overlaps
                  allEntries.sort((a, b) => a.exactPosition - b.exactPosition);

                  // Group overlapping entries
                  const groupedEntries: Array<{
                    entries: typeof allEntries;
                    exactPosition: number;
                    dayIndex: number;
                    timeString: string;
                  }> = [];

                  allEntries.forEach((entry) => {
                    // Find existing group within 1.5% distance (reduced threshold for better separation)
                    const existingGroup = groupedEntries.find(group => {
                      const distance = Math.abs(group.exactPosition - entry.exactPosition);
                      const isSameDay = group.dayIndex === entry.dayIndex;
                      
                      // Only group if they're on the same day AND within 1.5% distance
                      // 1.5% of timeline = roughly 2-3 hours on the same day
                      return isSameDay && distance < 1.5;
                    });

                    if (existingGroup) {
                      existingGroup.entries.push(entry);
                    } else {
                      groupedEntries.push({
                        entries: [entry],
                        exactPosition: entry.exactPosition,
                        dayIndex: entry.dayIndex,
                        timeString: entry.timeString
                      });
                    }
                  });

                  return groupedEntries.map((group, groupIndex) => {
                    const isMultiple = group.entries.length > 1;
                    const allSameEmoji = group.entries.every(entry => entry.emoji === group.entries[0].emoji);
                    
                    // Display logic: show emoji if single entry or all same emoji, otherwise show count
                    const displayContent = !isMultiple || allSameEmoji 
                      ? group.entries[0].emoji 
                      : group.entries.length.toString();

                    return (
                      <div
                        key={`group-${groupIndex}`}
                        className="absolute cursor-pointer group"
                        style={{
                          left: `${group.exactPosition}%`,
                          transform: 'translateX(-50%)',
                          top: '0px'
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10,
                            entries: group.entries,
                            day: `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][group.dayIndex]} at ${group.timeString}`
                          });
                        }}
                        onMouseLeave={handleDayLeave}
                        data-testid={`vibe-group-${groupIndex}`}
                      >
                        <div className="relative">
                          {/* Emoji bubble or count */}
                          <div className={`bg-dark-elevated border border-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:border-gray-400 hover:bg-dark-surface transition-all duration-200 group-hover:scale-110 ${
                            !isMultiple || allSameEmoji ? '' : 'font-semibold text-text-primary'
                          }`}>
                            {displayContent}
                          </div>
                          
                          {/* Time label */}
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            {group.timeString}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
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
            {tooltip.day}
          </div>
          <div className="space-y-3 max-w-80">
            {tooltip.entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3">
                {/* Album Cover */}
                <div className="flex-shrink-0">
                  {entry.albumArt ? (
                    <>
                      <img 
                        src={entry.albumArt} 
                        alt={`${entry.trackName} album cover`}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-12 h-12 bg-dark-elevated rounded flex items-center justify-center text-lg hidden"
                        style={{ display: 'none' }}
                      >
                        {entry.emoji}
                      </div>
                    </>
                  ) : (
                    <div className="w-12 h-12 bg-dark-elevated rounded flex items-center justify-center text-lg">
                      {entry.emoji}
                    </div>
                  )}
                </div>
                
                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{entry.emoji}</span>
                    <div className="text-text-primary font-medium text-sm leading-tight">
                      {entry.trackName}
                    </div>
                  </div>
                  <div className="text-text-secondary text-xs mb-1">
                    by {entry.artistName}
                  </div>
                  {entry.notes && (
                    <div className="text-text-secondary text-xs italic leading-relaxed">
                      "{entry.notes}"
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              <div className="w-20 h-20 mx-auto mb-4 relative">
                {stats?.topArtistImage ? (
                  <img 
                    src={stats.topArtistImage} 
                    alt={stats.topArtist || "Top Artist"}
                    className="w-full h-full object-cover rounded-full border-2 border-gray-700"
                    onError={(e) => {
                      // Fallback to initial letter if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700 ${
                    stats?.topArtistImage ? 'hidden' : 'flex'
                  }`}
                  style={{ display: stats?.topArtistImage ? 'none' : 'flex' }}
                >
                  <span className="text-lg font-bold text-text-primary">
                    {stats?.topArtist ? stats.topArtist.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
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
