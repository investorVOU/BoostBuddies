import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPostSchema, insertCommunitySchema, insertLiveEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Posts routes
  app.get('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const posts = await storage.getUserPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({ ...req.body, userId });
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create post" });
      }
    }
  });

  app.post('/api/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;
      
      // Check if user already liked this post
      const existingLikes = await storage.getUserPostLikes(userId);
      const alreadyLiked = existingLikes.some(like => like.postId === postId);
      
      if (alreadyLiked) {
        await storage.unlikePost(userId, postId);
        res.json({ liked: false });
      } else {
        await storage.likePost(userId, postId);
        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling post like:", error);
      res.status(500).json({ message: "Failed to toggle post like" });
    }
  });

  // User stats routes
  app.get('/api/users/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/users/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Communities routes
  app.get('/api/communities', isAuthenticated, async (req: any, res) => {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  app.get('/api/communities/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communities = await storage.getUserCommunities(userId);
      res.json(communities);
    } catch (error) {
      console.error("Error fetching user communities:", error);
      res.status(500).json({ message: "Failed to fetch user communities" });
    }
  });

  app.post('/api/communities/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communityId = req.params.id;
      const membership = await storage.joinCommunity(userId, communityId);
      res.status(201).json(membership);
    } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ message: "Failed to join community" });
    }
  });

  app.delete('/api/communities/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communityId = req.params.id;
      const success = await storage.leaveCommunity(userId, communityId);
      
      if (success) {
        res.json({ message: "Left community successfully" });
      } else {
        res.status(404).json({ message: "Community membership not found" });
      }
    } catch (error) {
      console.error("Error leaving community:", error);
      res.status(500).json({ message: "Failed to leave community" });
    }
  });

  // Live events routes
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const events = await storage.getLiveEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching live events:", error);
      res.status(500).json({ message: "Failed to fetch live events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const hostId = req.user.claims.sub;
      const eventData = insertLiveEventSchema.parse({ ...req.body, hostId });
      const event = await storage.createLiveEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating live event:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create live event" });
      }
    }
  });

  // Collab spotlight routes
  app.get('/api/collabs', isAuthenticated, async (req: any, res) => {
    try {
      const collabs = await storage.getActiveCollabSpotlights();
      res.json(collabs);
    } catch (error) {
      console.error("Error fetching collab spotlights:", error);
      res.status(500).json({ message: "Failed to fetch collab spotlights" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle different WebSocket message types
        switch (data.type) {
          case 'join_event':
            // Handle joining live events
            broadcast({
              type: 'event_participant_joined',
              eventId: data.eventId,
              participantCount: data.participantCount
            });
            break;
            
          case 'chat_message':
            // Handle chat messages in communities
            broadcast({
              type: 'new_chat_message',
              communityId: data.communityId,
              message: data.message,
              userId: data.userId,
              timestamp: new Date().toISOString()
            });
            break;
            
          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  return httpServer;
}
