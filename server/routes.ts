import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVibeEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Spotify OAuth routes
  app.get("/api/auth/spotify", (req, res) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/spotify/callback`;
    const scopes = 'user-read-currently-playing user-read-playback-state user-read-email user-read-private';
    
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    res.redirect(authUrl);
  });

  app.get("/api/auth/spotify/callback", async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: "Authorization code missing" });
    }

    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/spotify/callback`;

      // Exchange code for tokens
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || 'Failed to get tokens');
      }

      // Get user profile
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      const profile = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error('Failed to get user profile');
      }

      // Create or update user
      let user = await storage.getUserBySpotifyId(profile.id);
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

      if (user) {
        user = await storage.updateUser(user.id, {
          displayName: profile.display_name,
          email: profile.email,
          avatarUrl: profile.images?.[0]?.url,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || user.refreshToken,
          tokenExpiresAt: expiresAt
        });
      } else {
        user = await storage.createUser({
          spotifyId: profile.id,
          displayName: profile.display_name,
          email: profile.email,
          avatarUrl: profile.images?.[0]?.url,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiresAt: expiresAt
        });
      }

      // Set session
      (req.session as any).userId = user.id;
      
      res.redirect('/');
    } catch (error) {
      console.error('Spotify auth error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // Auth status
  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl
    });
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Get current playing track
  app.get("/api/spotify/now-playing", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    try {
      // Check if token needs refresh
      if (new Date() >= user.tokenExpiresAt) {
        const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: user.refreshToken
          })
        });

        const refreshData = await refreshResponse.json();
        
        if (refreshResponse.ok) {
          const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000);
          await storage.updateUser(user.id, {
            accessToken: refreshData.access_token,
            tokenExpiresAt: newExpiresAt
          });
          user.accessToken = refreshData.access_token;
        }
      }

      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (response.status === 204) {
        return res.json({ isPlaying: false });
      }

      if (!response.ok) {
        throw new Error('Failed to get current track');
      }

      const data = await response.json();
      
      if (!data.item) {
        return res.json({ isPlaying: false });
      }

      res.json({
        isPlaying: true,
        track: {
          id: data.item.id,
          name: data.item.name,
          artist: data.item.artists[0].name,
          album: data.item.album.name,
          albumArt: data.item.album.images[0]?.url,
          uri: data.item.uri
        }
      });
    } catch (error) {
      console.error('Now playing error:', error);
      res.status(500).json({ error: 'Failed to get current track' });
    }
  });

  // Vibe entries
  app.get("/api/vibe-entries", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { limit = "20", offset = "0", emoji, artist } = req.query;
    
    try {
      let entries;
      
      if (emoji) {
        entries = await storage.getVibeEntriesByEmoji(userId, emoji as string);
      } else if (artist) {
        entries = await storage.getVibeEntriesByArtist(userId, artist as string);
      } else {
        entries = await storage.getVibeEntries(userId, parseInt(limit as string), parseInt(offset as string));
      }
      
      res.json(entries);
    } catch (error) {
      console.error('Get vibe entries error:', error);
      res.status(500).json({ error: 'Failed to get vibe entries' });
    }
  });

  app.post("/api/vibe-entries", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const entryData = insertVibeEntrySchema.parse({
        ...req.body,
        userId
      });

      const entry = await storage.createVibeEntry(entryData);
      
      // Update weekly stats
      await updateWeeklyStats(userId);
      
      res.json(entry);
    } catch (error) {
      console.error('Create vibe entry error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create vibe entry' });
    }
  });

  app.delete("/api/vibe-entries/:id", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const success = await storage.deleteVibeEntry(req.params.id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Vibe entry not found" });
      }

      // Update weekly stats
      await updateWeeklyStats(userId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Delete vibe entry error:', error);
      res.status(500).json({ error: 'Failed to delete vibe entry' });
    }
  });

  // Weekly stats
  app.get("/api/weekly-stats", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const stats = await storage.getCurrentWeekStats(userId);
      res.json(stats || { totalEntries: 0, topMood: null, topArtist: null });
    } catch (error) {
      console.error('Get weekly stats error:', error);
      res.status(500).json({ error: 'Failed to get weekly stats' });
    }
  });

  // Data export
  app.get("/api/export", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const entries = await storage.getVibeEntries(userId, 1000, 0);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="vibe-journal-export.json"');
      res.json({
        exportDate: new Date().toISOString(),
        totalEntries: entries.length,
        entries: entries
      });
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  });

  // Helper function to update weekly stats
  async function updateWeeklyStats(userId: string) {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const entries = await storage.getVibeEntries(userId, 1000, 0);
    const weekEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= weekStart && new Date(entry.createdAt) <= weekEnd
    );

    // Calculate top mood
    const moodCounts: { [key: string]: number } = {};
    const artistCounts: { [key: string]: number } = {};
    
    weekEntries.forEach(entry => {
      moodCounts[entry.emoji] = (moodCounts[entry.emoji] || 0) + 1;
      artistCounts[entry.artistName] = (artistCounts[entry.artistName] || 0) + 1;
    });

    const topMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, null);
    const topArtist = Object.keys(artistCounts).reduce((a, b) => 
      artistCounts[a] > artistCounts[b] ? a : b, null);

    await storage.createOrUpdateWeeklyStats({
      userId,
      weekStart,
      weekEnd,
      totalEntries: weekEntries.length,
      topMood,
      topArtist
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
