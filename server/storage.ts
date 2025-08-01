import {
  users,
  posts,
  communities,
  communityMembers,
  postLikes,
  liveEvents,
  collabSpotlights,
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
} from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;
  private communities: Map<string, Community>;
  private communityMembers: Map<string, CommunityMember>;
  private postLikes: Map<string, PostLike>;
  private liveEvents: Map<string, LiveEvent>;
  private collabSpotlights: Map<string, CollabSpotlight>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.communities = new Map();
    this.communityMembers = new Map();
    this.postLikes = new Map();
    this.liveEvents = new Map();
    this.collabSpotlights = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Seed communities
    const webDevCommunity: Community = {
      id: randomUUID(),
      name: "Web Developers",
      description: "A community for web developers to share tips and collaborate",
      icon: "fas fa-code",
      color: "blue",
      memberCount: 1200,
      createdAt: new Date(),
    };
    
    const designersCommunity: Community = {
      id: randomUUID(),
      name: "UI/UX Designers",
      description: "Creative designers sharing inspiration and feedback",
      icon: "fas fa-paint-brush",
      color: "purple",
      memberCount: 856,
      createdAt: new Date(),
    };
    
    this.communities.set(webDevCommunity.id, webDevCommunity);
    this.communities.set(designersCommunity.id, designersCommunity);
    
    // Seed collab spotlights
    const techInnovatorsCollab: CollabSpotlight = {
      id: randomUUID(),
      title: "Tech Innovators",
      description: "Amazing collaboration on AI tutorials! 🤖 Their joint series got 50K+ views this week.",
      collaborators: JSON.stringify(["user1", "user2", "user3"]),
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60",
      views: 50000,
      isActive: true,
      createdAt: new Date(),
    };
    
    this.collabSpotlights.set(techInnovatorsCollab.id, techInnovatorsCollab);
    
    // Seed live events
    const reactQA: LiveEvent = {
      id: randomUUID(),
      title: "React Q&A Session",
      description: "Join Sarah's live coding session and ask your React questions!",
      hostId: "host1",
      status: "live",
      scheduledAt: new Date(),
      startedAt: new Date(),
      endedAt: null,
      participantCount: 234,
      createdAt: new Date(),
    };
    
    const designWorkshop: LiveEvent = {
      id: randomUUID(),
      title: "Design System Workshop",
      description: "Learn how to build scalable design systems",
      hostId: "host2",
      status: "upcoming",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startedAt: null,
      endedAt: null,
      participantCount: 0,
      createdAt: new Date(),
    };
    
    this.liveEvents.set(reactQA.id, reactQA);
    this.liveEvents.set(designWorkshop.id, designWorkshop);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...userData,
      id: userData.id!,
      points: existingUser?.points || 0,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Post operations
  async createPost(postData: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...postData,
      id,
      status: "pending",
      likesReceived: 0,
      likesNeeded: 10,
      shares: 0,
      comments: 0,
      pointsEarned: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  // Post likes operations
  async likePost(userId: string, postId: string): Promise<PostLike> {
    const id = randomUUID();
    const like: PostLike = {
      id,
      userId,
      postId,
      createdAt: new Date(),
    };
    this.postLikes.set(id, like);
    
    // Update post likes count
    const post = this.posts.get(postId);
    if (post) {
      post.likesReceived += 1;
      post.updatedAt = new Date();
      
      // Check if post should be approved
      if (post.likesReceived >= post.likesNeeded && post.status === "pending") {
        post.status = "approved";
        post.pointsEarned = 50; // Base points for approval
        
        // Update user points
        const user = this.users.get(post.userId);
        if (user) {
          user.points += post.pointsEarned;
          user.updatedAt = new Date();
        }
      }
    }
    
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    const likes = Array.from(this.postLikes.values());
    const like = likes.find(l => l.userId === userId && l.postId === postId);
    
    if (like) {
      this.postLikes.delete(like.id);
      
      // Update post likes count
      const post = this.posts.get(postId);
      if (post && post.likesReceived > 0) {
        post.likesReceived -= 1;
        post.updatedAt = new Date();
      }
      
      return true;
    }
    
    return false;
  }

  async getUserPostLikes(userId: string): Promise<PostLike[]> {
    return Array.from(this.postLikes.values())
      .filter(like => like.userId === userId);
  }

  async getPostLikes(postId: string): Promise<PostLike[]> {
    return Array.from(this.postLikes.values())
      .filter(like => like.postId === postId);
  }

  // Community operations
  async createCommunity(communityData: InsertCommunity): Promise<Community> {
    const id = randomUUID();
    const community: Community = {
      ...communityData,
      id,
      memberCount: 0,
      createdAt: new Date(),
    };
    this.communities.set(id, community);
    return community;
  }

  async getCommunity(id: string): Promise<Community | undefined> {
    return this.communities.get(id);
  }

  async getAllCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values())
      .sort((a, b) => b.memberCount - a.memberCount);
  }

  async joinCommunity(userId: string, communityId: string): Promise<CommunityMember> {
    const id = randomUUID();
    const member: CommunityMember = {
      id,
      userId,
      communityId,
      joinedAt: new Date(),
    };
    this.communityMembers.set(id, member);
    
    // Update community member count
    const community = this.communities.get(communityId);
    if (community) {
      community.memberCount += 1;
    }
    
    return member;
  }

  async leaveCommunity(userId: string, communityId: string): Promise<boolean> {
    const members = Array.from(this.communityMembers.values());
    const member = members.find(m => m.userId === userId && m.communityId === communityId);
    
    if (member) {
      this.communityMembers.delete(member.id);
      
      // Update community member count
      const community = this.communities.get(communityId);
      if (community && community.memberCount > 0) {
        community.memberCount -= 1;
      }
      
      return true;
    }
    
    return false;
  }

  async getUserCommunities(userId: string): Promise<Community[]> {
    const userMemberships = Array.from(this.communityMembers.values())
      .filter(member => member.userId === userId);
    
    const communities: Community[] = [];
    for (const membership of userMemberships) {
      const community = this.communities.get(membership.communityId);
      if (community) {
        communities.push(community);
      }
    }
    
    return communities;
  }

  // Live events operations
  async createLiveEvent(eventData: InsertLiveEvent): Promise<LiveEvent> {
    const id = randomUUID();
    const event: LiveEvent = {
      ...eventData,
      id,
      participantCount: 0,
      createdAt: new Date(),
    };
    this.liveEvents.set(id, event);
    return event;
  }

  async getLiveEvent(id: string): Promise<LiveEvent | undefined> {
    return this.liveEvents.get(id);
  }

  async getLiveEvents(): Promise<LiveEvent[]> {
    return Array.from(this.liveEvents.values())
      .sort((a, b) => {
        // Sort by status (live first, then upcoming, then ended)
        const statusOrder = { live: 0, upcoming: 1, ended: 2 };
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
        
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // Then by scheduled time
        const aTime = a.scheduledAt?.getTime() || 0;
        const bTime = b.scheduledAt?.getTime() || 0;
        return aTime - bTime;
      });
  }

  async updateLiveEvent(id: string, updates: Partial<LiveEvent>): Promise<LiveEvent | undefined> {
    const event = this.liveEvents.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.liveEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  // Collab spotlight operations
  async getActiveCollabSpotlights(): Promise<CollabSpotlight[]> {
    return Array.from(this.collabSpotlights.values())
      .filter(collab => collab.isActive)
      .sort((a, b) => b.views - a.views);
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
    return Array.from(this.users.values())
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
