import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart } from "lucide-react";
import { useNowPlaying } from "@/hooks/use-now-playing";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const EMOJI_OPTIONS = ["😊", "😢", "🔥", "😴", "💃", "🧘"];

export function VibeCapture() {
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: nowPlaying } = useNowPlaying();

  const captureVibeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/vibe-entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vibe-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-stats"] });
      setSelectedEmoji("");
      setNote("");
      toast({
        title: "Vibe captured!",
        description: "Your musical moment has been saved",
      });
    },
    onError: () => {
      toast({
        title: "Failed to capture vibe",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleCapture = () => {
    if (!selectedEmoji) {
      toast({
        title: "Select an emoji",
        description: "Please choose how you're feeling",
        variant: "destructive",
      });
      return;
    }

    if (!nowPlaying?.isPlaying) {
      toast({
        title: "No music playing",
        description: "Start playing music on Spotify first",
        variant: "destructive",
      });
      return;
    }

    captureVibeMutation.mutate({
      emoji: selectedEmoji,
      note: note.trim() || null,
      trackName: nowPlaying.track.name,
      artistName: nowPlaying.track.artist,
      albumName: nowPlaying.track.album,
      albumArt: nowPlaying.track.albumArt,
      spotifyTrackId: nowPlaying.track.id,
    });
  };

  return (
    <Card className="bg-dark-surface border-dark-elevated">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text-primary">
          How are you feeling?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-text-secondary mb-3">Choose your vibe:</p>
          <div className="grid grid-cols-6 gap-3">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={cn(
                  "p-3 text-2xl hover:bg-dark-elevated rounded-lg transition-colors border-2 border-transparent",
                  selectedEmoji === emoji && "border-vibe-orange bg-dark-elevated"
                )}
                data-testid={`button-emoji-${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Add a note (optional)
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 80))}
            placeholder="What's this vibe about? (max 80 characters)"
            maxLength={80}
            rows={3}
            className="bg-dark-elevated border-dark-elevated text-text-primary placeholder-text-secondary focus:ring-spotify focus:border-transparent resize-none"
            data-testid="textarea-note"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-text-secondary">
              Express your moment in words
            </span>
            <span className="text-xs text-text-secondary" data-testid="text-character-count">
              {note.length}/80
            </span>
          </div>
        </div>

        <Button
          onClick={handleCapture}
          disabled={captureVibeMutation.isPending || !nowPlaying?.isPlaying}
          className="w-full bg-spotify hover:bg-spotify/90 text-dark-bg font-semibold py-3"
          data-testid="button-capture-vibe"
        >
          {captureVibeMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin mr-2" />
              Capturing...
            </>
          ) : (
            <>
              <Heart className="mr-2 h-5 w-5" />
              Capture This Vibe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
