import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  primaryKey,
  unique,
  serial,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

export const userStatusEnum = pgEnum("user_status", [
  "WAITLISTED",
  "PENDING",
  "ACTIVE",
  "BLOCKED",
]);
export const profileRoleEnum = pgEnum("profile_role", [
  "TRAVELER",
  "OPERATOR",
  "CREATOR",
  "AGENT",
  "ADMIN",
]);
export const referralCodeTypeEnum = pgEnum("referral_code_type", [
  "CAMPAIGN",
  "USER",
]);
export const referralStatusEnum = pgEnum("referral_status", [
  "CLICKED",
  "SIGNED_UP",
  "CONFIRMED",
  "ACTIVATED",
]);
export const rewardsReasonEnum = pgEnum("rewards_reason", [
  "REFERRAL_SIGNUP",
  "REFERRAL_ACTIVATION",
  "INVITE_BOUNTY",
  "MANUAL_ADJUST",
]);
export const emailEventEnum = pgEnum("email_event", [
  "SEND_CONFIRM",
  "CONFIRM_CLICKED",
  "WELCOME_SENT",
]);

export const authProviderEnum = pgEnum("auth_provider", [
  "LOCAL",
  "GOOGLE",
  "FACEBOOK",
  "APPLE",
]);
export const postStatusEnum = pgEnum("post_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);
export const groupTypeEnum = pgEnum("group_type", ["PUBLIC", "PRIVATE"]);
export const voteTypeEnum = pgEnum("vote_type", ["UPVOTE", "DOWNVOTE"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  status: userStatusEnum("status").notNull().default('PENDING'),
  passwordHash: text("password_hash"),
  provider: authProviderEnum("auth_provider").default("LOCAL"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql.raw('now()'))
    .notNull(),
  defaultProfileId: integer("default_profile_id"), 
  positionNumber: integer("position_number").unique(),
  personaSelected: jsonb("persona_selected").default([]),
  dateOfBirth: text("date_of_birth"),
  referralCode: text("referral_code"),
  inviteRequired: boolean("invite_required").default(true),
  points: integer("points").default(0),
});

export const profiles = pgTable("profiles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  username: text("username").notNull().unique(), 
  displayName: text("display_name").notNull(),
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  role: profileRoleEnum("role").notNull().default('TRAVELER'), 
  personaTags: jsonb("persona_tags").default([]), 
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql.raw('now()'))
    .notNull(),
});

export const organizations = pgTable("organizations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  location: text("location"),
  type: text("type"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql.raw('now()'))
    .notNull(),
});

export const groups = pgTable("groups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  type: groupTypeEnum("type").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const groupsToUsers = pgTable(
  "groups_to_users",
  {
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.groupId, table.userId] }),
    };
  }
);

export const communities = pgTable("communities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const posts = pgTable("posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  authorProfileId: integer("author_profile_id")
    .notNull()
    .references(() => profiles.id), 
  communityId: integer("community_id")
    .notNull()
    .references(() => communities.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: postStatusEnum("status").notNull().default("DRAFT"),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql.raw('now()'))
    .notNull(),
});

export const comments = pgTable("comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  authorProfileId: integer("author_profile_id")
    .notNull()
    .references(() => profiles.id),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql.raw('now()'))
    .notNull(),
});

export const mentions = pgTable("mentions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  commentId: integer("comment_id").references(() => comments.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const votes = pgTable("votes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  commentId: integer("comment_id").references(() => comments.id),
  voteType: voteTypeEnum("vote_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const postsToCategories = pgTable(
  "posts_to_categories",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.postId, table.categoryId] }),
    };
  }
);

export const referralCodes = pgTable("referral_codes", {
  code: text("code").notNull().primaryKey(),
  type: referralCodeTypeEnum("type").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  campaignId: integer("campaign_id"),
  userId: integer("user_id")
    .unique()
    .references(() => users.id),
});

export const campaigns = pgTable("campaigns", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull(),
  isActive: boolean("is_active").default(true),
  rewardAmount: integer("reward_amount").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql.raw('now()'))
    .notNull(),
});

export const referrals = pgTable(
  "referrals",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    referrerUserId: integer("referrer_user_id").references(() => users.id),
    referredEmail: text("referred_email"),
    referredUserId: integer("referred_user_id").references(() => users.id),
    referralCode: text("referral_code").references(() => referralCodes.code),
    status: referralStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    lastEventAt: timestamp("last_event_at", { withTimezone: true }),
  },
  (table) => ({
    referrerIdx: unique().on(table.referrerUserId),
    referredIdx: unique().on(table.referredUserId),
  })
);

export const rewardsLedger = pgTable("rewards_ledger", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  deltaPoints: integer("delta_points").notNull(),
  reason: rewardsReasonEnum("reason").notNull(),
  refId: integer("ref_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const emailEvents = pgTable("email_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email"),
  event: emailEventEnum("event").notNull(),
  providerId: text("provider_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql.raw('now()'))
    .notNull(),
});

export const systemLog = pgTable("system_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  level: text("level").notNull(),
  message: text("message").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  ownedCampaigns: many(campaigns),
  profiles: many(profiles),
  groupsToUsers: many(groupsToUsers),
  organizations: many(organizations),
  communities: many(communities),
  mentions: many(mentions),
  personalReferralCode: one(referralCodes),
  defaultProfile: one(profiles, {
    fields: [users.defaultProfileId],
    references: [profiles.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  posts: many(posts),
  comments: many(comments),
  defaultForUser: one(users, {
    fields: [profiles.id],
    references: [users.defaultProfileId],
  }),
}));

export const organizationsRelations = relations(organizations, ({ one }) => ({
  owner: one(users, {
    fields: [organizations.ownerId],
    references: [users.id],
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  owner: one(users, {
    fields: [groups.ownerId],
    references: [users.id],
  }),
  groupsToUsers: many(groupsToUsers),
}));

export const groupsToUsersRelations = relations(groupsToUsers, ({ one }) => ({
  group: one(groups, {
    fields: [groupsToUsers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupsToUsers.userId],
    references: [users.id],
  }),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  owner: one(users, {
    fields: [communities.ownerId],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  authorProfile: one(profiles, {
    fields: [posts.authorProfileId],
    references: [profiles.id],
  }),
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id],
  }),
  comments: many(comments),
  postsToCategories: many(postsToCategories),
  votes: many(votes),
  mentions: many(mentions),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  authorProfile: one(profiles, {
    fields: [comments.authorProfileId],
    references: [profiles.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  votes: many(votes),
  mentions: many(mentions),
}));

export const mentionsRelations = relations(mentions, ({ one }) => ({
  user: one(users, {
    fields: [mentions.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [mentions.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [mentions.commentId],
    references: [comments.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  postsToCategories: many(postsToCategories),
}));

export const postsToCategoriesRelations = relations(
  postsToCategories,
  ({ one }) => ({
    post: one(posts, {
      fields: [postsToCategories.postId],
      references: [posts.id],
    }),
    category: one(categories, {
      fields: [postsToCategories.categoryId],
      references: [categories.id],
    }),
  })
);

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  owner: one(users, {
    fields: [campaigns.ownerId],
    references: [users.id],
  }),
  referralCodes: many(referralCodes),
}));

export const referralCodesRelations = relations(
  referralCodes,
  ({ one, many }) => ({
    campaign: one(campaigns, {
      fields: [referralCodes.campaignId],
      references: [campaigns.id],
    }),
    referrals: many(referrals),
    user: one(users, {
      fields: [referralCodes.userId],
      references: [users.id],
    }),
  })
);

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrerUser: one(users, {
    fields: [referrals.referrerUserId],
    references: [users.id],
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
  }),
  referralCode: one(referralCodes, {
    fields: [referrals.referralCode],
    references: [referralCodes.code],
  }),
}));

export const rewardsLedgerRelations = relations(rewardsLedger, ({ one }) => ({
    user: one(users, {
        fields: [rewardsLedger.userId],
        references: [users.id],
    }),
}));
