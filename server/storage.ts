import { users, vibeEntries, weeklyStats, sharedVibes, emojiUsage, type User, type InsertUser, type VibeEntry, type InsertVibeEntry, type WeeklyStats, type InsertWeeklyStats, type SharedVibe, type InsertSharedVibe, type EmojiUsage, type InsertEmojiUsage } from "@shared/schema";
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
  getVibeEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<VibeEntry[]>;
  createVibeEntry(entry: InsertVibeEntry): Promise<VibeEntry>;
  deleteVibeEntry(id: string, userId: string): Promise<boolean>;
  updateVibeEntry(id: string, userId: string, updates: Partial<VibeEntry>): Promise<VibeEntry | undefined>;

  // Weekly stats operations
  getWeeklyStats(userId: string, weekStart: Date): Promise<WeeklyStats | undefined>;
  createOrUpdateWeeklyStats(stats: InsertWeeklyStats): Promise<WeeklyStats>;
  getCurrentWeekStats(userId: string): Promise<WeeklyStats | undefined>;

  // Shared vibe operations
  createSharedVibe(sharedVibe: InsertSharedVibe): Promise<SharedVibe>;
  getSharedVibe(shareId: string): Promise<(SharedVibe & { vibeEntry: VibeEntry; user: User }) | undefined>;
  incrementShareViewCount(shareId: string): Promise<void>;
  getUserSharedVibes(userId: string): Promise<(SharedVibe & { vibeEntry: VibeEntry })[]>;
  deleteSharedVibe(shareId: string, userId: string): Promise<boolean>;

  // Emoji usage operations
  trackEmojiUsage(userId: string, emoji: string): Promise<void>;
  getMostUsedEmojis(userId: string, limit?: number): Promise<EmojiUsage[]>;
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

  async getVibeEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<VibeEntry[]> {
    return await db
      .select()
      .from(vibeEntries)
      .where(and(
        eq(vibeEntries.userId, userId),
        gte(vibeEntries.createdAt, startDate),
        lte(vibeEntries.createdAt, endDate)
      ))
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
    return (result.rowCount ?? 0) > 0;
  }

  async updateVibeEntry(id: string, userId: string, updates: Partial<VibeEntry>): Promise<VibeEntry | undefined> {
    const [vibeEntry] = await db
      .update(vibeEntries)
      .set(updates)
      .where(and(eq(vibeEntries.id, id), eq(vibeEntries.userId, userId)))
      .returning();
    return vibeEntry || undefined;
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

  async createSharedVibe(sharedVibe: InsertSharedVibe): Promise<SharedVibe> {
    const [created] = await db
      .insert(sharedVibes)
      .values(sharedVibe)
      .returning();
    return created;
  }

  async getSharedVibe(shareId: string): Promise<(SharedVibe & { vibeEntry: VibeEntry; user: User }) | undefined> {
    const [result] = await db
      .select()
      .from(sharedVibes)
      .innerJoin(vibeEntries, eq(sharedVibes.vibeEntryId, vibeEntries.id))
      .innerJoin(users, eq(vibeEntries.userId, users.id))
      .where(and(eq(sharedVibes.shareId, shareId), eq(sharedVibes.isActive, true)));
    
    if (!result) return undefined;
    
    return {
      ...result.shared_vibes,
      vibeEntry: result.vibe_entries,
      user: result.users,
    };
  }

  async incrementShareViewCount(shareId: string): Promise<void> {
    await db
      .update(sharedVibes)
      .set({ viewCount: sql`${sharedVibes.viewCount} + 1` })
      .where(eq(sharedVibes.shareId, shareId));
  }

  async getUserSharedVibes(userId: string): Promise<(SharedVibe & { vibeEntry: VibeEntry })[]> {
    const results = await db
      .select()
      .from(sharedVibes)
      .innerJoin(vibeEntries, eq(sharedVibes.vibeEntryId, vibeEntries.id))
      .where(and(eq(vibeEntries.userId, userId), eq(sharedVibes.isActive, true)))
      .orderBy(desc(sharedVibes.createdAt));
    
    return results.map(result => ({
      ...result.shared_vibes,
      vibeEntry: result.vibe_entries,
    }));
  }

  async deleteSharedVibe(shareId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(sharedVibes)
      .set({ isActive: false })
      .where(
        and(
          eq(sharedVibes.shareId, shareId),
          eq(sharedVibes.vibeEntryId, 
            db.select({ id: vibeEntries.id })
              .from(vibeEntries)
              .where(and(eq(vibeEntries.id, sharedVibes.vibeEntryId), eq(vibeEntries.userId, userId)))
          )
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  async trackEmojiUsage(userId: string, emoji: string): Promise<void> {
    // Try to update existing emoji usage first
    const [existing] = await db
      .select()
      .from(emojiUsage)
      .where(and(eq(emojiUsage.userId, userId), eq(emojiUsage.emoji, emoji)));

    if (existing) {
      // Update existing usage count and last used timestamp
      await db
        .update(emojiUsage)
        .set({ 
          usageCount: existing.usageCount + 1,
          lastUsed: new Date()
        })
        .where(and(eq(emojiUsage.userId, userId), eq(emojiUsage.emoji, emoji)));
    } else {
      // Create new emoji usage record
      await db
        .insert(emojiUsage)
        .values({
          userId,
          emoji,
          usageCount: 1
        });
    }
  }

  async getMostUsedEmojis(userId: string, limit = 6): Promise<EmojiUsage[]> {
    return await db
      .select()
      .from(emojiUsage)
      .where(eq(emojiUsage.userId, userId))
      .orderBy(desc(emojiUsage.usageCount), desc(emojiUsage.lastUsed))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
