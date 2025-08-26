import { useQuery } from "@tanstack/react-query";
import { getCurrentTrack, type NowPlayingResponse } from "@/lib/spotify";

export function useNowPlaying() {
  return useQuery<NowPlayingResponse>({
    queryKey: ["/api/spotify/now-playing"],
    queryFn: getCurrentTrack,
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: false,
  });
}
