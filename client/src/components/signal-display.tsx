import { useSignalData } from "@/hooks/use-signal-data";

export function SignalDisplay() {
  const { signalBars } = useSignalData();

  return (
    <div className="px-4 py-4">
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Signal Strength</h3>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
        
        {/* Signal Bars */}
        <div className="flex items-end gap-1 h-20 mb-4" data-testid="signal-bars">
          {signalBars.map((height, index) => (
            <div 
              key={index}
              className="signal-bar w-3" 
              style={{ height: `${height}%` }}
              data-testid={`signal-bar-${index}`}
            />
          ))}
        </div>
        
        {/* Frequency Range */}
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>146.500</span>
          <span>146.540</span>
        </div>
      </div>
    </div>
  );
}
