import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Unlock, Lock, Zap, Shield, Radio, AlertTriangle, Play, Square } from "lucide-react";

interface DecryptionPanelProps {
  currentSignal: any;
  settings: any;
  onSettingsChange: (updates: any) => void;
  onManualDecrypt: () => void;
}

export function DecryptionPanel({
  currentSignal,
  settings,
  onSettingsChange,
  onManualDecrypt,
}: DecryptionPanelProps) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionProgress, setDecryptionProgress] = useState(0);

  const encryptionIcons = {
    'AES': Shield,
    'P25': Radio,
    'DMR': Zap,
    'TETRA': AlertTriangle,
    'DES': Lock,
  };

  const encryptionColors = {
    'AES': 'text-destructive',
    'P25': 'text-yellow-500',
    'DMR': 'text-blue-500',
    'TETRA': 'text-purple-500',
    'DES': 'text-orange-500',
  };

  const handleDecrypt = async () => {
    if (!currentSignal?.isEncrypted || isDecrypting) return;
    
    setIsDecrypting(true);
    setDecryptionProgress(0);
    
    // Simulate decryption process
    const interval = setInterval(() => {
      setDecryptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDecrypting(false);
          onManualDecrypt();
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 150);
  };

  const isEncrypted = currentSignal?.isEncrypted || false;
  const encryptionType = currentSignal?.encryptionType;
  const isDecrypted = currentSignal?.isDecrypted || false;
  const decryptionEnabled = settings?.decryptionEnabled || false;

  const IconComponent = isEncrypted 
    ? (encryptionIcons[encryptionType as keyof typeof encryptionIcons] || Lock)
    : Unlock;
  const colorClass = isEncrypted 
    ? (encryptionColors[encryptionType as keyof typeof encryptionColors] || 'text-muted-foreground')
    : 'text-accent';

  return (
    <div className="px-4 pb-4">
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-4 h-4 ${colorClass}`} />
            <h3 className="text-sm font-medium">Signal Decryption</h3>
          </div>
          <Badge variant={!isEncrypted ? "secondary" : isDecrypted ? "default" : "destructive"}>
            {!isEncrypted ? 'CLEAR' : isDecrypted ? 'DECRYPTED' : 'ENCRYPTED'}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Signal Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Frequency:</span>
              <div className="font-mono">{currentSignal?.frequency?.toFixed(3) || '---'} MHz</div>
            </div>
            <div>
              <span className="text-muted-foreground">Encryption:</span>
              <div className={`font-mono ${colorClass}`}>
                {isEncrypted ? (encryptionType || 'Unknown') : 'None'}
              </div>
            </div>
          </div>

          {/* Decryption Progress */}
          {isEncrypted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Decryption Progress</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(isDecrypting ? decryptionProgress : (isDecrypted ? 100 : 0))}%
                </span>
              </div>
              <Progress 
                value={isDecrypting ? decryptionProgress : (isDecrypted ? 100 : 0)} 
                className="h-2" 
              />
            </div>
          )}

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto Decryption</span>
              <Switch 
                checked={decryptionEnabled}
                onCheckedChange={(checked) => onSettingsChange({ decryptionEnabled: checked })}
                data-testid="auto-decrypt-toggle"
              />
            </div>

            {isEncrypted && (
              <Button 
                onClick={handleDecrypt}
                disabled={isDecrypting || isDecrypted || !decryptionEnabled}
                className="w-full"
                data-testid="manual-decrypt-button"
              >
                {isDecrypting ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Decrypting... {Math.round(decryptionProgress)}%
                  </>
                ) : isDecrypted ? (
                  'Signal Decrypted'
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Decryption
                  </>
                )}
              </Button>
            )}
            
            {!isEncrypted && (
              <Button 
                disabled
                className="w-full"
                variant="secondary"
                data-testid="no-encryption-button"
              >
                No Encryption Detected
              </Button>
            )}
          </div>

          {/* Status */}
          <div className="text-xs text-muted-foreground p-2 bg-secondary/50 rounded">
            {!isEncrypted ? (
              <span className="text-accent">✓ Clear signal - no decryption needed</span>
            ) : isDecrypted ? (
              <span className="text-accent">✓ Signal successfully decrypted</span>
            ) : decryptionEnabled ? (
              <span>Decryption engine active - ready to decrypt</span>
            ) : (
              <span>Enable auto decryption to automatically decrypt signals</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}