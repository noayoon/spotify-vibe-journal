import { users, vibeEntries, weeklyStats, type User, type InsertUser, type VibeEntry, type InsertVibeEntry, type WeeklyStats, type InsertWeeklyStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserBySpotifyId(spotifyId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Vibe entry operations
  getVibeEntries(userId: string, limit?: number, offset?: number): Promise<VibeEntry[]>;
  getVibeEntriesByEmoji(userId: string, emoji: string): Promise<VibeEntry[]>;
  getVibeEntriesByArtist(userId: string, artist: string): Promise<VibeEntry[]>;
  createVibeEntry(entry: InsertVibeEntry): Promise<VibeEntry>;
  deleteVibeEntry(id: string, userId: string): Promise<boolean>;

  // Weekly stats operations
  getWeeklyStats(userId: string, weekStart: Date): Promise<WeeklyStats | undefined>;
  createOrUpdateWeeklyStats(stats: InsertWeeklyStats): Promise<WeeklyStats>;
  getCurrentWeekStats(userId: string): Promise<WeeklyStats | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserBySpotifyId(spotifyId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.spotifyId, spotifyId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getVibeEntries(userId: string, limit = 20, offset = 0): Promise<VibeEntry[]> {
    return await db
      .select()
      .from(vibeEntries)
      .where(eq(vibeEntries.userId, userId))
      .orderBy(desc(vibeEntries.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getVibeEntriesByEmoji(userId: string, emoji: string): Promise<VibeEntry[]> {
    return await db
      .select()
      .from(vibeEntries)
      .where(and(eq(vibeEntries.userId, userId), eq(vibeEntries.emoji, emoji)))
      .orderBy(desc(vibeEntries.createdAt));
  }

  async getVibeEntriesByArtist(userId: string, artist: string): Promise<VibeEntry[]> {
    return await db
      .select()
      .from(vibeEntries)
      .where(and(eq(vibeEntries.userId, userId), eq(vibeEntries.artistName, artist)))
      .orderBy(desc(vibeEntries.createdAt));
  }

  async createVibeEntry(entry: InsertVibeEntry): Promise<VibeEntry> {
    const [vibeEntry] = await db
      .insert(vibeEntries)
      .values(entry)
      .returning();
    return vibeEntry;
  }

  async deleteVibeEntry(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(vibeEntries)
      .where(and(eq(vibeEntries.id, id), eq(vibeEntries.userId, userId)));
    return result.rowCount > 0;
  }

  async getWeeklyStats(userId: string, weekStart: Date): Promise<WeeklyStats | undefined> {
    const [stats] = await db
      .select()
      .from(weeklyStats)
      .where(and(eq(weeklyStats.userId, userId), eq(weeklyStats.weekStart, weekStart)));
    return stats || undefined;
  }

  async createOrUpdateWeeklyStats(stats: InsertWeeklyStats): Promise<WeeklyStats> {
    const existing = await this.getWeeklyStats(stats.userId, stats.weekStart);
    
    if (existing) {
      const [updated] = await db
        .update(weeklyStats)
        .set(stats)
        .where(eq(weeklyStats.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(weeklyStats)
        .values(stats)
        .returning();
      return created;
    }
  }

  async getCurrentWeekStats(userId: string): Promise<WeeklyStats | undefined> {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    return this.getWeeklyStats(userId, weekStart);
  }
}

export const storage = new DatabaseStorage();
