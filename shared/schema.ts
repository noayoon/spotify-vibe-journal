import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spotifyId: text("spotify_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vibeEntries = pgTable("vibe_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emoji: text("emoji").notNull(),
  note: text("note"),
  trackName: text("track_name").notNull(),
  artistName: text("artist_name").notNull(),
  albumName: text("album_name").notNull(),
  albumArt: text("album_art"),
  spotifyTrackId: text("spotify_track_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weeklyStats = pgTable("weekly_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  totalEntries: integer("total_entries").notNull().default(0),
  topMood: text("top_mood"),
  topArtist: text("top_artist"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  vibeEntries: many(vibeEntries),
  weeklyStats: many(weeklyStats),
}));

export const vibeEntriesRelations = relations(vibeEntries, ({ one }) => ({
  user: one(users, {
    fields: [vibeEntries.userId],
    references: [users.id],
  }),
}));

export const weeklyStatsRelations = relations(weeklyStats, ({ one }) => ({
  user: one(users, {
    fields: [weeklyStats.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVibeEntrySchema = createInsertSchema(vibeEntries).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklyStatsSchema = createInsertSchema(weeklyStats).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVibeEntry = z.infer<typeof insertVibeEntrySchema>;
export type VibeEntry = typeof vibeEntries.$inferSelect;
export type InsertWeeklyStats = z.infer<typeof insertWeeklyStatsSchema>;
export type WeeklyStats = typeof weeklyStats.$inferSelect;
