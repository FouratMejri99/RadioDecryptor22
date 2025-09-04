import { useQuery } from "@tanstack/react-query";
import { type Frequency } from "@shared/schema";
import { Plane, Radio, AlertTriangle, Ship, Clock, Shield, Eye, Zap } from "lucide-react";

interface FrequencyPresetsProps {
  onFrequencySelect: (frequency: number, modulation: string) => void;
}

const categoryIcons = {
  aviation: Plane,
  amateur: Radio,
  emergency: AlertTriangle,
  marine: Ship,
  business: Clock,
  public_safety: Shield,
  government: Eye,
  military: Zap,
};

const categoryColors = {
  aviation: 'text-accent',
  amateur: 'text-chart-4',
  emergency: 'text-destructive',
  marine: 'text-primary',
  business: 'text-chart-3',
  public_safety: 'text-chart-5',
  government: 'text-red-500',
  military: 'text-orange-500',
};

export function FrequencyPresets({ onFrequencySelect }: FrequencyPresetsProps) {
  const { data: frequencies = [], isLoading } = useQuery<Frequency[]>({
    queryKey: ['/api/frequencies'],
  });

  const handlePresetClick = (frequency: Frequency) => {
    onFrequencySelect(frequency.frequency, frequency.modulation);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-3 border border-border animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-5 bg-muted rounded mb-1"></div>
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
        <h3 className="text-sm font-medium">Frequency Presets</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {frequencies.map((preset) => {
          const IconComponent = categoryIcons[preset.category as keyof typeof categoryIcons] || Radio;
          const colorClass = categoryColors[preset.category as keyof typeof categoryColors] || 'text-muted-foreground';
          
          return (
            <div 
              key={preset.id}
              className="bg-card rounded-lg p-3 border border-border hover:border-accent transition-colors cursor-pointer" 
              onClick={() => handlePresetClick(preset)}
              data-testid={`preset-${preset.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium uppercase ${colorClass}`}>
                  {preset.category}
                </span>
                <IconComponent className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-mono text-foreground">
                  {preset.frequency.toFixed(3)}
                </div>
                {preset.isEncrypted && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span className="text-xs text-destructive font-medium">ENC</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {preset.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
