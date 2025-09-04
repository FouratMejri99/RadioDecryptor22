import { Volume2, VolumeX, Settings } from "lucide-react";

interface FrequencyHeaderProps {
  frequency: number;
  isConnected: boolean;
  isMuted: boolean;
  onToggleAudio: () => void;
  onShowSettings: () => void;
}

export function FrequencyHeader({ 
  frequency, 
  isConnected, 
  isMuted, 
  onToggleAudio, 
  onShowSettings 
}: FrequencyHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-accent pulse-animation' : 'bg-muted'}`}></div>
            <div>
              <div className="text-xs text-muted-foreground">Current</div>
              <div className="text-lg font-semibold frequency-display" data-testid="current-frequency">
                {frequency.toFixed(3)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 hover:bg-secondary rounded-lg transition-colors" 
              onClick={onToggleAudio}
              data-testid="toggle-audio"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-accent" />
              )}
            </button>
            <button 
              className="p-2 hover:bg-secondary rounded-lg transition-colors" 
              onClick={onShowSettings}
              data-testid="show-settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
