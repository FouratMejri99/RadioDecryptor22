import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Bookmark } from "@shared/schema";
import { Plus, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { telegram } from "@/lib/telegram";

interface BookmarksSectionProps {
  userId: string;
  onFrequencySelect: (frequency: number, modulation: string) => void;
}

export function BookmarksSection({ userId, onFrequencySelect }: BookmarksSectionProps) {
  const queryClient = useQueryClient();

  const { data: bookmarks = [], isLoading } = useQuery<Bookmark[]>({
    queryKey: ['/api/bookmarks', userId],
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId: string) => {
      await apiRequest('DELETE', `/api/bookmarks/${bookmarkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks', userId] });
      telegram.hapticFeedback('success');
    },
  });

  const handleTuneToBookmark = (bookmark: Bookmark) => {
    onFrequencySelect(bookmark.frequency, bookmark.modulation);
    telegram.hapticFeedback('selection');
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    telegram.showConfirm('Delete this bookmark?', (confirmed) => {
      if (confirmed) {
        deleteBookmarkMutation.mutate(bookmarkId);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="px-4 py-4">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-3 border border-border animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Bookmarks</h3>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-accent hover:text-accent/80"
          data-testid="add-bookmark"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      
      {bookmarks.length === 0 ? (
        <div className="bg-card rounded-lg p-6 border border-border text-center">
          <div className="text-muted-foreground text-sm">
            No bookmarks yet. Add frequencies you want to save for quick access.
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bookmark) => (
            <div 
              key={bookmark.id}
              className="bg-card rounded-lg p-3 border border-border flex items-center justify-between"
              data-testid={`bookmark-${bookmark.id}`}
            >
              <div>
                <div className="text-sm font-mono text-foreground">
                  {bookmark.frequency.toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {bookmark.name}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="p-1 hover:bg-secondary rounded transition-colors" 
                  onClick={() => handleTuneToBookmark(bookmark)}
                  data-testid={`tune-bookmark-${bookmark.id}`}
                >
                  <Play className="w-4 h-4 text-accent" />
                </button>
                <button 
                  className="p-1 hover:bg-secondary rounded transition-colors" 
                  onClick={() => handleDeleteBookmark(bookmark.id)}
                  data-testid={`delete-bookmark-${bookmark.id}`}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
