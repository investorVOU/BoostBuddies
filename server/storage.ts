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
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getUserPosts(userId: string): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;

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
    this.seedData();
  }

  private async seedData() {
    try {
      // Check if communities already exist
      const existingCommunities = await db.select().from(communities).limit(1);
      if (existingCommunities.length > 0) return;

      // Seed communities
      await db.insert(communities).values([
        {
          name: "Web Developers",
          description: "A community for web developers to share tips and collaborate",
          icon: "fas fa-code",
          color: "blue",
          memberCount: 1200,
        },
        {
          name: "UI/UX Designers",
          description: "Creative designers sharing inspiration and feedback",
          icon: "fas fa-paint-brush",
          color: "purple",
          memberCount: 856,
        },
        {
          name: "Content Creators",
          description: "YouTubers, TikTokers, and social media creators",
          icon: "fas fa-video",
          color: "red",
          memberCount: 2100,
        }
      ]);

      // Seed collab spotlights
      await db.insert(collabSpotlights).values([
        {
          title: "Tech Innovators",
          description: "Amazing collaboration on AI tutorials! Their joint series got 50K+ views this week.",
          collaborators: JSON.stringify(["user1", "user2", "user3"]),
          imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60",
          views: 50000,
          isActive: true,
        }
      ]);

      // Seed live events (with null hostId for now)
      await db.insert(liveEvents).values([
        {
          title: "React Q&A Session",
          description: "Join Sarah's live coding session and ask your React questions!",
          hostId: null,
          status: "live",
          scheduledAt: new Date(),
          participantCount: 234,
        },
        {
          title: "Design System Workshop",
          description: "Learn how to build scalable design systems",
          hostId: null,
          status: "upcoming",
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          participantCount: 0,
        }
      ]);

      // Seed crypto addresses
      await db.insert(cryptoAddresses).values([
        {
          cryptoType: "btc",
          address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          isActive: true,
        },
        {
          cryptoType: "eth",
          address: "0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2",
          isActive: true,
        },
        {
          cryptoType: "usdt",
          address: "0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2",
          isActive: true,
        },
        {
          cryptoType: "matic",
          address: "0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2",
          isActive: true,
        },
      ]);
    } catch (error) {
      console.log('Seed data already exists or error seeding:', error);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Post operations
  async createPost(postData: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({
        ...postData,
        status: "pending",
        likesReceived: 0,
        likesNeeded: 10,
        shares: 0,
        comments: 0,
        pointsEarned: 0,
      })
      .returning();
    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getAllPosts(): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount > 0;
  }

  // Post likes operations
  async likePost(userId: string, postId: string): Promise<PostLike> {
    const [like] = await db
      .insert(postLikes)
      .values({ userId, postId })
      .returning();

    // Get updated likes count and post info
    const [likesCount] = await db
      .select({ count: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    const [post] = await db
      .update(posts)
      .set({
        likesReceived: likesCount.count,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning();

    // Check if post should be approved (this is a simplified version - in real app you'd need proper transaction)
    if (post && post.likesReceived >= post.likesNeeded && post.status === "pending") {
      const pointsEarned = 50; // Base points for approval

      await db
        .update(posts)
        .set({
          status: "approved",
          pointsEarned,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));

      // Update user points
      const [currentUser] = await db.select().from(users).where(eq(users.id, post.userId));
      if (currentUser) {
        await db
          .update(users)
          .set({
            points: (currentUser.points || 0) + pointsEarned,
            updatedAt: new Date(),
          })
          .where(eq(users.id, post.userId));
      }
    }

    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    const result = await db
      .delete(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));

    if (result.rowCount > 0) {
      // Get updated likes count
      const [likesCount] = await db
        .select({ count: count() })
        .from(postLikes)
        .where(eq(postLikes.postId, postId));

      // Update post likes count
      await db
        .update(posts)
        .set({
          likesReceived: likesCount.count,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));

      return true;
    }

    return false;
  }

  async getUserPostLikes(userId: string): Promise<PostLike[]> {
    return await db
      .select()
      .from(postLikes)
      .where(eq(postLikes.userId, userId));
  }

  async getPostLikes(postId: string): Promise<PostLike[]> {
    return await db
      .select()
      .from(postLikes)
      .where(eq(postLikes.postId, postId));
  }

  // Community operations
  async createCommunity(communityData: InsertCommunity): Promise<Community> {
    const [community] = await db
      .insert(communities)
      .values({ ...communityData, memberCount: 0 })
      .returning();
    return community;
  }

  async getCommunity(id: string): Promise<Community | undefined> {
    const [community] = await db.select().from(communities).where(eq(communities.id, id));
    return community;
  }

  async getAllCommunities(): Promise<Community[]> {
    return await db.select().from(communities).orderBy(desc(communities.memberCount));
  }

  async joinCommunity(userId: string, communityId: string): Promise<CommunityMember> {
    const [member] = await db
      .insert(communityMembers)
      .values({ userId, communityId })
      .returning();
    return member;
  }

  async leaveCommunity(userId: string, communityId: string): Promise<boolean> {
    const result = await db
      .delete(communityMembers)
      .where(and(eq(communityMembers.userId, userId), eq(communityMembers.communityId, communityId)));
    return result.rowCount > 0;
  }

  async getUserCommunities(userId: string): Promise<Community[]> {
    return await db
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
  }

  // Live events operations
  async createLiveEvent(eventData: InsertLiveEvent): Promise<LiveEvent> {
    const [event] = await db
      .insert(liveEvents)
      .values({ ...eventData, participantCount: 0 })
      .returning();
    return event;
  }

  async getLiveEvent(id: string): Promise<LiveEvent | undefined> {
    const [event] = await db.select().from(liveEvents).where(eq(liveEvents.id, id));
    return event;
  }

  async getLiveEvents(): Promise<LiveEvent[]> {
    return await db.select().from(liveEvents).orderBy(desc(liveEvents.scheduledAt));
  }

  async updateLiveEvent(id: string, updates: Partial<LiveEvent>): Promise<LiveEvent | undefined> {
    const [event] = await db
      .update(liveEvents)
      .set(updates)
      .where(eq(liveEvents.id, id))
      .returning();
    return event;
  }

  // Collab spotlight operations
  async getActiveCollabSpotlights(): Promise<CollabSpotlight[]> {
    return await db
      .select()
      .from(collabSpotlights)
      .where(eq(collabSpotlights.isActive, true))
      .orderBy(desc(collabSpotlights.views));
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    totalPosts: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    points: number;
  }> {
    const userPosts = await this.getUserPosts(userId);
    const user = await this.getUser(userId);

    const totalLikes = userPosts.reduce((sum, post) => sum + post.likesReceived, 0);
    const totalShares = userPosts.reduce((sum, post) => sum + post.shares, 0);
    const totalComments = userPosts.reduce((sum, post) => sum + post.comments, 0);

    return {
      totalPosts: userPosts.length,
      totalLikes,
      totalShares,
      totalComments,
      points: user?.points || 0,
    };
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.points))
      .limit(limit);
  }

  // Premium operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values({ ...paymentData, status: "pending" })
      .returning();
    return payment;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(subscriptionData)
      .returning();
    return subscription;
  }

  async getCryptoAddresses(): Promise<CryptoAddress[]> {
    return await db
      .select()
      .from(cryptoAddresses)
      .where(eq(cryptoAddresses.isActive, true));
  }

  private mapRowToPost(row: any): Post {
    return {
      id: row.id,
      userId: row.user_id,
      platform: row.platform,
      url: row.url,
      title: row.title,
      description: "", // Set default empty description
      status: row.status,
      likesReceived: row.likes_received || 0,
      likesNeeded: row.likes_needed || 10,
      pointsEarned: row.points_earned || 0,
      shares: row.shares || 0,
      comments: row.comments || 0,
      createdAt: row.created_at,
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
}

export const storage = new DatabaseStorage();