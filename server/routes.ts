import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertBookmarkSchema, insertScannerSettingsSchema, type SignalData, type WaterfallRow } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time signal data
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  // Enhanced signal simulation with proper frequency tracking
  let currentSignalState = {
    frequency: 146.52,
    isEncrypted: false,
    encryptionType: undefined as string | undefined,
    isDecrypted: false,
    signalStrength: -60,
    lastUpdate: Date.now()
  };
  
  // Track user's current tuned frequency from scanner settings
  let userTunedFrequency = 146.52;
  
  // Simulate real-time signal data based on user's tuned frequency
  function generateSignalData(): SignalData {
    const encryptionTypes = ['AES', 'P25', 'DMR', 'TETRA', 'DES'];
    
    // Use the user's tuned frequency as base, with small drift
    const currentFreq = userTunedFrequency + (Math.random() - 0.5) * 0.002; // Very small drift
    
    // Update signal characteristics if frequency changed significantly
    if (Math.abs(currentFreq - currentSignalState.frequency) > 0.001 || 
        Date.now() - currentSignalState.lastUpdate > 5000) {
      
      currentSignalState.frequency = currentFreq;
      currentSignalState.lastUpdate = Date.now();
      
      // Determine encryption based on frequency bands
      const isGovFreq = (currentFreq >= 450 && currentFreq <= 470) || // UHF Government
                        (currentFreq >= 764 && currentFreq <= 869) || // 700/800 MHz Public Safety
                        (currentFreq >= 896 && currentFreq <= 960);   // Military/Government
      
      const isEmergencyFreq = (currentFreq >= 453 && currentFreq <= 458) || // Emergency Services
                              (currentFreq >= 851 && currentFreq <= 869);   // Public Safety
      
      // Higher chance of encryption for government/emergency frequencies
      currentSignalState.isEncrypted = isGovFreq ? Math.random() > 0.2 : 
                                       isEmergencyFreq ? Math.random() > 0.4 : 
                                       Math.random() > 0.8;
      
      currentSignalState.encryptionType = currentSignalState.isEncrypted ? 
        encryptionTypes[Math.floor(Math.random() * encryptionTypes.length)] : undefined;
      
      // Reset decryption status when encryption changes
      currentSignalState.isDecrypted = !currentSignalState.isEncrypted;
      
      // Signal strength varies by frequency band
      const baseStrength = isGovFreq ? -50 : isEmergencyFreq ? -45 : -60;
      currentSignalState.signalStrength = baseStrength + (Math.random() - 0.5) * 20;
    }
    
    // Add some natural signal variation
    const strengthVariation = (Math.random() - 0.5) * 10;
    const currentStrength = currentSignalState.signalStrength + strengthVariation;
    
    return {
      frequency: currentFreq,
      strength: Math.max(-120, Math.min(-20, currentStrength)), // Clamp to realistic range
      timestamp: Date.now(),
      noise: -110 + Math.random() * 15, // -110 to -95 dBm noise floor
      isEncrypted: currentSignalState.isEncrypted,
      encryptionType: currentSignalState.encryptionType,
      isDecrypted: currentSignalState.isDecrypted,
      audioClarity: currentSignalState.isDecrypted ? 
        (85 + Math.random() * 15) : // Clear audio when decrypted
        (currentSignalState.isEncrypted ? 15 + Math.random() * 25 : 90 + Math.random() * 10), // Poor audio when encrypted
    };
  }
  
  // Function to update the tuned frequency from scanner settings
  function updateTunedFrequency(frequency: number) {
    userTunedFrequency = frequency;
    // Force signal update on frequency change
    currentSignalState.lastUpdate = 0;
  }
  
  function generateWaterfallRow(): WaterfallRow {
    const data: number[] = [];
    for (let i = 0; i < 100; i++) {
      data.push(-100 + Math.random() * 60); // Signal strength across frequency range
    }
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      data,
      timestamp: Date.now(),
    };
  }
  
  // Broadcast signal data to all connected clients
  function broadcastSignalData() {
    if (clients.size === 0) return;
    
    const signalData = generateSignalData();
    const waterfallData = generateWaterfallRow();
    
    const message = JSON.stringify({
      type: 'signal_update',
      signal: signalData,
      waterfall: waterfallData,
    });
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  // Start broadcasting signal data every 100ms
  setInterval(broadcastSignalData, 100);
  
  // REST API routes
  
  // Get all frequencies
  app.get("/api/frequencies", async (req, res) => {
    try {
      const frequencies = await storage.getFrequencies();
      res.json(frequencies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch frequencies" });
    }
  });
  
  // Get frequencies by category
  app.get("/api/frequencies/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const frequencies = await storage.getFrequenciesByCategory(category);
      res.json(frequencies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch frequencies by category" });
    }
  });
  
  // Get bookmarks for user
  app.get("/api/bookmarks/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const bookmarks = await storage.getBookmarksByUser(userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });
  
  // Create bookmark
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse(req.body);
      const bookmark = await storage.createBookmark(bookmarkData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bookmark" });
      }
    }
  });
  
  // Delete bookmark
  app.delete("/api/bookmarks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBookmark(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });
  
  // Get scanner settings
  app.get("/api/scanner-settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const settings = await storage.getScannerSettings(userId);
      
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await storage.updateScannerSettings(userId, {});
        res.json(defaultSettings);
      } else {
        res.json(settings);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scanner settings" });
    }
  });
  
  // Update scanner settings
  app.patch("/api/scanner-settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const settingsSchema = insertScannerSettingsSchema.partial().omit({ userId: true });
      const settingsData = settingsSchema.parse(req.body);
      
      // Update tuned frequency for signal simulation
      if (settingsData.currentFrequency) {
        updateTunedFrequency(settingsData.currentFrequency);
      }
      
      const settings = await storage.updateScannerSettings(userId, settingsData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update scanner settings" });
      }
    }
  });

  return httpServer;
}
