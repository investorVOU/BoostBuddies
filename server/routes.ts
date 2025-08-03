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

  // WebSocket disabled to avoid conflicts with Vite's dev server
  // Real-time features will be implemented via Server-Sent Events or polling
  
  // Live events endpoint for real-time updates
  app.get("/api/events/live", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    // Send initial connection message
    res.write("data: " + JSON.stringify({ type: "connected", timestamp: new Date() }) + "\n\n");
    
    // Keep connection alive
    const heartbeat = setInterval(() => {
      res.write("data: " + JSON.stringify({ type: "heartbeat", timestamp: new Date() }) + "\n\n");
    }, 30000);
    
    req.on("close", () => {
      clearInterval(heartbeat);
    });
  });

  // Points system routes
  app.post("/api/posts/:id/interact", sessionAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.body; // like, comment, share
      const userId = req.session.userId;

      if (!['like', 'comment', 'share'].includes(type)) {
        return res.status(400).json({ message: "Invalid interaction type" });
      }

      // Import PointsSystem dynamically to avoid import issues
      const { PointsSystem } = await import("./points-system");
      const result = await PointsSystem.processPostInteraction(userId, id, type);

      res.json(result);
    } catch (error) {
      console.error("Error processing interaction:", error);
      res.status(500).json({ message: "Failed to process interaction" });
    }
  });

  app.get("/api/user/stats", sessionAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { PointsSystem } = await import("./points-system");
      const stats = await PointsSystem.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  app.get("/api/user/points-history", sessionAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const { PointsSystem } = await import("./points-system");
      const history = await PointsSystem.getUserPointsHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error getting points history:", error);
      res.status(500).json({ message: "Failed to get points history" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const { PointsSystem } = await import("./points-system");
      const leaderboard = await PointsSystem.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  app.post("/api/user/daily-bonus", sessionAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { PointsSystem } = await import("./points-system");
      const awarded = await PointsSystem.awardDailyBonus(userId);
      res.json({ awarded, message: awarded ? "Daily bonus awarded!" : "Daily bonus already claimed" });
    } catch (error) {
      console.error("Error awarding daily bonus:", error);
      res.status(500).json({ message: "Failed to award daily bonus" });
    }
  });

  // User profile routes
  app.get("/api/user/settings", sessionAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        bio: user.bio,
        website: user.website,
        profilePhoto: user.profilePhoto,
      });
    } catch (error) {
      console.error("Error getting user settings:", error);
      res.status(500).json({ message: "Failed to get user settings" });
    }
  });

  app.put("/api/user/profile", sessionAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { firstName, lastName, email, bio, website } = req.body;

      await storage.updateUser(userId, {
        firstName,
        lastName,
        email,
        bio,
        website,
      });

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put("/api/user/change-password", sessionAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { currentPassword, newPassword } = req.body;

      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(404).json({ message: "User not found" });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(userId, { password: hashedNewPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Premium payment routes
  app.post("/api/payments/flutterwave", sessionAuth, async (req, res) => {
    try {
      const { amount, plan } = req.body;
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      // Mock Flutterwave payment processing (replace with real keys in production)
      const paymentData = {
        tx_ref: `BB_${Date.now()}_${userId}`,
        amount,
        currency: "USD",
        customer: {
          email: user?.email,
          name: `${user?.firstName} ${user?.lastName}`,
        },
        meta: {
          userId,
          plan,
        },
        redirect_url: `${req.headers.origin}/payment/success`,
      };

      // In production, use real Flutterwave API
      // const response = await fetch("https://api.flutterwave.com/v3/payments", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(paymentData),
      // });

      // Mock response for demo
      const mockResponse = {
        status: "success",
        data: {
          link: `https://checkout.flutterwave.com/v3/hosted/pay/${paymentData.tx_ref}`,
        },
      };

      res.json(mockResponse);
    } catch (error) {
      console.error("Error processing Flutterwave payment:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  app.post("/api/payments/paystack", sessionAuth, async (req, res) => {
    try {
      const { amount, plan } = req.body;
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      // Mock Paystack payment processing (replace with real keys in production)
      const paymentData = {
        email: user?.email,
        amount: amount * 100, // Paystack uses kobo
        reference: `BB_${Date.now()}_${userId}`,
        callback_url: `${req.headers.origin}/payment/success`,
        metadata: {
          userId,
          plan,
        },
      };

      // In production, use real Paystack API
      // const response = await fetch("https://api.paystack.co/transaction/initialize", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(paymentData),
      // });

      // Mock response for demo
      const mockResponse = {
        status: true,
        data: {
          authorization_url: `https://checkout.paystack.com/${paymentData.reference}`,
          reference: paymentData.reference,
        },
      };

      res.json(mockResponse);
    } catch (error) {
      console.error("Error processing Paystack payment:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  app.post("/api/payments/crypto", sessionAuth, async (req, res) => {
    try {
      const { amount, plan, currency } = req.body;
      const userId = req.session.userId;

      // Crypto payment addresses (replace with real addresses in production)
      const cryptoAddresses = {
        bitcoin: "1BoostBuddiesBTC123456789ABC",
        ethereum: "0x1234567890123456789012345678901234567890",
        usdt: "0xUSDT1234567890123456789012345678901234567890",
        polygon: "0xPOLY1234567890123456789012345678901234567890",
      };

      const address = cryptoAddresses[currency as keyof typeof cryptoAddresses];
      if (!address) {
        return res.status(400).json({ message: "Unsupported cryptocurrency" });
      }

      res.json({
        address,
        amount,
        currency: currency.toUpperCase(),
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`,
        instructions: `Send exactly ${amount} ${currency.toUpperCase()} to the address above. Your premium subscription will be activated within 1-3 confirmations.`,
      });
    } catch (error) {
      console.error("Error processing crypto payment:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  return server;
}