import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const frequencies = pgTable("frequencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frequency: real("frequency").notNull(), // in MHz
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // aviation, amateur, emergency, marine, etc.
  modulation: text("modulation").notNull().default("FM"), // AM, FM, USB, LSB, CW
  isActive: boolean("is_active").notNull().default(true),
  isEncrypted: boolean("is_encrypted").notNull().default(false),
  encryptionType: text("encryption_type"), // AES, DES, P25, DMR, TETRA, etc.
  isDecrypted: boolean("is_decrypted").notNull().default(false),
  signalStrength: real("signal_strength").default(-80),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  frequency: real("frequency").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  modulation: text("modulation").notNull().default("FM"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const scannerSettings = pgTable("scanner_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  volume: integer("volume").notNull().default(75),
  squelch: integer("squelch").notNull().default(40),
  currentFrequency: real("current_frequency").notNull().default(146.520),
  currentModulation: text("current_modulation").notNull().default("FM"),
  isScanning: boolean("is_scanning").notNull().default(false),
  isMuted: boolean("is_muted").notNull().default(false),
  decryptionEnabled: boolean("decryption_enabled").notNull().default(true),
  isBroadcasting: boolean("is_broadcasting").notNull().default(false),
  broadcastTitle: text("broadcast_title").default("Live Scanner Feed"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertFrequencySchema = createInsertSchema(frequencies).omit({
  id: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertScannerSettingsSchema = createInsertSchema(scannerSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertFrequency = z.infer<typeof insertFrequencySchema>;
export type Frequency = typeof frequencies.$inferSelect;

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

export type InsertScannerSettings = z.infer<typeof insertScannerSettingsSchema>;
export type ScannerSettings = typeof scannerSettings.$inferSelect;

// Signal data types for real-time updates
export interface SignalData {
  frequency: number;
  strength: number; // in dBm
  timestamp: number;
  noise: number;
  isEncrypted: boolean;
  encryptionType?: string;
  isDecrypted: boolean;
  audioClarity: number; // 0-100 percentage
}

export interface WaterfallRow {
  id: string;
  data: number[]; // signal strength values across frequency range
  timestamp: number;
}
