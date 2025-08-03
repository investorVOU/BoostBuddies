import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertPostSchema, insertCommunitySchema, insertLiveEventSchema, insertPaymentSchema, insertSubscriptionSchema } from "@shared/schema";
import { z } from "zod";

// Simple session-based auth middleware
const sessionAuth = (req: any, res: any, next: any) => {
  console.log('Session check:', { 
    sessionExists: !!req.session, 
    userId: req.session?.userId,
    sessionId: req.sessionID 
  });
  
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Admin auth middleware
const adminAuth = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.email !== 'admin@boostbuddies.com') {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  req.user = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        points: 0,
        isPremium: false,
        otpEnabled: false,
      });
      
      // Set session
      req.session.userId = user.id;
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", sessionAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error('Auth me error:', error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Admin routes
  app.get("/api/admin/posts/pending", adminAuth, async (req, res) => {
    try {
      const posts = await storage.getPendingPosts();
      res.json(posts);
    } catch (error) {
      console.error('Error getting pending posts:', error);
      res.status(500).json({ message: "Failed to get pending posts" });
    }
  });

  app.put("/api/admin/posts/:id/approve", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.approvePost(id, req.user.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error('Error approving post:', error);
      res.status(500).json({ message: "Failed to approve post" });
    }
  });

  app.put("/api/admin/posts/:id/reject", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const post = await storage.rejectPost(id, req.user.id, reason);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error('Error rejecting post:', error);
      res.status(500).json({ message: "Failed to reject post" });
    }
  });

  // Post routes
  app.get("/api/posts", sessionAuth, async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error('Error getting posts:', error);
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  app.post("/api/posts", sessionAuth, async (req, res) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Check if user is premium for auto-approval
      const user = await storage.getUser(req.session.userId);
      let status = "pending";
      let autoApproved = false;
      
      if (user?.isPremium) {
        status = "approved";
        autoApproved = true;
      }
      
      const post = await storage.createPost({
        ...postData,
        status,
        autoApproved,
      });
      
      res.json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/posts/user", sessionAuth, async (req, res) => {
    try {
      const posts = await storage.getUserPosts(req.session.userId);
      res.json(posts);
    } catch (error) {
      console.error('Error getting user posts:', error);
      res.status(500).json({ message: "Failed to get user posts" });
    }
  });

  app.put("/api/posts/:id/like", sessionAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const like = await storage.likePost(req.session.userId, id);
      res.json(like);
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/posts/:id/like", sessionAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.unlikePost(req.session.userId, id);
      res.json({ message: "Post unliked" });
    } catch (error) {
      console.error('Error unliking post:', error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // Community routes
  app.get("/api/communities", sessionAuth, async (req, res) => {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      console.error('Error getting communities:', error);
      res.status(500).json({ message: "Failed to get communities" });
    }
  });

  app.post("/api/communities", sessionAuth, async (req, res) => {
    try {
      const communityData = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(communityData);
      res.json(community);
    } catch (error) {
      console.error('Error creating community:', error);
      res.status(500).json({ message: "Failed to create community" });
    }
  });

  app.post("/api/communities/:id/join", sessionAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const membership = await storage.joinCommunity(req.session.userId, id);
      res.json(membership);
    } catch (error) {
      console.error('Error joining community:', error);
      res.status(500).json({ message: "Failed to join community" });
    }
  });

  app.delete("/api/communities/:id/leave", sessionAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.leaveCommunity(req.session.userId, id);
      res.json({ message: "Left community" });
    } catch (error) {
      console.error('Error leaving community:', error);
      res.status(500).json({ message: "Failed to leave community" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", sessionAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId);
      res.json(stats);
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.get("/api/analytics/leaderboard", sessionAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  // Live events routes
  app.get("/api/events", sessionAuth, async (req, res) => {
    try {
      const events = await storage.getLiveEvents();
      res.json(events);
    } catch (error) {
      console.error('Error getting live events:', error);
      res.status(500).json({ message: "Failed to get events" });
    }
  });

  app.post("/api/events", sessionAuth, async (req, res) => {
    try {
      const eventData = insertLiveEventSchema.parse({
        ...req.body,
        hostId: req.session.userId
      });
      const event = await storage.createLiveEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error('Error creating live event:', error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Collab spotlight routes
  app.get("/api/collab-spotlights", sessionAuth, async (req, res) => {
    try {
      const spotlights = await storage.getActiveCollabSpotlights();
      res.json(spotlights);
    } catch (error) {
      console.error('Error getting collab spotlights:', error);
      res.status(500).json({ message: "Failed to get collab spotlights" });
    }
  });

  // Premium/Payment routes
  app.get("/api/premium/subscription", sessionAuth, async (req, res) => {
    try {
      const subscription = await storage.getUserSubscription(req.session.userId);
      res.json(subscription);
    } catch (error) {
      console.error('Error getting subscription:', error);
      res.status(500).json({ message: "Failed to get subscription" });
    }
  });

  app.post("/api/premium/payments", sessionAuth, async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.post("/api/premium/subscribe", sessionAuth, async (req, res) => {
    try {
      const { plan } = req.body; // monthly or yearly
      
      const endDate = new Date();
      if (plan === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      const subscriptionData = insertSubscriptionSchema.parse({
        userId: req.session.userId,
        plan,
        endDate,
        startDate: new Date(),
      });
      
      const subscription = await storage.createSubscription(subscriptionData);
      
      // Update user premium status
      await storage.updateUser(req.session.userId, { 
        isPremium: true,
        premiumExpiresAt: endDate
      });
      
      res.json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.get("/api/crypto/addresses", async (req, res) => {
    try {
      const addresses = await storage.getCryptoAddresses();
      res.json(addresses);
    } catch (error) {
      console.error('Error getting crypto addresses:', error);
      res.status(500).json({ message: "Failed to get crypto addresses" });
    }
  });

  // WebSocket for real-time features
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'join_event':
            ws.send(JSON.stringify({ type: 'event_joined', eventId: data.eventId }));
            break;
          case 'chat_message':
            // Broadcast chat message to all connected clients
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'chat_message',
                  message: data.message,
                  userId: data.userId,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return server;
}