export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  uri: string;
}

export interface NowPlayingResponse {
  isPlaying: boolean;
  track?: SpotifyTrack;
}

export async function getCurrentTrack(): Promise<NowPlayingResponse> {
  const response = await fetch("/api/spotify/now-playing", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch current track");
  }

  return response.json();
}
