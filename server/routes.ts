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
  
  // Stable encryption state based on frequency
  let currentEncryptionState = {
    isEncrypted: false,
    encryptionType: undefined as string | undefined,
    lastFrequencyCheck: 146.52
  };
  
  // Simulate real-time signal data
  function generateSignalData(): SignalData {
    const currentFreq = 146.52 + (Math.random() - 0.5) * 0.04;
    const encryptionTypes = ['AES', 'P25', 'DMR', 'TETRA', 'DES'];
    
    // Only update encryption status if frequency changed significantly (more than 0.01 MHz)
    if (Math.abs(currentFreq - currentEncryptionState.lastFrequencyCheck) > 0.01) {
      currentEncryptionState.lastFrequencyCheck = currentFreq;
      // Government/military frequencies are more likely to be encrypted
      const isGovFreq = currentFreq > 400 || (currentFreq > 800 && currentFreq < 900);
      currentEncryptionState.isEncrypted = isGovFreq ? Math.random() > 0.3 : Math.random() > 0.8;
      currentEncryptionState.encryptionType = currentEncryptionState.isEncrypted ? 
        encryptionTypes[Math.floor(Math.random() * encryptionTypes.length)] : undefined;
    }
    
    return {
      frequency: currentFreq,
      strength: -100 + Math.random() * 60, // -100 to -40 dBm
      timestamp: Date.now(),
      noise: -110 + Math.random() * 20, // -110 to -90 dBm noise floor
      isEncrypted: currentEncryptionState.isEncrypted,
      encryptionType: currentEncryptionState.encryptionType,
      isDecrypted: currentEncryptionState.isEncrypted ? Math.random() > 0.3 : true, // 70% success rate for decryption
      audioClarity: currentEncryptionState.isEncrypted ? (Math.random() > 0.3 ? 85 + Math.random() * 15 : 20 + Math.random() * 30) : 90 + Math.random() * 10,
    };
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
