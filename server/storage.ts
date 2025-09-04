import { type Frequency, type InsertFrequency, type Bookmark, type InsertBookmark, type ScannerSettings, type InsertScannerSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Frequencies
  getFrequencies(): Promise<Frequency[]>;
  getFrequenciesByCategory(category: string): Promise<Frequency[]>;
  createFrequency(frequency: InsertFrequency): Promise<Frequency>;
  
  // Bookmarks
  getBookmarksByUser(userId: string): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: string): Promise<void>;
  
  // Scanner Settings
  getScannerSettings(userId: string): Promise<ScannerSettings | undefined>;
  updateScannerSettings(userId: string, settings: Partial<InsertScannerSettings>): Promise<ScannerSettings>;
}

export class MemStorage implements IStorage {
  private frequencies: Map<string, Frequency>;
  private bookmarks: Map<string, Bookmark>;
  private scannerSettings: Map<string, ScannerSettings>;

  constructor() {
    this.frequencies = new Map();
    this.bookmarks = new Map();
    this.scannerSettings = new Map();
    this.initializeDefaultFrequencies();
  }

  private initializeDefaultFrequencies() {
    const defaultFrequencies: InsertFrequency[] = [
      {
        frequency: 121.5,
        name: "Aviation Emergency",
        description: "International aviation emergency frequency",
        category: "aviation",
        modulation: "AM",
        isActive: true,
        isEncrypted: false,
        isDecrypted: true,
        signalStrength: -65,
      },
      {
        frequency: 146.52,
        name: "2M Calling Frequency",
        description: "Amateur radio 2-meter calling frequency",
        category: "amateur",
        modulation: "FM",
        isActive: true,
        isEncrypted: false,
        isDecrypted: true,
        signalStrength: -55,
      },
      {
        frequency: 154.265,
        name: "Fire Department",
        description: "Local fire department dispatch (ENCRYPTED)",
        category: "emergency",
        modulation: "FM",
        isActive: true,
        isEncrypted: true,
        encryptionType: "P25",
        isDecrypted: true,
        signalStrength: -72,
      },
      {
        frequency: 156.8,
        name: "Marine Channel 16",
        description: "International marine distress and calling",
        category: "marine",
        modulation: "FM",
        isActive: true,
        isEncrypted: false,
        isDecrypted: true,
        signalStrength: -68,
      },
      {
        frequency: 462.5625,
        name: "GMRS Channel 1",
        description: "General Mobile Radio Service",
        category: "amateur",
        modulation: "FM",
        isActive: true,
        isEncrypted: false,
        isDecrypted: true,
        signalStrength: -61,
      },
      {
        frequency: 155.16,
        name: "Police Dispatch",
        description: "Local police department (AES ENCRYPTED)",
        category: "emergency",
        modulation: "FM",
        isActive: true,
        isEncrypted: true,
        encryptionType: "AES",
        isDecrypted: true,
        signalStrength: -78,
      },
      {
        frequency: 453.725,
        name: "FBI Surveillance",
        description: "Federal surveillance frequency (DMR ENCRYPTED)",
        category: "government",
        modulation: "DMR",
        isActive: true,
        isEncrypted: true,
        encryptionType: "DMR",
        isDecrypted: true,
        signalStrength: -82,
      },
      {
        frequency: 866.0125,
        name: "Military Tactical",
        description: "Military tactical communications (TETRA)",
        category: "military",
        modulation: "TETRA",
        isActive: true,
        isEncrypted: true,
        encryptionType: "TETRA",
        isDecrypted: true,
        signalStrength: -85,
      },
    ];

    defaultFrequencies.forEach(freq => {
      this.createFrequency(freq);
    });
  }

  async getFrequencies(): Promise<Frequency[]> {
    return Array.from(this.frequencies.values());
  }

  async getFrequenciesByCategory(category: string): Promise<Frequency[]> {
    return Array.from(this.frequencies.values()).filter(freq => freq.category === category);
  }

  async createFrequency(insertFrequency: InsertFrequency): Promise<Frequency> {
    const id = randomUUID();
    const frequency: Frequency = {
      ...insertFrequency,
      id,
      createdAt: new Date(),
    };
    this.frequencies.set(id, frequency);
    return frequency;
  }

  async getBookmarksByUser(userId: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(bookmark => bookmark.userId === userId);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = randomUUID();
    const bookmark: Bookmark = {
      ...insertBookmark,
      id,
      createdAt: new Date(),
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(id: string): Promise<void> {
    this.bookmarks.delete(id);
  }

  async getScannerSettings(userId: string): Promise<ScannerSettings | undefined> {
    return Array.from(this.scannerSettings.values()).find(settings => settings.userId === userId);
  }

  async updateScannerSettings(userId: string, settings: Partial<InsertScannerSettings>): Promise<ScannerSettings> {
    const existing = await this.getScannerSettings(userId);
    
    if (existing) {
      const updated: ScannerSettings = {
        ...existing,
        ...settings,
        updatedAt: new Date(),
      };
      this.scannerSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newSettings: ScannerSettings = {
        id,
        userId,
        volume: 75,
        squelch: 40,
        currentFrequency: 146.52,
        currentModulation: "FM",
        isScanning: false,
        isMuted: false,
        ...settings,
        updatedAt: new Date(),
      };
      this.scannerSettings.set(id, newSettings);
      return newSettings;
    }
  }
}

export const storage = new MemStorage();
