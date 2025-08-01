import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"), // Add password field for email/password auth
  points: integer("points").default(0),
  isPremium: boolean("is_premium").default(false),
  premiumExpiresAt: timestamp("premium_expires_at"),
  otpSecret: varchar("otp_secret"),
  otpEnabled: boolean("otp_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // twitter, facebook, youtube, tiktok
  url: text("url").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("pending"), // pending, approved, rejected, auto_approved
  likesReceived: integer("likes_received").default(0),
  likesNeeded: integer("likes_needed").default(10),
  shares: integer("shares").default(0),
  comments: integer("comments").default(0),
  pointsEarned: integer("points_earned").default(0),
  engagementsCompleted: integer("engagements_completed").default(0), // Track user's engagement with other posts
  autoApproved: boolean("auto_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id), // Admin who approved
  approvedAt: timestamp("approved_at"),
  rejectedReason: text("rejected_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track user engagements with other posts
export const postEngagements = pgTable("post_engagements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: uuid("post_id").notNull().references(() => posts.id),
  engagementType: varchar("engagement_type").notNull(), // like, share, comment
  completedAt: timestamp("completed_at").defaultNow(),
});

export const communities = pgTable("communities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityMembers = pgTable("community_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: uuid("community_id").notNull().references(() => communities.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const postLikes = pgTable("post_likes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: uuid("post_id").notNull().references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liveEvents = pgTable("live_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  hostId: varchar("host_id").references(() => users.id),
  status: varchar("status").default("upcoming"), // upcoming, live, ended
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  participantCount: integer("participant_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const collabSpotlights = pgTable("collab_spotlights", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  collaborators: text("collaborators").notNull(), // JSON array of user IDs
  imageUrl: varchar("image_url"),
  views: integer("views").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Premium features table
export const premiumFeatures = pgTable("premium_features", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  featureType: varchar("feature_type").notNull(), // auto_approve, priority_support, advanced_analytics, unlimited_posts, custom_badge
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User badges table
export const userBadges = pgTable("user_badges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeType: varchar("badge_type").notNull(), // premium, verified, top_contributor, early_adopter, etc.
  badgeData: jsonb("badge_data"), // Custom badge configuration
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  plan: varchar("plan").notNull(), // monthly, yearly
  status: varchar("status").default("active"), // active, cancelled, expired
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gateway: varchar("gateway").notNull(), // flutterwave, paystack, crypto
  cryptoType: varchar("crypto_type"), // btc, eth, usdt, matic
  transactionId: varchar("transaction_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency").default("USD"),
  status: varchar("status").default("pending"), // pending, confirmed, failed
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cryptoAddresses = pgTable("crypto_addresses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cryptoType: varchar("crypto_type").notNull(),
  address: varchar("address").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesReceived: true,
  shares: true,
  comments: true,
  pointsEarned: true,
  status: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  memberCount: true,
  createdAt: true,
});

export const insertLiveEventSchema = createInsertSchema(liveEvents).omit({
  id: true,
  participantCount: true,
  createdAt: true,
  startedAt: true,
  endedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  status: true,
  subscriptionId: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Community = typeof communities.$inferSelect;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
export type InsertLiveEvent = z.infer<typeof insertLiveEventSchema>;
export type LiveEvent = typeof liveEvents.$inferSelect;
export type CollabSpotlight = typeof collabSpotlights.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type CryptoAddress = typeof cryptoAddresses.$inferSelect;

// Premium feature types
export type PremiumFeature = typeof premiumFeatures.$inferSelect;
export type InsertPremiumFeature = typeof premiumFeatures.$inferInsert;

// User badge types  
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;