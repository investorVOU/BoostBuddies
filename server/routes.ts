import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import bcrypt from "bcrypt";

import { insertPostSchema, insertCommunitySchema, insertLiveEventSchema } from "@shared/schema";
import { z } from "zod";
import { cacheMiddleware } from "./cache";
import { supabase } from "./db";

// Simple session-based auth middleware
const sessionAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporarily disable Replit Auth to focus on email/password auth
  // await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Email/Password Registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('Registration request received:', req.body);
      const { email, password, firstName, lastName } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName) {
        console.log('Validation failed: missing fields');
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (password.length < 6) {
        console.log('Validation failed: password too short');
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      console.log('Checking if user exists...');
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log('User already exists');
        return res.status(400).json({ message: "User already exists" });
      }

      console.log('Hashing password...');
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user with hashed password
      const userId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Creating user with ID:', userId);
      
      // Directly insert into Supabase using the correct column names
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName || '',
          profile_image_url: null,
          password: hashedPassword,
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('User created successfully');
      // Set session
      (req as any).session.userId = userId;
      (req as any).session.user = { id: userId, email, firstName, lastName };

      res.json({ message: "Registration successful", user: { id: userId, email, firstName, lastName } });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  });

  // Email/Password Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Simple validation
      if (!email || !password) {
        return res.status(400).json({ message: "Missing email or password" });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      if (!user.password) {
        return res.status(401).json({ message: "Invalid login method" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      (req as any).session.userId = user.id;
      (req as any).session.user = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };

      res.json({ message: "Login successful", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  

  // OAuth routes
  app.get('/api/auth/google', (req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`)}&` +
      `response_type=code&` +
      `scope=openid email profile`;
    
    res.redirect(googleAuthUrl);
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`,
        }),
      });

      const tokens = await tokenResponse.json();

      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      const userInfo = await userResponse.json();

      // Store user in database
      await storage.upsertUser({
        id: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profileImageUrl: userInfo.picture,
      });

      // Set session
      (req as any).session.userId = userInfo.id;
      (req as any).session.user = userInfo;

      res.redirect('/');
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect('/auth?error=oauth_error');
    }
  });

  app.get('/api/auth/twitter', (req, res) => {
    const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.TWITTER_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.TWITTER_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/twitter/callback`)}&` +
      `scope=tweet.read users.read&` +
      `state=state&` +
      `code_challenge=challenge&` +
      `code_challenge_method=plain`;
    
    res.redirect(twitterAuthUrl);
  });

  app.get('/api/auth/twitter/callback', async (req, res) => {
    try {
      const { code } = req.query;

      // Exchange code for tokens
      const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          code: code as string,
          grant_type: 'authorization_code',
          client_id: process.env.TWITTER_CLIENT_ID!,
          redirect_uri: process.env.TWITTER_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/twitter/callback`,
          code_verifier: 'challenge',
        }),
      });

      const tokens = await tokenResponse.json();

      // Get user info
      const userResponse = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      const userData = await userResponse.json();
      const userInfo = userData.data;

      // Store user in database
      await storage.upsertUser({
        id: userInfo.id,
        email: `${userInfo.username}@twitter.com`, // Twitter doesn't always provide email
        firstName: userInfo.name?.split(' ')[0] || userInfo.username,
        lastName: userInfo.name?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: userInfo.profile_image_url,
      });

      // Set session
      (req as any).session.userId = userInfo.id;
      (req as any).session.user = userInfo;

      res.redirect('/');
    } catch (error) {
      console.error('Twitter OAuth error:', error);
      res.redirect('/auth?error=oauth_error');
    }
  });

  // Posts routes
  app.get('/api/posts', sessionAuth, cacheMiddleware({ duration: 300 }), async (req: any, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/user', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const posts = await storage.getUserPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.post('/api/posts', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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

  app.post('/api/posts/:id/like', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
  app.get('/api/users/stats', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/users/leaderboard', sessionAuth, async (req: any, res) => {
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
  app.get('/api/communities', sessionAuth, cacheMiddleware({ duration: 600 }), async (req: any, res) => {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  app.get('/api/communities/user', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const communities = await storage.getUserCommunities(userId);
      res.json(communities);
    } catch (error) {
      console.error("Error fetching user communities:", error);
      res.status(500).json({ message: "Failed to fetch user communities" });
    }
  });

  app.post('/api/communities/:id/join', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const communityId = req.params.id;
      const membership = await storage.joinCommunity(userId, communityId);
      res.status(201).json(membership);
    } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ message: "Failed to join community" });
    }
  });

  app.delete('/api/communities/:id/leave', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
  app.get('/api/events', sessionAuth, async (req: any, res) => {
    try {
      const events = await storage.getLiveEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching live events:", error);
      res.status(500).json({ message: "Failed to fetch live events" });
    }
  });

  app.post('/api/events', sessionAuth, async (req: any, res) => {
    try {
      const hostId = req.session.userId;
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
  app.get('/api/collabs', sessionAuth, async (req: any, res) => {
    try {
      const collabs = await storage.getActiveCollabSpotlights();
      res.json(collabs);
    } catch (error) {
      console.error("Error fetching collab spotlights:", error);
      res.status(500).json({ message: "Failed to fetch collab spotlights" });
    }
  });

  // Premium subscription routes
  app.post('/api/premium/payment', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const paymentData = { ...req.body, userId };
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  app.get('/api/premium/status', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.get('/api/crypto-addresses', sessionAuth, async (req: any, res) => {
    try {
      const addresses = await storage.getCryptoAddresses();
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching crypto addresses:", error);
      res.status(500).json({ message: "Failed to fetch crypto addresses" });
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