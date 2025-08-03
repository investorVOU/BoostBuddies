import {
  users,
  posts,
  communities,
  communityMembers,
  postLikes,
  liveEvents,
  collabSpotlights,
  subscriptions,
  payments,
  cryptoAddresses,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Community,
  type InsertCommunity,
  type CommunityMember,
  type PostLike,
  type LiveEvent,
  type InsertLiveEvent,
  type CollabSpotlight,
  type Payment,
  type InsertPayment,
  type Subscription,
  type InsertSubscription,
  type CryptoAddress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | undefined>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getUserPosts(userId: string): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  getPendingPosts(): Promise<Post[]>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  approvePost(id: string, adminId: string): Promise<Post | undefined>;
  rejectPost(id: string, adminId: string, reason: string): Promise<Post | undefined>;

  // Post likes operations
  likePost(userId: string, postId: string): Promise<PostLike>;
  unlikePost(userId: string, postId: string): Promise<boolean>;
  getUserPostLikes(userId: string): Promise<PostLike[]>;
  getPostLikes(postId: string): Promise<PostLike[]>;

  // Community operations
  createCommunity(community: InsertCommunity): Promise<Community>;
  getCommunity(id: string): Promise<Community | undefined>;
  getAllCommunities(): Promise<Community[]>;
  joinCommunity(userId: string, communityId: string): Promise<CommunityMember>;
  leaveCommunity(userId: string, communityId: string): Promise<boolean>;
  getUserCommunities(userId: string): Promise<Community[]>;

  // Live events operations
  createLiveEvent(event: InsertLiveEvent): Promise<LiveEvent>;
  getLiveEvent(id: string): Promise<LiveEvent | undefined>;
  getLiveEvents(): Promise<LiveEvent[]>;
  updateLiveEvent(id: string, updates: Partial<LiveEvent>): Promise<LiveEvent | undefined>;

  // Collab spotlight operations
  getActiveCollabSpotlights(): Promise<CollabSpotlight[]>;

  // Analytics operations
  getUserStats(userId: string): Promise<{
    totalPosts: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    points: number;
  }>;
  getLeaderboard(limit?: number): Promise<User[]>;

  // Premium operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getCryptoAddresses(): Promise<CryptoAddress[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.init();
  }

  private async init() {
    try {
      const result = await db.select().from(users).limit(1);
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const newUser = {
        ...user,
        id: user.id || randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.insert(users).values(newUser).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      const result = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const existingUser = await this.getUser(userData.id!);
      if (existingUser) {
        return await this.updateUser(userData.id!, userData) || existingUser;
      } else {
        return await this.createUser(userData as Omit<User, 'createdAt' | 'updatedAt'>);
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  // Post operations
  async createPost(postData: InsertPost): Promise<Post> {
    try {
      const newPost = {
        ...postData,
        id: randomUUID(),
        status: "pending",
        likesReceived: 0,
        shares: 0,
        comments: 0,
        pointsEarned: 0,
        engagementsCompleted: 0,
        autoApproved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.insert(posts).values(newPost).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getPost(id: string): Promise<Post | undefined> {
    try {
      const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting post:', error);
      return undefined;
    }
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(posts)
        .where(eq(posts.userId, userId))
        .orderBy(desc(posts.createdAt));
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  }

  async getAllPosts(): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(posts)
        .where(eq(posts.status, "approved"))
        .orderBy(desc(posts.createdAt));
    } catch (error) {
      console.error('Error getting all posts:', error);
      return [];
    }
  }

  async getPendingPosts(): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(posts)
        .where(eq(posts.status, "pending"))
        .orderBy(desc(posts.createdAt));
    } catch (error) {
      console.error('Error getting pending posts:', error);
      return [];
    }
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      const result = await db.update(posts)
        .set(updateData)
        .where(eq(posts.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating post:', error);
      return undefined;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      await db.delete(posts).where(eq(posts.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  async approvePost(id: string, adminId: string): Promise<Post | undefined> {
    try {
      const result = await db.update(posts)
        .set({
          status: "approved",
          approvedBy: adminId,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error approving post:', error);
      return undefined;
    }
  }

  async rejectPost(id: string, adminId: string, reason: string): Promise<Post | undefined> {
    try {
      const result = await db.update(posts)
        .set({
          status: "rejected",
          approvedBy: adminId,
          rejectedReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error rejecting post:', error);
      return undefined;
    }
  }

  // Post likes operations
  async likePost(userId: string, postId: string): Promise<PostLike> {
    try {
      const newLike = {
        id: randomUUID(),
        userId,
        postId,
        createdAt: new Date(),
      };
      const result = await db.insert(postLikes).values(newLike).returning();
      
      // Update post likes count
      await db.update(posts)
        .set({ likesReceived: db.select({ count: count() }).from(postLikes).where(eq(postLikes.postId, postId)) })
        .where(eq(posts.id, postId));
      
      return result[0];
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    try {
      await db.delete(postLikes)
        .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
      
      // Update post likes count
      await db.update(posts)
        .set({ likesReceived: db.select({ count: count() }).from(postLikes).where(eq(postLikes.postId, postId)) })
        .where(eq(posts.id, postId));
      
      return true;
    } catch (error) {
      console.error('Error unliking post:', error);
      return false;
    }
  }

  async getUserPostLikes(userId: string): Promise<PostLike[]> {
    try {
      return await db.select().from(postLikes).where(eq(postLikes.userId, userId));
    } catch (error) {
      console.error('Error getting user post likes:', error);
      return [];
    }
  }

  async getPostLikes(postId: string): Promise<PostLike[]> {
    try {
      return await db.select().from(postLikes).where(eq(postLikes.postId, postId));
    } catch (error) {
      console.error('Error getting post likes:', error);
      return [];
    }
  }

  // Community operations
  async createCommunity(community: InsertCommunity): Promise<Community> {
    try {
      const newCommunity = {
        ...community,
        id: randomUUID(),
        memberCount: 0,
        createdAt: new Date(),
      };
      const result = await db.insert(communities).values(newCommunity).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }

  async getCommunity(id: string): Promise<Community | undefined> {
    try {
      const result = await db.select().from(communities).where(eq(communities.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting community:', error);
      return undefined;
    }
  }

  async getAllCommunities(): Promise<Community[]> {
    try {
      return await db.select().from(communities).orderBy(desc(communities.memberCount));
    } catch (error) {
      console.error('Error getting all communities:', error);
      return [];
    }
  }

  async joinCommunity(userId: string, communityId: string): Promise<CommunityMember> {
    try {
      const newMember = {
        id: randomUUID(),
        userId,
        communityId,
        joinedAt: new Date(),
      };
      const result = await db.insert(communityMembers).values(newMember).returning();
      
      // Update community member count
      await db.update(communities)
        .set({ memberCount: db.select({ count: count() }).from(communityMembers).where(eq(communityMembers.communityId, communityId)) })
        .where(eq(communities.id, communityId));
      
      return result[0];
    } catch (error) {
      console.error('Error joining community:', error);
      throw error;
    }
  }

  async leaveCommunity(userId: string, communityId: string): Promise<boolean> {
    try {
      await db.delete(communityMembers)
        .where(and(eq(communityMembers.userId, userId), eq(communityMembers.communityId, communityId)));
      
      // Update community member count
      await db.update(communities)
        .set({ memberCount: db.select({ count: count() }).from(communityMembers).where(eq(communityMembers.communityId, communityId)) })
        .where(eq(communities.id, communityId));
      
      return true;
    } catch (error) {
      console.error('Error leaving community:', error);
      return false;
    }
  }

  async getUserCommunities(userId: string): Promise<Community[]> {
    try {
      const result = await db
        .select({
          id: communities.id,
          name: communities.name,
          description: communities.description,
          icon: communities.icon,
          color: communities.color,
          memberCount: communities.memberCount,
          createdAt: communities.createdAt,
        })
        .from(communities)
        .innerJoin(communityMembers, eq(communities.id, communityMembers.communityId))
        .where(eq(communityMembers.userId, userId));
      
      return result;
    } catch (error) {
      console.error('Error getting user communities:', error);
      return [];
    }
  }

  // Live events operations
  async createLiveEvent(event: InsertLiveEvent): Promise<LiveEvent> {
    try {
      const newEvent = {
        ...event,
        id: randomUUID(),
        participantCount: 0,
        createdAt: new Date(),
      };
      const result = await db.insert(liveEvents).values(newEvent).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating live event:', error);
      throw error;
    }
  }

  async getLiveEvent(id: string): Promise<LiveEvent | undefined> {
    try {
      const result = await db.select().from(liveEvents).where(eq(liveEvents.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting live event:', error);
      return undefined;
    }
  }

  async getLiveEvents(): Promise<LiveEvent[]> {
    try {
      return await db.select().from(liveEvents).orderBy(desc(liveEvents.scheduledAt));
    } catch (error) {
      console.error('Error getting live events:', error);
      return [];
    }
  }

  async updateLiveEvent(id: string, updates: Partial<LiveEvent>): Promise<LiveEvent | undefined> {
    try {
      const result = await db.update(liveEvents)
        .set(updates)
        .where(eq(liveEvents.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating live event:', error);
      return undefined;
    }
  }

  // Collab spotlight operations
  async getActiveCollabSpotlights(): Promise<CollabSpotlight[]> {
    try {
      return await db.select().from(collabSpotlights)
        .where(eq(collabSpotlights.isActive, true))
        .orderBy(desc(collabSpotlights.views));
    } catch (error) {
      console.error('Error getting active collab spotlights:', error);
      return [];
    }
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    totalPosts: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    points: number;
  }> {
    try {
      const userPosts = await this.getUserPosts(userId);
      const user = await this.getUser(userId);
      
      const totalPosts = userPosts.length;
      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likesReceived || 0), 0);
      const totalShares = userPosts.reduce((sum, post) => sum + (post.shares || 0), 0);
      const totalComments = userPosts.reduce((sum, post) => sum + (post.comments || 0), 0);
      
      return {
        totalPosts,
        totalLikes,
        totalShares,
        totalComments,
        points: user?.points || 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalPosts: 0,
        totalLikes: 0,
        totalShares: 0,
        totalComments: 0,
        points: 0,
      };
    }
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    try {
      return await db.select().from(users)
        .orderBy(desc(users.points))
        .limit(limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Premium operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    try {
      const newPayment = {
        ...payment,
        id: randomUUID(),
        status: "pending",
        createdAt: new Date(),
      };
      const result = await db.insert(payments).values(newPayment).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    try {
      const result = await db.select().from(subscriptions)
        .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return undefined;
    }
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    try {
      const newSubscription = {
        ...subscription,
        id: randomUUID(),
        status: "active",
        createdAt: new Date(),
      };
      const result = await db.insert(subscriptions).values(newSubscription).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async getCryptoAddresses(): Promise<CryptoAddress[]> {
    try {
      return await db.select().from(cryptoAddresses)
        .where(eq(cryptoAddresses.isActive, true));
    } catch (error) {
      console.error('Error getting crypto addresses:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();