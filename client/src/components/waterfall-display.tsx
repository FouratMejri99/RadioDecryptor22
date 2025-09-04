import { useSignalData } from "@/hooks/use-signal-data";
import { useState } from "react";
import { Pause, Play } from "lucide-react";

export function WaterfallDisplay() {
  const { waterfallRows } = useSignalData();
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="px-4 pb-4">
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Spectrum Waterfall</h3>
          <button 
            className="text-xs text-accent hover:text-accent/80 flex items-center gap-1" 
            onClick={() => setIsPaused(!isPaused)}
            data-testid="toggle-waterfall"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
        
        <div className="h-24 overflow-hidden bg-background/50 rounded border border-border p-1" data-testid="waterfall-display">
          {!isPaused && waterfallRows.map((row) => (
            <div 
              key={row.id} 
              className="waterfall-row"
              data-testid={`waterfall-row-${row.id}`}
            />
          ))}
          {isPaused && (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Paused
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
