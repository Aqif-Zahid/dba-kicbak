import { pgTable, check, integer, text, boolean, timestamp, foreignKey, unique, jsonb, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const authProvider = pgEnum("auth_provider", ['LOCAL', 'GOOGLE', 'FACEBOOK', 'APPLE'])
export const emailEvent = pgEnum("email_event", ['SEND_CONFIRM', 'CONFIRM_CLICKED', 'WELCOME_SENT'])
export const groupType = pgEnum("group_type", ['PUBLIC', 'PRIVATE'])
export const postStatus = pgEnum("post_status", ['DRAFT', 'PUBLISHED', 'ARCHIVED'])
export const profileRole = pgEnum("profile_role", ['TRAVELER', 'OPERATOR', 'CREATOR', 'AGENT', 'ADMIN'])
export const referralCodeType = pgEnum("referral_code_type", ['CAMPAIGN', 'USER'])
export const referralStatus = pgEnum("referral_status", ['CLICKED', 'SIGNED_UP', 'CONFIRMED', 'ACTIVATED'])
export const rewardsReason = pgEnum("rewards_reason", ['REFERRAL_SIGNUP', 'REFERRAL_ACTIVATION', 'INVITE_BOUNTY', 'MANUAL_ADJUST'])
export const userStatus = pgEnum("user_status", ['WAITLISTED', 'PENDING', 'ACTIVE', 'BLOCKED'])
export const voteType = pgEnum("vote_type", ['UPVOTE', 'DOWNVOTE'])


export const campaigns = pgTable("campaigns", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "campaigns_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: text().notNull(),
	ownerId: integer("owner_id").notNull(),
	isActive: boolean("is_active").default(true),
	rewardAmount: integer("reward_amount").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	check("campaigns_id_not_null", sql`NOT NULL id`),
	check("campaigns_name_not_null", sql`NOT NULL name`),
	check("campaigns_owner_id_not_null", sql`NOT NULL owner_id`),
	check("campaigns_reward_amount_not_null", sql`NOT NULL reward_amount`),
	check("campaigns_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const communities = pgTable("communities", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "communities_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	ownerId: integer("owner_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "communities_owner_id_users_id_fk"
		}),
	unique("communities_slug_unique").on(table.slug),
	check("communities_id_not_null", sql`NOT NULL id`),
	check("communities_name_not_null", sql`NOT NULL name`),
	check("communities_slug_not_null", sql`NOT NULL slug`),
	check("communities_owner_id_not_null", sql`NOT NULL owner_id`),
]);

export const groups = pgTable("groups", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "groups_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: text().notNull(),
	type: groupType().notNull(),
	ownerId: integer("owner_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "groups_owner_id_users_id_fk"
		}),
	check("groups_id_not_null", sql`NOT NULL id`),
	check("groups_name_not_null", sql`NOT NULL name`),
	check("groups_type_not_null", sql`NOT NULL type`),
]);

export const emailEvents = pgTable("email_events", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "email_events_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	email: text(),
	event: emailEvent().notNull(),
	providerId: text("provider_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	check("email_events_id_not_null", sql`NOT NULL id`),
	check("email_events_event_not_null", sql`NOT NULL event`),
]);

export const categories = pgTable("categories", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "categories_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("categories_name_unique").on(table.name),
	check("categories_id_not_null", sql`NOT NULL id`),
	check("categories_name_not_null", sql`NOT NULL name`),
]);

export const comments = pgTable("comments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "comments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	authorProfileId: integer("author_profile_id").notNull(),
	postId: integer("post_id").notNull(),
	content: text().notNull(),
	upvotes: integer().default(0),
	downvotes: integer().default(0),
	parentId: integer("parent_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorProfileId],
			foreignColumns: [profiles.id],
			name: "comments_author_profile_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "comments_post_id_posts_id_fk"
		}),
	check("comments_id_not_null", sql`NOT NULL id`),
	check("comments_author_profile_id_not_null", sql`NOT NULL author_profile_id`),
	check("comments_post_id_not_null", sql`NOT NULL post_id`),
	check("comments_content_not_null", sql`NOT NULL content`),
	check("comments_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const mentions = pgTable("mentions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "mentions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id").notNull(),
	postId: integer("post_id"),
	commentId: integer("comment_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mentions_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "mentions_post_id_posts_id_fk"
		}),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: "mentions_comment_id_comments_id_fk"
		}),
	check("mentions_id_not_null", sql`NOT NULL id`),
	check("mentions_user_id_not_null", sql`NOT NULL user_id`),
]);

export const organizations = pgTable("organizations", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "organizations_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: text().notNull(),
	location: text(),
	type: text(),
	ownerId: integer("owner_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "organizations_owner_id_users_id_fk"
		}),
	unique("organizations_name_unique").on(table.name),
	check("organizations_id_not_null", sql`NOT NULL id`),
	check("organizations_name_not_null", sql`NOT NULL name`),
	check("organizations_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const posts = pgTable("posts", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "posts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	authorProfileId: integer("author_profile_id").notNull(),
	communityId: integer("community_id").notNull(),
	title: text().notNull(),
	content: text().notNull(),
	status: postStatus().default('DRAFT').notNull(),
	upvotes: integer().default(0),
	downvotes: integer().default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorProfileId],
			foreignColumns: [profiles.id],
			name: "posts_author_profile_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "posts_community_id_communities_id_fk"
		}),
	check("posts_id_not_null", sql`NOT NULL id`),
	check("posts_author_profile_id_not_null", sql`NOT NULL author_profile_id`),
	check("posts_community_id_not_null", sql`NOT NULL community_id`),
	check("posts_title_not_null", sql`NOT NULL title`),
	check("posts_content_not_null", sql`NOT NULL content`),
	check("posts_status_not_null", sql`NOT NULL status`),
	check("posts_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const referralCodes = pgTable("referral_codes", {
	code: text().primaryKey().notNull(),
	type: referralCodeType().notNull(),
	active: boolean().default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	campaignId: integer("campaign_id"),
	userId: integer("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "referral_codes_user_id_users_id_fk"
		}),
	unique("referral_codes_user_id_unique").on(table.userId),
	check("referral_codes_code_not_null", sql`NOT NULL code`),
	check("referral_codes_type_not_null", sql`NOT NULL type`),
]);

export const referrals = pgTable("referrals", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "referrals_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	referrerUserId: integer("referrer_user_id"),
	referredEmail: text("referred_email"),
	referredUserId: integer("referred_user_id"),
	referralCode: text("referral_code"),
	status: referralStatus().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	lastEventAt: timestamp("last_event_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.referrerUserId],
			foreignColumns: [users.id],
			name: "referrals_referrer_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.referredUserId],
			foreignColumns: [users.id],
			name: "referrals_referred_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.referralCode],
			foreignColumns: [referralCodes.code],
			name: "referrals_referral_code_referral_codes_code_fk"
		}),
	unique("referrals_referrer_user_id_unique").on(table.referrerUserId),
	unique("referrals_referred_user_id_unique").on(table.referredUserId),
	check("referrals_id_not_null", sql`NOT NULL id`),
	check("referrals_status_not_null", sql`NOT NULL status`),
]);

export const systemLog = pgTable("system_log", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "system_log_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	level: text().notNull(),
	message: text().notNull(),
	details: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	check("system_log_id_not_null", sql`NOT NULL id`),
	check("system_log_level_not_null", sql`NOT NULL level`),
	check("system_log_message_not_null", sql`NOT NULL message`),
]);

export const systemSettings = pgTable("system_settings", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "system_settings_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	key: text().notNull(),
	value: text().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("system_settings_key_unique").on(table.key),
	check("system_settings_id_not_null", sql`NOT NULL id`),
	check("system_settings_key_not_null", sql`NOT NULL key`),
	check("system_settings_value_not_null", sql`NOT NULL value`),
	check("system_settings_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const votes = pgTable("votes", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "votes_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id").notNull(),
	postId: integer("post_id"),
	commentId: integer("comment_id"),
	voteType: voteType("vote_type").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "votes_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "votes_post_id_posts_id_fk"
		}),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: "votes_comment_id_comments_id_fk"
		}),
	check("votes_id_not_null", sql`NOT NULL id`),
	check("votes_user_id_not_null", sql`NOT NULL user_id`),
	check("votes_vote_type_not_null", sql`NOT NULL vote_type`),
]);

export const profiles = pgTable("profiles", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "profiles_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id").notNull(),
	username: text().notNull(),
	displayName: text("display_name").notNull(),
	profilePicture: text("profile_picture"),
	bio: text(),
	role: profileRole().default('TRAVELER').notNull(),
	personaTags: jsonb("persona_tags").default([]),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "profiles_user_id_users_id_fk"
		}),
	unique("profiles_username_unique").on(table.username),
	check("profiles_id_not_null", sql`NOT NULL id`),
	check("profiles_user_id_not_null", sql`NOT NULL user_id`),
	check("profiles_username_not_null", sql`NOT NULL username`),
	check("profiles_display_name_not_null", sql`NOT NULL display_name`),
	check("profiles_role_not_null", sql`NOT NULL role`),
	check("profiles_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	email: text().notNull(),
	phoneNumber: text("phone_number"),
	status: userStatus().default('PENDING').notNull(),
	passwordHash: text("password_hash"),
	authProvider: authProvider("auth_provider").default('LOCAL'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	defaultProfileId: integer("default_profile_id"),
	positionNumber: integer("position_number"),
	personaSelected: jsonb("persona_selected").default([]),
	dateOfBirth: text("date_of_birth"),
	referralCode: text("referral_code"),
	inviteRequired: boolean("invite_required").default(true),
	points: integer().default(0),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_position_number_unique").on(table.positionNumber),
	check("users_id_not_null", sql`NOT NULL id`),
	check("users_email_not_null", sql`NOT NULL email`),
	check("users_status_not_null", sql`NOT NULL status`),
	check("users_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const rewardsLedger = pgTable("rewards_ledger", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "rewards_ledger_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id"),
	deltaPoints: integer("delta_points").notNull(),
	reason: rewardsReason().notNull(),
	refId: integer("ref_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "rewards_ledger_user_id_users_id_fk"
		}),
	check("rewards_ledger_id_not_null", sql`NOT NULL id`),
	check("rewards_ledger_delta_points_not_null", sql`NOT NULL delta_points`),
	check("rewards_ledger_reason_not_null", sql`NOT NULL reason`),
]);

export const groupsToUsers = pgTable("groups_to_users", {
	groupId: integer("group_id").notNull(),
	userId: integer("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [groups.id],
			name: "groups_to_users_group_id_groups_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "groups_to_users_user_id_users_id_fk"
		}),
	primaryKey({ columns: [table.userId, table.groupId], name: "groups_to_users_group_id_user_id_pk"}),
	check("groups_to_users_group_id_not_null", sql`NOT NULL group_id`),
	check("groups_to_users_user_id_not_null", sql`NOT NULL user_id`),
]);

export const postsToCategories = pgTable("posts_to_categories", {
	postId: integer("post_id").notNull(),
	categoryId: integer("category_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "posts_to_categories_post_id_posts_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "posts_to_categories_category_id_categories_id_fk"
		}),
	primaryKey({ columns: [table.postId, table.categoryId], name: "posts_to_categories_post_id_category_id_pk"}),
	check("posts_to_categories_post_id_not_null", sql`NOT NULL post_id`),
	check("posts_to_categories_category_id_not_null", sql`NOT NULL category_id`),
]);
