import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Plus } from "lucide-react";
import { useNowPlaying } from "@/hooks/use-now-playing";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "./emoji-picker";

const DEFAULT_EMOJI_OPTIONS = ["😊", "😢", "🔥", "😴", "💃", "🧘"];

export function VibeCapture() {
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [note, setNote] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: nowPlaying } = useNowPlaying();

  // Fetch user's most used emojis
  const { data: mostUsedEmojis = [] } = useQuery<Array<{ emoji: string }>>({
    queryKey: ["/api/most-used-emojis"],
    enabled: true,
  });

  const captureVibeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/vibe-entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vibe-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/most-used-emojis"] });
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

  // Combine most used emojis with default options, ensuring selected emoji appears
  let emojiOptions = mostUsedEmojis.length > 0 
    ? Array.from(new Set([...mostUsedEmojis.map((item) => item.emoji), ...DEFAULT_EMOJI_OPTIONS]))
    : DEFAULT_EMOJI_OPTIONS;

  // If a selected emoji from picker isn't in the quick options, add it to the front
  if (selectedEmoji && !emojiOptions.includes(selectedEmoji)) {
    emojiOptions = [selectedEmoji, ...emojiOptions.slice(0, 4)];
  }

  // Handler for emoji selection from picker
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
    // Refresh most used emojis to potentially show the newly selected emoji
    queryClient.invalidateQueries({ queryKey: ["/api/most-used-emojis"] });
  };

  const handleCapture = () => {
    if (!selectedEmoji) {
      toast({
        title: "Select an emoji",
        description: "Please choose how you're feeling",
        variant: "destructive",
      });
      return;
    }

    // If music is playing, capture with track info
    if (nowPlaying?.isPlaying && nowPlaying?.track) {
      captureVibeMutation.mutate({
        emoji: selectedEmoji,
        note: note.trim() || null,
        trackName: nowPlaying.track.name,
        artistName: nowPlaying.track.artist,
        albumName: nowPlaying.track.album,
        albumArt: nowPlaying.track.albumArt,
        spotifyTrackId: nowPlaying.track.id,
      });
    } else {
      // Allow capturing vibes without music playing
      captureVibeMutation.mutate({
        emoji: selectedEmoji,
        note: note.trim() || null,
        trackName: "No track playing",
        artistName: "N/A",
        albumName: "N/A",
        albumArt: null,
        spotifyTrackId: null,
      });
    }
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
          <p className="text-sm text-text-secondary mb-3">
            {mostUsedEmojis.length > 0 ? "Your most used vibes:" : "Choose your vibe:"}
          </p>
          <div className="grid grid-cols-6 gap-3">
            {emojiOptions.slice(0, 5).map((emoji) => (
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
            <button
              onClick={() => setShowEmojiPicker(true)}
              className={cn(
                "p-3 text-lg hover:bg-dark-elevated rounded-lg transition-colors border-2 border-dashed border-text-secondary/30 text-text-secondary",
                "flex items-center justify-center"
              )}
              data-testid="button-add-custom-emoji"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-3 font-normal">
            Add a note (optional)
          </label>
          <div className="relative">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 80))}
              placeholder="What's this vibe about?"
              maxLength={80}
              className="h-12 px-4 bg-dark-elevated border-0 rounded-full text-text-primary placeholder-text-secondary-custom focus:ring-2 focus:ring-white/10 focus:bg-dark-elevated transition-all duration-200 text-sm font-normal"
              data-testid="input-note"
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-text-secondary font-normal">
              Express your moment in words
            </span>
            <span className="text-sm text-text-secondary font-normal" data-testid="text-character-count">
              {note.length}/80
            </span>
          </div>
        </div>

        <Button
          onClick={handleCapture}
          disabled={captureVibeMutation.isPending || !selectedEmoji}
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
      
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        selectedEmoji={selectedEmoji}
      />
    </Card>
  );
}
