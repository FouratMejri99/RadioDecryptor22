import { FrequencyHeader } from "@/components/frequency-header";
import { ScannerStatus } from "@/components/scanner-status";
import { SignalDisplay } from "@/components/signal-display";
import { WaterfallDisplay } from "@/components/waterfall-display";
import { FrequencyPresets } from "@/components/frequency-presets";
import { ManualTuning } from "@/components/manual-tuning";
import { AudioControls } from "@/components/audio-controls";
import { BookmarksSection } from "@/components/bookmarks-section";
import { DecryptionControls } from "@/components/decryption-controls";
import { LiveBroadcasting } from "@/components/live-broadcasting";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSignalData } from "@/hooks/use-signal-data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { telegram } from "@/lib/telegram";
import { useEffect, useState } from "react";
import { type ScannerSettings, type InsertScannerSettings } from "@shared/schema";

export default function Home() {
  const { currentSignal, isConnected, getSignalStrength } = useSignalData();
  const [currentPage, setCurrentPage] = useState<'home' | 'presets' | 'bookmarks' | 'settings'>('home');
  const queryClient = useQueryClient();
  const userId = telegram.getUserId();

  // Fetch scanner settings
  const { data: settings } = useQuery<ScannerSettings>({
    queryKey: ['/api/scanner-settings', userId],
  });

  // Update scanner settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<InsertScannerSettings>) => {
      const response = await apiRequest('PATCH', `/api/scanner-settings/${userId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scanner-settings', userId] });
    },
  });

  // Initialize Telegram Web App
  useEffect(() => {
    if (telegram.isAvailable()) {
      telegram.expand();
    }
  }, []);

  const handleFrequencyChange = (frequency: number, modulation: string = 'FM') => {
    updateSettingsMutation.mutate({
      currentFrequency: frequency,
      currentModulation: modulation,
    });
    telegram.hapticFeedback('selection');
  };

  const handleSettingsChange = (updates: Partial<InsertScannerSettings>) => {
    updateSettingsMutation.mutate(updates);
  };

  const currentFrequency = settings?.currentFrequency || 146.52;
  const currentModulation = settings?.currentModulation || 'FM';
  const isScanning = settings?.isScanning || false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Current Frequency */}
      <FrequencyHeader 
        frequency={currentFrequency}
        isConnected={isConnected}
        isMuted={settings?.isMuted || false}
        onToggleAudio={() => handleSettingsChange({ isMuted: !settings?.isMuted })}
        onShowSettings={() => setCurrentPage('settings')}
      />

      {/* Scanner Status */}
      <ScannerStatus 
        isScanning={isScanning}
        modulation={currentModulation}
        signalStrength={getSignalStrength()}
      />

      {/* Main Content */}
      <div className="pb-20"> {/* Add bottom padding for fixed navigation */}
        {currentPage === 'home' && (
          <>
            {/* Signal Strength Visualization */}
            <SignalDisplay />

            {/* Waterfall Display */}
            <WaterfallDisplay />

            {/* Manual Tuning */}
            <ManualTuning 
              currentFrequency={currentFrequency}
              currentModulation={currentModulation}
              onFrequencyChange={handleFrequencyChange}
            />

            {/* Scanner Controls */}
            <div className="px-4 pb-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Scanner Control</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={isScanning ? "default" : "secondary"}>
                      {isScanning ? "SCANNING" : "STANDBY"}
                    </Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSettingsChange({ isScanning: !isScanning })}
                  className={`w-full ${isScanning ? 'bg-destructive hover:bg-destructive/90' : 'bg-accent hover:bg-accent/90'}`}
                  data-testid="toggle-scanning"
                >
                  {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                </Button>
              </div>
            </div>

            {/* Audio Controls */}
            <AudioControls 
              volume={settings?.volume || 75}
              squelch={settings?.squelch || 40}
              isMuted={settings?.isMuted || false}
              onVolumeChange={(volume) => handleSettingsChange({ volume })}
              onSquelchChange={(squelch) => handleSettingsChange({ squelch })}
              onToggleMute={() => handleSettingsChange({ isMuted: !settings?.isMuted })}
            />

            {/* Decryption Controls */}
            <DecryptionControls 
              isEncrypted={currentSignal?.isEncrypted || false}
              encryptionType={currentSignal?.encryptionType}
              isDecrypted={currentSignal?.isDecrypted || false}
              decryptionEnabled={settings?.decryptionEnabled || true}
              onToggleDecryption={() => handleSettingsChange({ decryptionEnabled: !settings?.decryptionEnabled })}
              onManualDecrypt={() => {
                telegram.hapticFeedback('success');
                // Decryption handled by simulation
              }}
            />

            {/* Live Broadcasting Controls */}
            <LiveBroadcasting 
              isBroadcasting={settings?.isBroadcasting || false}
              broadcastTitle={settings?.broadcastTitle || "Live Scanner Feed"}
              onToggleBroadcast={() => handleSettingsChange({ isBroadcasting: !settings?.isBroadcasting })}
              onUpdateTitle={(title) => handleSettingsChange({ broadcastTitle: title })}
            />

          </>
        )}

        {currentPage === 'presets' && (
          <FrequencyPresets onFrequencySelect={handleFrequencyChange} />
        )}

        {currentPage === 'bookmarks' && (
          <BookmarksSection 
            userId={userId}
            onFrequencySelect={handleFrequencyChange}
          />
        )}

        {currentPage === 'settings' && (
          <div className="px-4 py-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Scan</span>
                  <button 
                    onClick={() => handleSettingsChange({ isScanning: !isScanning })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isScanning ? 'bg-accent' : 'bg-secondary'
                    }`}
                    data-testid="toggle-scanning"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isScanning ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isScanning={isScanning}
        onToggleScan={() => handleSettingsChange({ isScanning: !isScanning })}
      />
    </div>
  );
}
