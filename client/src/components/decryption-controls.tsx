import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Unlock, Lock, Zap, Shield, Radio, AlertTriangle } from "lucide-react";

interface DecryptionControlsProps {
  isEncrypted: boolean;
  encryptionType?: string;
  isDecrypted: boolean;
  decryptionEnabled: boolean;
  onToggleDecryption: () => void;
  onManualDecrypt: () => void;
}

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

export function DecryptionControls({
  isEncrypted,
  encryptionType,
  isDecrypted,
  decryptionEnabled,
  onToggleDecryption,
  onManualDecrypt,
}: DecryptionControlsProps) {
  const [decryptionProgress, setDecryptionProgress] = useState(isDecrypted ? 100 : 0);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleManualDecrypt = async () => {
    if (isDecrypting) return;
    
    setIsDecrypting(true);
    setDecryptionProgress(0);
    
    // Simulate decryption progress
    const interval = setInterval(() => {
      setDecryptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDecrypting(false);
          onManualDecrypt();
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);
  };


  const IconComponent = isEncrypted 
    ? (encryptionIcons[encryptionType as keyof typeof encryptionIcons] || Lock)
    : Unlock;
  const colorClass = isEncrypted 
    ? (encryptionColors[encryptionType as keyof typeof encryptionColors] || 'text-muted-foreground')
    : 'text-accent';

  return (
    <div className="px-4 pb-4">
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-4 h-4 ${colorClass}`} />
            <h3 className="text-sm font-medium">Decryption Control</h3>
          </div>
          <Badge variant={!isEncrypted ? "secondary" : isDecrypted ? "default" : "destructive"}>
            {!isEncrypted ? 'CLEAR SIGNAL' : isDecrypted ? 'DECRYPTED' : 'ENCRYPTED'}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Encryption Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Encryption Type</span>
            <span className={`text-sm font-mono ${colorClass}`}>
              {isEncrypted ? (encryptionType || 'Unknown') : 'None'}
            </span>
          </div>

          {/* Decryption Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Decryption Progress</span>
              <span className="text-xs text-muted-foreground">{Math.round(decryptionProgress)}%</span>
            </div>
            <Progress value={decryptionProgress} className="h-2" />
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Decryption Engine</span>
              <Switch 
                checked={decryptionEnabled}
                onCheckedChange={onToggleDecryption}
                data-testid="decryption-enabled-toggle"
              />
            </div>

            {decryptionEnabled && isEncrypted && (
              <Button 
                onClick={handleManualDecrypt}
                disabled={isDecrypting || isDecrypted}
                className="w-full"
                data-testid="manual-decrypt-button"
              >
                {isDecrypting ? 'Decrypting...' : isDecrypted ? 'Signal Decrypted' : 'Start Decryption'}
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
          <div className="text-xs text-muted-foreground">
            {!isEncrypted ? (
              <span className="text-accent">✓ Clear audio signal - no decryption needed</span>
            ) : isDecrypted ? (
              <span className="text-accent">✓ Audio signal successfully decrypted</span>
            ) : decryptionEnabled ? (
              <span>Decryption engine ready</span>
            ) : (
              <span>Decryption engine disabled</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}