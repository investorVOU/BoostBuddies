import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, gte } from "drizzle-orm";
import { users, posts, userInteractions, pointsHistory } from "../shared/schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export interface PointsAction {
  type: 'like' | 'comment' | 'share' | 'post_approved' | 'daily_bonus';
  points: number;
  description: string;
}

// Points configuration
export const POINTS_CONFIG: Record<string, PointsAction> = {
  like: { type: 'like', points: 1, description: 'Liked a post' },
  comment: { type: 'comment', points: 2, description: 'Commented on a post' },
  share: { type: 'share', points: 3, description: 'Shared a post' },
  post_approved: { type: 'post_approved', points: 10, description: 'Post was approved' },
  daily_bonus: { type: 'daily_bonus', points: 5, description: 'Daily login bonus' },
};

export class PointsSystem {
  // Award points to a user for an action
  static async awardPoints(
    userId: string, 
    actionType: keyof typeof POINTS_CONFIG, 
    relatedPostId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const action = POINTS_CONFIG[actionType];
    if (!action) {
      throw new Error(`Unknown action type: ${actionType}`);
    }

    try {
      // Start transaction
      await db.transaction(async (tx) => {
        // Update user's total points
        const [user] = await tx
          .select({ points: users.points })
          .from(users)
          .where(eq(users.id, userId));

        if (!user) {
          throw new Error('User not found');
        }

        const newPoints = (user.points || 0) + action.points;

        await tx
          .update(users)
          .set({ 
            points: newPoints,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));

        // Record in points history
        await tx.insert(pointsHistory).values({
          id: `points_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          points: action.points,
          actionType: action.type,
          description: action.description,
          relatedPostId,
          metadata,
          createdAt: new Date(),
        });

        // Update user interaction if related to a post
        if (relatedPostId && ['like', 'comment', 'share'].includes(actionType)) {
          await tx.insert(userInteractions).values({
            id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            postId: relatedPostId,
            type: actionType as 'like' | 'comment' | 'share',
            createdAt: new Date(),
          }).onConflictDoNothing();
        }
      });

      console.log(`Awarded ${action.points} points to user ${userId} for ${actionType}`);
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  // Get user's points history
  static async getUserPointsHistory(userId: string, limit: number = 50): Promise<any[]> {
    const history = await db
      .select()
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))
      .orderBy(desc(pointsHistory.createdAt))
      .limit(limit);

    return history;
  }

  // Get leaderboard
  static async getLeaderboard(limit: number = 10): Promise<any[]> {
    const leaderboard = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        points: users.points,
        isPremium: users.isPremium,
      })
      .from(users)
      .orderBy(desc(users.points))
      .limit(limit);

    return leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }

  // Get user's rank
  static async getUserRank(userId: string): Promise<number> {
    const [user] = await db
      .select({ points: users.points })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return 0;
    }

    const [rankResult] = await db
      .select({ count: users.points })
      .from(users)
      .where(gte(users.points, user.points));

    return rankResult ? parseInt(rankResult.count as any) : 0;
  }

  // Award daily bonus if user hasn't received it today
  static async awardDailyBonus(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBonus = await db
      .select()
      .from(pointsHistory)
      .where(
        and(
          eq(pointsHistory.userId, userId),
          eq(pointsHistory.actionType, 'daily_bonus'),
          gte(pointsHistory.createdAt, today)
        )
      )
      .limit(1);

    if (todayBonus.length === 0) {
      await this.awardPoints(userId, 'daily_bonus');
      return true;
    }

    return false;
  }

  // Check if user has interacted with a post recently
  static async hasRecentInteraction(
    userId: string, 
    postId: string, 
    interactionType: 'like' | 'comment' | 'share'
  ): Promise<boolean> {
    const interaction = await db
      .select()
      .from(userInteractions)
      .where(
        and(
          eq(userInteractions.userId, userId),
          eq(userInteractions.postId, postId),
          eq(userInteractions.type, interactionType)
        )
      )
      .limit(1);

    return interaction.length > 0;
  }

  // Process automatic points for post interactions
  static async processPostInteraction(
    userId: string,
    postId: string,
    interactionType: 'like' | 'comment' | 'share'
  ): Promise<{ success: boolean; pointsAwarded: number; message: string }> {
    try {
      // Check if user already interacted with this post in this way
      const hasInteracted = await this.hasRecentInteraction(userId, postId, interactionType);
      
      if (hasInteracted) {
        return {
          success: false,
          pointsAwarded: 0,
          message: `You have already ${interactionType}d this post`
        };
      }

      // Award points
      await this.awardPoints(userId, interactionType, postId);
      const pointsAwarded = POINTS_CONFIG[interactionType].points;

      return {
        success: true,
        pointsAwarded,
        message: `You earned ${pointsAwarded} points for ${interactionType}ing this post!`
      };
    } catch (error) {
      console.error('Error processing post interaction:', error);
      return {
        success: false,
        pointsAwarded: 0,
        message: 'Failed to process interaction'
      };
    }
  }

  // Get user stats
  static async getUserStats(userId: string): Promise<any> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return null;
    }

    const [totalPosts] = await db
      .select({ count: posts.id })
      .from(posts)
      .where(eq(posts.userId, userId));

    const [approvedPosts] = await db
      .select({ count: posts.id })
      .from(posts)
      .where(
        and(
          eq(posts.userId, userId),
          eq(posts.status, 'approved')
        )
      );

    const [totalInteractions] = await db
      .select({ count: userInteractions.id })
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId));

    const rank = await this.getUserRank(userId);

    return {
      totalPosts: totalPosts?.count || 0,
      approvedPosts: approvedPosts?.count || 0,
      totalInteractions: totalInteractions?.count || 0,
      points: user.points || 0,
      rank,
      isPremium: user.isPremium,
      joinDate: user.createdAt,
    };
  }
}