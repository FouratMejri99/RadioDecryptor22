import { useState, useCallback } from "react";
import { useWebSocket } from "./use-websocket";
import { type SignalData, type WaterfallRow } from "@shared/schema";

export function useSignalData() {
  const [currentSignal, setCurrentSignal] = useState<SignalData | null>(null);
  const [signalHistory, setSignalHistory] = useState<SignalData[]>([]);
  const [waterfallRows, setWaterfallRows] = useState<WaterfallRow[]>([]);
  const [signalBars, setSignalBars] = useState<number[]>(Array(15).fill(0));

  const handleMessage = useCallback((data: any) => {
    if (data.type === 'signal_update') {
      const { signal, waterfall } = data;
      
      // Update current signal
      setCurrentSignal(signal);
      
      // Add to signal history (keep last 100 entries)
      setSignalHistory(prev => {
        const newHistory = [...prev, signal];
        return newHistory.slice(-100);
      });
      
      // Update waterfall display (keep last 12 rows)
      setWaterfallRows(prev => {
        const newRows = [waterfall, ...prev];
        return newRows.slice(0, 12);
      });
      
      // Generate signal bars from waterfall data
      if (waterfall.data && waterfall.data.length >= 15) {
        const bars = waterfall.data.slice(0, 15).map((strength: number) => {
          // Convert dBm to percentage (assume -100 to -40 dBm range)
          return Math.max(0, Math.min(100, ((strength + 100) / 60) * 100));
        });
        setSignalBars(bars);
      }
    }
  }, []);

  const { isConnected, connectionAttempts } = useWebSocket({
    onMessage: handleMessage,
  });

  const getSignalStrength = () => {
    return currentSignal ? Math.round(currentSignal.strength) : -100;
  };

  const getSignalPercentage = () => {
    if (!currentSignal) return 0;
    // Convert dBm to percentage (-100 to -40 dBm range)
    return Math.max(0, Math.min(100, ((currentSignal.strength + 100) / 60) * 100));
  };

  return {
    currentSignal,
    signalHistory,
    waterfallRows,
    signalBars,
    isConnected,
    connectionAttempts,
    getSignalStrength,
    getSignalPercentage,
  };
}
