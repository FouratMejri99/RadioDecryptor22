interface ScannerStatusProps {
  isScanning: boolean;
  modulation: string;
  signalStrength: number;
}

export function ScannerStatus({ isScanning, modulation, signalStrength }: ScannerStatusProps) {
  return (
    <div className="px-4 py-3 bg-secondary border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded border border-accent ${isScanning ? 'scanning-indicator' : ''}`}></div>
          <span className="text-sm text-accent font-medium" data-testid="scan-status">
            {isScanning ? 'SCANNING' : 'MANUAL'}
          </span>
          <span className="text-xs text-muted-foreground">Mode: {modulation}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span data-testid="signal-strength">{signalStrength}</span> dBm
        </div>
      </div>
    </div>
  );
}
