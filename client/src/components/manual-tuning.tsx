import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Radio, Mic, ChevronDown, ChevronUp } from "lucide-react";
import type { Frequency } from "@shared/schema";

interface ManualTuningProps {
  currentFrequency: number;
  currentModulation: string;
  onFrequencyChange: (frequency: number, modulation: string) => void;
  onRecordFrequency?: (frequency: Frequency) => void;
  onBroadcastFrequency?: (frequency: Frequency) => void;
}

export function ManualTuning({ 
  currentFrequency, 
  currentModulation, 
  onFrequencyChange,
  onRecordFrequency,
  onBroadcastFrequency 
}: ManualTuningProps) {
  const [frequency, setFrequency] = useState(currentFrequency.toString());
  const [modulation, setModulation] = useState(currentModulation);
  const [showFrequencyList, setShowFrequencyList] = useState(false);
  
  // Fetch available frequencies
  const { data: frequencies = [] } = useQuery<Frequency[]>({
    queryKey: ['/api/frequencies'],
  });

  const handleTune = () => {
    const freq = parseFloat(frequency);
    if (freq && freq > 0.1 && freq < 1000) {
      onFrequencyChange(freq, modulation);
      setShowFrequencyList(true); // Show frequency list after tuning
    }
  };
  
  const handleFrequencySelect = (freq: Frequency) => {
    onFrequencyChange(freq.frequency, freq.modulation);
    setFrequency(freq.frequency.toString());
    setModulation(freq.modulation);
    setShowFrequencyList(false);
  };
  
  const handleRecord = (freq: Frequency, e: React.MouseEvent) => {
    e.stopPropagation();
    onRecordFrequency?.(freq);
  };
  
  const handleBroadcast = (freq: Frequency, e: React.MouseEvent) => {
    e.stopPropagation();
    onBroadcastFrequency?.(freq);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTune();
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="text-sm font-medium mb-3">Manual Tuning</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Frequency (MHz)</label>
            <div className="flex gap-2">
              <Input
                type="number" 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                onKeyPress={handleKeyPress}
                step="0.001" 
                min="0.1" 
                max="1000"
                className="flex-1 font-mono"
                data-testid="frequency-input"
              />
              <Button 
                onClick={handleTune}
                className="px-4"
                data-testid="tune-button"
              >
                Tune
              </Button>
              <Button 
                onClick={() => setShowFrequencyList(!showFrequencyList)}
                variant="outline"
                size="sm"
                data-testid="frequency-list-toggle"
              >
                {showFrequencyList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Modulation</label>
            <Select value={modulation} onValueChange={setModulation}>
              <SelectTrigger data-testid="modulation-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="FM">FM</SelectItem>
                <SelectItem value="USB">USB</SelectItem>
                <SelectItem value="LSB">LSB</SelectItem>
                <SelectItem value="CW">CW</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Available Frequencies Dropdown */}
          {showFrequencyList && (
            <div className="mt-3">
              <label className="text-xs text-muted-foreground block mb-2">Available Frequencies</label>
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                {frequencies.map((freq) => (
                  <div 
                    key={freq.id}
                    className="flex items-center justify-between p-2 bg-secondary rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleFrequencySelect(freq)}
                    data-testid={`freq-item-${freq.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{freq.frequency.toFixed(3)} MHz</span>
                        <Badge variant="outline" className="text-xs">{freq.modulation}</Badge>
                        {freq.isEncrypted && (
                          <Badge variant="destructive" className="text-xs">ENC</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{freq.name}</div>
                      <div className="text-xs text-muted-foreground">{freq.category}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleRecord(freq, e)}
                        data-testid={`record-${freq.id}`}
                        className="h-8 w-8 p-0"
                      >
                        <Mic className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleBroadcast(freq, e)}
                        data-testid={`broadcast-${freq.id}`}
                        className="h-8 w-8 p-0"
                      >
                        <Radio className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
