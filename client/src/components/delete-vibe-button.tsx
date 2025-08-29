import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteVibeButtonProps {
  vibeId: string;
}

export function DeleteVibeButton({ vibeId }: DeleteVibeButtonProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteVibeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/vibe-entries/${vibeId}`, null);
    },
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["/api/vibe-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/most-used-emojis"] });
      
      toast({
        title: "Vibe deleted",
        description: "Your vibe has been permanently removed",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete vibe",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-text-secondary hover:text-red-400 hover:bg-red-400/10"
          data-testid={`button-delete-vibe-${vibeId}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-dark-surface border-dark-elevated">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-text-primary">Delete Vibe</AlertDialogTitle>
          <AlertDialogDescription className="text-text-secondary">
            Are you sure you want to delete this vibe? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-dark-elevated border-dark-elevated text-text-secondary hover:bg-dark-surface">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteVibeMutation.mutate()}
            disabled={deleteVibeMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-testid="button-confirm-delete"
          >
            {deleteVibeMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}