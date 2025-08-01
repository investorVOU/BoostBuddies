import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as TwitterStrategy } from "passport-twitter";

import { insertPostSchema, insertCommunitySchema, insertLiveEventSchema } from "@shared/schema";
import { z } from "zod";
import { cacheMiddleware } from "./cache";
import { supabase } from "./db";
import { FlutterwaveGateway, PaystackGateway, CryptoPaymentHandler } from "./payment-gateways";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporarily disable Replit Auth to focus on email/password auth
  // await setupAuth(app);

  // Initialize Passport for OAuth
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: any, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided by Google'), null);
        }

        // Check if user exists
        let user = await storage.getUserByEmail(email);
        
        if (!user) {
          // Create new user
          const userId = `google_${profile.id}`;
          const userData = {
            id: userId,
            email,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            passwordHash: '', // OAuth users don't need password
            isPremium: false,
            points: 0,
          };
          user = await storage.createUser(userData);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Twitter OAuth Strategy
  if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/api/auth/twitter/callback",
      includeEmail: true
    }, async (token, tokenSecret, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@twitter.local`;
        
        // Check if user exists
        let user = await storage.getUserByEmail(email);
        
        if (!user) {
          // Create new user
          const userId = `twitter_${profile.id}`;
          const userData = {
            id: userId,
            email,
            firstName: profile.displayName?.split(' ')[0] || '',
            lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
            passwordHash: '', // OAuth users don't need password
            isPremium: false,
            points: 0,
          };
          user = await storage.createUser(userData);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth' }),
    (req: any, res) => {
      // Set session
      req.session.userId = req.user.id;
      res.redirect('/');
    }
  );

  // Twitter OAuth routes
  app.get('/api/auth/twitter',
    passport.authenticate('twitter')
  );

  app.get('/api/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/auth' }),
    (req: any, res) => {
      // Set session
      req.session.userId = req.user.id;
      res.redirect('/');
    }
  );

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

  // Admin routes - restricted to admin users only
  const adminAuth = async (req: any, res: any, next: any) => {
    if (!req.session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check if user is admin by email
    if (req.session.user.email !== 'directtest@example.com') { // Replace with your actual admin email
      return res.status(403).json({ message: "Admin access required" });
    }
    
    // Try to log admin access (table may not exist yet)
    try {
      await supabase.from('admin_logs').insert({
        admin_id: req.session.user.id,
        action: `${req.method} ${req.path}`,
        details: `Admin accessed: ${req.path}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.log('Admin log failed (table may not exist):', logError.message);
    }
    
    next();
  };

  app.get('/api/admin/status', async (req: any, res) => {
    try {
      if (!req.session?.user?.email) {
        return res.json({ isAdmin: false });
      }
      
      // Check if current user is admin by email
      const isAdmin = req.session.user.email === 'directtest@example.com'; // Replace with your actual admin email
      
      console.log('Admin check:', { email: req.session.user.email, isAdmin });
      res.json({ isAdmin });
    } catch (error) {
      console.error('Admin status check error:', error);
      res.json({ isAdmin: false });
    }
  });

  app.get('/api/admin/users', adminAuth, async (req: any, res) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert to camelCase for frontend
      const convertedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImageUrl: user.profile_image_url,
        points: user.points,
        isPremium: user.is_premium,
        premiumExpiresAt: user.premium_expires_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }));
      
      res.json(convertedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get posts for admin moderation
  app.get('/api/admin/posts', adminAuth, async (req: any, res) => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          users!posts_user_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert to camelCase for frontend  
      const convertedPosts = posts.map(post => ({
        id: post.id,
        userId: post.user_id,
        user: {
          firstName: post.users?.first_name,
          lastName: post.users?.last_name,
          email: post.users?.email,
        },
        platform: post.platform,
        url: post.url,
        title: post.title,
        description: post.description,
        status: post.status,
        likesReceived: post.likes_received,
        likesNeeded: post.likes_needed,
        shares: post.shares,
        comments: post.comments,
        pointsEarned: post.points_earned,
        engagementsCompleted: post.engagements_completed || 0,
        autoApproved: post.auto_approved,
        approvedBy: post.approved_by,
        approvedAt: post.approved_at,
        rejectedReason: post.rejected_reason,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
      }));
      
      res.json(convertedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Approve/reject posts
  app.patch('/api/admin/posts/:postId', adminAuth, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const { status, rejectedReason } = req.body;
      
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      
      if (status === 'approved') {
        updates.approved_by = req.session.user.id;
        updates.approved_at = new Date().toISOString();
        updates.rejected_reason = null;
      } else if (status === 'rejected' && rejectedReason) {
        updates.rejected_reason = rejectedReason;
        updates.approved_by = null;
        updates.approved_at = null;
      }
      
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();
      
      if (error) throw error;
      
      res.json({ message: "Post updated successfully", post: data });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Record user engagement and check for auto-approval
  app.post('/api/posts/:postId/engage', sessionAuth, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const { engagementType } = req.body; // like, share, comment
      const userId = req.session.user.id;
      
      // Record the engagement
      const { error: engagementError } = await supabase
        .from('post_engagements')
        .insert({
          user_id: userId,
          post_id: postId,
          engagement_type: engagementType,
        });
      
      if (engagementError) throw engagementError;
      
      // Count user's total engagements
      const { count: totalEngagements } = await supabase
        .from('post_engagements')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);
      
      // Check if user has any pending posts that can be auto-approved
      if ((totalEngagements || 0) >= 10) {
        const { data: userPosts, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending');
        
        if (!postsError && userPosts.length > 0) {
          // Auto-approve the oldest pending post
          const postToApprove = userPosts[0];
          await supabase
            .from('posts')
            .update({
              status: 'auto_approved',
              auto_approved: true,
              approved_at: new Date().toISOString(),
              engagements_completed: totalEngagements,
              updated_at: new Date().toISOString(),
            })
            .eq('id', postToApprove.id);
        }
      }
      
      res.json({ 
        message: "Engagement recorded successfully",
        totalEngagements: totalEngagements || 0,
        autoApprovalEligible: (totalEngagements || 0) >= 10
      });
    } catch (error) {
      console.error('Error recording engagement:', error);
      res.status(500).json({ message: "Failed to record engagement" });
    }
  });

  app.get('/api/admin/stats', adminAuth, async (req: any, res) => {
    try {
      const [usersResult, postsResult, communitiesResult, adminLogsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('posts').select('id', { count: 'exact' }),
        supabase.from('communities').select('id', { count: 'exact' }),
        supabase.from('admin_logs').select('id', { count: 'exact' })
      ]);

      res.json({
        totalUsers: usersResult.count || 0,
        activePosts: postsResult.count || 0,
        totalCommunities: communitiesResult.count || 0,
        adminLogins: adminLogsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/logs', adminAuth, async (req: any, res) => {
    try {
      const { data: logs, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      res.json(logs || []);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      res.status(500).json({ message: "Failed to fetch admin logs" });
    }
  });

  app.patch('/api/admin/users/:userId', adminAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium;
      if (updates.points !== undefined) dbUpdates.points = updates.points;
      dbUpdates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      res.json({ message: "User updated successfully", user: data });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: "Failed to update user" });
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

  // Premium subscription routes
  app.post('/api/premium/subscribe', sessionAuth, async (req, res) => {
    try {
      const { plan } = req.body;
      const userId = req.session.userId;

      if (!plan || !['monthly', 'yearly'].includes(plan)) {
        return res.status(400).json({ message: 'Invalid plan selected' });
      }

      // Update user to premium
      const { data: user, error: updateError } = await supabase
        .from('users')
        .update({ 
          is_premium: true,
          premium_expires_at: new Date(Date.now() + (plan === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000))
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      res.json({ message: 'Premium subscription activated successfully', user });
    } catch (error: any) {
      console.error('Error activating premium subscription:', error);
      res.status(500).json({ message: 'Failed to activate premium subscription' });
    }
  });

  // Get user premium status
  app.get('/api/premium/status', sessionAuth, async (req, res) => {
    try {
      const userId = req.session.userId;

      const { data: user, error } = await supabase
        .from('users')
        .select('is_premium, premium_expires_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      res.json({ 
        isPremium: user?.is_premium || false, 
        expiresAt: user?.premium_expires_at 
      });
    } catch (error: any) {
      console.error('Error fetching premium status:', error);
      res.status(500).json({ message: 'Failed to fetch premium status' });
    }
  });

  // OTP Security Routes
  app.get('/api/auth/otp/setup', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Check if user already has OTP enabled
      const { data: user, error } = await supabase
        .from('users')
        .select('otp_secret, otp_enabled')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (user.otp_enabled) {
        return res.status(400).json({ message: 'OTP is already enabled' });
      }

      // Generate new secret
      const secret = speakeasy.generateSecret({
        name: `BoostBuddies (${user.email || userId})`,
        issuer: 'BoostBuddies'
      });

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

      // Store the secret temporarily (not yet enabled)
      await supabase
        .from('users')
        .update({ 
          otp_secret: secret.base32,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      });
    } catch (error) {
      console.error('OTP setup error:', error);
      res.status(500).json({ message: 'Failed to setup OTP' });
    }
  });

  app.post('/api/auth/otp/verify-setup', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'OTP token is required' });
      }

      // Get user's secret
      const { data: user, error } = await supabase
        .from('users')
        .select('otp_secret')
        .eq('id', userId)
        .single();

      if (error || !user.otp_secret) {
        return res.status(400).json({ message: 'OTP setup not found' });
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.otp_secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid OTP token' });
      }

      // Enable OTP for the user
      await supabase
        .from('users')
        .update({ 
          otp_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      res.json({ message: 'OTP authentication enabled successfully' });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Failed to verify OTP' });
    }
  });

  app.post('/api/auth/otp/verify', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'OTP token is required' });
      }

      // Get user's secret
      const { data: user, error } = await supabase
        .from('users')
        .select('otp_secret, otp_enabled')
        .eq('id', userId)
        .single();

      if (error || !user.otp_secret || !user.otp_enabled) {
        return res.status(400).json({ message: 'OTP not enabled for this user' });
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.otp_secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid OTP token' });
      }

      res.json({ message: 'OTP verified successfully', verified: true });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Failed to verify OTP' });
    }
  });

  app.post('/api/auth/otp/disable', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { token, password } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'OTP token is required to disable' });
      }

      // Get user data
      const { data: user, error } = await supabase
        .from('users')
        .select('otp_secret, otp_enabled, password')
        .eq('id', userId)
        .single();

      if (error || !user.otp_enabled) {
        return res.status(400).json({ message: 'OTP not enabled for this user' });
      }

      // Verify password if user has one
      if (user.password && password) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(400).json({ message: 'Invalid password' });
        }
      }

      // Verify the OTP token
      const verified = speakeasy.totp.verify({
        secret: user.otp_secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid OTP token' });
      }

      // Disable OTP
      await supabase
        .from('users')
        .update({ 
          otp_enabled: false,
          otp_secret: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      res.json({ message: 'OTP authentication disabled successfully' });
    } catch (error) {
      console.error('OTP disable error:', error);
      res.status(500).json({ message: 'Failed to disable OTP' });
    }
  });

  app.get('/api/auth/otp/status', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;

      const { data: user, error } = await supabase
        .from('users')
        .select('otp_enabled')
        .eq('id', userId)
        .single();

      if (error) throw error;

      res.json({ 
        otpEnabled: user?.otp_enabled || false 
      });
    } catch (error) {
      console.error('OTP status error:', error);
      res.status(500).json({ message: 'Failed to get OTP status' });
    }
  });

  // Initialize payment gateways
  const flutterwaveGateway = new FlutterwaveGateway();
  const paystackGateway = new PaystackGateway();
  const cryptoHandler = new CryptoPaymentHandler();

  // Payment gateway routes
  app.post('/api/payments/flutterwave/initialize', sessionAuth, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = req.session.userId;
      
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const txRef = `bb_${userId}_${Date.now()}`;
      const amount = plan === 'yearly' ? 20.00 : 2.00;
      const redirectUrl = `${req.protocol}://${req.get('host')}/api/payments/flutterwave/callback`;

      const paymentData = await flutterwaveGateway.initializePayment({
        amount,
        currency: 'USD',
        email: user.email,
        txRef,
        redirectUrl,
        customerName: `${user.first_name} ${user.last_name}`,
      });

      // Store payment record
      await supabase.from('payments').insert({
        user_id: userId,
        gateway: 'flutterwave',
        transaction_id: txRef,
        amount: Math.round(amount * 100), // Store in cents
        currency: 'USD',
        status: 'pending',
      });

      res.json(paymentData);
    } catch (error) {
      console.error('Flutterwave initialization error:', error);
      res.status(500).json({ message: 'Payment initialization failed' });
    }
  });

  app.get('/api/payments/flutterwave/callback', async (req, res) => {
    try {
      const { transaction_id, tx_ref, status } = req.query;
      
      console.log('Flutterwave callback received:', { transaction_id, tx_ref, status });

      if (!transaction_id) {
        console.log('No transaction_id in callback');
        return res.redirect('/premium?status=error&message=No transaction ID');
      }

      // Verify payment with Flutterwave
      const verification = await flutterwaveGateway.verifyPayment(transaction_id as string);
      
      console.log('Flutterwave verification result:', verification);

      if (verification.status === 'success' && verification.data.status === 'successful') {
        // Update payment status
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .update({ 
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', tx_ref)
          .select()
          .single();

        if (paymentError) {
          console.error('Failed to update payment:', paymentError);
          return res.redirect('/premium?status=error&message=Payment update failed');
        }

        if (payment) {
          // Activate premium subscription
          const success = await activatePremiumSubscription(payment.id);
          if (success) {
            console.log('Premium activated successfully for payment:', payment.id);
            res.redirect('/premium?status=success&message=Premium activated');
          } else {
            console.log('Failed to activate premium for payment:', payment.id);
            res.redirect('/premium?status=error&message=Premium activation failed');
          }
        } else {
          res.redirect('/premium?status=error&message=Payment not found');
        }
      } else {
        console.log('Payment verification failed:', verification);
        res.redirect('/premium?status=failed&message=Payment verification failed');
      }
    } catch (error) {
      console.error('Flutterwave callback error:', error);
      res.redirect('/premium?status=error&message=Callback processing failed');
    }
  });

  app.post('/api/payments/paystack/initialize', sessionAuth, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = req.session.userId;
      
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const reference = `bb_${userId}_${Date.now()}`;
      const amount = plan === 'yearly' ? 30000 : 3000; // NGN prices
      const callbackUrl = `${req.protocol}://${req.get('host')}/api/payments/paystack/callback`;

      const paymentData = await paystackGateway.initializePayment({
        amount,
        email: user.email,
        reference,
        callbackUrl,
        customerName: `${user.first_name} ${user.last_name}`,
      });

      // Store payment record
      await supabase.from('payments').insert({
        user_id: userId,
        gateway: 'paystack',
        transaction_id: reference,
        amount: amount * 100, // Store in kobo as cents equivalent
        currency: 'NGN',
        status: 'pending',
      });

      res.json(paymentData);
    } catch (error) {
      console.error('Paystack initialization error:', error);
      res.status(500).json({ message: 'Payment initialization failed' });
    }
  });

  app.get('/api/payments/paystack/callback', async (req, res) => {
    try {
      const { reference, trxref } = req.query;
      const txRef = reference || trxref;
      
      console.log('Paystack callback received:', { reference, trxref, txRef });

      if (!txRef) {
        console.log('No reference in callback');
        return res.redirect('/premium?status=error&message=No reference provided');
      }

      // Verify payment with Paystack
      const verification = await paystackGateway.verifyPayment(txRef as string);
      
      console.log('Paystack verification result:', verification);

      if (verification.status && verification.data.status === 'success') {
        // Update payment status
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .update({ 
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', txRef)
          .select()
          .single();

        if (paymentError) {
          console.error('Failed to update payment:', paymentError);
          return res.redirect('/premium?status=error&message=Payment update failed');
        }

        if (payment) {
          // Activate premium subscription
          const success = await activatePremiumSubscription(payment.id);
          if (success) {
            console.log('Premium activated successfully for payment:', payment.id);
            res.redirect('/premium?status=success&message=Premium activated');
          } else {
            console.log('Failed to activate premium for payment:', payment.id);
            res.redirect('/premium?status=error&message=Premium activation failed');
          }
        } else {
          res.redirect('/premium?status=error&message=Payment not found');
        }
      } else {
        console.log('Payment verification failed:', verification);
        res.redirect('/premium?status=failed&message=Payment verification failed');
      }
    } catch (error) {
      console.error('Paystack callback error:', error);
      res.redirect('/premium?status=error&message=Callback processing failed');
    }
  });

  app.post('/api/payments/crypto/initialize', sessionAuth, async (req: any, res) => {
    try {
      const { cryptoType, plan } = req.body;
      const userId = req.session.userId;

      if (!['btc', 'eth', 'usdt', 'matic'].includes(cryptoType)) {
        return res.status(400).json({ message: 'Invalid crypto type' });
      }

      // Crypto amounts (these would typically come from a price API)
      const cryptoPrices = {
        btc: plan === 'yearly' ? 0.0002 : 0.00002,
        eth: plan === 'yearly' ? 0.005 : 0.0005,
        usdt: plan === 'yearly' ? 20 : 2,
        matic: plan === 'yearly' ? 25 : 2.5,
      };

      const amount = cryptoPrices[cryptoType as keyof typeof cryptoPrices];
      const reference = `bb_crypto_${userId}_${Date.now()}`;

      // Store payment record
      await supabase.from('payments').insert({
        user_id: userId,
        gateway: 'crypto',
        crypto_type: cryptoType,
        transaction_id: reference,
        amount: Math.round(amount * 100000000), // Store in satoshis/wei equivalent
        currency: cryptoType.toUpperCase(),
        status: 'pending',
      });

      const paymentInstructions = await cryptoHandler.generatePaymentInstructions(
        cryptoType as 'btc' | 'eth' | 'usdt' | 'matic',
        amount
      );

      res.json({
        reference,
        ...paymentInstructions,
      });
    } catch (error) {
      console.error('Crypto payment initialization error:', error);
      res.status(500).json({ message: 'Crypto payment initialization failed' });
    }
  });

  app.post('/api/payments/crypto/confirm', sessionAuth, async (req: any, res) => {
    try {
      const { reference, txHash } = req.body;
      const userId = req.session.userId;

      if (!reference || !txHash) {
        return res.status(400).json({ message: 'Reference and transaction hash required' });
      }

      // Update payment with transaction hash - admin will verify manually
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({ 
          transaction_id: txHash,
          status: 'pending' // Will be confirmed by admin
        })
        .eq('transaction_id', reference)
        .eq('user_id', userId)
        .select()
        .single();

      if (paymentError) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      res.json({ 
        message: 'Transaction hash submitted. Payment will be verified within 24 hours.',
        payment 
      });
    } catch (error) {
      console.error('Crypto payment confirmation error:', error);
      res.status(500).json({ message: 'Payment confirmation failed' });
    }
  });

  // Helper function to activate premium subscription
  const activatePremiumSubscription = async (paymentId: string) => {
    try {
      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) {
        console.error('Payment not found:', paymentError);
        return false;
      }

      // Calculate expiry date based on amount
      const expiryDate = new Date();
      const isYearly = payment.amount >= 2000; // $20 or NGN 30,000
      expiryDate.setDate(expiryDate.getDate() + (isYearly ? 365 : 30));

      // Update user to premium
      const { error: userError } = await supabase
        .from('users')
        .update({
          is_premium: true,
          premium_expires_at: expiryDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.user_id);

      if (userError) {
        console.error('Failed to activate premium:', userError);
        return false;
      }

      console.log(`Premium activated for user ${payment.user_id}, expires: ${expiryDate.toISOString()}`);
      return true;
    } catch (error) {
      console.error('Error activating premium:', error);
      return false;
    }
  };

  // Webhook endpoints
  app.post('/api/webhooks/flutterwave', async (req, res) => {
    try {
      const signature = req.headers['verif-hash'] as string;
      const payload = JSON.stringify(req.body);

      console.log('Flutterwave webhook received:', { signature, body: req.body });

      if (!flutterwaveGateway.verifyWebhookSignature(payload, signature)) {
        console.log('Invalid Flutterwave webhook signature');
        return res.status(400).json({ message: 'Invalid signature' });
      }

      const { event, data } = req.body;

      if (event === 'charge.completed' && data.status === 'successful') {
        console.log('Processing successful Flutterwave payment:', data.tx_ref);
        
        // Update payment status
        const { data: payment, error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', data.tx_ref)
          .select()
          .single();

        if (updateError) {
          console.error('Failed to update payment:', updateError);
          return res.status(500).json({ message: 'Failed to update payment' });
        }

        if (payment) {
          // Activate premium subscription
          await activatePremiumSubscription(payment.id);
        }
      }

      res.json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Flutterwave webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  app.post('/api/webhooks/paystack', async (req, res) => {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const payload = JSON.stringify(req.body);

      console.log('Paystack webhook received:', { signature, body: req.body });

      if (!paystackGateway.verifyWebhookSignature(payload, signature)) {
        console.log('Invalid Paystack webhook signature');
        return res.status(400).json({ message: 'Invalid signature' });
      }

      const { event, data } = req.body;

      if (event === 'charge.success' && data.status === 'success') {
        console.log('Processing successful Paystack payment:', data.reference);
        
        // Update payment status
        const { data: payment, error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', data.reference)
          .select()
          .single();

        if (updateError) {
          console.error('Failed to update payment:', updateError);
          return res.status(500).json({ message: 'Failed to update payment' });
        }

        if (payment) {
          // Activate premium subscription
          await activatePremiumSubscription(payment.id);
        }
      }

      res.json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Paystack webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Get crypto addresses for admin
  app.get('/api/admin/crypto-addresses', adminAuth, async (req: any, res) => {
    try {
      const { data: addresses, error } = await supabase
        .from('crypto_addresses')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      res.json(addresses || []);
    } catch (error) {
      console.error('Error fetching crypto addresses:', error);
      res.status(500).json({ message: 'Failed to fetch crypto addresses' });
    }
  });

  // Update crypto addresses
  app.post('/api/admin/crypto-addresses/:cryptoType', adminAuth, async (req: any, res) => {
    try {
      const { cryptoType } = req.params;
      const { address } = req.body;

      const { data, error } = await supabase
        .from('crypto_addresses')
        .upsert({
          crypto_type: cryptoType,
          address: address,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ message: 'Crypto address updated successfully', data });
    } catch (error) {
      console.error('Error updating crypto address:', error);
      res.status(500).json({ message: 'Failed to update crypto address' });
    }
  });

  // Admin payment management
  app.get('/api/admin/payments', adminAuth, async (req: any, res) => {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          users!payments_user_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  });

  app.patch('/api/admin/payments/:paymentId', adminAuth, async (req: any, res) => {
    try {
      const { paymentId } = req.params;
      const { status } = req.body;

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (paymentError) throw paymentError;

      // If payment is confirmed, activate premium
      if (status === 'confirmed') {
        const success = await activatePremiumSubscription(paymentId);
        if (!success) {
          return res.status(500).json({ message: 'Failed to activate premium subscription' });
        }
      }

      res.json({ message: 'Payment updated successfully', payment });
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ message: 'Failed to update payment' });
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