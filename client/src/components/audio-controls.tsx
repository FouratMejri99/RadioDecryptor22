import { VolumeX, Volume1, Volume2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface AudioControlsProps {
  volume: number;
  squelch: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onSquelchChange: (squelch: number) => void;
  onToggleMute: () => void;
}

export function AudioControls({ 
  volume, 
  squelch, 
  isMuted, 
  onVolumeChange, 
  onSquelchChange, 
  onToggleMute 
}: AudioControlsProps) {
  const [isRecording, setIsRecording] = useState(false);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="px-4 pb-4">
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="text-sm font-medium mb-3">Audio Controls</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Volume</span>
            <div className="flex items-center gap-3 flex-1 max-w-32 ml-4">
              <VolumeX className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={(value) => onVolumeChange(value[0])}
                max={100}
                step={1}
                className="flex-1"
                data-testid="volume-slider"
              />
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Squelch</span>
            <div className="flex items-center gap-3 flex-1 max-w-32 ml-4">
              <span className="text-xs text-muted-foreground">Low</span>
              <Slider
                value={[squelch]}
                onValueChange={(value) => onSquelchChange(value[0])}
                max={100}
                step={1}
                className="flex-1"
                data-testid="squelch-slider"
              />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={isRecording ? "destructive" : "secondary"}
              className="flex-1"
              onClick={() => setIsRecording(!isRecording)}
              data-testid="record-button"
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? 'Stop' : 'Record'}
            </Button>
            <Button 
              variant="secondary"
              className="flex-1"
              onClick={onToggleMute}
              data-testid="mute-button"
            >
              <VolumeIcon className="w-4 h-4 mr-2" />
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
