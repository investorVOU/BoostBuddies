import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { supabaseAuth } from "./supabase-auth";
import { randomUUID } from "crypto";
import "./types"; // Import session type declarations

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

  const user = await supabaseAuth.getUserById(req.session.userId);
  if (!user || !await supabaseAuth.isAdmin(user)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  req.user = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Initialize defaults on startup
  supabaseAuth.initializeDefaults();

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Get user from database
      const user = await supabaseAuth.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is admin
      if (!await supabaseAuth.isAdmin(user)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Verify password
      const isValidPassword = await supabaseAuth.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set admin session
      req.session.userId = user.id;
      req.session.isAdmin = true;

      res.json({ 
        user,
        message: "Admin login successful"
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await supabaseAuth.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user
      const user = await supabaseAuth.createUser({
        email,
        password,
        firstName,
        lastName,
      });

      if (!user) {
        return res.status(500).json({ message: "Registration failed" });
      }

      // Set session
      req.session.userId = user.id;

      res.json({ user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await supabaseAuth.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValid = await supabaseAuth.verifyPassword(user, password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;

      res.json({ user });
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
      const user = await supabaseAuth.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      console.error('Auth me error:', error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Forgot password route
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await supabaseAuth.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: "If the email exists, a reset link has been sent." });
      }

      // Generate reset token
      const token = randomUUID();
      
      // In a real app, you would send an email here
      console.log(`Password reset token for ${email}: ${token}`);
      
      res.json({ message: "If the email exists, a reset link has been sent." });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: "Reset request failed" });
    }
  });

  // Admin routes
  app.get("/api/admin/posts", adminAuth, async (req, res) => {
    try {
      const status = req.query.status as string;
      
      if (status === 'pending') {
        const posts = await supabaseAuth.getPendingPosts();
        res.json(posts);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error('Error getting admin posts:', error);
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  app.post("/api/admin/posts/:id/approve", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await supabaseAuth.approvePost(id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json({ message: "Post approved successfully" });
    } catch (error) {
      console.error('Error approving post:', error);
      res.status(500).json({ message: "Failed to approve post" });
    }
  });

  app.post("/api/admin/posts/:id/reject", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const success = await supabaseAuth.rejectPost(id, req.user.id, reason || "Content does not meet guidelines");
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json({ message: "Post rejected successfully" });
    } catch (error) {
      console.error('Error rejecting post:', error);
      res.status(500).json({ message: "Failed to reject post" });
    }
  });

  app.get("/api/admin/settings", adminAuth, async (req, res) => {
    try {
      const settings = await supabaseAuth.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error getting system settings:', error);
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.put("/api/admin/settings/:key", adminAuth, async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const success = await supabaseAuth.updateSystemSetting(key, value, req.user.id);
      if (!success) {
        return res.status(500).json({ message: "Failed to update setting" });
      }
      res.json({ message: "Setting updated successfully" });
    } catch (error) {
      console.error('Error updating system setting:', error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Post routes - Simple mock for now
  app.get("/api/posts", sessionAuth, async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error('Error getting posts:', error);
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  app.post("/api/posts", sessionAuth, async (req, res) => {
    try {
      res.json({ message: "Post created successfully", id: randomUUID() });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Community routes - Mock for now
  app.get("/api/communities", sessionAuth, async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error('Error getting communities:', error);
      res.status(500).json({ message: "Failed to get communities" });
    }
  });

  // Simple endpoint implementations
  app.get("/api/analytics/stats", sessionAuth, async (req, res) => {
    res.json({ totalPosts: 0, totalLikes: 0, totalShares: 0, totalComments: 0, points: 0 });
  });

  app.get("/api/analytics/leaderboard", sessionAuth, async (req, res) => {
    res.json([]);
  });

  app.get("/api/events", sessionAuth, async (req, res) => {
    res.json([]);
  });

  app.get("/api/collab-spotlights", sessionAuth, async (req, res) => {
    res.json([]);
  });

  app.get("/api/premium/subscription", sessionAuth, async (req, res) => {
    res.json(null);
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

  // WebSocket server removed to avoid conflicts with Vite's HMR WebSocket
  // Real-time features are handled via Server-Sent Events above

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