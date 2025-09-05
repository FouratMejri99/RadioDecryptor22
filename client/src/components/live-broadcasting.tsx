import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Radio, Users, Settings, Play, Square } from "lucide-react";

interface LiveBroadcastingProps {
  isBroadcasting: boolean;
  broadcastTitle: string;
  onToggleBroadcast: () => void;
  onUpdateTitle: (title: string) => void;
}

export function LiveBroadcasting({
  isBroadcasting,
  broadcastTitle,
  onToggleBroadcast,
  onUpdateTitle,
}: LiveBroadcastingProps) {
  const [title, setTitle] = useState(broadcastTitle);
  const [quality, setQuality] = useState("high");
  const [isPublic, setIsPublic] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Simulated listener count
  const listenerCount = isBroadcasting ? Math.floor(Math.random() * 50) + 10 : 0;

  const handleStartBroadcast = () => {
    if (title !== broadcastTitle) {
      onUpdateTitle(title);
    }
    onToggleBroadcast();
  };
  
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isBroadcasting) {
      onUpdateTitle(newTitle);
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-medium">Live Broadcasting</h3>
          </div>
          <Badge variant={isBroadcasting ? "default" : "secondary"}>
            {isBroadcasting ? "LIVE" : "OFFLINE"}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Broadcast Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Broadcast Title</label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter broadcast title..."
              data-testid="broadcast-title-input"
            />
          </div>

          {/* Stream Quality */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Audio Quality</label>
            <Select value={quality} onValueChange={setQuality} disabled={isBroadcasting}>
              <SelectTrigger data-testid="quality-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (64 kbps)</SelectItem>
                <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                <SelectItem value="high">High (256 kbps)</SelectItem>
                <SelectItem value="ultra">Ultra (320 kbps)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Public Stream</span>
              <p className="text-xs text-muted-foreground">Allow others to discover and listen</p>
            </div>
            <Switch 
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isBroadcasting}
              data-testid="public-toggle"
            />
          </div>

          {/* Advanced Settings Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Advanced Settings</span>
            <Switch 
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
              data-testid="advanced-toggle"
            />
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-3 p-3 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-Record</span>
                <Switch data-testid="auto-record-toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Noise Gate</span>
                <Switch defaultChecked data-testid="noise-gate-toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AGC (Auto Gain)</span>
                <Switch defaultChecked data-testid="agc-toggle" />
              </div>
            </div>
          )}

          {/* Broadcast Control */}
          <Button 
            onClick={handleStartBroadcast}
            className={`w-full ${isBroadcasting ? 'bg-destructive hover:bg-destructive/90' : 'bg-accent hover:bg-accent/90'}`}
            data-testid="broadcast-toggle"
          >
            {isBroadcasting ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Broadcasting
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Broadcasting
              </>
            )}
          </Button>

          {/* Live Stats */}
          {isBroadcasting && (
            <div className="space-y-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center justify-between">
                <span className="text-sm">Live Listeners</span>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="text-sm font-mono">{listenerCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Stream Quality</span>
                <span className="text-sm font-mono">{quality.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-mono text-accent">
                  {Math.floor(Math.random() * 60)}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          {/* Broadcasting Status */}
          <div className="text-xs text-muted-foreground">
            {isBroadcasting ? (
              <span className="text-accent">🔴 Broadcasting live to {listenerCount} listeners</span>
            ) : (
              <span>Ready to broadcast scanner audio</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}