import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { VibeEntry } from "@shared/schema";

interface ShareDialogProps {
  vibeEntry: VibeEntry;
  children?: React.ReactNode;
}

interface SharedVibeResponse {
  id: string;
  shareId: string;
  shareUrl: string;
  title?: string;
  description?: string;
}

export function ShareDialog({ vibeEntry, children }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createShareMutation = useMutation({
    mutationFn: async (data: { vibeEntryId: string; title?: string; description?: string }): Promise<SharedVibeResponse> => {
      const response = await apiRequest("POST", "/api/shared-vibes", data);
      return response.json();
    },
    onSuccess: (data: SharedVibeResponse) => {
      setShareUrl(data.shareUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/my-shared-vibes"] });
      toast({
        title: "Vibe shared!",
        description: "Your vibe moment has been shared successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to share",
        description: "Something went wrong while sharing your vibe moment.",
        variant: "destructive",
      });
    },
  });

  const handleShare = () => {
    createShareMutation.mutate({
      vibeEntryId: vibeEntry.id,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "Share URL has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to your clipboard.",
        variant: "destructive",
      });
    }
  };

  const openSharedVibe = () => {
    window.open(shareUrl, '_blank');
  };

  const resetDialog = () => {
    setTitle("");
    setDescription("");
    setShareUrl("");
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetDialog();
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary hover:bg-dark-elevated"
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-dark-elevated border-dark-border text-text-primary max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Vibe Moment</DialogTitle>
        </DialogHeader>
        
        {!shareUrl ? (
          <div className="space-y-4">
            {/* Vibe Preview */}
            <div className="bg-dark-base rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{vibeEntry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{vibeEntry.trackName}</p>
                  <p className="text-sm text-text-secondary truncate">{vibeEntry.artistName}</p>
                </div>
              </div>
              {vibeEntry.note && (
                <p className="text-sm text-text-secondary">{vibeEntry.note}</p>
              )}
            </div>

            {/* Share Details */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Title (optional)
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your vibe moment a title..."
                  className="mt-1 bg-dark-base border-dark-border focus:border-green-500"
                  maxLength={100}
                  data-testid="input-share-title"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell people more about this moment..."
                  className="mt-1 bg-dark-base border-dark-border focus:border-green-500 resize-none"
                  rows={3}
                  maxLength={500}
                  data-testid="textarea-share-description"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleShare}
                disabled={createShareMutation.isPending}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                data-testid="button-create-share"
              >
                {createShareMutation.isPending ? "Creating..." : "Create Share Link"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-text-secondary">Your vibe moment is ready to share!</p>
            </div>

            <div className="bg-dark-base rounded-lg p-3 hover:bg-dark-elevated transition-colors cursor-pointer group" onClick={copyToClipboard}>
              <div className="flex items-center gap-2">
                <div 
                  className="flex-1 text-sm px-3 py-2 break-all cursor-pointer transition-colors"
                  style={{ color: '#ffffff !important' }}
                  data-testid="text-share-url"
                >
                  <span style={{ color: '#ffffff !important' }} className="group-hover:text-blue-400 transition-colors">
                    {shareUrl}
                  </span>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard();
                  }}
                  size="sm"
                  variant="ghost"
                  className="text-green-500 hover:text-green-400 hover:bg-green-500/10 flex-shrink-0"
                  data-testid="button-copy-url"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={openSharedVibe}
                variant="outline"
                className="flex-1 border-gray-600 bg-transparent hover:bg-dark-base"
                style={{ color: '#60a5fa !important', borderColor: '#4b5563 !important' }}
                data-testid="button-preview-share"
              >
                <ExternalLink className="w-4 h-4 mr-2" style={{ color: '#60a5fa !important' }} />
                <span style={{ color: '#60a5fa !important' }}>Preview</span>
              </Button>
              <Button
                onClick={copyToClipboard}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                data-testid="button-copy-link"
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}