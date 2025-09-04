import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManualTuningProps {
  currentFrequency: number;
  currentModulation: string;
  onFrequencyChange: (frequency: number, modulation: string) => void;
}

export function ManualTuning({ currentFrequency, currentModulation, onFrequencyChange }: ManualTuningProps) {
  const [frequency, setFrequency] = useState(currentFrequency.toString());
  const [modulation, setModulation] = useState(currentModulation);

  const handleTune = () => {
    const freq = parseFloat(frequency);
    if (freq && freq > 0.1 && freq < 1000) {
      onFrequencyChange(freq, modulation);
    }
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
        </div>
      </div>
    </div>
  );
}
